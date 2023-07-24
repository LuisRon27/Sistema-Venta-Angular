import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from 'src/app/Services/producto.service';
import { VentaService } from 'src/app/Services/venta.service';
import { UtilidadService } from 'src/app/Services/utilidad.service';
import { Producto } from 'src/app/Interfaces/producto';
import { Venta } from 'src/app/Interfaces/venta';
import { DetalleVenta } from 'src/app/Interfaces/detalle-venta';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css']
})
export class VentaComponent implements OnInit {

  //Variables
  listaProductos: Producto[] = [];
  listaProductosFiltro: Producto[] = [];

  listaProductosParaVenta: DetalleVenta[] = [];
  bloquearBotonRegistrar: boolean = false;

  productoSeleccionado!: Producto;
  tipodePagoPorDefecto: string = "Efectivo";
  totalPagar: number = 0;

  formularioProductoVenta: FormGroup;
  columnasTablas: string[] = ["Producto", "Cantidad", "Precio", "Total", "Accion"];
  datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);

  retornarProductosPorFiltros(busqueda: any): Producto[] {

    const valorBuscado = typeof busqueda === "string" ? busqueda.toLocaleLowerCase() : busqueda.nombre.toLocaleLowerCase();

    return this.listaProductos.filter(item => item.nombre.toLocaleLowerCase().includes(valorBuscado));
  }

  constructor(

    private fb: FormBuilder,
    private _productoServicio: ProductoService,
    private _ventaServicio: VentaService,
    private _utilidadServicio: UtilidadService

  ) {

    this.formularioProductoVenta = this.fb.group({
      producto: ['', Validators.required],
      cantidad: ['', Validators.required]

    });

    this._productoServicio.lista().subscribe({
      next: (data) => {
        if (data.status) {
          const lista = data.value as Producto[];
          this.listaProductos = lista.filter(p => p.esActivo == 1 && p.stock > 0);
        }

      },
      error: (e) => { }
    });

    this.formularioProductoVenta.get('producto')?.valueChanges.subscribe(value => {
      this.listaProductosFiltro = this.retornarProductosPorFiltros(value);
    });
  }

  ngOnInit(): void {

  }

  mostrarProducto(producto: Producto): string {
    return producto.nombre;
  }

  productoParaVenta(event: any) {
    this.productoSeleccionado = event.option.value;
  }

  agregarProductoParaVenta() {
    const _cantidad: number = this.formularioProductoVenta.value.cantidad;
    const _precio: number = parseFloat(this.productoSeleccionado.precio);
    const _total: number = _cantidad * _precio;

    this.totalPagar = this.totalPagar + _total;

    this.listaProductosParaVenta.push({
      id_Producto: this.productoSeleccionado.id_Producto,
      descripcionProducto: this.productoSeleccionado.nombre,
      cantidad: _cantidad,
      precioTexto: String(_precio.toFixed(2)),
      totalTexto: String(_total.toFixed(2))
    });


    this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);

    this.formularioProductoVenta.patchValue({
      producto: '',
      cantidad: ''
    });
  }

  eliminarProducto(detalle: DetalleVenta) {
    this.totalPagar = this.totalPagar - parseFloat(detalle.totalTexto),
      this.listaProductosParaVenta = this.listaProductosParaVenta.filter(p => p.id_Producto != detalle.id_Producto);

    this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);
  }

  registrarVenta() {

    if (this.listaProductosParaVenta.length > 0) {

      this.bloquearBotonRegistrar = true;

      const request: Venta = {
        tipoPago: this.tipodePagoPorDefecto,
        totalTexto: String(this.totalPagar.toFixed(2)),
        detalleVenta: this.listaProductosParaVenta
      }

      this._ventaServicio.registrar(request).subscribe({
        next: (response) => {
          if (response.status) {
            this.totalPagar = 0.00;
            this.listaProductosParaVenta = [];
            this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);

            Swal.fire({
              icon: 'success',
              title: 'Venta Registrada!',
              text: `Numero de Venta: ${response.value.numeroDocumento}`
            })
          } else {
            this._utilidadServicio.mostrarAlerta("No se Pudo reistrar la Venta", "Oops");
          }
        },
        complete: () => {
          this.bloquearBotonRegistrar = false;
        },
        error: (e) => { }
      })
    }

  }

}
