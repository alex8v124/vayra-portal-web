import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { PDV } from '../models/pdv.model';
import { SKU } from '../models/sku.model';
import { Actividad } from '../models/actividad.model';
import { Storecheck } from '../models/storecheck.model';
import { Planning } from '../models/planning.model';
import { EquipoComercial } from '../models/equipo-comercial.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  users = signal<User[]>([]);
  pdvs = signal<PDV[]>([]);
  skus = signal<SKU[]>([]);
  actividades = signal<Actividad[]>([]);
  storechecks = signal<Storecheck[]>([]);
  isLoadingStorechecks = signal<boolean>(false);
  plannings = signal<Planning[]>([]);
  isLoadingPlannings = signal<boolean>(true);
  equipos = signal<EquipoComercial[]>([]);

  private apiUrl = `${environment.apiUrl}/api/data`;
  private apiUsuarios = `${environment.apiUrl}/api/usuarios`;
  private apiEquipos = `${environment.apiUrl}/api/data/equipos`;

  private loadedModules = new Set<string>();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { 
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
    }
  }

  loadModuleData(moduleName: string, forceReload = false) {
    if (!isPlatformBrowser(this.platformId)) return;
    if (forceReload || !this.loadedModules.has(moduleName)) {
      this.loadedModules.add(moduleName);
      switch (moduleName) {
        case 'pdv':
          if (forceReload || !this.pdvs().length) this.loadPdvs();
          if (forceReload || !this.plannings().length) this.loadPlannings();
          break;
        case 'storecheck':
          if (forceReload || !this.storechecks().length) this.loadStorechecks();
          if (forceReload || !this.pdvs().length) this.loadPdvs();
          if (forceReload || !this.actividades().length) this.loadActividades();
          if (forceReload || !this.skus().length) this.loadSkus();
          break;
        case 'reportes':
        case 'validaciones':
          if (forceReload || !this.storechecks().length) this.loadStorechecks();
          break;
        case 'planning':
          if (forceReload || !this.plannings().length) this.loadPlannings();
          if (forceReload || !this.pdvs().length) this.loadPdvs();
          if (forceReload || !this.actividades().length) this.loadActividades();
          break;
        case 'skus':
          if (forceReload || !this.skus().length) this.loadSkus();
          break;
        case 'actividades':
          if (forceReload || !this.actividades().length) this.loadActividades();
          if (forceReload || !this.skus().length) this.loadSkus();
          if (forceReload || !this.plannings().length) this.loadPlannings();
          break;
        case 'usuarios':
        case 'equipos':
          if (forceReload || !this.users().length) this.loadUsers();
          if (forceReload || !this.equipos().length) this.loadEquipos();
          break;
        case 'dashboard':
          if (forceReload || !this.storechecks().length) this.loadStorechecks();
          if (forceReload || !this.skus().length) this.loadSkus();
          if (forceReload || !this.pdvs().length) this.loadPdvs();
          if (forceReload || !this.actividades().length) this.loadActividades();
          break;
      }
    }
  }

  // ==== USUARIOS ====
  loadUsers() {
    this.http.get<User[]>(this.apiUsuarios).subscribe({
      next: (data) => this.users.set(data),
      error: (err) => console.error('Error fetching users', err)
    });
  }

  updateUser(updated: User) {
    if (!updated.id) return;
    this.http.put(`${this.apiUsuarios}/${updated.id}`, updated).subscribe({
      next: () => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.showNotification('Usuario actualizado', 'success');
      },
      error: (err) => this.showNotification('Error al actualizar', 'error')
    });
  }

  deleteUser(id: number) {
    this.http.delete(`${this.apiUsuarios}/${id}`).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== id));
        this.showNotification('Usuario eliminado', 'success');
      },
      error: (err) => this.showNotification('Error al eliminar', 'error')
    });
  }
  
  addUser(user: User) {
    this.http.post<any>(this.apiUsuarios, user).subscribe({
      next: res => {
        if(res.success || res.id) {
          user.id = res.id;
          this.users.update(list => [...list, user]);
          this.showNotification('Usuario creado', 'success');
        }
      },
      error: err => this.showNotification('Error al crear usuario', 'error')
    });
  }

  // ==== PDVs ====
  loadPdvs() {
    this.http.get<any[]>(`${this.apiUrl}/pdvs`).subscribe({
      next: (data) => {
        const mapped = data.map(d => ({
          id: d.pdvId, nombre: d.pdvNombre, codigo: d.codigo, distrito: d.distrito,
          tipo: d.tipo, estado: d.estado,
          visitas: d.visitas, pendiente: d.pendiente, puestos: [] as any[]
        }));
        this.pdvs.set(mapped);
        // Cargar puestos de mercado de la BD y asignarlos a cada PDV
        this.loadPuestos();
      },
      error: (err) => console.error('Error fetching PDVs', err)
    });
  }

  loadPuestos() {
    this.http.get<any[]>(`${this.apiUrl}/pms`).subscribe({
      next: (pms) => {
        const pmMap = new Map<number, any[]>();
        for (const pm of pms) {
          const pid = Number(pm.pdvId);
          if (!pmMap.has(pid)) pmMap.set(pid, []);
          pmMap.get(pid)!.push({
            pmId: Number(pm.pmId),
            num: 'P-' + String(pm.pmId).padStart(2, '0'),
            nombre: pm.pmNombre,
            actIds: (pm.actIds || []).map(Number)
          });
        }
        this.pdvs.update(pdvList => {
          return pdvList.map(pdv => ({
            ...pdv,
            puestos: pmMap.get(Number(pdv.id)) || []
          }));
        });
      }
    });
  }

  addPuesto(pdvId: number, nombre: string, actIds: number[]) {
    const payload = { pmNombre: nombre, pdvId, actIds };
    this.http.post<any>(`${this.apiUrl}/pms`, payload).subscribe({
      next: () => {
        this.loadPuestos();
        this.showNotification('Puesto agregado exitosamente');
      },
      error: () => this.showNotification('Error al crear puesto', 'error')
    });
  }

  updatePuesto(pmId: number, nombre: string, pdvId: number, actIds: number[]) {
    const payload = { pmNombre: nombre, pdvId, actIds };
    this.http.put(`${this.apiUrl}/pms/${pmId}`, payload).subscribe({
      next: () => {
        this.loadPuestos();
        this.showNotification('Puesto actualizado');
      },
      error: () => this.showNotification('Error al actualizar puesto', 'error')
    });
  }

  deletePuesto(pmId: number) {
    this.http.delete(`${this.apiUrl}/pms/${pmId}`).subscribe({
      next: () => {
        this.loadPuestos();
        this.showNotification('Puesto eliminado');
      },
      error: () => this.showNotification('Error al eliminar puesto', 'error')
    });
  }
  
  updatePDV(updated: PDV) {
    const payload = { pdvId: updated.id, pdvNombre: updated.nombre, codigo: updated.codigo, distrito: updated.distrito, tipo: updated.tipo, estado: updated.estado, visitas: updated.visitas, pendiente: updated.pendiente };
    this.http.put(`${this.apiUrl}/pdvs/${updated.id}`, payload).subscribe({
      next: () => {
        this.pdvs.update(list => list.map(p => p.id === updated.id ? updated : p));
        this.showNotification('PDV actualizado', 'success');
      },
      error: () => this.showNotification('Error', 'error')
    });
  }

  addPDV(pdv: PDV) {
    const payload = { pdvNombre: pdv.nombre, codigo: pdv.codigo, distrito: pdv.distrito, tipo: pdv.tipo, estado: pdv.estado, visitas: pdv.visitas, pendiente: pdv.pendiente };
    this.http.post<any>(`${this.apiUrl}/pdvs`, payload).subscribe({
      next: (res) => {
        pdv.id = res.pdvId;
        this.pdvs.update(list => [...list, pdv]);
        this.showNotification('PDV creado', 'success');
      },
      error: () => this.showNotification('Error', 'error')
    });
  }

  // ==== SKUs ====
  loadSkus() {
    this.http.get<any[]>(`${this.apiUrl}/productos`).subscribe({
      next: (data) => {
        const mapped = data.map(d => ({
          id: d.productoId, codigo: `SKU-00${d.productoId}`, nombre: d.nombre, 
          marca: d.marca, categoria: d.categoria, activo: d.estado
        }));
        this.skus.set(mapped);
      },
      error: (err) => console.error('Error fetching SKUs', err)
    });
  }

  updateSKU(updated: SKU) {
    const payload = { nombre: updated.nombre, marca: updated.marca, categoria: updated.categoria, estado: updated.activo, precio: 0 };
    this.http.put(`${this.apiUrl}/productos/${updated.id}`, payload).subscribe({
      next: () => {
        this.skus.update(list => list.map(s => s.id === updated.id ? updated : s));
        this.showNotification('SKU actualizado', 'success');
      }
    });
  }

  addSKU(sku: SKU) {
    const payload = { nombre: sku.nombre, marca: sku.marca, categoria: sku.categoria, estado: sku.activo, precio: 0 };
    this.http.post<any>(`${this.apiUrl}/productos`, payload).subscribe({
      next: (res) => {
        sku.id = res.productoId;
        sku.codigo = `SKU-00${res.productoId}`;
        this.skus.update(list => [...list, sku]);
        this.showNotification('SKU creado', 'success');
      }
    });
  }

  deleteSKU(id: number) {
    this.http.delete(`${this.apiUrl}/productos/${id}`).subscribe({
      next: () => {
        this.skus.update(list => list.filter(s => s.id !== id));
        this.showNotification('SKU eliminado', 'success');
      },
      error: () => this.showNotification('Error al eliminar SKU', 'error')
    });
  }

  addSKUsBulk(skus: SKU[]) {
    const payload = skus.map(sku => ({ nombre: sku.nombre, marca: sku.marca, categoria: sku.categoria, estado: sku.activo, precio: 0 }));
    this.http.post<any[]>(`${this.apiUrl}/productos/bulk`, payload).subscribe({
      next: (res) => {
        this.loadSkus(); // Recargamos para obtener todos los IDs reales generados
        this.showNotification(`Se importaron ${res.length} SKUs con éxito`, 'success');
      },
      error: () => this.showNotification('Error importando los SKUs', 'error')
    });
  }

  // ==== ACTIVIDADES ====
  loadActividades() {
    this.http.get<any[]>(`${this.apiUrl}/actividades`).subscribe({
      next: (data) => {
        const mapped = data.map(d => ({
          id: d.actId, nombre: d.nombre || d.actPromocional, tipo: d.tipo, estado: d.estado, 
          inicio: d.inicio, fin: d.fin, descripcion: d.descripcion,
          skuIds: d.skuIds ? d.skuIds.split(',').map(Number) : []
        }));
        this.actividades.set(mapped);
      }
    });
  }

  updateActividad(updated: Actividad) {
    const payload = { nombre: updated.nombre, tipo: updated.tipo, estado: updated.estado, inicio: updated.inicio, fin: updated.fin, descripcion: updated.descripcion, skuIds: updated.skuIds.join(',') };
    this.http.put(`${this.apiUrl}/actividades/${updated.id}`, payload).subscribe({
      next: () => {
        this.actividades.update(list => list.map(a => a.id === updated.id ? updated : a));
        this.showNotification('Actividad actualizada', 'success');
      }
    });
  }

  addActividad(actividad: Actividad) {
    const payload = { nombre: actividad.nombre, tipo: actividad.tipo, estado: actividad.estado, inicio: actividad.inicio, fin: actividad.fin, descripcion: actividad.descripcion, skuIds: actividad.skuIds.join(',') };
    this.http.post<any>(`${this.apiUrl}/actividades`, payload).subscribe({
      next: (res) => {
        actividad.id = res.actId;
        this.actividades.update(list => [...list, actividad]);
        this.showNotification('Actividad creada', 'success');
      }
    });
  }

  deleteActividad(id: number) {
    this.http.delete(`${this.apiUrl}/actividades/${id}`).subscribe({
      next: () => {
        this.actividades.update(list => list.filter(a => a.id !== id));
        this.showNotification('Actividad eliminada', 'success');
      }
    });
  }

  // ==== STORECHECKS ====
  loadStorechecks() {
    this.isLoadingStorechecks.set(true);
    this.http.get<any[]>(`${this.apiUrl}/reportes`).subscribe({
      next: (data) => {
        const mapped = data.map(d => ({
          id: d.registroReporteId, pdv: d.pdv, puesto: d.puesto, fecha: d.fechaStr, 
          mercaderista: d.mercaderista, estado: d.estado, skus: d.skus, foto: d.foto, 
          actividad: d.actividad, observaciones: d.observaciones,
          pmId: d.pm ? d.pm.pmId : undefined,
          reporte: d.reporte,
          fotos: d.fotos ? JSON.parse(d.fotos) : null
        }));
        this.storechecks.set(mapped.reverse());
        this.isLoadingStorechecks.set(false);
      },
      error: () => this.isLoadingStorechecks.set(false)
    });
  }

  updateStorecheck(updated: Storecheck) {
    const payload = { pdv: updated.pdv, puesto: updated.puesto, fechaStr: updated.fecha, mercaderista: updated.mercaderista, estado: updated.estado, skus: updated.skus, foto: updated.foto, actividad: updated.actividad, observaciones: updated.observaciones, pm: updated.pmId ? { pmId: updated.pmId } : null, reporte: updated.reporte };
    this.http.put(`${this.apiUrl}/reportes/${updated.id}`, payload).subscribe({
      next: () => {
        this.storechecks.update(list => list.map(s => s.id === updated.id ? updated : s));
        this.showNotification('Storecheck guardado', 'success');
      }
    });
  }

  addStorecheck(sc: Storecheck) {
    const payload = { pdv: sc.pdv, puesto: sc.puesto, fechaStr: sc.fecha, mercaderista: sc.mercaderista, estado: sc.estado, skus: sc.skus, foto: sc.foto, actividad: sc.actividad, observaciones: sc.observaciones, pm: sc.pmId ? { pmId: sc.pmId } : null, reporte: sc.reporte };
    this.http.post<any>(`${this.apiUrl}/reportes`, payload).subscribe({
      next: (res) => {
        sc.id = res.registroReporteId;
        this.storechecks.update(list => [sc, ...list]);
        this.showNotification('Storecheck enviado', 'success');
      }
    });
  }

  showNotification(message: string, type: 'success' | 'error' = 'success') {
    const el = document.getElementById("notif");
    if(el) {
      el.style.background = type === "success" ? "#10B981" : "#EF4444";
      el.innerHTML = `<svg width="16" height="16" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> ${message}`;
      el.style.display = "flex";
      setTimeout(() => { el.style.display = "none" }, 3200);
    }
  }

  // ==== PLANNING ====
  loadPlannings() {
    this.isLoadingPlannings.set(true);
    this.http.get<Planning[]>(`${this.apiUrl}/plannings`).subscribe({
      next: (data) => {
        this.plannings.set(data);
        this.isLoadingPlannings.set(false);
      },
      error: (err) => {
        console.error('Error fetching plannings', err);
        this.isLoadingPlannings.set(false);
      }
    });
  }

  addPlanning(planning: Planning) {
    this.http.post<Planning>(`${this.apiUrl}/plannings`, planning).subscribe({
      next: (res) => {
        if (res && (res as any).planningId) planning.planningId = (res as any).planningId;
        else if (res && (res as any).id) planning.planningId = (res as any).id;
        this.plannings.update(list => [planning, ...list]);
        this.showNotification('Planificación creada con éxito', 'success');
      },
      error: () => this.showNotification('Error al crear planificación', 'error')
    });
  }

  updatePlanning(id: number, planning: Planning) {
    this.http.put<Planning>(`${this.apiUrl}/plannings/${id}`, planning).subscribe({
      next: () => {
        this.plannings.update(list => list.map(p => p.planningId === id ? { ...planning, planningId: id } : p));
        this.showNotification('Planificación actualizada con éxito', 'success');
      },
      error: () => this.showNotification('Error al actualizar planificación', 'error')
    });
  }

  deletePlanning(id: number) {
    this.http.delete(`${this.apiUrl}/plannings/${id}`).subscribe({
      next: () => {
        this.plannings.update(list => list.filter(p => p.planningId !== id));
        this.showNotification('Planificación eliminada', 'success');
      },
      error: () => this.showNotification('Error al eliminar planificación', 'error')
    });
  }

  // ==== EQUIPOS COMERCIALES ====
  loadEquipos() {
    this.http.get<EquipoComercial[]>(this.apiEquipos).subscribe({
      next: (data) => this.equipos.set(data),
      error: (err) => console.error('Error fetching commercial teams', err)
    });
  }

  addEquipo(eq: EquipoComercial) {
    this.http.post<EquipoComercial>(this.apiEquipos, eq).subscribe({
      next: () => {
        this.loadEquipos();
        this.showNotification('Equipo comercial creado con éxito', 'success');
      },
      error: () => this.showNotification('Error al crear equipo comercial', 'error')
    });
  }

  updateEquipo(id: number, eq: EquipoComercial) {
    this.http.put<EquipoComercial>(`${this.apiEquipos}/${id}`, eq).subscribe({
      next: () => {
        this.loadEquipos();
        this.showNotification('Equipo comercial actualizado', 'success');
      },
      error: () => this.showNotification('Error al actualizar equipo comercial', 'error')
    });
  }

  deleteEquipo(id: number) {
    this.http.delete(`${this.apiEquipos}/${id}`).subscribe({
      next: () => {
        this.loadEquipos();
        this.showNotification('Equipo comercial eliminado', 'success');
      },
      error: () => this.showNotification('Error al eliminar equipo comercial', 'error')
    });
  }
}
