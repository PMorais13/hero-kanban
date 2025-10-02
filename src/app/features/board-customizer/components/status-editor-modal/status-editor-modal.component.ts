import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import type { BoardStatusEditorOption } from '@features/board/state/board-config.state';

interface IconOption {
  readonly value: string;
  readonly label: string;
}

export type StatusEditorFormValue = Readonly<{
  name: string;
  description: string;
  icon: string;
}>;

@Component({
  selector: 'hk-status-editor-modal',
  standalone: true,
  templateUrl: './status-editor-modal.component.html',
  styleUrls: ['./status-editor-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf, ReactiveFormsModule],
})
export class StatusEditorModalComponent {
  readonly status = input.required<BoardStatusEditorOption>();
  readonly iconOptions = input.required<readonly IconOption[]>();

  readonly dismissed = output<void>();
  readonly submitted = output<StatusEditorFormValue>();

  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this.formBuilder.group({
    name: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
    description: this.formBuilder.control(''),
    icon: this.formBuilder.control('', Validators.required),
  });

  protected readonly iconOptionsWithFallback = computed(() => {
    const options = this.iconOptions();
    const currentIcon = this.status().icon;

    if (options.some((option) => option.value === currentIcon)) {
      return options;
    }

    return [...options, { value: currentIcon, label: currentIcon } satisfies IconOption];
  });

  private readonly syncFormEffect = effect(
    () => {
      const current = this.status();
      this.form.reset({
        name: current.name,
        description: current.description,
        icon: current.icon,
      });
    },
    { allowSignalWrites: true },
  );

  protected onCancel(): void {
    this.dismissed.emit();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: StatusEditorFormValue = {
      name: value.name.trim(),
      description: value.description?.trim() ?? '',
      icon: value.icon.trim(),
    };

    this.submitted.emit(payload);
  }
}
