import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { StorecheckProcessorService } from '../../core/services/storecheck-processor.service';
import { CronogramaService, Cronograma } from '../../core/services/cronograma.service';

@Component({
  selector: 'app-storecheck-processor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './storecheck-processor.html',
  styles: [`
    .step-container { margin-bottom: 2rem; padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); }
    .mapping-table th, .mapping-table td { padding: 0.5rem; border: 1px solid var(--border-color); }
    .mapping-table { width: 100%; border-collapse: collapse; }
    .checkbox-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
  `]
})
export class StorecheckProcessorComponent implements OnInit {
  step = 1;
  isLoading = false;
  loadingProgress = 0; // New variable for progress bar
  loadingMessage = '';

  // Data from Excel
  selectedFile: File | null = null;
  baseData: any[] = [];
  promocionesUnicas: string[] = [];
  skusUnicos: string[] = [];
  pdvsUnicos: string[] = [];

  // Configuration
  numeroStorecheck: string = '1ER';
  promocionElegida: string = '';
  skusSeleccionados: { [sku: string]: boolean } = {};
  
  // Cronogramas
  cronogramas: Cronograma[] = [];
  selectedCronogramaId: number | null = null;
  cronogramaMercados: string[] = []; // Nombres de mercados del cronograma seleccionado
  cronogramaData: any[] = []; // Data real para mandar al backend

  // Homologación
  mapeoMercados: { [pdv: string]: string } = {}; // pdv -> mercado del crono

  constructor(
    private processorService: StorecheckProcessorService,
    private cronogramaService: CronogramaService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cronogramaService.listar().subscribe((data: Cronograma[]) => {
        this.cronogramas = data;
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    this.isLoading = true;
    this.loadingProgress = 10;
    this.loadingMessage = 'Leyendo archivo...';

    const reader = new FileReader();
    
    // Simulate some progress to give user feedback before heavy parsing
    const interval = setInterval(() => {
      if (this.loadingProgress < 85) {
        this.loadingProgress += 15;
      }
    }, 100);

    reader.onload = (e: any) => {
      this.loadingMessage = 'Procesando datos (esto puede tomar unos segundos)...';
      this.loadingProgress = 90;
      
      // Use setTimeout to allow the browser to paint the progress bar update before blocking the thread
      setTimeout(() => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet);
          
          this.baseData = rows;
          this.procesarDatosBase();
          
          clearInterval(interval);
          this.loadingProgress = 100;
          this.loadingMessage = '¡Completado!';
          
          setTimeout(() => {
            this.isLoading = false;
            this.step = 2;
          }, 400);
        } catch (error) {
          clearInterval(interval);
          this.isLoading = false;
          alert('Error al leer el archivo Excel.');
        }
      }, 100);
    };
    
