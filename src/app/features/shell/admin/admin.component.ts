import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { AdminService, AdminEquipo, AdminPartido } from '../../../core/admin/admin.service';
import { StatsService, StatsResumen, DiaMetrica } from '../../../core/stats/stats.service';
import { UsuarioPerfil } from '../../../core/auth/auth.service';

type Tab = 'resumen' | 'usuarios' | 'equipos' | 'partidos';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <h1 class="page-title font-display">Panel de Administración</h1>
        <span class="admin-badge">Admin</span>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn" [class.active]="tab() === 'resumen'"   (click)="tab.set('resumen')">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
          Resumen
        </button>
        <button class="tab-btn" [class.active]="tab() === 'usuarios'"  (click)="switchTab('usuarios')">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Usuarios
          @if (usuarios().length) { <span class="tab-count">{{ usuarios().length }}</span> }
        </button>
        <button class="tab-btn" [class.active]="tab() === 'equipos'"   (click)="switchTab('equipos')">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          Equipos
          @if (equipos().length) { <span class="tab-count">{{ equipos().length }}</span> }
        </button>
        <button class="tab-btn" [class.active]="tab() === 'partidos'"  (click)="switchTab('partidos')">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
          </svg>
          Partidos
          @if (partidos().length) { <span class="tab-count">{{ partidos().length }}</span> }
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════════ RESUMEN -->
      @if (tab() === 'resumen') {
        <div class="tab-content">
          @if (loadingStats()) {
            <div class="loading-msg">Cargando métricas...</div>
          } @else {
            <div class="kpi-grid">
              <div class="kpi-card">
                <span class="kpi-label">Usuarios registrados</span>
                <span class="kpi-value">{{ statsResumen()?.totalUsuarios ?? 0 }}</span>
              </div>
              <div class="kpi-card">
                <span class="kpi-label">Total logins</span>
                <span class="kpi-value">{{ statsResumen()?.totalLogins ?? 0 }}</span>
              </div>
              <div class="kpi-card kpi-card--blue">
                <span class="kpi-label">Equipos creados</span>
                <span class="kpi-value kpi-value--blue">{{ totalEquipos() }}</span>
              </div>
              <div class="kpi-card kpi-card--green">
                <span class="kpi-label">Partidos totales</span>
                <span class="kpi-value kpi-value--green">{{ totalPartidos() }}</span>
              </div>
              <div class="kpi-card">
                <span class="kpi-label">Registros (30 días)</span>
                <span class="kpi-value">{{ totalPeriodo(statsResumen()?.registrosPorDia ?? []) }}</span>
              </div>
              <div class="kpi-card">
                <span class="kpi-label">Logins (30 días)</span>
                <span class="kpi-value">{{ totalPeriodo(statsResumen()?.loginsPorDia ?? []) }}</span>
              </div>
            </div>

            @if (statsResumen(); as r) {
              <div class="charts-row">
                <div class="chart-card">
                  <h2 class="chart-title">Registros por día (últimos 30 días)</h2>
                  @if (r.registrosPorDia.length) {
                    <div class="bar-chart">
                      @for (d of r.registrosPorDia; track d.fecha) {
                        <div class="bar-col">
                          <span class="bar-count">{{ d.cantidad }}</span>
                          <div class="bar" [style.height.%]="pct(d.cantidad, maxVal(r.registrosPorDia))" [title]="d.fecha + ': ' + d.cantidad"></div>
                          <span class="bar-label">{{ shortDate(d.fecha) }}</span>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="empty-chart">Sin registros en los últimos 30 días.</p>
                  }
                </div>

                <div class="chart-card">
                  <h2 class="chart-title">Logins por día (últimos 30 días)</h2>
                  @if (r.loginsPorDia.length) {
                    <div class="bar-chart">
                      @for (d of r.loginsPorDia; track d.fecha) {
                        <div class="bar-col">
                          <span class="bar-count">{{ d.cantidad }}</span>
                          <div class="bar bar--green" [style.height.%]="pct(d.cantidad, maxVal(r.loginsPorDia))" [title]="d.fecha + ': ' + d.cantidad"></div>
                          <span class="bar-label">{{ shortDate(d.fecha) }}</span>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="empty-chart">Sin logins registrados aún.</p>
                  }
                </div>
              </div>
            }
          }
        </div>
      }

      <!-- ══════════════════════════════════════════════════════════ USUARIOS -->
      @if (tab() === 'usuarios') {
        <div class="tab-content">
          <div class="toolbar">
            <input
              class="search-input"
              type="text"
              placeholder="Buscar por nombre..."
              [value]="busquedaUsuarios()"
              (input)="busquedaUsuarios.set($any($event.target).value)"
            />
            <span class="total-badge">{{ usuariosFiltrados().length }} usuarios</span>
          </div>

          @if (loadingUsuarios()) {
            <div class="loading-msg">Cargando usuarios...</div>
          } @else if (!usuariosFiltrados().length) {
            <div class="empty-state">No se encontraron usuarios.</div>
          } @else {
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Posición</th>
                    <th>Comuna</th>
                    <th>Rep. prom.</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of usuariosFiltrados(); track u.id) {
                    <tr [class.row-blocked]="u.bloqueado">
                      <td>
                        <div class="user-cell">
                          @if (u.foto_url) {
                            <img [src]="u.foto_url" class="mini-avatar" alt="" />
                          } @else {
                            <div class="mini-avatar-ph">{{ u.nombre?.charAt(0) }}</div>
                          }
                          <div class="user-cell-info">
                            <span class="user-nombre">{{ u.nombre }}</span>
                            @if (u.is_admin) { <span class="badge badge--gold">Admin</span> }
                          </div>
                        </div>
                      </td>
                      <td class="td-secondary">{{ u.posicion ?? '—' }}</td>
                      <td class="td-secondary">{{ u.comuna || '—' }}</td>
                      <td class="td-secondary">{{ avgRep(u) }}</td>
                      <td>
                        @if (u.bloqueado) {
                          <span class="badge badge--red">Bloqueado</span>
                        } @else {
                          <span class="badge badge--green">Activo</span>
                        }
                      </td>
                      <td>
                        @if (!u.is_admin) {
                          <button
                            class="btn-action"
                            [class.btn-action--danger]="!u.bloqueado"
                            [class.btn-action--ok]="u.bloqueado"
                            [disabled]="procesando().has(u.id)"
                            (click)="toggleUserBloqueado(u)"
                          >
                            {{ procesando().has(u.id) ? '...' : (u.bloqueado ? 'Desbloquear' : 'Bloquear') }}
                          </button>
                        } @else {
                          <span class="td-secondary">—</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- ══════════════════════════════════════════════════════════ EQUIPOS -->
      @if (tab() === 'equipos') {
        <div class="tab-content">
          <div class="toolbar">
            <input
              class="search-input"
              type="text"
              placeholder="Buscar por nombre..."
              [value]="busquedaEquipos()"
              (input)="busquedaEquipos.set($any($event.target).value)"
            />
            <span class="total-badge">{{ equiposFiltrados().length }} equipos</span>
          </div>

          @if (loadingEquipos()) {
            <div class="loading-msg">Cargando equipos...</div>
          } @else if (!equiposFiltrados().length) {
            <div class="empty-state">No se encontraron equipos.</div>
          } @else {
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Equipo</th>
                    <th>Capitán</th>
                    <th>Miembros activos</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (e of equiposFiltrados(); track e.id) {
                    <tr [class.row-blocked]="e.bloqueado">
                      <td>
                        <div class="equipo-cell">
                          @if (e.escudo_url) {
                            <img [src]="e.escudo_url" class="mini-escudo" alt="" />
                          } @else {
                            <div class="mini-escudo-ph">⚽</div>
                          }
                          <span class="equipo-nombre">{{ e.nombre }}</span>
                        </div>
                      </td>
                      <td class="td-secondary">{{ e.capitan_nombre }}</td>
                      <td class="td-secondary text-center">{{ e.total_miembros }}</td>
                      <td>
                        @if (e.bloqueado) {
                          <span class="badge badge--red">Bloqueado</span>
                        } @else {
                          <span class="badge badge--green">Activo</span>
                        }
                      </td>
                      <td>
                        <button
                          class="btn-action"
                          [class.btn-action--danger]="!e.bloqueado"
                          [class.btn-action--ok]="e.bloqueado"
                          [disabled]="procesando().has(e.id)"
                          (click)="toggleEquipoBloqueado(e)"
                        >
                          {{ procesando().has(e.id) ? '...' : (e.bloqueado ? 'Desbloquear' : 'Bloquear') }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- ══════════════════════════════════════════════════════════ PARTIDOS -->
      @if (tab() === 'partidos') {
        <div class="tab-content">
          <div class="toolbar">
            <input
              class="search-input"
              type="text"
              placeholder="Buscar equipo..."
              [value]="busquedaPartidos()"
              (input)="busquedaPartidos.set($any($event.target).value)"
            />
            <select class="filter-select" [value]="filtroEstado()" (change)="filtroEstado.set($any($event.target).value)">
              <option value="">Todos los estados</option>
              <option value="programado">Programado</option>
              <option value="en_disputa">En disputa</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <span class="total-badge">{{ partidosFiltrados().length }} partidos</span>
          </div>

          @if (loadingPartidos()) {
            <div class="loading-msg">Cargando partidos...</div>
          } @else if (!partidosFiltrados().length) {
            <div class="empty-state">No se encontraron partidos.</div>
          } @else {
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Enfrentamiento</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Lugar</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of partidosFiltrados(); track p.id) {
                    <tr>
                      <td>
                        <span class="match-teams">
                          {{ p.equipo_local_nombre }}
                          <span class="vs">vs</span>
                          {{ p.equipo_visitante_nombre }}
                        </span>
                      </td>
                      <td class="td-secondary">{{ tipoLabel(p.tipo_futbol) }}</td>
                      <td class="td-secondary">{{ formatFecha(p.fecha) }}</td>
                      <td class="td-secondary">{{ p.lugar || '—' }}</td>
                      <td>
                        <span class="badge" [ngClass]="estadoBadgeClass(p.estado)">
                          {{ estadoLabel(p.estado) }}
                        </span>
                      </td>
                      <td>
                        @if (p.estado === 'programado' || p.estado === 'en_disputa') {
                          <button
                            class="btn-action btn-action--danger"
                            [disabled]="procesando().has(p.id)"
                            (click)="cancelarPartido(p)"
                          >
                            {{ procesando().has(p.id) ? '...' : 'Cancelar' }}
                          </button>
                        } @else {
                          <span class="td-secondary">—</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- Toast de feedback -->
      @if (toastMsg()) {
        <div class="toast" [class.toast--error]="toastError()">{{ toastMsg() }}</div>
      }
    </div>
  `,
  styles: [`
    .admin-page { max-width: 1100px; }

    .admin-header {
      display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem;
    }
    .page-title { font-size: 2rem; color: var(--color-gold); letter-spacing: .1em; margin: 0; }
    .admin-badge {
      background: rgba(240,192,64,.15); border: 1px solid rgba(240,192,64,.3);
      color: var(--color-gold); font-size: .65rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .12em;
      padding: .25rem .6rem; border-radius: 20px;
    }

    /* ── Tabs ── */
    .tabs {
      display: flex; gap: .5rem; margin-bottom: 1.75rem;
      border-bottom: 1px solid rgba(255,255,255,.08); padding-bottom: .75rem;
      flex-wrap: wrap;
    }
    .tab-btn {
      display: flex; align-items: center; gap: .45rem;
      background: transparent; border: 1px solid rgba(255,255,255,.1);
      color: rgba(255,255,255,.5); font-size: .78rem; font-weight: 600;
      letter-spacing: .06em; text-transform: uppercase;
      padding: .45rem .9rem; border-radius: 8px; cursor: pointer;
      transition: all .2s;
    }
    .tab-btn:hover { color: #fff; background: rgba(255,255,255,.05); }
    .tab-btn.active {
      color: var(--color-gold); background: rgba(240,192,64,.08);
      border-color: rgba(240,192,64,.3);
    }
    .tab-count {
      background: rgba(255,255,255,.12); color: rgba(255,255,255,.6);
      font-size: .65rem; padding: .1rem .45rem; border-radius: 10px;
    }
    .tab-btn.active .tab-count {
      background: rgba(240,192,64,.2); color: var(--color-gold);
    }

    /* ── Tab content ── */
    .tab-content { animation: fadeIn .2s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

    .loading-msg {
      color: rgba(255,255,255,.4); font-size: .9rem; padding: 3rem 0; text-align: center;
    }
    .empty-state {
      background: rgba(255,255,255,.02); border: 1px dashed rgba(255,255,255,.1);
      border-radius: 12px; padding: 2.5rem; text-align: center;
      color: rgba(255,255,255,.3); font-size: .9rem;
    }

    /* ── KPI grid ── */
    .kpi-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
      margin-bottom: 2rem;
    }
    .kpi-card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1.25rem 1.5rem;
      display: flex; flex-direction: column; gap: .4rem;
    }
    .kpi-card--blue { border-color: rgba(100,160,255,.2); background: rgba(100,160,255,.04); }
    .kpi-card--green { border-color: rgba(80,200,120,.2); background: rgba(80,200,120,.04); }
    .kpi-label {
      font-size: .68rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .1em; color: rgba(255,255,255,.4);
    }
    .kpi-value {
      font-family: 'Bebas Neue', sans-serif; font-size: 2.4rem;
      color: var(--color-gold); line-height: 1;
    }
    .kpi-value--blue { color: #6ca0ff; }
    .kpi-value--green { color: #50c878; }

    /* ── Charts ── */
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .chart-card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1.5rem;
    }
    .chart-title {
      font-size: .72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .1em; color: rgba(255,255,255,.5); margin-bottom: 1.25rem;
    }
    .bar-chart {
      display: flex; align-items: flex-end; gap: 5px;
      height: 140px; overflow-x: auto; padding-bottom: .5rem;
    }
    .bar-col { display: flex; flex-direction: column; align-items: center; gap: 3px; flex-shrink: 0; width: 32px; }
    .bar-count { font-size: .55rem; color: rgba(255,255,255,.4); }
    .bar {
      width: 100%; min-height: 3px; border-radius: 3px 3px 0 0;
      background: linear-gradient(to top, var(--color-gold2, #c8960a), var(--color-gold, #f0c040));
    }
    .bar--green {
      background: linear-gradient(to top, #2d7a45, #50c878);
    }
    .bar-label { font-size: .5rem; color: rgba(255,255,255,.3); white-space: nowrap; }
    .empty-chart {
      color: rgba(255,255,255,.3); font-size: .82rem; text-align: center; padding: 2rem 0;
    }

    /* ── Toolbar ── */
    .toolbar {
      display: flex; align-items: center; gap: .75rem; margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .search-input {
      background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
      color: #fff; font-size: .85rem; padding: .55rem .9rem;
      border-radius: 8px; outline: none; flex: 1; min-width: 180px; max-width: 320px;
      transition: border-color .2s;
    }
    .search-input::placeholder { color: rgba(255,255,255,.3); }
    .search-input:focus { border-color: rgba(240,192,64,.4); }
    .filter-select {
      background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
      color: rgba(255,255,255,.7); font-size: .82rem; padding: .55rem .75rem;
      border-radius: 8px; outline: none; cursor: pointer;
    }
    .filter-select:focus { border-color: rgba(240,192,64,.4); }
    .total-badge {
      font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.35);
      letter-spacing: .06em;
    }

    /* ── Table ── */
    .table-wrap { overflow-x: auto; border-radius: 12px; }
    .data-table {
      width: 100%; border-collapse: collapse;
      background: rgba(255,255,255,.02); font-size: .82rem;
    }
    .data-table thead th {
      padding: .75rem 1rem; text-align: left;
      font-size: .65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .1em; color: rgba(255,255,255,.35);
      border-bottom: 1px solid rgba(255,255,255,.07);
      white-space: nowrap;
    }
    .data-table tbody tr {
      border-bottom: 1px solid rgba(255,255,255,.05);
      transition: background .15s;
    }
    .data-table tbody tr:last-child { border-bottom: none; }
    .data-table tbody tr:hover { background: rgba(255,255,255,.03); }
    .data-table tbody tr.row-blocked { background: rgba(255,80,80,.04); }
    .data-table td { padding: .8rem 1rem; vertical-align: middle; color: #e0e0e0; }
    .td-secondary { color: rgba(255,255,255,.4); font-size: .8rem; }
    .text-center { text-align: center; }

    /* ── User cell ── */
    .user-cell { display: flex; align-items: center; gap: .65rem; }
    .user-cell-info { display: flex; flex-direction: column; gap: .2rem; }
    .user-nombre { font-weight: 600; }
    .mini-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .mini-avatar-ph {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      background: rgba(240,192,64,.15); border: 1px solid rgba(240,192,64,.2);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Bebas Neue', sans-serif; font-size: .9rem; color: var(--color-gold);
    }

    /* ── Equipo cell ── */
    .equipo-cell { display: flex; align-items: center; gap: .65rem; }
    .equipo-nombre { font-weight: 600; }
    .mini-escudo { width: 28px; height: 28px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
    .mini-escudo-ph {
      width: 28px; height: 28px; border-radius: 4px; flex-shrink: 0;
      background: rgba(255,255,255,.06); display: flex; align-items: center;
      justify-content: center; font-size: .9rem;
    }

    /* ── Match cell ── */
    .match-teams { font-weight: 600; font-size: .82rem; }
    .vs { color: rgba(255,255,255,.3); margin: 0 .4rem; font-weight: 400; font-size: .75rem; }

    /* ── Badges ── */
    .badge {
      display: inline-block; font-size: .62rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .08em;
      padding: .2rem .55rem; border-radius: 20px;
    }
    .badge--gold  { background: rgba(240,192,64,.15); color: var(--color-gold); border: 1px solid rgba(240,192,64,.25); }
    .badge--green { background: rgba(80,200,120,.12); color: #50c878; border: 1px solid rgba(80,200,120,.2); }
    .badge--red   { background: rgba(255,80,80,.12);  color: #ff6b6b; border: 1px solid rgba(255,80,80,.2); }
    .badge--blue  { background: rgba(100,160,255,.12); color: #6ca0ff; border: 1px solid rgba(100,160,255,.2); }
    .badge--gray  { background: rgba(255,255,255,.07); color: rgba(255,255,255,.4); border: 1px solid rgba(255,255,255,.1); }
    .badge--orange { background: rgba(255,160,50,.12); color: #ffa032; border: 1px solid rgba(255,160,50,.2); }

    /* ── Action buttons ── */
    .btn-action {
      background: transparent; border: 1px solid rgba(255,255,255,.15);
      color: rgba(255,255,255,.55); font-size: .72rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .07em;
      padding: .35rem .75rem; border-radius: 6px; cursor: pointer;
      transition: all .2s; white-space: nowrap;
    }
    .btn-action:hover { background: rgba(255,255,255,.06); color: #fff; }
    .btn-action:disabled { opacity: .4; cursor: not-allowed; }
    .btn-action--danger { border-color: rgba(255,80,80,.3); color: #ff6b6b; }
    .btn-action--danger:hover { background: rgba(255,80,80,.1); border-color: rgba(255,80,80,.5); }
    .btn-action--ok { border-color: rgba(80,200,120,.3); color: #50c878; }
    .btn-action--ok:hover { background: rgba(80,200,120,.1); border-color: rgba(80,200,120,.5); }

    /* ── Toast ── */
    .toast {
      position: fixed; bottom: 2rem; right: 2rem; z-index: 200;
      background: rgba(80,200,120,.9); color: #fff;
      font-size: .82rem; font-weight: 600; padding: .75rem 1.25rem;
      border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,.5);
      animation: slideUp .25s ease;
    }
    .toast--error { background: rgba(255,80,80,.9); }
    @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .kpi-grid { grid-template-columns: 1fr 1fr; }
      .admin-header { flex-direction: column; align-items: flex-start; gap: .5rem; }
    }
    @media (max-width: 480px) {
      .kpi-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class AdminComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private statsSvc = inject(StatsService);

  readonly tab = signal<Tab>('resumen');

  // ── Resumen ─────────────────────────────────────────────────────────────
  readonly loadingStats = signal(true);
  readonly statsResumen  = signal<StatsResumen | null>(null);
  readonly totalEquipos  = signal(0);
  readonly totalPartidos = signal(0);

  // ── Usuarios ─────────────────────────────────────────────────────────────
  readonly loadingUsuarios   = signal(false);
  readonly usuarios          = signal<UsuarioPerfil[]>([]);
  readonly busquedaUsuarios  = signal('');

  // ── Equipos ──────────────────────────────────────────────────────────────
  readonly loadingEquipos  = signal(false);
  readonly equipos         = signal<AdminEquipo[]>([]);
  readonly busquedaEquipos = signal('');

  // ── Partidos ─────────────────────────────────────────────────────────────
  readonly loadingPartidos  = signal(false);
  readonly partidos         = signal<AdminPartido[]>([]);
  readonly busquedaPartidos = signal('');
  readonly filtroEstado     = signal('');

  // ── Shared ───────────────────────────────────────────────────────────────
  readonly procesando = signal<Set<string>>(new Set());
  readonly toastMsg   = signal('');
  readonly toastError = signal(false);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  async ngOnInit(): Promise<void> {
    await this.cargarResumen();
  }

  // ── Computed filters ─────────────────────────────────────────────────────

  usuariosFiltrados(): UsuarioPerfil[] {
    const q = this.busquedaUsuarios().trim().toLowerCase();
    if (!q) return this.usuarios();
    return this.usuarios().filter(u => u.nombre?.toLowerCase().includes(q));
  }

  equiposFiltrados(): AdminEquipo[] {
    const q = this.busquedaEquipos().trim().toLowerCase();
    if (!q) return this.equipos();
    return this.equipos().filter(e => e.nombre?.toLowerCase().includes(q));
  }

  partidosFiltrados(): AdminPartido[] {
    let list = this.partidos();
    const q = this.busquedaPartidos().trim().toLowerCase();
    const est = this.filtroEstado();
    if (q) list = list.filter(p =>
      p.equipo_local_nombre.toLowerCase().includes(q) ||
      p.equipo_visitante_nombre.toLowerCase().includes(q),
    );
    if (est) list = list.filter(p => p.estado === est);
    return list;
  }

  // ── Carga de datos ────────────────────────────────────────────────────────

  async switchTab(t: Tab): Promise<void> {
    this.tab.set(t);
    if (t === 'usuarios' && !this.usuarios().length) await this.cargarUsuarios();
    if (t === 'equipos'  && !this.equipos().length)  await this.cargarEquipos();
    if (t === 'partidos' && !this.partidos().length)  await this.cargarPartidos();
  }

  private async cargarResumen(): Promise<void> {
    this.loadingStats.set(true);
    const [resumen, equipos, partidos] = await Promise.all([
      this.statsSvc.cargarResumen(30),
      this.adminSvc.contarEquipos(),
      this.adminSvc.contarPartidos(),
    ]);
    this.statsResumen.set(resumen);
    this.totalEquipos.set(equipos);
    this.totalPartidos.set(partidos);
    this.loadingStats.set(false);
  }

  private async cargarUsuarios(): Promise<void> {
    this.loadingUsuarios.set(true);
    const data = await this.adminSvc.cargarTodosUsuarios();
    this.usuarios.set(data);
    this.loadingUsuarios.set(false);
  }

  private async cargarEquipos(): Promise<void> {
    this.loadingEquipos.set(true);
    const data = await this.adminSvc.cargarTodosEquipos();
    this.equipos.set(data);
    this.loadingEquipos.set(false);
  }

  private async cargarPartidos(): Promise<void> {
    this.loadingPartidos.set(true);
    const data = await this.adminSvc.cargarTodosPartidos();
    this.partidos.set(data);
    this.loadingPartidos.set(false);
  }

  // ── Acciones ──────────────────────────────────────────────────────────────

  async toggleUserBloqueado(u: UsuarioPerfil): Promise<void> {
    this.addProcesando(u.id);
    const err = await this.adminSvc.setUserBloqueado(u.id, !u.bloqueado);
    this.removeProcesando(u.id);
    if (err) { this.showToast('Error: ' + err, true); return; }
    this.usuarios.update(list => list.map(x => x.id === u.id ? { ...x, bloqueado: !u.bloqueado } : x));
    this.showToast(u.bloqueado ? 'Usuario desbloqueado' : 'Usuario bloqueado');
  }

  async toggleEquipoBloqueado(e: AdminEquipo): Promise<void> {
    this.addProcesando(e.id);
    const err = await this.adminSvc.setEquipoBloqueado(e.id, !e.bloqueado);
    this.removeProcesando(e.id);
    if (err) { this.showToast('Error: ' + err, true); return; }
    this.equipos.update(list => list.map(x => x.id === e.id ? { ...x, bloqueado: !e.bloqueado } : x));
    this.showToast(e.bloqueado ? 'Equipo desbloqueado' : 'Equipo bloqueado');
  }

  async cancelarPartido(p: AdminPartido): Promise<void> {
    this.addProcesando(p.id);
    const err = await this.adminSvc.cancelarPartido(p.id);
    this.removeProcesando(p.id);
    if (err) { this.showToast('Error: ' + err, true); return; }
    this.partidos.update(list => list.map(x => x.id === p.id ? { ...x, estado: 'cancelado' as const } : x));
    this.showToast('Partido cancelado');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private addProcesando(id: string): void {
    this.procesando.update(s => { const n = new Set(s); n.add(id); return n; });
  }

  private removeProcesando(id: string): void {
    this.procesando.update(s => { const n = new Set(s); n.delete(id); return n; });
  }

  private showToast(msg: string, error = false): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg.set(msg);
    this.toastError.set(error);
    this.toastTimer = setTimeout(() => this.toastMsg.set(''), 3000);
  }

  avgRep(u: UsuarioPerfil): number {
    return Math.round((u.rep_asistencia + u.rep_puntualidad + u.rep_compromiso) / 3);
  }

  totalPeriodo(dias: DiaMetrica[]): number {
    return dias.reduce((s, d) => s + d.cantidad, 0);
  }

  maxVal(dias: DiaMetrica[]): number {
    return Math.max(...dias.map(d => d.cantidad), 1);
  }

  pct(value: number, max: number): number {
    return Math.round((value / max) * 100);
  }

  shortDate(fecha: string): string {
    const [, mes, dia] = fecha.split('-');
    return `${dia}/${mes}`;
  }

  formatFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CL', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  tipoLabel(tipo: string): string {
    const map: Record<string, string> = {
      futbol5: 'F5', futbol7: 'F7', futbol8: 'F8', futbol11: 'F11',
    };
    return map[tipo] ?? tipo;
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      programado: 'Programado',
      en_disputa: 'En disputa',
      completado: 'Completado',
      cancelado:  'Cancelado',
    };
    return map[estado] ?? estado;
  }

  estadoBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      programado: 'badge--blue',
      en_disputa: 'badge--orange',
      completado: 'badge--green',
      cancelado:  'badge--red',
    };
    return map[estado] ?? 'badge--gray';
  }
}
