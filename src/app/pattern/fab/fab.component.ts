import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [], // Nessuna dipendenza, l'icona viene proiettata con ng-content
  templateUrl: './fab.component.html',
  styleUrls: ['./fab.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FabComponent {
  /**
   * API Pubblica (Input): Il testo da mostrare nel tooltip al passaggio del mouse.
   * Se non fornito, il tooltip non verrà visualizzato.
   */
  tooltip = input<string>('');

  /**
   * API Pubblica (Output): Emette un evento `void` quando il pulsante viene cliccato.
   */
  clicked = output<void>();

  /**
   * Metodo interno chiamato dal template per emettere l'evento di click.
   * Aggiungiamo `event.stopPropagation()` per evitare che il click si propaghi
   * ad eventuali elementi sottostanti, una buona pratica per elementi flottanti.
   * @param event L'evento del mouse.
   */
  onClick(event: MouseEvent): void {
    event.stopPropagation();
    this.clicked.emit();
  }
}