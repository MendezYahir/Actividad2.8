import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';
import { ProductoFormComponent } from '../producto-form/producto-form.component';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, ProductoFormComponent],
  template: `
    <div class="container my-4">
      <h2 class="mb-4 text-center">Gestión de Inventario de Productos</h2>

      <!-- Alertas de éxito y error -->
      <div *ngIf="mensajeExito" class="alert alert-success">{{ mensajeExito }}</div>
      <div *ngIf="mensajeError" class="alert alert-danger">{{ mensajeError }}</div>

      <!-- Formulario -->
      <app-producto-form 
        [productoEditar]="productoSeleccionado" 
        (guardar)="onGuardarProducto($event)"
        (cancelar)="cancelarEdicion()">
      </app-producto-form>

      <!-- Tabla -->
      <div class="card shadow-sm">
        <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Listado de Productos</h5>
          <button class="btn btn-sm btn-outline-light" (click)="cargarProductos()">Refrescar</button>
        </div>
        <div class="card-body">
          <div *ngIf="cargando" class="text-center my-3">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div class="table-responsive" *ngIf="!cargando">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let prod of productos">
                  <td>{{ prod.id }}</td>
                  <td class="fw-bold">{{ prod.nombre }}</td>
                  <td><span class="badge bg-info text-dark">{{ prod.categoria }}</span></td>
                  <td>{{ prod.precio | currency }}</td>
                  <td>{{ prod.stock }}</td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-warning me-2" (click)="seleccionarParaEditar(prod)">Editar</button>
                    <button class="btn btn-sm btn-danger" (click)="eliminarProducto(prod.id)">Eliminar</button>
                  </td>
                </tr>
                <tr *ngIf="productos.length === 0">
                  <td colspan="6" class="text-center text-muted">No hay registros disponibles.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductoListComponent implements OnInit {
  productos: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  cargando: boolean = false;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {}

  // 1. GET: Consultar / Refrescar
  cargarProductos(): void {
    this.cargando = true;
    this.productoService.getProductos().subscribe({
      next: () => {
        this.cargando = false;
        this.mostrarMensajeExito('Consulta realizada exitosamente a la API.');
      },
      error: () => {
        this.mensajeError = 'Error al consultar los registros.';
        this.cargando = false;
      }
    });
  }

  // 2 y 3. POST / PUT: Guardar o Actualizar
  onGuardarProducto(producto: Producto): void {
    this.cargando = false; // Aseguramos que la tabla siempre esté visible

    if (producto.id) {
      // Actualizar localmente de inmediato
      const index = this.productos.findIndex(p => p.id === producto.id);
      if (index !== -1) this.productos = [...this.productos.slice(0, index), { ...producto }, ...this.productos.slice(index + 1)];
      this.mostrarMensajeExito('Producto actualizado correctamente.');
      this.productoSeleccionado = null;

      // Petición a la API en segundo plano
      this.productoService.actualizarProducto(producto.id, producto).subscribe({
        error: () => this.mensajeError = 'Error al actualizar en el servidor.'
      });
    } else {
      // Crear localmente de inmediato
      const nuevo = { ...producto, id: Math.floor(Math.random() * 1000) + 1 };
      this.productos = [nuevo, ...this.productos]; // Asignación inmutable para forzar actualización de vista
      this.mostrarMensajeExito('Producto registrado correctamente.');

      // Petición a la API en segundo plano
      this.productoService.crearProducto(producto).subscribe({
        error: () => this.mensajeError = 'Error al registrar en el servidor.'
      });
    }
  }

  seleccionarParaEditar(producto: Producto): void {
    this.productoSeleccionado = { ...producto };
  }

  // 4. DELETE: Eliminar
  eliminarProducto(id: number | undefined): void {
    if (!id) return;
    if (confirm('¿Está seguro de eliminar este registro?')) {
      this.productos = this.productos.filter(p => p.id !== id);
      this.mostrarMensajeExito('Producto eliminado correctamente.');

      this.productoService.eliminarProducto(id).subscribe({
        error: () => this.mensajeError = 'Error al eliminar el registro.'
      });
    }
  }

  cancelarEdicion(): void {
    this.productoSeleccionado = null;
  }

  private mostrarMensajeExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = null;
    setTimeout(() => this.mensajeExito = null, 3000);
  }
}