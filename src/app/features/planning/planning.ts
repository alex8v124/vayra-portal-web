import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Planning } from '../../core/models/planning.model';

@Component({
  selector: 'app-planning',
  imports: [CommonModule],
  templateUrl: './planning.html',
  styleUrl: './planning.css'
})
export class PlanningComponent {
  filter = signal('');
  activeModal = signal<'none' | 'new_planning' | 'edit_planning'>('none');
  selectedPlanning = signal<Planning | null>(null);
  visibleCount = signal<number>(50);

  // Form helper signals
  formMercaderistaId = signal<number>(0);
  formPdvId = signal<number>(0);
  formFechaInicio = signal<string>('');
  formFechaFin = signal<string>('');
  
  // Multiple selection for PMs and Acts
  selectedPmIds = signal<number[]>([]);
  pmDiasSemana = signal<{[pmId: number]: string}>({});
  selectedActIds = signal<number[]>([]);

  // List of mercaderistas (role = mercaderista)
  mercaderistas = computed(() => {
    const allMercs = this.dataService.users().filter(u => u.role === 'mercaderista');
    if (this.auth.isAdmin()) {
      return allMercs;
    }
    const myTeam = this.auth.currentUser()?.equipoComercial || '';
    return allMercs.filter(u => u.equipoComercial === myTeam);
  });

  // Available PMs based on selected PDV in the form
  availablePms = computed(() => {
    const pdvId = this.formPdvId();
    const pdv = this.dataService.pdvs().find(p => p.id === pdvId);
    return pdv ? pdv.puestos : [];
  });

  // Available Activities
  availableActividades = computed(() => {
    return this.dataService.actividades();
  });

  pageSize = signal(12);
  currentPage = signal(1);

  filteredPlannings = computed(() => {
    let list = this.dataService.plannings();
    if (this.auth.currentUser()?.role === 'mercaderista') {
      list = list.filter(p => p.usuarioId === this.auth.currentUser()?.id);
    } else if (!this.auth.isAdmin()) {
      const myTeam = this.auth.currentUser()?.equipoComercial || '';
      const myTeamMercIds = this.dataService.users()
        .filter(u => u.role === 'mercaderista' && u.equipoComercial === myTeam)
        .map(u => u.id);
      list = list.filter(p => myTeamMercIds.includes(p.usuarioId));
    }
    const term = this.filter().toLowerCase().trim();
    if (term) {
      list = list.filter(p => 
        (p.pdvNombre && p.pdvNombre.toLowerCase().includes(term)) ||
        (p.mercaderistaName && p.mercaderistaName.toLowerCase().includes(term))
      );
    }
    return list;
  });

