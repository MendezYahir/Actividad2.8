import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card p-4 mb-4 shadow-sm">
      <h3 class="card-title text-primary mb-3">
        {{ productoForm.get('id')?.value ? 'Editar Producto' : 'Nuevo Producto' }}
      </h3>

      <form [formGroup]="productoForm" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label class="form-label">Nombre del Producto</label>
          <input type="text" formControlName="nombre" class="form-control" [class.is-invalid]="productoForm.get('nombre')?.invalid && productoForm.get('nombre')?.touched">
          <div class="invalid-feedback">El nombre es requerido (mínimo 3 caracteres).</div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Precio ($)</label>
            <input type="number" step="0.01" formControlName="precio" class="form-control" [class.is-invalid]="productoForm.get('precio')?.invalid && productoForm.get('precio')?.touched">
            <div class="invalid-feedback">Ingrese un precio mayor a 0.</div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Stock</label>
            <input type="number" formControlName="stock" class="form-control" [class.is-invalid]="productoForm.get('stock')?.invalid && productoForm.get('stock')?.touched">
            <div class="invalid-feedback">El stock debe ser mayor o igual a 0.</div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Categoría</label>
          <select formControlName="categoria" class="form-select" [class.is-invalid]="productoForm.get('categoria')?.invalid && productoForm.get('categoria')?.touched">
            <option value="">-- Selecciona una categoría --</option>
            <option value="Electrónica">Electrónica</option>
            <option value="Ropa">Ropa</option>
            <option value="Hogar">Hogar</option>
          </select>
          <div class="invalid-feedback">Debe seleccionar una categoría.</div>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-success" [disabled]="productoForm.invalid">
            {{ productoForm.get('id')?.value ? 'Actualizar' : 'Guardar' }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="limpiarFormulario()">
            Cancelar / Limpiar
          </button>
        </div>
      </form>
    </div>
  `
})
export class ProductoFormComponent implements OnChanges {
  @Input() productoEditar: Producto | null = null;
  @Output() guardar = new EventEmitter<Producto>();
  @Output() cancelar = new EventEmitter<void>();

  productoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.productoForm = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      categoria: ['', [Validators.required]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoEditar'] && this.productoEditar) {
      this.productoForm.patchValue(this.productoEditar);
    }
  }

  onSubmit(): void {
    if (this.productoForm.valid) {
      this.guardar.emit(this.productoForm.value);
      this.limpiarFormulario();
    } else {
      this.productoForm.markAllAsTouched();
    }
  }

  limpiarFormulario(): void {
    this.productoForm.reset({ stock: 0 });
    this.cancelar.emit();
  }
}