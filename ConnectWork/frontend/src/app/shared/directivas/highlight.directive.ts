import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * Directiva: Resalta elementos en hover
 * Uso: <div appHighlight="yellow">Contenido</div>
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlight = 'yellow';
  @Input() highlightOpacity = 0.3;

  private colorOriginal: string;

  constructor(private elementRef: ElementRef<HTMLElement>) {
    this.colorOriginal = this.elementRef.nativeElement.style.backgroundColor;
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.highlight(this.appHighlight, this.highlightOpacity);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.elementRef.nativeElement.style.backgroundColor = this.colorOriginal;
  }

  private highlight(color: string, opacity: number): void {
    // Convertir nombre de color a hexadecimal
    const colorHex = this.getNombreColorAHex(color);
    const rgb = this.hexToRgb(colorHex);

    if (rgb) {
      this.elementRef.nativeElement.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    }
  }

  private getNombreColorAHex(colorName: string): string {
    const colores: { [key: string]: string } = {
      'red': '#FF0000',
      'green': '#008000',
      'blue': '#0000FF',
      'yellow': '#FFFF00',
      'cyan': '#00FFFF',
      'magenta': '#FF00FF',
      'gray': '#808080',
      'orange': '#FFA500',
      'purple': '#800080',
      'pink': '#FFC0CB',
      'lightblue': '#ADD8E6',
      'lightgreen': '#90EE90'
    };

    return colores[colorName.toLowerCase()] || colorName;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
