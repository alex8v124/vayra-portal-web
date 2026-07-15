import { Component, OnInit, Inject, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CronogramaService, Cronograma } from '../../core/services/cronograma.service';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Planning } from '../../core/models/planning.model';

@Component({
  selector: 'app-cronogramas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './cronogramas.html',
  styleUrl: './cronogramas.css'
})
export class CronogramasComponent implements OnInit {
  cronogramas: Cronograma[] = [];
  plannings: Planning[] = [];
  form: FormGroup;
  showModal = false;
  
  availablePlannings = computed(() => {
    const all = this.dataService.plannings();
    if (this.auth.isAdmin()) {
      return all;
    }
    const currentUser = this.auth.currentUser();
    if (currentUser?.role === 'supervisor') {
      const freshUser = this.dataService.users().find(u => Number(u.id) === Number(currentUser.id)) || currentUser;
      const assignedStr = freshUser.pdvsAsignados || currentUser.pdvsAsignados || '';
      if (assignedStr.trim()) {
        const allowedIds = new Set(assignedStr.split(',').map((id: string) => Number(id.trim())).filter(Boolean));
        return all.filter(p => p.pdvId && allowedIds.has(Number(p.pdvId)));
      }
    }
    return all;
  });

  // Vistas y Calendario
  viewMode: 'lista' | 'mes' | 'semana' | 'anio' = 'lista';
  currentDate: Date = new Date();
  
  calendarDays: { date: Date, currentMonth: boolean, dateString: string }[] = [];
  weekDays: { date: Date, dateString: string }[] = [];
  yearMonths: { monthIndex: number, monthName: string, days: {date: Date, dateString: string, currentMonth: boolean}[] }[] = [];
  calendarVisits: { [dateString: string]: any[] } = {};
  
  filterCronogramaId: string = 'ALL';
  filterPdv: string = 'ALL';

  showDayModal = false;
  selectedDateString: string = '';

