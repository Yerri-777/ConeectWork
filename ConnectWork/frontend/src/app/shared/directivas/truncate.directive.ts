import { Directive, ElementRef, Input, OnInit } from '@angular/core';

/**
 * Directiva: Trunca texto con ellipsis
 * Uso: <p appTruncate="50">Texto largo que será truncado...</p>
 */
@Directive({
  selector: '[appTruncate]',
  standalone: true
})
export class TruncateDirective implements OnInit {
  @Input() appTruncate: number = 50; // Cantidad de caracteres
  @Input() truncateEnd = '...';

  private textoOriginal: string = '';

  constructor(private elementRef: ElementRef<HTMLElement>) {
    this.textoOriginal = this.elementRef.nativeElement.textContent || '';
  }

  ngOnInit(): void {
    this.truncarTexto();
  }

  private truncarTexto(): void {
    const elemento = this.elementRef.nativeElement;
    const texto = elemento.textContent || '';

    if (texto.length > this.appTruncate) {
      const textoTruncado = texto.substring(0, this.appTruncate) + this.truncateEnd;
      elemento.textContent = textoTruncado;
      elemento.title = texto; // Mostrar texto completo en tooltip
    }
  }
}
