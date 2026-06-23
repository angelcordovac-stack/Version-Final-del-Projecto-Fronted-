import { TestBed } from '@angular/core/testing';

import { ToastService, Toast } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty toast list', () => {
    expect(service.toasts).toEqual([]);
  });

  it('show() should push a toast with type "info" and a 3000ms delay by default', () => {
    service.show('Mensaje de prueba');

    expect(service.toasts.length).toBe(1);
    expect(service.toasts[0]).toEqual({ message: 'Mensaje de prueba', type: 'info', delay: 3000 });
  });

  it('show() should respect the given toast type', () => {
    service.show('Operacion exitosa', 'success');

    expect(service.toasts[0].type).toBe('success');
  });

  it('show() should append multiple toasts in order', () => {
    service.show('Primero', 'info');
    service.show('Segundo', 'danger');

    expect(service.toasts.length).toBe(2);
    expect(service.toasts.map((t) => t.message)).toEqual(['Primero', 'Segundo']);
  });

  it('remove() should remove only the given toast', () => {
    service.show('Uno');
    service.show('Dos');
    const toastToRemove: Toast = service.toasts[0];

    service.remove(toastToRemove);

    expect(service.toasts.length).toBe(1);
    expect(service.toasts[0].message).toBe('Dos');
  });

  it('remove() should do nothing if the toast is not in the list', () => {
    service.show('Uno');
    const toastAjeno: Toast = { message: 'No existe', type: 'info' };

    service.remove(toastAjeno);

    expect(service.toasts.length).toBe(1);
  });

  it('clear() should empty the toast list', () => {
    service.show('Uno');
    service.show('Dos');

    service.clear();

    expect(service.toasts).toEqual([]);
  });
});
