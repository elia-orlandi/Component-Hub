import { Component, ChangeDetectionStrategy, inject, OnInit, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComponentsService } from '../state/components.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailComponent implements OnInit {
  // Iniezione delle dipendenze
  private route = inject(ActivatedRoute);
  public componentsService = inject(ComponentsService);

  // -----------------------------------------------------------------
  // Logica per caricare il componente corretto
  // -----------------------------------------------------------------

  // 1. Ottieni i parametri dalla rotta in modo reattivo
  private paramMap = toSignal(this.route.paramMap);

  // 2. Estrai l'ID (sarà sempre presente in questa rotta)
  public componentId = computed(() => this.paramMap()?.get('id') ?? null);

  public componentDetail = computed(() => {
    const selectedComponent = this.componentsService.state.selectedComponent();
    if (!selectedComponent) return null;
    
    return {
      ...selectedComponent,
      dependenciesJson: JSON.stringify(selectedComponent.dependencies || {}, null, 2)
    };
  });

  // Effetto per caricare i dati quando l'ID cambia (o al primo caricamento)
  constructor() {
    effect(() => {
      const id = this.componentId();
      if (id) {
        // Chiedi al servizio di caricare il componente specifico per questo ID
        this.componentsService.loadById(id);
      } else {
        // Gestisci il caso in cui l'ID non sia presente, anche se la rotta lo richiede
        // (buona pratica per la robustezza)
        console.error("ID del componente non trovato nella rotta.");
        this.componentsService.clearSelectedComponent();
      }
    });
  }

  // ngOnInit può essere usato per logica che deve girare una sola volta.
  // In questo caso, l'effect nel costruttore è sufficiente.
  ngOnInit(): void {}
}