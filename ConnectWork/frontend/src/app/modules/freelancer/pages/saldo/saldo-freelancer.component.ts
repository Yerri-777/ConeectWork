import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
	selector: 'app-saldo-freelancer',
	standalone: true,
	imports: [CommonModule, DecimalPipe],
	templateUrl: './saldo-freelancer.component.html',
	styleUrls: ['./saldo.component.css']
})
export class SaldoFreelancerComponent implements OnInit {
	// Estado mínimo: saldo y cargando
	saldo: number | null = null;
	loading = false;

	constructor() {}

	ngOnInit(): void {
		// Placeholder: en el futuro inyectar Servicio para obtener saldo real
		this.loading = true;
		setTimeout(() => {
			this.saldo = 0;
			this.loading = false;
		}, 100);
	}
}
