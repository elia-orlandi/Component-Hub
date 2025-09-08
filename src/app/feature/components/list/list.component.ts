import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ComponentsService } from '../state/components.service';
import { ComponentCardComponent } from '../../../ui/component-card/component-card.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [ComponentCardComponent], // Importa il presentation component
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {
  // Inietta il servizio di stato (Regola #2.2)
  public componentsService = inject(ComponentsService);

  ngOnInit(): void {
    // Avvia il caricamento dei componenti quando il componente viene inizializzato
    this.componentsService.loadAll();
  }
}