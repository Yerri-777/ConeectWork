import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * Directiva: Permite solo números en inputs
 * Uso: <input appPermiteSoloNumero [decimales]="2">
 */
@Directive({
  selector: '[appPermiteSoloNumero]',
  standalone: true
})
export class PermiteSoloNumeroDirective {
  @Input() decimales = 0;

  constructor(private elementRef: ElementRef<HTMLInputElement>) {}

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    const key = event.key;

    // Permitir números
    if (/[0-9]/.test(key)) {
      return;
    }

    // Permitir decimal si está habilitado
    if (this.decimales > 0 && key === '.' || key === ',') {
      const value = this.elementRef.nativeElement.value;
      if (!value.includes('.') && !value.includes(',')) {
        return;
      }
    }

    // Permitir borrar y navegación
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      return;
    }

    // Prevenir cualquier otro carácter
    event.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const paste = event.clipboardData?.getData('text') || '';

    // Validar que el contenido pegado sea numérico
    const regex = this.decimales > 0 ? /^[0-9.]*$/ : /^[0-9]*$/;

    if (!regex.test(paste)) {
      event.preventDefault();
    }
  }
}
