import { Component, computed, signal, OnInit } from '@angular/core';
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
export class PlanningComponent implements OnInit {
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

  // List of mercaderistas (role = mercaderista or currently selected in form)
  mercaderistas = computed(() => {
    const users = this.dataService.users();
    const currentId = Number(this.formMercaderistaId());
    
    const allMercs = users.filter(u => {
      const role = (u.role || '').toLowerCase();
      return role.includes('mercaderista') || role === 'usuario' || Number(u.id) === currentId;
    });

    if (this.auth.isAdmin()) {
      return allMercs;
    }
    const myTeam = this.auth.currentUser()?.equipoComercial || '';
    return allMercs.filter(u => u.equipoComercial === myTeam || !myTeam || Number(u.id) === currentId);
  });

  // Available PMs based on selected PDV in the form
  availablePms = computed(() => {
    const pdvId = Number(this.formPdvId());
    const pdv = this.dataService.pdvs().find(p => Number(p.id) === pdvId);
    return pdv ? pdv.puestos : [];
  });

  // Available Activities
  availableActividades = computed(() => {
    return this.dataService.actividades();
  });

  pageSize = signal(20);
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

  ngOnInit() {
    this.dataService.loadModuleData('planning');
  }

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

  onPageSizeChange(event: Event) {
    const val = +(event.target as HTMLSelectElement).value;
    this.pageSize.set(val);
    this.currentPage.set(1);
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
    const numId = Number(pmId);
    const currentlySelected = this.isPmSelected(numId);
    
    this.selectedPmIds.update(ids => {
      const numIds = ids.map(Number);
      return currentlySelected ? numIds.filter(id => id !== numId) : [...numIds, numId];
    });

    const isNowSelected = !currentlySelected;
    this.pmDiasSemana.update(dias => {
      const copy: any = { ...dias };
      if (!isNowSelected) {
        delete copy[numId];
        delete copy[String(numId)];
      } else if (!copy[numId] && !copy[String(numId)]) {
        copy[numId] = 'Lunes';
        copy[String(numId)] = 'Lunes';
      }
      return copy;
    });
  }

  setPmDiaSemana(pmId: number, dia: string, event: Event) {
    if (event) {
      event.stopPropagation();
    }
    const numId = Number(pmId);
    this.pmDiasSemana.update(dias => ({
      ...dias,
      [numId]: dia,
      [String(numId)]: dia
    }));
  }

  toggleActSelection(actId: number) {
    if (actId === undefined) return;
    const numId = Number(actId);
    const currentlySelected = this.isActSelected(numId);
    this.selectedActIds.update(ids => {
      const numIds = ids.map(Number);
      return currentlySelected ? numIds.filter(id => id !== numId) : [...numIds, numId];
    });
  }

  isPmSelected(pmId: number | undefined): boolean {
    if (pmId === undefined) return false;
    const numId = Number(pmId);
    return this.selectedPmIds().map(Number).includes(numId);
  }

  isActSelected(actId: number): boolean {
    if (actId === undefined) return false;
    const numId = Number(actId);
    return this.selectedActIds().map(Number).includes(numId);
  }

  normalizeDia(dia: any): string {
    if (!dia || typeof dia !== 'string') return 'Lunes';
    const d = dia.trim().toLowerCase();
    if (d.includes('lun')) return 'Lunes';
    if (d.includes('mar')) return 'Martes';
    if (d.includes('mi')) return 'Miércoles';
    if (d.includes('jue')) return 'Jueves';
    if (d.includes('vie')) return 'Viernes';
    if (d.includes('s')) return 'Sábado';
    if (d.includes('dom')) return 'Domingo';
    return 'Lunes';
  }

  getPmDiaSemana(pmId: number | undefined): string {
    if (pmId === undefined) return 'Lunes';
    const numId = Number(pmId);
    const dia = (this.pmDiasSemana() as any)[numId] || (this.pmDiasSemana() as any)[String(numId)] || 'Lunes';
    return this.normalizeDia(dia);
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
    this.formMercaderistaId.set(Number(p.usuarioId));
    this.formPdvId.set(Number(p.pdvId));
    this.formFechaInicio.set(p.fechaInicio || '');
    this.formFechaFin.set(p.fechaFin || '');
    
    // Parse pm_ids and act_ids cleanly with deduplication
    const pmIds = p.pmIds ? Array.from(new Set(p.pmIds.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0))) : [];
    const actIds = p.actIds ? Array.from(new Set(p.actIds.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0))) : [];
    
    let diasParsed: any = {};
    if (p.diasSemanaPms) {
      try { 
        const parsed = JSON.parse(p.diasSemanaPms);
        if (typeof parsed === 'object' && parsed !== null) {
          Object.keys(parsed).forEach(k => {
            const normalized = this.normalizeDia(parsed[k]);
            diasParsed[k] = normalized;
            diasParsed[Number(k)] = normalized;
          });
        }
      } catch (e) {
        console.warn('Could not parse diasSemanaPms:', p.diasSemanaPms);
      }
    }

    // Ensure all pmIds have a default day if not present in diasParsed
    pmIds.forEach(pmId => {
      const val = diasParsed[pmId] || diasParsed[String(pmId)];
      const normalized = this.normalizeDia(val);
      diasParsed[pmId] = normalized;
      diasParsed[String(pmId)] = normalized;
    });

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

    const cleanDias: { [pmId: string]: string } = {};
    this.selectedPmIds().forEach(pmId => {
      const numId = Number(pmId);
      const dia = (this.pmDiasSemana() as any)[numId] || (this.pmDiasSemana() as any)[String(numId)] || 'Lunes';
      cleanDias[String(numId)] = dia;
    });

    const payload: Planning = {
      planningId: this.selectedPlanning()?.planningId,
      usuarioId: Number(this.formMercaderistaId()),
      pdvId: Number(this.formPdvId()),
      pmIds: Array.from(new Set(this.selectedPmIds().map(Number))).join(','),
      diasSemanaPms: JSON.stringify(cleanDias),
      actIds: Array.from(new Set(this.selectedActIds().map(Number))).join(','),
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
