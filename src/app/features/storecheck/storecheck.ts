import { Component, computed, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { SKUForm } from '../../core/models/sku.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-storecheck',
  imports: [FormsModule],
  templateUrl: './storecheck.html',
  styleUrl: './storecheck.css'
})
export class StorecheckComponent implements OnInit {
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

  filterPanelOpen = signal(false);
  selectedMercaderista = signal('');
  selectedActividad = signal('');
  selectedFecha = signal('');

  currentPage = signal(1);
  pageSize = signal(20);
  selectedPreviewSC = signal<any | null>(null);

  scStep = signal(0);
  SC_STEPS = ["PDV", "Puesto", "Actividad", "Foto", "Stock", "Confirmar"];

  scForm = signal<any>({
    pdv: "",
    puestoNum: "",
    puestoNombre: "",
    pmId: null,
    actividad: "",
    actividadId: null,
    observaciones: "",
    productos: [],
    fotos: []
  });

  isCameraOpen = signal(false);
  currentCaptureType = signal<'pdv' | 'puesto' | null>(null);
  capturedPhotoPDV = signal<string | null>(null);
  capturedPhotoPuesto = signal<string | null>(null);
  stream = signal<MediaStream | null>(null);

  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  mercaderistasUnicos = computed(() => {
    const mercs = this.dataService.storechecks().map(s => s.mercaderista).filter(Boolean);
    return [...new Set(mercs)].sort();
  });

  actividadesUnicas = computed(() => {
    const acts = this.dataService.storechecks().map(s => s.actividad).filter(Boolean);
    return [...new Set(acts)].sort();
  });

  hayFiltros = computed(() => {
    return this.selectedMercaderista() !== '' ||
           this.selectedActividad() !== '' ||
           this.selectedFecha() !== '';
  });

  filteredSCs = computed(() => {
    const term = this.filter().toLowerCase().trim();
    const merc = this.selectedMercaderista();
    const act = this.selectedActividad();
    const fecha = this.selectedFecha();

    return this.dataService.storechecks().filter(s => {
      if (term && !s.pdv.toLowerCase().includes(term) && !(s.puesto || '').toLowerCase().includes(term) && !s.mercaderista.toLowerCase().includes(term) && !s.actividad.toLowerCase().includes(term)) {
        return false;
      }
      if (merc && s.mercaderista !== merc) return false;
      if (act && s.actividad !== act) return false;
      if (fecha && !s.fecha.includes(fecha)) return false;
      return true;
    });
  });

