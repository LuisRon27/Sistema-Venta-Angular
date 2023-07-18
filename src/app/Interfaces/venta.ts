import { DetalleVenta } from "./detalle-venta";

export interface Venta {

  id_Venta?: number,
  numeroDocumento?: string,
  tipoPago: string,
  fechaRegistro?: string,
  totalTexto: string,
  detalleVenta: DetalleVenta[]
}
