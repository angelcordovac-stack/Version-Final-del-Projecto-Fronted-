import { TestBed } from '@angular/core/testing';

import { ToastService, Toast } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debe comenzar con una lista de toast vacía', () => {
    expect(service.toasts).toEqual([]);
  });

  it('show() debe añadir un toast con tipo "info" y un retardo de 3000ms por defecto', () => {
    service.show('Mensaje de prueba');

    expect(service.toasts.length).toBe(1);
    expect(service.toasts[0]).toEqual({ message: 'Mensaje de prueba', type: 'info', delay: 3000 });
  });

  it('show() debe respetar el tipo de toast dado', () => {
    service.show('Operacion exitosa', 'success');

    expect(service.toasts[0].type).toBe('success');
  });

  it('show() debe añadir varios toast en orden', () => {
    service.show('Primero', 'info');
    service.show('Segundo', 'danger');

    expect(service.toasts.length).toBe(2);
    expect(service.toasts.map((t) => t.message)).toEqual(['Primero', 'Segundo']);
  });

  it('remove() debe eliminar solo el toast dado', () => {
    service.show('Uno');
    service.show('Dos');
    const toastToRemove: Toast = service.toasts[0];

    service.remove(toastToRemove);

    expect(service.toasts.length).toBe(1);
    expect(service.toasts[0].message).toBe('Dos');
  });

  it('remove() no debe hacer nada si el toast no está en la lista', () => {
    service.show('Uno');
    const toastAjeno: Toast = { message: 'No existe', type: 'info' };

    service.remove(toastAjeno);

    expect(service.toasts.length).toBe(1);
  });

  it('clear() debe vaciar la lista de toast', () => {
    service.show('Uno');
    service.show('Dos');

    service.clear();

    expect(service.toasts).toEqual([]);
  });
});
