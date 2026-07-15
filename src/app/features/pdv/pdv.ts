import { Component, computed, signal, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pdv',
  imports: [],
  templateUrl: './pdv.html',
  styleUrl: './pdv.css'
})
export class PdvComponent implements OnInit {
  filter = signal('');
  filterPanelOpen = signal(false);
  selectedDistrito = signal('');
  selectedTipo = signal('');
  selectedEstado = signal('');
  selectedPendiente = signal('');

  activeModal = signal<'none' | 'puestos' | 'new_pdv' | 'edit_pdv' | 'add_puesto' | 'edit_puesto' | 'visit'>('none');
  selectedPdv = signal<any>(null);
  editingPuesto = signal<any>(null);
  selectedActIds = signal<number[]>([]);

  distritosUnicos = computed(() => {
    const dists = this.dataService.pdvs().map(p => p.distrito).filter(Boolean);
    return [...new Set(dists)].sort();
  });

  tiposUnicos = computed(() => {
    const tips = this.dataService.pdvs().map(p => p.tipo).filter(Boolean);
    return [...new Set(tips)].sort();
  });

  hayFiltros = computed(() => {
    return this.selectedDistrito() !== '' ||
           this.selectedTipo() !== '' ||
           this.selectedEstado() !== '' ||
           this.selectedPendiente() !== '';
  });

  filteredPDVs = computed(() => {
    const term = this.filter().toLowerCase().trim();
    const dist = this.selectedDistrito();
    const tipo = this.selectedTipo();
    const estado = this.selectedEstado();
    const pend = this.selectedPendiente();

    return this.dataService.pdvs().filter(p => {
      if (term && !p.nombre.toLowerCase().includes(term) && !p.codigo.toLowerCase().includes(term) && !p.distrito.toLowerCase().includes(term)) {
        return false;
      }
      if (dist && p.distrito !== dist) return false;
      if (tipo && p.tipo !== tipo) return false;
      if (estado && p.estado !== estado) return false;
      if (pend === 'pendiente' && !p.pendiente) return false;
      if (pend === 'al_dia' && p.pendiente) return false;
      if (pend === 'hoy' && !this.isPdvActiveToday(p.id)) return false;
      return true;
    });
  });

  toggleFilterPanel() {
    this.filterPanelOpen.update(v => !v);
  }

  limpiarFiltros() {
    this.selectedDistrito.set('');
    this.selectedTipo.set('');
    this.selectedEstado.set('');
    this.selectedPendiente.set('');
    this.dataService.showNotification('Filtros de PDV limpiados');
  }

  limpiarTodosFiltros() {
    this.filter.set('');
    this.limpiarFiltros();
  }

  activePlanningsToday = computed(() => {
    const currentUser = this.auth.currentUser();
    if (!currentUser || currentUser.role !== 'mercaderista') return [];
    const todayStr = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD local
    return this.dataService.plannings().filter(p => 
      p.usuarioId === currentUser.id && todayStr >= p.fechaInicio && todayStr <= p.fechaFin
    );
  });

  activePlanningsSets = computed(() => {
    const pdvIds = new Set<number>();
    const pmIdsByPdv = new Map<number, Set<number>>();
    for (const p of this.activePlanningsToday()) {
      pdvIds.add(p.pdvId);
      if (p.pmIds) {
        let pmSet = pmIdsByPdv.get(p.pdvId);
        if (!pmSet) {
          pmSet = new Set<number>();
          pmIdsByPdv.set(p.pdvId, pmSet);
        }
        p.pmIds.split(',').forEach(id => pmSet!.add(Number(id)));
      }
    }
    return { pdvIds, pmIdsByPdv };
  });

  isPdvActiveToday(pdvId: number): boolean {
    return this.activePlanningsSets().pdvIds.has(pdvId);
  }

  isPmActiveToday(pmId: number | undefined, pdvId: number): boolean {
    if (pmId === undefined || pmId === null) return false;
    return this.activePlanningsSets().pmIdsByPdv.get(pdvId)?.has(pmId) ?? false;
  }

  constructor(public dataService: DataService, public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.dataService.loadModuleData('pdv');
  }

