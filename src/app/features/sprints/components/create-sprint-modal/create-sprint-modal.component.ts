import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { NgIf } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateSprintPayload } from '@features/board/state/board.models';

@Component({
  selector: 'hk-create-sprint-modal',
  standalone: true,
  templateUrl: './create-sprint-modal.component.html',
  styleUrls: ['./create-sprint-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, ReactiveFormsModule],
})
export class CreateSprintModalComponent {
  readonly dismissed = output<void>();
  readonly submitted = output<CreateSprintPayload>();

  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this.formBuilder.group({
    name: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
    goal: this.formBuilder.control('', [Validators.required, Validators.minLength(5)]),
    focus: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
    startDate: this.formBuilder.control('', Validators.required),
    endDate: this.formBuilder.control('', Validators.required),
  });

  protected get hasInvalidPeriod(): boolean {
    const start = this.form.controls.startDate.value;
    const end = this.form.controls.endDate.value;

    if (!start || !end) {
      return false;
    }

    return new Date(start).getTime() > new Date(end).getTime();
  }

  protected onCancel(): void {
    this.dismissed.emit();
    this.resetForm();
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.hasInvalidPeriod) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: CreateSprintPayload = {
      name: value.name.trim(),
      goal: value.goal.trim(),
      focus: value.focus.trim(),
      startDateIso: value.startDate,
      endDateIso: value.endDate,
    };

    this.submitted.emit(payload);
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      goal: '',
      focus: '',
      startDate: '',
      endDate: '',
    });
  }
}
