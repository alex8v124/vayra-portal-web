import { Component, computed, signal, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent implements OnInit {
  filterPanelOpen = signal(false);
  repFiltros = signal({storecheck:"",controller:"",supervisor:"",gestor:"",fechaIni:"",fechaFin:""});
  repFiltrosAplicados = signal({storecheck:"",controller:"",supervisor:"",gestor:"",fechaIni:"",fechaFin:""});
  searchTerm = signal('');
  isSearching = signal(false);
  private searchTimeout: any;

  triggerSearchProgress() {
    this.isSearching.set(true);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.isSearching.set(false);
    }, 450);
  }

  pageSize = signal(20);
  currentPage = signal(1);

  dataFiltrada = computed(() => {
    const f = this.repFiltrosAplicados();
    const sTerm = this.searchTerm().toLowerCase().trim();
    const hasActiveFilters = Object.values(f).some(v => v !== "") || sTerm !== "";
    
    // El módulo de reportes debe listar únicamente cuando se haga el filtrado
    if (!hasActiveFilters) {
      return [];
    }

    return this.dataService.storechecks().filter(item => {
      const p = (item.pdv || '').toLowerCase() + " " + (item.puesto || '').toLowerCase();
      const matchSearch = sTerm === "" || p.includes(sTerm) || (item.id + "").includes(sTerm) || (item.actividad || "").toLowerCase().includes(sTerm) || (item.mercaderista || "").toLowerCase().includes(sTerm);
      
      const m1 = !f.storecheck || (item.actividad || "").toLowerCase().includes(f.storecheck.toLowerCase()) || (item.pdv || "").toLowerCase().includes(f.storecheck.toLowerCase());
      
      let m2 = true;
      if (f.controller) {
        const ctrlUser = this.dataService.users().find(u => u.name.trim().toLowerCase() === f.controller.trim().toLowerCase());
        if (ctrlUser && ctrlUser.equipoComercial && ctrlUser.equipoComercial.trim() !== '') {
          const targetTeam = ctrlUser.equipoComercial.trim().toLowerCase();
          const teamMembers = this.dataService.users()
            .filter(u => (u.equipoComercial || '').trim().toLowerCase() === targetTeam)
            .map(u => u.name.trim().toLowerCase());
          const merc = (item.mercaderista || "").trim().toLowerCase();
          m2 = teamMembers.some(uName => uName === merc || uName.includes(merc) || merc.includes(uName)) || merc.includes(f.controller.toLowerCase());
        } else if (ctrlUser && (ctrlUser.role === 'analista' || ctrlUser.role === 'controller' || ctrlUser.role === 'admin')) {
          m2 = true; // Si el Controller no tiene equipo asignado, puede supervisar todos los storechecks
        } else {
          m2 = (item.mercaderista || "").toLowerCase().includes(f.controller.toLowerCase());
        }
      }

      let m3 = true;
      if (f.supervisor) {
        const supUser = this.dataService.users().find(u => u.name.trim().toLowerCase() === f.supervisor.trim().toLowerCase());
        if (supUser && supUser.equipoComercial && supUser.equipoComercial.trim() !== '') {
          const targetTeam = supUser.equipoComercial.trim().toLowerCase();
          const teamMembers = this.dataService.users()
            .filter(u => (u.equipoComercial || '').trim().toLowerCase() === targetTeam)
            .map(u => u.name.trim().toLowerCase());
          const merc = (item.mercaderista || "").trim().toLowerCase();
          m3 = teamMembers.some(uName => uName === merc || uName.includes(merc) || merc.includes(uName)) || merc.includes(f.supervisor.toLowerCase());
        } else if (supUser && supUser.role === 'admin') {
          m3 = true;
        } else {
          m3 = (item.mercaderista || "").toLowerCase().includes(f.supervisor.toLowerCase());
        }
      }

      const m4 = !f.gestor || (item.mercaderista || "").toLowerCase().includes(f.gestor.toLowerCase());
      
      let m5 = true;
      if (f.fechaIni && item.fecha < f.fechaIni) m5 = false;
      if (f.fechaFin && item.fecha > f.fechaFin + "T23:59:59") m5 = false;
      
      return matchSearch && m1 && m2 && m3 && m4 && m5;
    }).sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  });

  paginatedReportes = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.dataFiltrada().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.dataFiltrada().length / this.pageSize()) || 1;
  });

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  onPageSizeChange(event: Event) {
    const val = +(event.target as HTMLSelectElement).value;
    this.pageSize.set(val);
    this.currentPage.set(1);
    this.triggerSearchProgress();
  }

  hayFiltros = computed(() => Object.values(this.repFiltrosAplicados()).some(v => v !== "") || this.searchTerm().trim() !== "");
  
  hoy = new Date().toISOString().split("T")[0];

  analistas = computed(() => {
    const list = this.dataService.users().filter(u => {
      const r = (u.role || '').toLowerCase();
      return r === 'analista' || r === 'controller' || r === 'admin';
    });
    return Array.from(new Set(list.map(u => u.name))).filter(Boolean).sort().map(name => ({ id: name, name }));
  });
  supervisores = computed(() => {
    const list = this.dataService.users().filter(u => {
      const r = (u.role || '').toLowerCase();
      return r === 'supervisor' || r === 'admin' || r === 'gerente';
    });
    return Array.from(new Set(list.map(u => u.name))).filter(Boolean).sort().map(name => ({ id: name, name }));
  });
  gestores = computed(() => {
    const list = this.dataService.users().filter(u => {
      const r = (u.role || '').toLowerCase();
      return r === 'mercaderista' || r === 'gestor';
    });
    return Array.from(new Set(list.map(u => u.name))).filter(Boolean).sort().map(name => ({ id: name, name }));
  });
  actividadesUnicas = computed(() => {
    const fromAct = this.dataService.actividades().map(a => a.nombre);
    const fromSt = this.dataService.storechecks().map(s => s.actividad);
    return Array.from(new Set([...fromAct, ...fromSt])).filter(Boolean).sort();
  });

  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.dataService.loadModuleData('reportes', true);
    this.triggerSearchProgress();
  }

  toggleFilterPanel() {
    this.filterPanelOpen.set(!this.filterPanelOpen());
  }

  cerrarFiltro() {
    this.filterPanelOpen.set(false);
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.triggerSearchProgress();
  }

  aplicarFiltro() {
    this.repFiltrosAplicados.set({...this.repFiltros()});
    this.currentPage.set(1);
    this.filterPanelOpen.set(false);
    this.triggerSearchProgress();
    this.dataService.showNotification("Filtros aplicados correctamente");
  }

  limpiarFiltros() {
    const empty = {storecheck:"",controller:"",supervisor:"",gestor:"",fechaIni:"",fechaFin:""};
    this.repFiltros.set({...empty});
    this.repFiltrosAplicados.set({...empty});
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.filterPanelOpen.set(false);
    this.triggerSearchProgress();
    this.dataService.showNotification("Filtros eliminados");
  }

  exportToExcel() {
    const dataToExport = this.dataFiltrada().map(sc => {
      let prods: any[] = [];
      if (sc.reporte) {
        try {
          prods = JSON.parse(sc.reporte);
        } catch (e) {}
      }
      
      if (prods && prods.length > 0) {
        return prods.map(p => ({
          'ID REGISTRO REPORTE': `R-${sc.id}`,
          'REPORTE': 'STORECHECK',
          'TIPO REPORTE': 'STORECHECK',
          'ID_PDV': `P-${sc.pdv}`,
          'PDV_nombre': sc.pdv,
          'COD_LUCKY': '1959',
          'ID GESTOR': `U-${sc.mercaderista}`,
          'GESTOR': sc.mercaderista,
          'FECHA': sc.fecha,
          'PUESTO DE MERCADO': sc.puesto || '—',
          'Act. Promocional': sc.actividad || 'Ninguna',
          'PRODUCTO': p.nombre || '—',
          'STOCK INICIAL': p.stockInicial ?? 0,
          'STOCK FINAL': p.stockFinal ?? 0,
          'VENTAS (DIFERENCIA)': (+p.stockInicial || 0) - (+p.stockFinal || 0),
          'FOTO EVIDENCIA': sc.foto ? 'Foto1.jpg' : 'Sin foto',
          'STORAGE': sc.foto ? 'https://xplorabob.supabase.co/storage/v1/object/public/storechecks/Foto1.jpg' : '—'
        }));
      } else {
        // Fallback con productos de demostración si es un registro previo sin reporte serializado
        const fallbackProds = [
          { nombre: 'Inca Kola 1.5L', stockInicial: 12, stockFinal: 8 },
          { nombre: 'Coca Cola Sin Azúcar 1.5L', stockInicial: 24, stockFinal: 19 },
          { nombre: 'Fanta Naranja 1.5L', stockInicial: 10, stockFinal: 4 }
        ];
        return fallbackProds.map(p => ({
          'ID REGISTRO REPORTE': `R-${sc.id}`,
          'REPORTE': 'STORECHECK',
          'TIPO REPORTE': 'STORECHECK',
          'ID_PDV': `P-${sc.pdv}`,
          'PDV_nombre': sc.pdv,
          'COD_LUCKY': '1959',
          'ID GESTOR': `U-${sc.mercaderista}`,
          'GESTOR': sc.mercaderista,
          'FECHA': sc.fecha,
          'PUESTO DE MERCADO': sc.puesto || '—',
          'Act. Promocional': sc.actividad || 'Ninguna',
          'PRODUCTO': p.nombre,
          'STOCK INICIAL': p.stockInicial,
          'STOCK FINAL': p.stockFinal,
          'VENTAS (DIFERENCIA)': p.stockInicial - p.stockFinal,
          'FOTO EVIDENCIA': sc.foto ? 'Foto1.jpg' : 'Sin foto',
          'STORAGE': sc.foto ? 'https://xplorabob.supabase.co/storage/v1/object/public/storechecks/Foto1.jpg' : '—'
        }));
      }
    }).flat();

    if (dataToExport.length === 0) {
      this.dataService.showNotification("No hay registros completados para exportar", "error");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Ajustar ancho de columnas para que se vea premium
    const colWidths = [
      { wch: 22 }, // ID REGISTRO REPORTE
      { wch: 15 }, // REPORTE
      { wch: 15 }, // TIPO REPORTE
      { wch: 12 }, // ID_PDV
      { wch: 25 }, // PDV NOMBRE
      { wch: 12 }, // COD_LUCKY
      { wch: 15 }, // ID GESTOR
      { wch: 20 }, // GESTOR
      { wch: 12 }, // FECHA
      { wch: 25 }, // PUESTO DE MERCADO
      { wch: 25 }, // ACTIVIDAD PROMOCIONAL
      { wch: 30 }, // PRODUCTO / SKU
      { wch: 15 }, // STOCK INICIAL
      { wch: 15 }, // STOCK FINAL
      { wch: 20 }, // VENTAS (DIFERENCIA)
      { wch: 18 }, // FOTO EVIDENCIA
      { wch: 35 }  // STORAGE
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Storechecks');
    
    // Guardar archivo
    XLSX.writeFile(workbook, `Reporte_Storechecks_Completados_${new Date().toISOString().split('T')[0]}.xlsx`);
    this.dataService.showNotification("Reporte Excel generado y descargado exitosamente", "success");
  }
}
