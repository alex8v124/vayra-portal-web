import { Component, computed, signal } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reportes',
  imports: [FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent {
  filterPanelOpen = signal(false);
  repFiltros = signal({storecheck:"",controller:"",supervisor:"",gestor:"",fechaIni:"",fechaFin:""});
  repFiltrosAplicados = signal({storecheck:"",controller:"",supervisor:"",gestor:"",fechaIni:"",fechaFin:""});
  searchTerm = signal('');

  dataFiltrada = computed(() => {
    let data = this.dataService.storechecks();
    const f = this.repFiltrosAplicados();
    const sTerm = this.searchTerm().toLowerCase();
    
    if(f.storecheck) data = data.filter(sc => sc.actividad === f.storecheck);
    if(f.controller) data = data.filter(sc => sc.mercaderista === f.controller); // mock logic
    if(f.supervisor) data = data.filter(sc => sc.mercaderista === f.supervisor);
    if(f.gestor) data = data.filter(sc => sc.mercaderista === f.gestor);
    if(f.fechaIni) data = data.filter(sc => sc.fecha >= f.fechaIni);
    if(f.fechaFin) data = data.filter(sc => sc.fecha <= f.fechaFin);

    if (sTerm) {
      data = data.filter(sc => sc.pdv.toLowerCase().includes(sTerm) || sc.mercaderista.toLowerCase().includes(sTerm));
    }
    
    return data;
  });

  hayFiltros = computed(() => Object.values(this.repFiltrosAplicados()).some(v => v !== ""));
  
  hoy = new Date().toISOString().split("T")[0];

  analistas = computed(() => this.dataService.users().filter(u => u.role === 'analista' || u.role === 'admin'));
  supervisores = computed(() => this.dataService.users().filter(u => u.role === 'admin'));
  gestores = computed(() => this.dataService.users().filter(u => u.role === 'mercaderista'));
  actividadesUnicas = computed(() => [...new Set(this.dataService.storechecks().map(s => s.actividad))]);

  constructor(public dataService: DataService) {}

  toggleFilterPanel() {
    this.filterPanelOpen.set(!this.filterPanelOpen());
  }

  cerrarFiltro() {
    this.filterPanelOpen.set(false);
  }

  aplicarFiltro() {
    this.repFiltrosAplicados.set({...this.repFiltros()});
    this.filterPanelOpen.set(false);
    this.dataService.showNotification("Filtros aplicados correctamente");
  }

  limpiarFiltros() {
    const empty = {storecheck:"",controller:"",supervisor:"",gestor:"",fechaIni:"",fechaFin:""};
    this.repFiltros.set({...empty});
    this.repFiltrosAplicados.set({...empty});
    this.filterPanelOpen.set(false);
    this.dataService.showNotification("Filtros eliminados");
  }

  showExportModal() {
    this.dataService.showNotification("Modal de exportación por implementar");
  }
}