  paginatedSCs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredSCs().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredSCs().length / this.pageSize()) || 1;
  });

  toggleFilterPanel() {
    this.filterPanelOpen.update(v => !v);
  }

  limpiarFiltros() {
    this.selectedMercaderista.set('');
    this.selectedActividad.set('');
    this.selectedFecha.set('');
    this.currentPage.set(1);
    this.triggerSearchProgress();
    this.dataService.showNotification('Filtros de Storecheck limpiados');
  }

  limpiarTodosFiltros() {
    this.filter.set('');
    this.limpiarFiltros();
  }

  onMercaderistaChange(event: Event) {
    this.selectedMercaderista.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.triggerSearchProgress();
  }

  onActividadChange(event: Event) {
    this.selectedActividad.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.triggerSearchProgress();
  }

  onFechaChange(event: Event) {
    this.selectedFecha.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.triggerSearchProgress();
  }

  actVigentes = computed(() => this.dataService.actividades().filter(a => a.estado === "Vigente"));
  pdvActivos = computed(() => this.dataService.pdvs().filter(p => p.estado === "Activo"));
  
  pdvSeleccionado = computed(() => this.dataService.pdvs().find(p => p.nombre === this.scForm().pdv));

  activePlanningsToday = computed(() => {
    const currentUser = this.auth.currentUser();
    if (!currentUser || currentUser.role !== 'mercaderista') return [];
    const todayStr = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD local
    return this.dataService.plannings().filter(p => 
      p.usuarioId === currentUser.id && todayStr >= p.fechaInicio && todayStr <= p.fechaFin
    );
  });

  activePlanningsSets = computed(() => {
    const pdvNames = new Set<string>();
    const pmIdsByPdv = new Map<number, Set<number>>();
    const actIds = new Set<number>();
    for (const p of this.activePlanningsToday()) {
      if (p.pdvNombre) pdvNames.add(p.pdvNombre);
      if (p.pmIds) {
        let pmSet = pmIdsByPdv.get(p.pdvId);
        if (!pmSet) {
          pmSet = new Set<number>();
          pmIdsByPdv.set(p.pdvId, pmSet);
        }
        p.pmIds.split(',').forEach(id => pmSet!.add(Number(id)));
      }
      if (p.actIds) {
        p.actIds.split(',').forEach(id => actIds.add(Number(id)));
      }
    }
    return { pdvNames, pmIdsByPdv, actIds };
  });

  isPdvActiveToday(pdvName: string): boolean {
    return this.activePlanningsSets().pdvNames.has(pdvName);
  }

  isPmActiveToday(pmId: number | undefined): boolean {
    if (pmId === undefined || pmId === null) return false;
    const currentPdv = this.pdvSeleccionado();
    if (!currentPdv) return false;
    return this.activePlanningsSets().pmIdsByPdv.get(currentPdv.id)?.has(pmId) ?? false;
  }

  isActividadActiveToday(actId: number): boolean {
    return this.activePlanningsSets().actIds.has(actId);
  }

  constructor(public dataService: DataService, public auth: AuthService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.dataService.loadModuleData('storecheck');
    this.triggerSearchProgress();
    this.route.queryParams.subscribe(params => {
      if (params['pdvName']) {
        this.scForm.set({
          pdv: params['pdvName'], puestoNum: "", puestoNombre: "", pmId: null, actividad: "", actividadId: null, observaciones: "",
          productos: [], fotos: []
        });
        
        if (params['autoCamera'] === 'pdv') {
          this.scStep.set(1);
          setTimeout(() => this.openCamera('pdv'), 500);
        } else {
          this.scStep.set(1);
        }
      }
    });
  }

  updateFilter(event: Event) {
    this.filter.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.triggerSearchProgress();
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
    this.triggerSearchProgress();
  }

  previewStorecheck(sc: any) {
    this.selectedPreviewSC.set(sc);
  }

  closePreview() {
    this.selectedPreviewSC.set(null);
  }

  parseReporte(reporte: any): any[] {
    if (!reporte) return [];
    if (typeof reporte === 'string') {
      try {
        return JSON.parse(reporte);
      } catch (e) {
        return [];
      }
    }
    if (Array.isArray(reporte)) return reporte;
    return [];
  }

  startNewSC() {
    this.scForm.set({
      pdv: "", puestoNum: "", puestoNombre: "", pmId: null, actividad: "", actividadId: null, observaciones: "",
      productos: []
    });
    this.scStep.set(1);
  }

  cancelSC() {
    this.scStep.set(0);
    this.closeCamera();
    this.capturedPhotoPDV.set(null);
    this.capturedPhotoPuesto.set(null);
  }

  nextStep() {
    this.scStep.set(this.scStep() + 1);
  }

  prevStep() {
    this.scStep.set(this.scStep() - 1);
  }

  scStep1Next() {
    if (!this.scForm().pdv) {
      this.dataService.showNotification("Debes seleccionar un PDV", "error");
      return;
    }
    this.nextStep();
  }

  selectPuesto(num: string, nombre: string, pmId?: number) {
    this.scForm.update(f => ({...f, puestoNum: num, puestoNombre: nombre, pmId: pmId || null}));
  }

  selectActividad(id: number, nombre: string) {
    const current = this.scForm();
    if (current.actividadId === id) {
      // Deseleccionar
      this.scForm.update(f => ({...f, actividadId: null, actividad: ""}));
    } else {
      this.scForm.update(f => ({...f, actividadId: id, actividad: nombre}));
    }
  }

  // Llamado al pasar del paso 3 al 4, o del 4 al 5: cargar productos de la actividad seleccionada
  loadProductosForActividad() {
    const actId = this.scForm().actividadId;
    if (actId) {
      const act = this.dataService.actividades().find(a => a.id === actId);
      if (act && act.skuIds && act.skuIds.length) {
        const skus = this.dataService.skus().filter(s => act.skuIds.includes(s.id));
        this.scForm.update(f => ({
          ...f,
          productos: skus.map(s => ({...s, stockInicial: "", stockFinal: "", tieneActividad: true}))
        }));
        return;
      }
    }
    // Fallback: todos los SKUs activos
    this.scForm.update(f => ({
      ...f,
      productos: this.dataService.skus().filter(s => s.activo).map(s => ({...s, stockInicial: "", stockFinal: "", tieneActividad: false}))
    }));
  }

  scStep3Next() {
    this.loadProductosForActividad();
    this.nextStep();
  }

  scValidateStock() {
    const invalidos = this.scForm().productos.filter((p: SKUForm) => p.stockInicial === "" || p.stockFinal === "");
    if(invalidos.length) {
      this.dataService.showNotification(`${invalidos.length} producto(s) con stock vacío — completa todos los campos obligatorios`, "error");
      return;
    }
    this.nextStep();
  }

  async openCamera(type: 'pdv' | 'puesto') {
    try {
      this.currentCaptureType.set(type);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      this.stream.set(mediaStream);
      this.isCameraOpen.set(true);
      setTimeout(() => {
        if (this.videoElement && this.videoElement.nativeElement) {
          this.videoElement.nativeElement.srcObject = mediaStream;
          this.videoElement.nativeElement.play().catch(e => console.error(e));
        }
      }, 100);
    } catch (error) {
      this.dataService.showNotification("Error al acceder a la cámara. Revisa los permisos.", "error");
    }
  }

  capturePhoto() {
    if (this.videoElement && this.canvasElement) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const type = this.currentCaptureType();
        if (type === 'pdv') {
          this.capturedPhotoPDV.set(dataUrl);
        } else {
          this.capturedPhotoPuesto.set(dataUrl);
        }
        
        const fotos = [this.capturedPhotoPDV() || '', this.capturedPhotoPuesto() || ''].filter(Boolean);
        this.scForm.update(f => ({...f, fotos: fotos}));
        
        this.closeCamera();
      }
    }
  }

  closeCamera() {
    const s = this.stream();
    if (s) {
      s.getTracks().forEach(track => track.stop());
      this.stream.set(null);
    }
    this.isCameraOpen.set(false);
    this.currentCaptureType.set(null);
  }

  retakePhoto(type: 'pdv' | 'puesto') {
    if (type === 'pdv') {
      this.capturedPhotoPDV.set(null);
    } else {
      this.capturedPhotoPuesto.set(null);
    }
    const fotos = [this.capturedPhotoPDV() || '', this.capturedPhotoPuesto() || ''].filter(Boolean);
    this.scForm.update(f => ({...f, fotos: fotos}));
    this.openCamera(type);
  }

  completeSC() {
    const f = this.scForm();
    const isMercaderista = this.auth.currentUser()?.role === 'mercaderista';
    const estado = isMercaderista ? "Pendiente" : "Completado";
    this.dataService.addStorecheck({
      id: Date.now(),
      pdv: f.pdv,
      puesto: f.puestoNum ? (f.puestoNum + " — " + f.puestoNombre) : "",
      fecha: new Date().toISOString().split("T")[0],
      mercaderista: this.auth.currentUser()?.name || '',
      estado: estado,
      skus: f.productos.length,
      foto: true,
      actividad: f.actividad || "General",
      observaciones: f.observaciones,
      pmId: f.pmId || undefined,
      fotos: f.fotos && f.fotos.length > 0 ? JSON.stringify(f.fotos) : null,
      reporte: JSON.stringify(f.productos.map((p: any) => ({
        nombre: p.nombre || p.skuNombre,
        stockInicial: p.stockInicial,
        stockFinal: p.stockFinal
      })))
    });
    this.dataService.showNotification("Storecheck completado y guardado exitosamente");
    this.capturedPhotoPDV.set(null);
    this.capturedPhotoPuesto.set(null);
    this.scStep.set(0);
  }

  getSkuNames(skuIds: number[]) {
    return skuIds.map(id => this.dataService.skus().find(s => s.id === id)?.nombre).filter(Boolean).join(", ");
  }

  todayISO() {
    return new Date().toISOString().split("T")[0];
  }

  todayFormatted() {
    const d = new Date();
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  }
}
