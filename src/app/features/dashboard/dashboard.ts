import { Component, AfterViewInit, computed, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from '../../core/services/data.service';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  chartInstances: any = {};

  activosSKU = computed(() => this.dataService.skus().filter(s => s.activo).length);
  inactivosSKU = computed(() => this.dataService.skus().filter(s => !s.activo).length);
  compSC = computed(() => this.dataService.storechecks().filter(s => s.estado === 'Completado').length);
  pendSC = computed(() => this.dataService.storechecks().filter(s => s.estado === 'Pendiente').length);
  
  recentSC = computed(() => this.dataService.storechecks().slice(0, 4));

  constructor(
    public dataService: DataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initDashboardCharts();
    }
  }

  ngOnDestroy() {
    Object.values(this.chartInstances).forEach((c: any) => {
      try { c.destroy(); } catch(e) {}
    });
  }

  initDashboardCharts() {
    const cob = document.getElementById("chart-cobertura");
    const pie = document.getElementById("chart-pie");
    const merc = document.getElementById("chart-merc");
    const trend = document.getElementById("chart-trend");
    if(!cob || !pie || !merc || !trend) return;

    const planDia = [8,10,7,9,6];
    const execDia = [7,9,5,8,3];
    const pctDia = planDia.map((p,i) => Math.round(execDia[i]/p*100));

    this.chartInstances.cob = new Chart(cob, {
      type: "bar",
      data: {
        labels: ["Lunes","Martes","Miércoles","Jueves","Viernes"],
        datasets: [
          { label: "PDVs Planificados", data: planDia, backgroundColor: "rgba(226,232,240,0.8)", borderColor: "#CBD5E1", borderWidth: 1, borderRadius: {topLeft:5,topRight:5}, borderSkipped: false, order: 2, yAxisID: "y" },
          { label: "PDVs Ejecutados", data: execDia, backgroundColor: "rgba(14,165,233,0.85)", borderColor: "#0284C7", borderWidth: 1, borderRadius: {topLeft:5,topRight:5}, borderSkipped: false, order: 2, yAxisID: "y" },
          { label: "% Cobertura", data: pctDia, type: "line", borderColor: "#8B5CF6", backgroundColor: "rgba(139,92,246,0.08)", borderWidth: 2.5, pointBackgroundColor: "#8B5CF6", pointBorderColor: "#fff", pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 8, tension: 0.35, fill: false, order: 1, yAxisID: "y2" }
        ]
      },
      options: {
        responsive: true,
        interaction: {mode: "index", intersect: false},
        plugins: {
          legend: { display: true, position: "bottom", labels: {boxWidth: 12, font: {size: 11}, padding: 16, usePointStyle: false} },
          tooltip: {
            backgroundColor: "#fff", borderColor: "#E2E8F0", borderWidth: 1, titleColor: "#0F172A", bodyColor: "#64748B", padding: 10,
            callbacks: { label: (ctx:any) => ctx.dataset.label === "% Cobertura" ? ` Cobertura: ${ctx.parsed.y}%` : ` ${ctx.dataset.label}: ${ctx.parsed.y} PDVs` }
          }
        },
        scales: {
          x: { grid: {display: false}, border: {display: false}, ticks: {font: {size: 11}, color: "#94A3B8"} },
          y: { min: 0, max: 12, position: "left", grid: {color: "#E2E8F0", drawBorder: false, lineWidth: 1}, border: {display: false, dash: [3,3]}, ticks: {font: {size: 11}, color: "#94A3B8", stepSize: 2, callback: (v:any)=>v+" PDVs"} },
          y2: { min: 0, max: 100, position: "right", grid: {display: false}, border: {display: false}, ticks: {font: {size: 11}, color: "#8B5CF6", stepSize: 20, callback: (v:any)=>v+"%"} }
        }
      }
    });

    const scData = this.dataService.storechecks();
    const nComp = scData.filter(s=>s.estado==="Completado").length;
    const nProc = scData.filter(s=>s.estado==="En Proceso").length;
    const nPend = scData.filter(s=>s.estado==="Pendiente").length;
    this.chartInstances.pie = new Chart(pie, {
      type: "doughnut",
      data: {
        labels: ["Completados","En Proceso","Pendientes"],
        datasets: [{ data: [nComp,nProc,nPend], backgroundColor: ["#10B981","#F59E0B","#CBD5E1"], hoverBackgroundColor: ["#059669","#D97706","#94A3B8"], borderWidth: 3, borderColor: "#fff", hoverOffset: 6 }]
      },
      options: {
        responsive: true, cutout: "68%",
        plugins: {
          legend: {display: false},
          tooltip: {
            backgroundColor: "#fff", borderColor: "#E2E8F0", borderWidth: 1, titleColor: "#0F172A", bodyColor: "#64748B",
            callbacks: { label: (ctx:any) => { const total = ctx.dataset.data.reduce((a:number,b:number)=>a+b,0); return ` ${ctx.label}: ${ctx.parsed} (${Math.round(ctx.parsed/total*100)}%)`; } }
          }
        }
      }
    });

    const mercaderistas = [...new Set(scData.map(s=>s.mercaderista))];
    const dataComp = mercaderistas.map(m=>scData.filter(s=>s.mercaderista===m&&s.estado==="Completado").length);
    const dataProc = mercaderistas.map(m=>scData.filter(s=>s.mercaderista===m&&s.estado==="En Proceso").length);
    const dataPend = mercaderistas.map(m=>scData.filter(s=>s.mercaderista===m&&s.estado==="Pendiente").length);
    this.chartInstances.merc = new Chart(merc, {
      type: "bar",
      data: {
        labels: mercaderistas,
        datasets: [
          {label:"Completados",data:dataComp,backgroundColor:"#10B981",borderRadius:4,borderSkipped:false},
          {label:"En Proceso",data:dataProc,backgroundColor:"#F59E0B",borderRadius:4,borderSkipped:false},
          {label:"Pendientes",data:dataPend,backgroundColor:"#E2E8F0",borderRadius:4,borderSkipped:false}
        ]
      },
      options: {
        indexAxis: "y", responsive: true, interaction: {mode:"index",intersect:false},
        plugins: { legend: {display: true, position: "bottom", labels: {boxWidth: 11, font: {size: 11}, padding: 14}}, tooltip: {backgroundColor: "#fff", borderColor: "#E2E8F0", borderWidth: 1, titleColor: "#0F172A", bodyColor: "#64748B"} },
        scales: {
          x: { stacked: true, grid: {color: "#E2E8F0", drawBorder: false, lineWidth: 1}, border: {display: false, dash: [3,3]}, ticks: {font: {size: 11}, color: "#94A3B8", stepSize: 1, callback: (v:any)=>v+" SC"} },
          y: { stacked: true, grid: {display: false}, border: {display: false}, ticks: {color: "#0F172A", font: {size: 12, weight: "600"}} }
        }
      }
    });

    const meses = ["Ene","Feb","Mar","Abr","May","Jun"];
    const cobReal = [58,63,67,72,72,null];
    const metaLinea = [80,80,80,80,80,80];
    this.chartInstances.trend = new Chart(trend, {
      type: "line",
      data: {
        labels: meses,
        datasets: [
          { label: "Cobertura real (%)", data: cobReal, borderColor: "#0EA5E9", backgroundColor: "rgba(14,165,233,0.1)", borderWidth: 2.5, pointBackgroundColor: "#0EA5E9", pointBorderColor: "#fff", pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7, tension: 0.35, fill: true, spanGaps: false },
          { label: "Meta mínima (80%)", data: metaLinea, borderColor: "#EF4444", backgroundColor: "transparent", borderWidth: 2, borderDash: [6,4], pointRadius: 0, pointHoverRadius: 0, tension: 0, fill: false }
        ]
      },
      options: {
        responsive: true, interaction: {mode:"index",intersect:false},
        plugins: { legend: {display: true, position: "bottom", labels: {boxWidth: 20, font: {size: 11}, padding: 14}}, tooltip: {backgroundColor: "#fff", borderColor: "#E2E8F0", borderWidth: 1, titleColor: "#0F172A", bodyColor: "#64748B", callbacks: {label: (ctx:any)=>` ${ctx.dataset.label}: ${ctx.parsed.y!==null?ctx.parsed.y+"%":"sin dato"}`} } },
        scales: {
          x: { grid: {display: false}, border: {display: false}, ticks: {font: {size: 11}, color: "#94A3B8"} },
          y: { min: 40, max: 100, grid: {color: "#E2E8F0", drawBorder: false, lineWidth: 1}, border: {display: false, dash: [3,3]}, ticks: {font: {size: 11}, color: "#94A3B8", stepSize: 10, callback: (v:any)=>v+"%"} }
        }
      }
    });
  }
}
