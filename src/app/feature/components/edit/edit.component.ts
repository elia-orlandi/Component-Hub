import { Component, ChangeDetectionStrategy, inject, OnInit, computed, effect, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentsService } from '../state/components.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { ComponentCreatePayload, ComponentUpdatePayload } from '../../../core/models/database.type';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent implements OnInit {
  // Iniezione delle dipendenze
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  public componentsService = inject(ComponentsService);

  // Definizione del form reattivo
  public componentForm = this.fb.group({
    name: ['', Validators.required],
    readme: [''],
    angular_version: ['17', Validators.required], // Valore di default
    // ... altri campi come dependencies, code_html, etc.
    preview_screenshot_url: ['', Validators.required],
  });
  
  // -----------------------------------------------------------------
  // Logica per distinguere tra modalità "New" e "Edit"
  // -----------------------------------------------------------------
  
  // 1. Ottieni i parametri dalla rotta in modo reattivo
  private paramMap = toSignal(this.route.paramMap);

  // 2. Estrai l'ID del componente (sarà `null` in modalità "new")
  public componentId = computed(() => this.paramMap()?.get('id') ?? null);

  // 3. Crea un segnale calcolato che ci dice se siamo in modalità modifica
  public isEditMode = computed(() => !!this.componentId());

  // Effetto per caricare i dati del componente quando siamo in modalità modifica
  constructor() {
    effect(() => {
      const id = this.componentId();
      if (id) {
        // Se c'è un ID, chiediamo al servizio di caricare quel componente
        // (dovremo implementare `loadById` nel servizio)
        this.componentsService.loadById(id);
      } else {
        // Se non c'è ID, siamo in modalità "new".
        // Assicuriamoci che il form sia pulito e lo stato del componente selezionato sia nullo.
        this.componentForm.reset({ angular_version: '17' }); // Resetta con valori di default
        this.componentsService.clearSelectedComponent(); // Metodo da aggiungere al servizio
      }
    });
    
    // Effetto per popolare il form quando il componente selezionato cambia
    effect(() => {
      const selectedComponent = this.componentsService.state.selectedComponent();
      if (selectedComponent && this.isEditMode()) {
        // Popola il form con i dati del componente caricato
        this.componentForm.patchValue(selectedComponent);
      }
    });

    effect(() => {
      // Questo effect si attiva quando `isLoading` o `error` cambiano.
      const isLoading = this.componentsService.state.isLoading();
      const error = this.componentsService.state.error();
      
      // Usiamo `untracked` per leggere lo stato precedente senza creare dipendenze cicliche.
      const previousState = untracked(() => this.componentsService.state);

      // La condizione di successo è: il caricamento è appena finito E non ci sono errori.
      if (!isLoading && previousState.isLoading() && !error) {
        // Siamo in una transizione da loading -> not loading, con successo.
        console.log('Operazione di salvataggio completata con successo!');
        const newId = this.componentsService.state.selectedComponent()?.id;
        
        if (newId) {
          this.router.navigate(['/components', newId]);
        }
      }
    });
  }

  // Il metodo ngOnInit può essere usato per logica che deve girare una sola volta
  ngOnInit(): void {}

  // Metodo per il salvataggio
  onSubmit(): void {
    if (this.componentForm.invalid) {
      return;
    }

    const formValue = this.componentForm.getRawValue();

    if (this.isEditMode()) {
      const payload: ComponentUpdatePayload & { id: string } = {
        id: this.componentId()!,
        ...formValue as ComponentUpdatePayload
      };
      this.componentsService.update(payload);
    } else {
      const payload: ComponentCreatePayload = formValue as ComponentCreatePayload;
      this.componentsService.create(payload);
    }
  }
}