  constructor(
    private cronogramaService: CronogramaService, 
    public dataService: DataService,
    public auth: AuthService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      planningIds: [[], Validators.required], // Array of strings/numbers
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarCronogramas();
      this.cargarPlannings();
      this.generateCalendar();
    }
  }

  cargarCronogramas() {
    this.cronogramaService.listar().subscribe({
      next: (data) => {
        this.cronogramas = data;
        if (this.viewMode !== 'lista') {
          this.extractVisitsForCalendar();
        }
      },
      error: (err) => console.error('Error cargando cronogramas', err)
    });
  }

  cargarPlannings() {
    this.dataService.loadPlannings();
  }

  getCantidadVisitas(jsonStr: string): number {
    try {
      const arr = JSON.parse(jsonStr);
      return Array.isArray(arr) ? arr.length : 0;
    } catch(e) {
      return 0;
    }
  }

  abrirModalNuevo() {
    this.form.reset({ nombre: '', planningIds: [], fechaInicio: '', fechaFin: '' });
    this.showModal = true;
  }

  setViewMode(mode: 'lista' | 'mes' | 'semana' | 'anio') {
    this.viewMode = mode;
    if (mode !== 'lista') {
      this.refreshViews();
      this.extractVisitsForCalendar();
    }
  }

  refreshViews() {
    if (this.viewMode === 'mes') this.generateCalendar();
    else if (this.viewMode === 'semana') this.generateWeek();
    else if (this.viewMode === 'anio') this.generateYear();
  }

  openDayModal(dateString: string) {
    if (this.calendarVisits[dateString] && this.calendarVisits[dateString].length > 0) {
      this.selectedDateString = dateString;
      this.showDayModal = true;
    }
  }

  cerrarDayModal() {
    this.showDayModal = false;
  }

  prevDate() {
    if (this.viewMode === 'mes') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    } else if (this.viewMode === 'semana') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate() - 7);
    } else if (this.viewMode === 'anio') {
      this.currentDate = new Date(this.currentDate.getFullYear() - 1, 1, 1);
    }
    this.refreshViews();
  }

  nextDate() {
    if (this.viewMode === 'mes') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    } else if (this.viewMode === 'semana') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate() + 7);
    } else if (this.viewMode === 'anio') {
      this.currentDate = new Date(this.currentDate.getFullYear() + 1, 1, 1);
    }
    this.refreshViews();
  }

  prevYear() {
    this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), this.currentDate.getDate());
    this.refreshViews();
  }

  nextYear() {
    this.currentDate = new Date(this.currentDate.getFullYear() + 1, this.currentDate.getMonth(), this.currentDate.getDate());
    this.refreshViews();
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    let firstDayIndex = firstDayOfMonth.getDay();
    
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      this.calendarDays.push({ date: d, currentMonth: false, dateString });
    }
    
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      this.calendarDays.push({ date: d, currentMonth: true, dateString });
    }
    
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      this.calendarDays.push({ date: d, currentMonth: false, dateString });
    }
  }

  generateWeek() {
    this.weekDays = [];
    const dayOfWeek = this.currentDate.getDay();
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - dayOfWeek); // Sunday as first day
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      this.weekDays.push({ date: d, dateString });
    }
  }

  generateYear() {
    this.yearMonths = [];
    const year = this.currentDate.getFullYear();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    for (let m = 0; m < 12; m++) {
      const days = [];
      const firstDay = new Date(year, m, 1);
      const lastDay = new Date(year, m + 1, 0);
      let firstDayIndex = firstDay.getDay();
      
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const d = new Date(year, m, -i);
        const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        days.push({ date: d, dateString, currentMonth: false });
      }
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, m, i);
        const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        days.push({ date: d, dateString, currentMonth: true });
      }
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const d = new Date(year, m + 1, i);
        const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        days.push({ date: d, dateString, currentMonth: false });
      }
      this.yearMonths.push({ monthIndex: m, monthName: monthNames[m], days });
    }
  }

  extractVisitsForCalendar() {
    this.calendarVisits = {};
    let filteredCronos = this.cronogramas;
    
    if (this.filterCronogramaId !== 'ALL') {
      filteredCronos = filteredCronos.filter(c => c.id?.toString() === this.filterCronogramaId);
    }
    
    filteredCronos.forEach(c => {
      try {
        const visitas: any[] = JSON.parse(c.datosJson);
        visitas.forEach(v => {
          if (this.filterPdv === 'ALL' || v.MERCADO === this.filterPdv) {
            if (!this.calendarVisits[v.fecha]) {
              this.calendarVisits[v.fecha] = [];
            }
            this.calendarVisits[v.fecha].push(v);
          }
        });
      } catch(e) {}
    });
  }

  applyFilters() {
    this.extractVisitsForCalendar();
  }

  getUniquePdvs(): string[] {
    const pdvs = new Set<string>();
    this.cronogramas.forEach(c => {
      try {
        const visitas: any[] = JSON.parse(c.datosJson);
        visitas.forEach(v => pdvs.add(v.MERCADO));
      } catch(e) {}
    });
    return Array.from(pdvs).sort();
  }

  eliminarCronograma(id: number) {
    if (confirm('¿Seguro que desea eliminar este cronograma?')) {
      this.cronogramaService.eliminar(id).subscribe({
        next: () => this.cargarCronogramas(),
        error: (err: any) => alert('Error eliminando: ' + err.message)
      });
    }
  }

  generarVisitas(plannings: Planning[], fechaInicio: Date, fechaFin: Date): any[] {
    const visitas: any[] = [];
    const diaAIndex: { [key: string]: number } = {
      'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 
      'Jueves': 4, 'Viernes': 5, 'Sábado': 6
    };

    plannings.forEach(planning => {
      let diasSemana: {[pmId: number]: string} = {};
      try {
        if (planning.diasSemanaPms) {
          diasSemana = JSON.parse(planning.diasSemanaPms);
        }
      } catch(e) {}

      const pmIds = planning.pmIds ? planning.pmIds.split(',').map(Number) : [];
      const pdv = this.dataService.pdvs().find(p => p.id === planning.pdvId);

      if (pdv) {
        pmIds.forEach(pmId => {
          const pm = pdv.puestos?.find(p => p.pmId === pmId);
          if (pm) {
            const diaName = diasSemana[pmId] || 'Lunes';
            const targetDay = diaAIndex[diaName];
            if (targetDay !== undefined) {
              let curr = new Date(fechaInicio.getTime());
              while (curr <= fechaFin) {
                if (curr.getUTCDay() === targetDay) {
                  visitas.push({
                    fecha: curr.toISOString().split('T')[0],
                    Ciudad: '',
                    MERCADO: pdv.nombre,
                    DEX: '',
                    nroPuesto: pm.num,
                    encargado: pm.nombre
                  });
                }
                curr.setUTCDate(curr.getUTCDate() + 1);
              }
            }
          }
        });
      }
    });

    visitas.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.MERCADO.localeCompare(b.MERCADO));
    return visitas;
  }

  guardar() {
    if (this.form.invalid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const value = this.form.value;
    const selectedIds = value.planningIds || [];
    if (selectedIds.length === 0) {
      alert('Debe seleccionar al menos un planning');
      return;
    }

    const allPlannings = this.dataService.plannings();
    const planningsElegidos = allPlannings.filter(p => p.planningId && selectedIds.includes(p.planningId.toString()));

    if (planningsElegidos.length === 0) {
      alert('Plannings seleccionados no encontrados');
      return;
    }

    const fInicio = new Date(value.fechaInicio);
    const fFin = new Date(value.fechaFin);
    
    if (fInicio > fFin) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    const visitas = this.generarVisitas(planningsElegidos, fInicio, fFin);

    const nuevo: Cronograma = {
      nombre: value.nombre,
      planningIds: selectedIds.join(','),
      fechaInicio: value.fechaInicio,
      fechaFin: value.fechaFin,
      datosJson: JSON.stringify(visitas)
    };

    this.cronogramaService.guardar(nuevo).subscribe({
      next: () => {
        this.showModal = false;
        this.cargarCronogramas();
      },
      error: (err: any) => alert('Error: ' + err.message)
    });
  }

  cerrarModal() {
    this.showModal = false;
  }
}
