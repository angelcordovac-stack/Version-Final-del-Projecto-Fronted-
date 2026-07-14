export interface DashboardResponse {
  totalIncidencias: number;
  pendientes: number;
  solucionadas: number;
  porEstado: Record<string, number>;
  porTecnico: Record<string, number>;
}

export interface TecnicoRendimiento {
  idTecnico: number;
  nombreTecnico: string;
  totalAsignadas: number;
  totalResueltas: number;
  totalPendientes: number;
}

export interface IncidenciaFiltrada {
  idIncidencia: number;
  codigoEquipo?: string;
  descripcionProblema?: string;
  fechaRegistro?: string;
  quienRegistra?: string;
  idTecnicoAsignado?: number;
  estado?: string;
  tipoSolucion?: string;
  requiereRepuesto?: boolean;
  fechaAsignacion?: string;
  fechaSolucion?: string;
}

export interface EquipoDetalle {
  codigoEquipo: string;
  marcaModelo?: string;
  areaUbicacion?: string;
  responsable?: string;
}

export interface TecnicoDetalle {
  idUsuario: number;
  nombre?: string;
  especialidad?: string;
  maxIncidencias?: number;
  disponibilidad?: boolean;
}

export interface RepuestoDetalle {
  idRepuesto: number;
  idIncidencia?: number;
  descripcion?: string;
  fechaSolicitud?: string;
  fechaEntrega?: string;
  estado?: string;
}

export interface InformeTecnicoDetalle {
  idInforme: number;
  idIncidencia?: number;
  diagnostico?: string;
  procedimientoRealizado?: string;
  observaciones?: string;
  fechaInforme?: string;
}

export interface IncidenciaDetalleCompleto {
  incidencia: IncidenciaFiltrada;
  equipo: EquipoDetalle | null;
  tecnicoAsignado: TecnicoDetalle | null;
  repuestos: RepuestoDetalle[];
  informes: InformeTecnicoDetalle[];
}

export interface FiltroIncidencias {
  estado?: string;
  desde?: string;
  hasta?: string;
  idTecnico?: number;
}
