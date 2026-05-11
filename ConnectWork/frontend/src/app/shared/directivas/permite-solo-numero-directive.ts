import { Directive, ElementRef, HostListener, Input } from '@angular/core';


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


    event.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const paste = event.clipboardData?.getData('text') || '';


    const regex = this.decimales > 0 ? /^[0-9.]*$/ : /^[0-9]*$/;

    if (!regex.test(paste)) {
      event.preventDefault();
    }
  }
}
