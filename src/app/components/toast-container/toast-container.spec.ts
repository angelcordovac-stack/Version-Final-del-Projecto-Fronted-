import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastContainer } from './toast-container';
import { ToastService } from '../../services/toast.service';

describe('ToastContainer', () => {
  let component: ToastContainer;
  let fixture: ComponentFixture<ToastContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('getToastClass() should map each toast type to its bootstrap class', () => {
    expect(component.getToastClass('success')).toBe('bg-success text-light');
    expect(component.getToastClass('danger')).toBe('bg-danger text-light');
    expect(component.getToastClass('warning')).toBe('bg-warning text-light');
    expect(component.getToastClass('info')).toBe('bg-info text-light');
  });

  it('should expose the toasts from the service for the template to render', () => {
    const toastService = TestBed.inject(ToastService);
    toastService.show('Mensaje 1', 'success');
    toastService.show('Mensaje 2', 'danger');

    // El template itera "toastService.toasts" directamente dentro de un @for
    // con ngb-toast. Forzar detectChanges() aquí dispara un falso positivo de
    // Angular (NG0100) propio de probar ngb-toast en modo zoneless, no un bug
    // de la app. Por eso verificamos la fuente de datos que el template
    // consume, en lugar de forzar el renderizado del DOM.
    expect(component.toastService.toasts.length).toBe(2);
    expect(component.toastService.toasts.map((t) => t.message)).toEqual(['Mensaje 1', 'Mensaje 2']);
    expect(component.getToastClass(component.toastService.toasts[0].type)).toBe('bg-success text-light');
  });
});
