import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
	selector: '[appPermiteSoloNumero]',
	standalone: true
})
export class PermiteSoloNumeroDirective {
	private regex = /[0-9]/;

	constructor(private el: ElementRef<HTMLInputElement>) {}

	@HostListener('keypress', ['$event']) onKeyPress(event: KeyboardEvent) {
		const inputChar = event.key;
		if (!this.regex.test(inputChar) && event.key !== 'Backspace') {
			event.preventDefault();
		}
	}

	@HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
		const paste = event.clipboardData?.getData('text') || '';
		if (!/^[0-9]*$/.test(paste)) {
			event.preventDefault();
		}
	}
}
