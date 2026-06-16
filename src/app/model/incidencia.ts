export interface Incidencia {
  idIncidencia: number;
  codigoEquipo?: string;
  descripcionProblema?: string;
  estado?: string;
  idTecnicoAsignado?: number;
  fechaRegistro?: string;
  quienRegistra?: string;
  tipoSolucion?: string;
}