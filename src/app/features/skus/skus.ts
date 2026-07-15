import { Component, computed, signal, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import * as XLSX from 'xlsx';
import { SKU } from '../../core/models/sku.model';

@Component({
  selector: 'app-skus',
  imports: [],
  templateUrl: './skus.html',
  styleUrl: './skus.css'
})
export class SkusComponent implements OnInit {
  filter = signal('');
  categoryFilter = signal('');
  marcaFilter = signal('');
  estadoFilter = signal('');
  sortCol = signal<keyof SKU | ''>('');
  sortAsc = signal(true);
  
  showModal = signal(false);
  selectedSku = signal<SKU | null>(null);

  uniqueCategories = computed(() => {
    const cats = this.dataService.skus().map(s => s.categoria).filter(c => c);
    return [...new Set(cats)].sort();
  });

  uniqueMarcas = computed(() => {
    const marcas = this.dataService.skus().map(s => s.marca).filter(m => m);
    return [...new Set(marcas)].sort();
  });

  filteredSKUs = computed(() => {
    const term = this.filter().toLowerCase();
    const cat = this.categoryFilter();
    const marca = this.marcaFilter();
    const estado = this.estadoFilter();
    const col = this.sortCol();
    const asc = this.sortAsc();

    let arr = this.dataService.skus().filter(s => {
      const matchTerm = s.nombre.toLowerCase().includes(term) || s.codigo.toLowerCase().includes(term);
      const matchCat = cat === '' || s.categoria === cat;
      const matchMarca = marca === '' || s.marca === marca;
      let matchEstado = true;
      if (estado === 'activo') matchEstado = s.activo === true;
      if (estado === 'inactivo') matchEstado = s.activo === false;
      return matchTerm && matchCat && matchMarca && matchEstado;
    });

    if (col) {
      arr.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    }

    return arr;
  });

  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.dataService.loadModuleData('skus');
  }

  updateFilter(event: Event) {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  updateCategoryFilter(event: Event) {
    this.categoryFilter.set((event.target as HTMLSelectElement).value);
  }

  updateMarcaFilter(event: Event) {
    this.marcaFilter.set((event.target as HTMLSelectElement).value);
  }

  updateEstadoFilter(event: Event) {
    this.estadoFilter.set((event.target as HTMLSelectElement).value);
  }

  setSort(col: keyof SKU) {
    if (this.sortCol() === col) {
      this.sortAsc.set(!this.sortAsc());
    } else {
      this.sortCol.set(col);
      this.sortAsc.set(true);
    }
  }

  toggleSKU(id: number, event: Event) {
    const active = (event.target as HTMLInputElement).checked;
    const sku = this.dataService.skus().find(x => x.id === id);
    if(sku) {
      this.dataService.updateSKU({...sku, activo: active});
      this.dataService.showNotification(`SKU ${active?"activado":"desactivado"}`);
    }
  }

  openNewSKUModal() {
    this.selectedSku.set(null);
    this.showModal.set(true);
  }

  openEditSKUModal(sku: SKU) {
    this.selectedSku.set(sku);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  deleteSKU(sku: SKU) {
    if (confirm(`¿Estás seguro que deseas eliminar el SKU ${sku.nombre}?`)) {
      this.dataService.deleteSKU(sku.id);
    }
  }

  saveSKU(nombre: string, codigo: string, marca: string, categoria: string) {
    if(!nombre || !codigo) {
      this.dataService.showNotification('Nombre y código son obligatorios', 'error');
      return;
    }
    const current = this.selectedSku();
    if (current) {
      // Edit
      this.dataService.updateSKU({
        ...current,
        nombre,
        codigo,
        marca,
        categoria
      });
    } else {
      // New
      this.dataService.addSKU({
        id: 0,
        codigo,
        nombre,
        marca,
        categoria,
        activo: true
      });
    }
    this.closeModal();
  }

  importExcel(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.dataService.showNotification('Importando SKUs...', 'success');
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);
        
        const newSkus: SKU[] = [];
        data.forEach((row: any) => {
          const nombre = row.Nombre || row.Producto;
          if(nombre) {
            newSkus.push({
              id: 0,
              codigo: '',
              nombre: nombre.toString(),
              marca: (row.Marca || 'Genérico').toString(),
              categoria: (row.Categoría || row.Categoria || 'Bebidas').toString(),
              activo: true
            });
          }
        });

        if(newSkus.length > 0) {
          this.dataService.addSKUsBulk(newSkus);
        } else {
          this.dataService.showNotification('El archivo no contiene SKUs válidos', 'error');
        }
      } catch (err) {
        console.error(err);
        this.dataService.showNotification('Error al leer el archivo Excel', 'error');
      }
      
      // Limpiar el input file
      event.target.value = null;
    };
    reader.readAsBinaryString(file);
  }

  exportToExcel() {
    this.dataService.showNotification('Generando Excel de SKUs...', 'success');
    
    // Preparar datos
    const skus = this.filteredSKUs();
    const dataToExport = skus.map(s => ({
      'Código': s.codigo,
      'Producto': s.nombre,
      'Marca': s.marca,
      'Categoría': s.categoria,
      'Estado': s.activo ? 'Activo' : 'Inactivo'
    }));

    if (dataToExport.length === 0) {
      this.dataService.showNotification("No hay SKUs para exportar", "error");
      return;
    }

    // Crear worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 15 }, // Código
      { wch: 40 }, // Producto
      { wch: 25 }, // Marca
      { wch: 20 }, // Categoría
      { wch: 10 }  // Estado
    ];
    ws['!cols'] = colWidths;

    // Crear workbook y agregar la hoja
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Catálogo_SKUs');

    // Generar archivo y descargar
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Catalogo_SKUs_${fecha}.xlsx`);
  }
}
