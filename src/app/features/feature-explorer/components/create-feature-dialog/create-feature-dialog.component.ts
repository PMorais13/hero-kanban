import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface CreateFeatureDialogResult {
  readonly title: string;
  readonly theme: string;
  readonly mission: string;
  readonly xpReward: number;
}

@Component({
  selector: 'hk-create-feature-dialog',
  standalone: true,
  templateUrl: './create-feature-dialog.component.html',
  styleUrls: ['./create-feature-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, NgIf],
})
export class CreateFeatureDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<CreateFeatureDialogComponent, CreateFeatureDialogResult>>(MatDialogRef);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly featureForm = this.formBuilder.group({
    title: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    theme: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    mission: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    xpReward: this.formBuilder.control<number | null>(250, {
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.featureForm.invalid) {
      this.featureForm.markAllAsTouched();
      return;
    }

    const rawValue = this.featureForm.getRawValue();

    const result: CreateFeatureDialogResult = {
      title: rawValue.title.trim(),
      theme: rawValue.theme.trim(),
      mission: rawValue.mission.trim(),
      xpReward: Number(rawValue.xpReward ?? 0),
    };

    this.dialogRef.close(result);
  }
}
