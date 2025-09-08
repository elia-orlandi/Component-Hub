import {
  Component,
  ChangeDetectionStrategy,
  signal,
  HostListener,
  ElementRef,
  inject,
  input
} from '@angular/core';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [], // Non ha dipendenze interne, solo ng-content
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownMenuComponent {
  // Inietta ElementRef per ottenere un riferimento al componente stesso.
  // È necessario per capire se un click avviene "dentro" o "fuori".
  private elementRef = inject(ElementRef);

  /**
   * (Opzionale) Permette di controllare l'apertura/chiusura del dropdown dall'esterno.
   * Se non fornito, il componente gestisce lo stato internamente.
   */
  isOpen = input<boolean>();

  /**
   * Stato interno del dropdown. Usato se `isOpen` non è fornito dall'esterno.
   * Inizializzato a `false`.
   */
  private internalIsOpen = signal(false);

  /**
   * Determina lo stato corrente del dropdown, dando priorità all'input esterno.
   * Questo permette al componente di essere sia controllato che non controllato.
   */
  public get state(): boolean {
    return this.isOpen() ?? this.internalIsOpen();
  }

  /**
   * Apre, chiude o inverte lo stato del dropdown.
   */
  public toggle(): void {
    if (this.isOpen() === undefined) {
      // Se non è controllato dall'esterno, gestisce lo stato interno
      this.internalIsOpen.update(open => !open);
    }
  }
  
  public close(): void {
    if (this.isOpen() === undefined) {
      this.internalIsOpen.set(false);
    }
  }

  /**
   * HostListener che ascolta i click sull'intero documento.
   * Se il click avviene fuori dal componente, il dropdown si chiude.
   * Questo garantisce un'esperienza utente intuitiva.
   * @param event L'evento del mouse.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.close();
    }
  }
}