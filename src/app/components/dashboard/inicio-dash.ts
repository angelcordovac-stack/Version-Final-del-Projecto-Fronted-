import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IncidenciaService } from '../../services/incidencia.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-inicio-dash',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .dash {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    /* ── Header ── */
    .dash__header {
      margin-bottom: 2rem;
    }
    .dash__title {
      font-size: 2.6rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.4rem;
      line-height: 1.1;
      letter-spacing: -1.5px;
    }
    .dash__subtitle {
      color: #64748b;
      font-size: 0.92rem;
      margin: 0;
    }

    /* ── Stats ── */
    .dash__stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .dash__stat {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem 1.75rem;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      transition: box-shadow 0.18s, transform 0.18s;
    }
    .dash__stat:hover {
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
      transform: translateY(-2px);
    }

    .dash__stat-body {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .dash__stat-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }
    .dash__stat-number {
      font-size: 2.8rem;
      font-weight: 800;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      letter-spacing: -1px;
    }
    .dash__stat-number--blue  { color: #1d4ed8; }
    .dash__stat-number--amber { color: #d97706; }
    .dash__stat-number--green { color: #16a34a; }

    .dash__stat-detail {
      font-size: 0.78rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 0.15rem;
    }
    .dash__stat-detail--warn  { color: #d97706; }
    .dash__stat-detail--green { color: #16a34a; }

    .dash__stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
    }
    .dash__stat-icon--blue  { background: #eff6ff; }
    .dash__stat-icon--amber { background: #fffbeb; }
    .dash__stat-icon--green { background: #f0fdf4; }

    /* ── Acceso Rápido ── */
    .dash__bottom {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .dash__section {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem 1.75rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .dash__section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .dash__section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .dash__quick-links {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .dash__quick-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 1.35rem;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      border: 1.5px solid #e2e8f0;
      color: #334155;
      background: #fff;
      transition: all 0.15s;
    }
    .dash__quick-btn:hover {
      border-color: #1e293b;
      color: #0f172a;
      background: #f8fafc;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    }
  `],
  template: `
    <div class="dash">

      <!-- Header -->
      <div class="dash__header">
        <h1 class="dash__title">Panel de Control</h1>
        <p class="dash__subtitle">Visión general de infraestructura e incidencias en tiempo real.</p>
      </div>

      <!-- Stats -->
      <div class="dash__stats">

        <div class="dash__stat">
          <div class="dash__stat-body">
            <span class="dash__stat-label">Incidencias Pendientes</span>
            <span class="dash__stat-number dash__stat-number--amber">{{ pendientes }}</span>
            <span class="dash__stat-detail dash__stat-detail--warn">⚠️ Requieren atención</span>
          </div>
          <div class="dash__stat-icon dash__stat-icon--amber">⏳</div>
        </div>

        <div class="dash__stat">
          <div class="dash__stat-body">
            <span class="dash__stat-label">En sistema</span>
            <span class="dash__stat-number dash__stat-number--blue">{{ totalIncidencias }}</span>
            <span class="dash__stat-detail">📋 Total registradas</span>
          </div>
          <div class="dash__stat-icon dash__stat-icon--blue">🖥️</div>
        </div>

        <div class="dash__stat">
          <div class="dash__stat-body">
            <span class="dash__stat-label">Solucionadas</span>
            <span class="dash__stat-number dash__stat-number--green">{{ solucionadas }}</span>
            <span class="dash__stat-detail dash__stat-detail--green">✅ Últimas 24h: resueltas</span>
          </div>
          <div class="dash__stat-icon dash__stat-icon--green">✔️</div>
        </div>

      </div>

      <!-- Acceso Rápido -->
      <div class="dash__bottom">
        <div class="dash__section">
          <div class="dash__section-header">
            <p class="dash__section-title">⚡ Acceso Rápido</p>
          </div>
          <div class="dash__quick-links">
            @if (esJefeOTecnico) {
              <a routerLink="/dashboard/GestionIncidencias" class="dash__quick-btn">🛠️ Incidencias</a>
            }
            @if (esJefeOSistemas) {
              <a routerLink="/dashboard/GestionRepuestos" class="dash__quick-btn">📦 Repuestos</a>
            }
            @if (esJefe) {
              <a routerLink="/dashboard/MantenimientoUsuarios" class="dash__quick-btn">👥 Mantenimiento</a>
            }
            @if (esJefeOTecnico) {
              <a routerLink="/dashboard/DiccionarioFallas" class="dash__quick-btn">📖 Diccionario</a>
            }
          </div>
        </div>
      </div>

    </div>
  `,
})
export class InicioDash implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private session = inject(SessionService);

  totalIncidencias = 0;
  pendientes = 0;
  solucionadas = 0;
  rolCodigo = '';

  ngOnInit(): void {
    this.rolCodigo = this.session.getInfoSession()?.rol?.codigo ?? '';

    this.incidenciaService.getAll().subscribe({
      next: (data: any) => {
        this.totalIncidencias = data?.length || 0;
        this.pendientes = data?.filter((i: any) => i.estado === 'Pendiente').length || 0;
        this.solucionadas = data?.filter((i: any) => i.estado === 'Solucionado').length || 0;
      },
    });
  }

  get esJefe(): boolean { return this.rolCodigo === 'JEFE'; }
  get esJefeOTecnico(): boolean { return this.rolCodigo === 'JEFE' || this.rolCodigo === 'TECNICO'; }
  get esJefeOSistemas(): boolean { return this.rolCodigo === 'JEFE' || this.rolCodigo === 'SISTEMAS'; }
}