  updateFilter(event: Event) {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  closeModal() {
    this.activeModal.set('none');
    this.selectedPdv.set(null);
    this.editingPuesto.set(null);
    this.selectedActIds.set([]);
  }

  // ── PDV CRUD ──
  openNewPDVModal() {
    this.activeModal.set('new_pdv');
  }

  saveNewPDV(nombre: string, codigo: string, distrito: string, tipo: string) {
    if (!nombre || !codigo || !distrito || !tipo) {
      this.dataService.showNotification('Complete los campos obligatorios.', 'error');
      return;
    }
    const newPDV = {
      id: 0, nombre, codigo, distrito, tipo,
      estado: 'Activo' as const, visitas: 0, pendiente: true, puestos: []
    };
    this.dataService.addPDV(newPDV);
    this.closeModal();
  }

  openEditPDVModal(pdvId: number) {
    const pdv = this.dataService.pdvs().find(p => p.id === pdvId);
    if (pdv) {
      this.selectedPdv.set({...pdv});
      this.activeModal.set('edit_pdv');
    }
  }

  saveEditPDV(nombre: string, codigo: string, distrito: string, tipo: string, estado: string) {
    if (!nombre || !codigo || !distrito || !tipo) {
      this.dataService.showNotification('Complete los campos obligatorios.', 'error');
      return;
    }
    const pdv = this.selectedPdv();
    if (pdv) {
      this.dataService.updatePDV({
        ...pdv, nombre, codigo, distrito, tipo, estado: estado as 'Activo'|'Inactivo'
      });
      this.closeModal();
    }
  }

  // ── PUESTOS CRUD (con múltiples actividades) ──
  openPuestosModal(pdvId: number) {
    const pdv = this.dataService.pdvs().find(p => p.id === pdvId);
    if (pdv) {
      this.selectedPdv.set({...pdv});
      this.activeModal.set('puestos');
    }
  }

  openAddPuestoModal() {
    this.selectedActIds.set([]);
    this.activeModal.set('add_puesto');
  }

  toggleActSelection(actId: number) {
    this.selectedActIds.update(ids => {
      if (ids.includes(actId)) {
        return ids.filter(id => id !== actId);
      } else {
        return [...ids, actId];
      }
    });
  }

  isActSelected(actId: number): boolean {
    return this.selectedActIds().includes(actId);
  }

  savePuesto(nombre: string) {
    if (!nombre) {
      this.dataService.showNotification('El nombre del puesto es requerido', 'error');
      return;
    }
    if (this.selectedActIds().length === 0) {
      this.dataService.showNotification('Debes seleccionar al menos una actividad', 'error');
      return;
    }
    const pdv = this.selectedPdv();
    this.dataService.addPuesto(pdv.id, nombre, this.selectedActIds());
    this.closeModal();
  }

  openEditPuestoModal(puesto: any) {
    this.editingPuesto.set(puesto);
    this.selectedActIds.set([...(puesto.actIds || [])]);
    this.activeModal.set('edit_puesto');
  }

  updatePuesto(nombre: string) {
    if (!nombre) {
      this.dataService.showNotification('El nombre del puesto es requerido', 'error');
      return;
    }
    if (this.selectedActIds().length === 0) {
      this.dataService.showNotification('Debes seleccionar al menos una actividad', 'error');
      return;
    }
    const puesto = this.editingPuesto();
    const pdv = this.selectedPdv();
    this.dataService.updatePuesto(puesto.pmId, nombre, pdv.id, this.selectedActIds());
    this.closeModal();
  }

  deletePuesto(puesto: any) {
    this.dataService.deletePuesto(puesto.pmId);
    setTimeout(() => {
      const pdv = this.dataService.pdvs().find(p => p.id === this.selectedPdv()?.id);
      if (pdv) this.selectedPdv.set({...pdv});
    }, 600);
  }

  getActNames(actIds: number[]): string {
    if (!actIds || actIds.length === 0) return 'Sin actividades';
    return actIds.map(id => {
      const act = this.dataService.actividades().find(a => a.id === id);
      return act ? act.nombre : '?';
    }).join(', ');
  }

  // ── VISITA ──
  openVisitModal(pdvId: number) {
    const pdv = this.dataService.pdvs().find(p => p.id === pdvId);
    if (pdv) {
      this.selectedPdv.set(pdv);
      this.activeModal.set('visit');
    }
  }

  confirmVisit() {
    this.dataService.showNotification('Visita iniciada — redirigiendo a storecheck');
    this.router.navigate(['/storecheck'], { queryParams: { pdvId: this.selectedPdv().id, pdvName: this.selectedPdv().nombre, autoCamera: 'pdv' } });
    this.closeModal();
  }
}