  paginatedPlannings = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredPlannings().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredPlannings().length / this.pageSize()) || 1;
  });

  constructor(public dataService: DataService, public auth: AuthService) {}

  updateFilter(event: Event) {
    this.filter.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(p: number) {
    this.currentPage.set(p);
  }

  onPdvChange(event: Event) {
    const pdvId = +(event.target as HTMLSelectElement).value;
    this.formPdvId.set(pdvId);
    // Reset PM and Act selections since they depend on PDV
    this.selectedPmIds.set([]);
    this.selectedActIds.set([]);
  }

  togglePmSelection(pmId: number | undefined) {
    if (pmId === undefined) return;
    this.selectedPmIds.update(ids => 
      ids.includes(pmId) ? ids.filter(id => id !== pmId) : [...ids, pmId]
    );
    // Remove if unchecked, or default to Lunes if checked
    const selected = this.selectedPmIds().includes(pmId);
    this.pmDiasSemana.update(dias => {
      const copy = { ...dias };
      if (!selected) {
        delete copy[pmId];
      } else if (!copy[pmId]) {
        copy[pmId] = 'Lunes';
      }
      return copy;
    });
  }

  setPmDiaSemana(pmId: number, dia: string, event: Event) {
    event.stopPropagation();
    this.pmDiasSemana.update(dias => ({...dias, [pmId]: dia}));
  }

  toggleActSelection(actId: number) {
    this.selectedActIds.update(ids => 
      ids.includes(actId) ? ids.filter(id => id !== actId) : [...ids, actId]
    );
  }

  isPmSelected(pmId: number | undefined): boolean {
    if (pmId === undefined) return false;
    return this.selectedPmIds().includes(pmId);
  }

  isActSelected(actId: number): boolean {
    return this.selectedActIds().includes(actId);
  }

  openNewPlanningModal() {
    this.selectedPlanning.set(null);
    this.formMercaderistaId.set(0);
    this.formPdvId.set(0);
    this.formFechaInicio.set('');
    this.formFechaFin.set('');
    this.selectedPmIds.set([]);
    this.pmDiasSemana.set({});
    this.selectedActIds.set([]);
    this.activeModal.set('new_planning');
  }

  openEditPlanningModal(p: Planning) {
    this.selectedPlanning.set(p);
    this.formMercaderistaId.set(p.usuarioId);
    this.formPdvId.set(p.pdvId);
    this.formFechaInicio.set(p.fechaInicio);
    this.formFechaFin.set(p.fechaFin);
    
    // Parse pm_ids and act_ids
    const pmIds = p.pmIds ? p.pmIds.split(',').map(Number).filter(n => !isNaN(n)) : [];
    const actIds = p.actIds ? p.actIds.split(',').map(Number).filter(n => !isNaN(n)) : [];
    
    let diasParsed = {};
    if (p.diasSemanaPms) {
      try { diasParsed = JSON.parse(p.diasSemanaPms); } catch (e) {}
    }

    this.selectedPmIds.set(pmIds);
    this.pmDiasSemana.set(diasParsed);
    this.selectedActIds.set(actIds);
    this.activeModal.set('edit_planning');
  }

  closeModal() {
    this.activeModal.set('none');
    this.selectedPlanning.set(null);
  }

  savePlanning() {
    if (!this.formMercaderistaId() || !this.formPdvId() || !this.formFechaInicio() || !this.formFechaFin()) {
      this.dataService.showNotification('Todos los campos son obligatorios', 'error');
      return;
    }

    if (new Date(this.formFechaInicio()) > new Date(this.formFechaFin())) {
      this.dataService.showNotification('La fecha de inicio no puede ser posterior a la fecha fin', 'error');
      return;
    }

    const payload: Planning = {
      usuarioId: this.formMercaderistaId(),
      pdvId: this.formPdvId(),
      pmIds: this.selectedPmIds().join(','),
      diasSemanaPms: JSON.stringify(this.pmDiasSemana()),
      actIds: this.selectedActIds().join(','),
      fechaInicio: this.formFechaInicio(),
      fechaFin: this.formFechaFin(),
      estado: this.selectedPlanning()?.estado || 'Pendiente'
    };

    if (this.activeModal() === 'edit_planning' && this.selectedPlanning()?.planningId) {
      this.dataService.updatePlanning(this.selectedPlanning()!.planningId!, payload);
    } else {
      this.dataService.addPlanning(payload);
    }
    this.closeModal();
  }

  deletePlanning(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este planning?')) {
      this.dataService.deletePlanning(id);
    }
  }

  getMercTeam(usuarioId: number): string {
    const u = this.dataService.users().find(x => x.id === usuarioId);
    return u?.equipoComercial || 'Sin equipo';
  }

  getPmNames(pmIdsStr: string): string {
    if (!pmIdsStr) return 'Todos';
    const ids = pmIdsStr.split(',').map(Number).filter(n => !isNaN(n));
    if (ids.length === 0) return 'Ninguno';
    
    const allPms: any[] = [];
    this.dataService.pdvs().forEach(p => {
      if (p.puestos) allPms.push(...p.puestos);
    });

    return ids.map(id => {
      const pm = allPms.find(x => x.pmId === id);
      return pm ? pm.nombre : `Puesto ${id}`;
    }).join(', ');
  }

  getActNames(actIdsStr: string): string {
    if (!actIdsStr) return 'Todas';
    const ids = actIdsStr.split(',').map(Number).filter(n => !isNaN(n));
    if (ids.length === 0) return 'Ninguna';

    return ids.map(id => {
      const act = this.dataService.actividades().find(a => a.id === id);
      return act ? act.nombre : `Actividad ${id}`;
    }).join(', ');
  }
}
