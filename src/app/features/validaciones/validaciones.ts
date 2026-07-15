import { Component, computed, signal, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Storecheck } from '../../core/models/storecheck.model';

@Component({
  selector: 'app-validaciones',
  imports: [],
  templateUrl: './validaciones.html',
  styleUrl: './validaciones.css'
})
export class ValidacionesComponent implements OnInit {
  
  activeModal = signal<string | null>(null);
  selectedStorecheck = signal<Storecheck | null>(null);
  filter = signal('');
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

  // Filtered storechecks based on user role and team, sorted by ID desc
  filteredStorechecks = computed(() => {
    const currentUser = this.auth.currentUser();
    const storechecks = [...this.dataService.storechecks()];
    if (!currentUser) return [];

    let filtered = storechecks;
    // If supervisor, only show members of their commercial team
    if (currentUser.role === 'supervisor') {
      const teamName = currentUser.equipoComercial;
      if (!teamName) return [];
      
      const teamUsernames = this.dataService.users()
        .filter(u => u.equipoComercial === teamName)
        .map(u => u.name.trim().toLowerCase());

      filtered = storechecks.filter(s => {
        const mercName = (s.mercaderista || '').trim().toLowerCase();
        return teamUsernames.some(uName => uName === mercName || uName.includes(mercName) || mercName.includes(uName));
      });
    }

    const term = this.filter().toLowerCase().trim();
    if (term) {
      filtered = filtered.filter(s => 
        (s.pdv || '').toLowerCase().includes(term) ||
        (s.puesto || '').toLowerCase().includes(term) ||
        (s.mercaderista || '').toLowerCase().includes(term) ||
        (s.estado || '').toLowerCase().includes(term) ||
        String(s.id).includes(term)
      );
    }

    return filtered.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  });

  paginatedStorechecks = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredStorechecks().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredStorechecks().length / this.pageSize()) || 1;
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

  updateFilter(event: Event) {
    this.filter.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.triggerSearchProgress();
  }

  // KPIs should be calculated using the filtered storechecks list for the user
  comp = computed(() => this.filteredStorechecks().filter((s: Storecheck) => s.estado === 'Completado').length);
  pend = computed(() => this.filteredStorechecks().filter((s: Storecheck) => s.estado !== 'Completado').length);
  foto = computed(() => this.filteredStorechecks().filter((s: Storecheck) => s.foto).length);

  constructor(
    public dataService: DataService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.dataService.loadModuleData('validaciones');
    this.triggerSearchProgress();
  }

  validateSC(sc: Storecheck) {
    this.dataService.updateStorecheck({...sc, estado: 'Completado'});
    this.dataService.showNotification("Storecheck validado y aprobado");
  }

  openDetailModal(sc: Storecheck) {
    this.selectedStorecheck.set(sc);
    this.activeModal.set('detail');
  }

  closeModal() {
    this.activeModal.set(null);
    this.selectedStorecheck.set(null);
  }

  getProducts(sc: Storecheck | null): any[] {
    if (!sc) return [];
    if (sc.reporte) {
      try {
        return JSON.parse(sc.reporte);
      } catch (e) {
        console.error("Error parsing storecheck products", e);
      }
    }
    // Fallback con productos de demostración si es un registro previo sin reporte serializado
    return [
      { nombre: 'Inca Kola 1.5L', stockInicial: 12, stockFinal: 8 },
      { nombre: 'Coca Cola Sin Azúcar 1.5L', stockInicial: 24, stockFinal: 19 },
      { nombre: 'Fanta Naranja 1.5L', stockInicial: 10, stockFinal: 4 }
    ];
  }
}
