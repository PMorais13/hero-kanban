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
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import type {
  BoardStatusWithCapacity,
  CreateStoryPayload,
  Feature,
  Priority,
  Sprint,
} from '../../state/board.models';

interface StoryTaskForm {
  readonly title: FormControl<string>;
  readonly isDone: FormControl<boolean>;
}

type StoryTaskFormGroup = FormGroup<StoryTaskForm>;

@Component({
  selector: 'kanban-create-story-modal',
  standalone: true,
  templateUrl: './create-story-modal.component.html',
  styleUrls: ['./create-story-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf, ReactiveFormsModule],
})
export class CreateStoryModalComponent {
  readonly features = input.required<readonly Feature[]>();
  readonly statusOptions = input.required<readonly BoardStatusWithCapacity[]>();
  readonly sprints = input.required<readonly Sprint[]>();
  readonly activeSprintId = input<string | null | undefined>();

  readonly dismissed = output<void>();
  readonly submitted = output<CreateStoryPayload>();

  protected readonly priorityOptions: ReadonlyArray<{ value: Priority; label: string }> = [
    { value: 'critical', label: 'Crítica' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Média' },
    { value: 'low', label: 'Baixa' },
  ];

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly sprintPeriodFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  protected readonly form = this.formBuilder.group({
    title: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
    featureId: this.formBuilder.control('', Validators.required),
    statusId: this.formBuilder.control('', Validators.required),
    priority: this.formBuilder.control<Priority>('medium', Validators.required),
    estimate: this.formBuilder.control(3, { validators: [Validators.required, Validators.min(1)] }),
    assignee: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
    labels: this.formBuilder.control(''),
    xp: this.formBuilder.control(40, { validators: [Validators.required, Validators.min(1)] }),
    dueDate: this.formBuilder.control(''),
    sprintId: this.formBuilder.control(''),
    tasks: this.formBuilder.array<StoryTaskFormGroup>([]),
  });

  protected readonly statusAtCapacity = computed(() => {
    const currentStatusId = this.form.controls.statusId.value;
    const option = this.statusOptions().find((item) => item.status.id === currentStatusId);
    return option?.isAtLimit ?? false;
  });

  private readonly syncDefaultsEffect = effect(
    () => {
      const featureOptions = this.features();
      const statusOptions = this.statusOptions();
      const sprintOptions = this.sprints();
      const selectedSprintId = this.activeSprintId();

      if (featureOptions.length > 0 && this.form.controls.featureId.value === '') {
        this.form.controls.featureId.setValue(featureOptions[0].id);
      }

      const currentStatusId = this.form.controls.statusId.value;
      if (currentStatusId === '' && statusOptions.length > 0) {
        const firstAvailable = statusOptions.find((option) => !option.isAtLimit) ?? statusOptions[0];
        this.form.controls.statusId.setValue(firstAvailable.status.id);
      }

      if (
        typeof selectedSprintId === 'string' &&
        selectedSprintId.length > 0 &&
        this.form.controls.sprintId.value === '' &&
        sprintOptions.some((option) => option.id === selectedSprintId)
      ) {
        this.form.controls.sprintId.setValue(selectedSprintId);
      }
    },
    { allowSignalWrites: true },
  );

  protected get taskArray(): FormArray<StoryTaskFormGroup> {
    return this.form.controls.tasks;
  }

  protected trackTask(index: number): number {
    return index;
  }

  protected addTask(): void {
    this.taskArray.push(this.createTaskGroup());
  }

  protected removeTask(index: number): void {
    this.taskArray.removeAt(index);
  }

  protected onCancel(): void {
    this.dismissed.emit();
    this.resetForm();
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.statusAtCapacity()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: CreateStoryPayload = {
      title: value.title,
      featureId: value.featureId,
      statusId: value.statusId,
      priority: value.priority,
      estimate: value.estimate,
      assignee: value.assignee,
      labels: value.labels
        .split(',')
        .map((label) => label.trim())
        .filter((label) => label.length > 0),
      xp: value.xp,
      dueDate: value.dueDate ? new Date(value.dueDate).toISOString() : undefined,
      sprintId: value.sprintId.length > 0 ? value.sprintId : undefined,
      tasks: value.tasks.map((task) => ({
        title: task.title,
        isDone: task.isDone,
      })),
    } satisfies CreateStoryPayload;

    this.submitted.emit(payload);
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset({
      title: '',
      featureId: '',
      statusId: '',
      priority: 'medium',
      estimate: 3,
      assignee: '',
      labels: '',
      xp: 40,
      dueDate: '',
      sprintId: '',
    });
    this.taskArray.clear();
  }

  private createTaskGroup(): StoryTaskFormGroup {
    return this.formBuilder.group({
      title: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
      isDone: this.formBuilder.control(false),
    });
  }

  protected formatSprintLabel(sprint: Sprint): string {
    const start = this.sprintPeriodFormatter.format(new Date(sprint.startDateIso));
    const end = this.sprintPeriodFormatter.format(new Date(sprint.endDateIso));
    return `${sprint.name} · ${start} – ${end}`;
  }
}
