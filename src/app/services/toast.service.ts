import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';
export interface Toast {
	message: string;
	type: ToastType;
	delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: Toast[] = [];

  show(message: string, type: ToastType = 'info') {
		const toast: Toast = {
		  message,
		  type,
		  delay: 3000
		};

		console.log('adding this toast', toast);
		this.toasts.push(toast);
	}

  remove(toast: Toast) {
		this.toasts = this.toasts.filter((t) => t !== toast);//filtra todos los t distintos al parametro toast, el resultado del filtro asigna al arreglo de toasts
	}

	clear() {
		this.toasts = [];
	}
}
