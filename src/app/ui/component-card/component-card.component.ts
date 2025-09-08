import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Component as ComponentModel } from '../../core/models/database.type';

@Component({
  selector: 'app-component-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './component-card.component.html',
  styleUrls: ['./component-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentCardComponent {
  // API Pubblica: riceve il componente da mostrare (Regola #2.2)
  component = input.required<ComponentModel>();
}