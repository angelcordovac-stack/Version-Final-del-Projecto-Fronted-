import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

interface Slide {
  url: string;
  type: 'hero' | 'about' | 'easy' | 'problems';
}

interface Operacion {
  numero: number;
  titulo: string;
  descripcion: string;
  imagen: string;
}

interface Funcionalidad {
  icono: string;
  titulo: string;
  descripcion: string;
}

interface Testimonio {
  texto: string;
  autor: string;
  cargo: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private router = inject(Router);

  /* ===== Slider de fondo (4 escenas) ===== */
  slides: Slide[] = [
    { url: 'https://images.unsplash.com/photo-1661347558501-4eec206b3739?q=80&w=870&auto=format&fit=crop', type: 'hero' },
    { url: 'https://plus.unsplash.com/premium_photo-1664301884434-228dd7cff3a6?q=80&w=870&auto=format&fit=crop', type: 'about' },
    { url: 'https://images.unsplash.com/photo-1721333090143-8bfc7007ed97?q=80&w=435&auto=format&fit=crop', type: 'easy' },
    { url: 'https://plus.unsplash.com/premium_photo-1682088347812-48fdca508547?q=80&w=870&auto=format&fit=crop', type: 'problems' },
  ];
  currentIndex = 0;
  private intervalId: any;

  /* ===== Seccion "Como funciona" — 6 pasos ===== */
  operaciones: Operacion[] = [
    {
      numero: 1,
      titulo: 'Reporta',
      descripcion: 'El usuario registra la incidencia con codigo de equipo y descripcion del problema.',
      imagen: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop',
    },
    {
      numero: 2,
      titulo: 'Asigna',
      descripcion: 'El jefe del area asigna la incidencia al tecnico mas adecuado segun disponibilidad.',
      imagen: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&auto=format&fit=crop',
    },
    {
      numero: 3,
      titulo: 'Diagnostica',
      descripcion: 'El tecnico revisa el equipo, identifica la falla y decide la mejor solucion.',
      imagen: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&auto=format&fit=crop',
    },
    {
      numero: 4,
      titulo: 'Solicita',
      descripcion: 'Si requiere repuesto, lo solicita a Logistica desde la misma plataforma.',
      imagen: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&auto=format&fit=crop',
    },
    {
      numero: 5,
      titulo: 'Repara',
      descripcion: 'El tecnico resuelve el problema en el lugar o en taller con los repuestos necesarios.',
      imagen: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&auto=format&fit=crop',
    },
    {
      numero: 6,
      titulo: 'Documenta',
      descripcion: 'Se registra el informe tecnico y la incidencia queda en el historial del equipo.',
      imagen: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop',
    },
  ];

  /* ===== Funcionalidades clave ===== */
  funcionalidades: Funcionalidad[] = [
    {
      icono: '🛠️',
      titulo: 'Gestion de Incidencias',
      descripcion: 'Registra, asigna y soluciona incidencias con trazabilidad completa.',
    },
    {
      icono: '👨‍🔧',
      titulo: 'Control de Tecnicos',
      descripcion: 'Visibilidad de la carga, especialidad y disponibilidad de cada tecnico.',
    },
    {
      icono: '📦',
      titulo: 'Solicitudes a Logistica',
      descripcion: 'Pedidos de repuestos integrados al flujo de cada incidencia.',
    },
    {
      icono: '📚',
      titulo: 'Diccionario de Fallas',
      descripcion: 'Base de conocimiento con problemas frecuentes y sus soluciones.',
    },
    {
      icono: '📊',
      titulo: 'Reportes para el Jefe',
      descripcion: 'Indicadores de PCs problematicas y productividad por tecnico.',
    },
    {
      icono: '🖥️',
      titulo: 'Historial por Equipo',
      descripcion: 'Consulta todo lo ocurrido con un equipo para decidir reemplazo.',
    },
  ];

  /* ===== Testimonios — auto rotacion cada 6s ===== */
  testimonios: Testimonio[] = [
    {
      texto: 'Antes los reportes se perdian en correos. Ahora todo el equipo trabaja sobre la misma plataforma y no se nos escapa nada.',
      autor: 'Mariela Rojas',
      cargo: 'Jefa de Sistemas — Soft Corporation',
    },
    {
      texto: 'Como tecnico, tener mis incidencias asignadas en una sola pantalla me hace ahorrar al menos una hora por dia.',
      autor: 'Luis Vargas',
      cargo: 'Tecnico de Soporte',
    },
    {
      texto: 'El diccionario de fallas se volvio mi primera parada. Muchos problemas ya tienen solucion documentada.',
      autor: 'Diego Quispe',
      cargo: 'Tecnico Senior',
    },
    {
      texto: 'Los reportes de equipos problematicos nos ayudaron a decidir cuales PCs reemplazar este trimestre. Decision con datos.',
      autor: 'Carlos Mendez',
      cargo: 'Jefe del Area de Soporte',
    },
  ];
  testimonioIndex = 0;
  private testimonioIntervalId: any;

  ngOnInit(): void {
    this.startSlider();
    this.startTestimonios();
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.testimonioIntervalId) clearInterval(this.testimonioIntervalId);
  }

  /* ----- Slider de fondo ----- */
  private startSlider(): void {
    this.intervalId = setInterval(() => this.nextSlide(), 5000);
  }
  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }
  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }
  goToSlide(i: number): void {
    this.currentIndex = i;
  }

  /* ----- Slider de testimonios ----- */
  private startTestimonios(): void {
    this.testimonioIntervalId = setInterval(() => this.nextTestimonio(), 6000);
  }
  nextTestimonio(): void {
    this.testimonioIndex = (this.testimonioIndex + 1) % this.testimonios.length;
  }
  prevTestimonio(): void {
    this.testimonioIndex = (this.testimonioIndex - 1 + this.testimonios.length) % this.testimonios.length;
  }
  goToTestimonio(i: number): void {
    this.testimonioIndex = i;
  }

  /* ----- CTA ----- */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}