    reader.readAsArrayBuffer(file);
  }

  procesarDatosBase() {
    const promos = new Set<string>();
    const skus = new Set<string>();
    const pdvs = new Set<string>();

    this.baseData.forEach((row: any) => {
      const act = row['Act. Promocional'] || row['ACTIVIDAD PROMOCIONAL'];
      const sku = row['PRODUCTO'] || row['PRODUCTO / SKU'];
      const pdv = row['PDV_nombre'] || row['PDV NOMBRE'] || row['PDV_NOMBRE'];

      if (act) promos.add(act);
      if (sku) skus.add(sku);
      if (pdv) pdvs.add(pdv);
      
      // Auto-fix for python script that requires strict names
      if (!row['Act. Promocional'] && row['ACTIVIDAD PROMOCIONAL']) row['Act. Promocional'] = row['ACTIVIDAD PROMOCIONAL'];
      if (!row['PRODUCTO'] && row['PRODUCTO / SKU']) row['PRODUCTO'] = row['PRODUCTO / SKU'];
      if (!row['PDV_nombre'] && (row['PDV NOMBRE'] || row['PDV_NOMBRE'])) row['PDV_nombre'] = row['PDV NOMBRE'] || row['PDV_NOMBRE'];
      if (!row['STOCK FINAL'] && row['STOCK FINAL'] !== 0) row['STOCK FINAL'] = 0;
      if (!row['STOCK INICIAL'] && row['STOCK INICIAL'] !== 0) row['STOCK INICIAL'] = 0;
    });

    this.promocionesUnicas = Array.from(promos).sort();
    this.skusUnicos = Array.from(skus).sort();
    this.pdvsUnicos = Array.from(pdvs).sort();

    if (this.promocionesUnicas.length === 0) {
      alert("Atención: No se encontraron Actividades Promocionales en este Excel. ¿Seguro que es el reporte correcto?");
    }

    // Re-generar el archivo Excel con los encabezados estandarizados para que Python no falle
    try {
      const worksheet = XLSX.utils.json_to_sheet(this.baseData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Storechecks');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.selectedFile = new File([excelBuffer], "base_normalizada.xlsx", { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
    } catch (e) {
      console.warn("No se pudo re-generar el archivo excel:", e);
    }

    // Init skus checkboxes
    this.skusUnicos.forEach(sku => this.skusSeleccionados[sku] = true);
    
    // Auto-mapeo simple
    this.pdvsUnicos.forEach(pdv => this.mapeoMercados[pdv] = pdv);
  }

  onCronogramaChange() {
    if (!this.selectedCronogramaId) {
      this.cronogramaMercados = [];
      this.cronogramaData = [];
      return;
    }

    const crono = this.cronogramas.find(c => c.id === Number(this.selectedCronogramaId));
    if (crono) {
      try {
        const arr = JSON.parse(crono.datosJson);
        this.cronogramaData = arr;
        this.cronogramaMercados = arr.map((x: any) => x.MERCADO).filter((x: any) => x);
      } catch (e) {
        this.cronogramaMercados = [];
      }
    }
  }

  seleccionarTodosSKUs(val: boolean) {
    this.skusUnicos.forEach(sku => this.skusSeleccionados[sku] = val);
  }

  autocompletarMapeo() {
    // Si el pdv coincide parcialmente con algun mercado del cronograma
    this.pdvsUnicos.forEach(pdv => {
      const match = this.cronogramaMercados.find(m => m.toLowerCase() === pdv.toLowerCase());
      if (match) {
        this.mapeoMercados[pdv] = match;
      }
    });
  }

  generarStorecheck() {
    if (!this.selectedFile) return;

    this.isLoading = true;
    
    const skusFinales = Object.keys(this.skusSeleccionados).filter(k => this.skusSeleccionados[k]);
    
    // Mapeo formato: { "PDV_Base": { "MERCADO_CRONO": "X", "Ciudad": "Y", "DEX": "Z" } }
    const mapeoCompleto: any = {};
    Object.keys(this.mapeoMercados).forEach(pdv => {
      const mercadoSel = this.mapeoMercados[pdv];
      const cronoInfo = this.cronogramaData.find((x:any) => x.MERCADO === mercadoSel) || {};
      mapeoCompleto[pdv] = {
        MERCADO_CRONO: mercadoSel || pdv,
        Ciudad: cronoInfo.Ciudad || 'N/A',
        DEX: cronoInfo.DEX || 'N/A'
      };
    });

    const config = {
      numero_storecheck: this.numeroStorecheck,
      promocion_elegida: this.promocionElegida,
      skus_seleccionados: skusFinales,
      cronograma_data: this.cronogramaData,
      mapeo_mercados: mapeoCompleto
    };

    this.processorService.processStorecheck(this.selectedFile, JSON.stringify(config)).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.numeroStorecheck}_Storecheck_${this.promocionElegida.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
        alert('Archivo generado exitosamente');
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        alert('Hubo un error procesando el archivo: ' + (err.message || 'Error desconocido'));
      }
    });
  }
}
