# AGENT.md — Boas práticas para Angular (v19+)

> Este guia orienta um agente de IA a gerar código Angular moderno, consistente e sustentável. O foco está em **tipagem forte**, **arquitetura limpa**, **testabilidade**, **performance**, **acessibilidade** e **segurança**.

---

## 1 Configuração inicial

- Criar projeto standalone:
  ```bash
  ng new app --standalone --routing --style=scss
  ```
- **TypeScript estrito** em `tsconfig.json`:  
  - `strict`,  
  - `noImplicitAny`,  
  - `noUncheckedIndexedAccess`,  
  - `strictNullChecks`,  
  - `exactOptionalPropertyTypes`.
- **ESLint + Prettier** para lint e formatação.
- Configurar **aliases de paths** em `tsconfig.json` (`@app/*`, `@core/*`, `@shared/*`, `@features/*`).

---

## 2 Organização de pastas

Estrutura orientada a **features**:

```
/src/app
  /core         # auth, http, tokens, guards globais
  /shared       # componentes puros, pipes, diretivas
  /features
    /<feature>
      <feature>.routes.ts
      components/
      pages/
      services/
      state/
```

- Cada feature deve ser **standalone**.  
- Evitar “utils” genéricos. Prefira serviços ou tokens coesos.

---

## 3 Standalone e rotas

- Usar **Standalone Components** em 100% dos casos.  
- **inject()** em vez de constructor quando apropriado.  
- **Rotas lazy-loaded** por feature:
  ```ts
  export const FEATURE_ROUTES: Routes = [
    { path: '', component: FeaturePage }
  ];
  ```
- Guardas como funções:
  ```ts
  export const canAccess = () => inject(AuthService).isLoggedIn();
  ```

---

## 4 Tipagem forte

- Nunca usar `any`.  
- Preferir **tipos literais**, **union types** e **satisfies** para checagem.  
- Separar **DTOs (dados da API)** de **ViewModels (dados da UI)**.  
- Declarar sempre o tipo de retorno de funções públicas.

```ts
export type Status = 'todo' | 'in_progress' | 'done';

export interface TaskDto {
  id: string;
  title: string;
  status: Status;
  estimateHours?: number | null;
}

export interface TaskVm {
  id: string;
  title: string;
  status: Status;
  estimateLabel: string;
}
```

---

## 5 Estado: Signals + RxJS

- **Signals** para estado local de UI.  
- **RxJS** para assíncrono, HTTP e streams.  
- Estado o mais próximo possível do componente.  
- Serviços de estado por feature, expondo `signals` ou `Observable` somente-leitura.

```ts
@Injectable({ providedIn: 'root' })
export class TasksState {
  private readonly _tasks = signal<TaskVm[]>([]);
  readonly tasks = this._tasks.asReadonly();

  async load() {
    const http = inject(HttpClient);
    const data = await firstValueFrom(http.get<TaskDto[]>('/api/tasks'));
    this._tasks.set(data.map(mapDtoToVm));
  }

  move(id: string, status: Status) {
    this._tasks.update(list =>
      list.map(t => (t.id === id ? { ...t, status } : t))
    );
  }
}
```

---

## 6 HTTP e erros

- Centralizar HttpClient em **Core**.  
- **Interceptors** para JWT/erros.  
- Retry apenas em **GET** idempotentes.  
- Tratar erros em nível baixo e propagar **tipos claros** para UI.

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getTokenSafely();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(authReq).pipe(
    catchError(err => throwError(() => new DomainHttpError(err)))
  );
};
```

---

## 7 Performance

- `trackBy` em *ngFor.  
- Computed signals/memoization para evitar recomputações.  
- Usar **async pipe** em vez de `subscribe` manuais.  
- Lazy-load de rotas e bundles.  
- Imagens otimizadas (`loading="lazy"`).

---

## 8 Acessibilidade (a11y)

- Usar `aria-*` correto.  
- Gerenciar foco em modais e rotas.  
- Contraste mínimo garantido.  
- Elementos semânticos nativos sempre que possível.

---

## ) Design System e UI

- **SCSS com tokens** (cores, tipografia, espaçamentos).  
- Metodologia **BEM** para classes.  
- Evitar inline styles.  
- Priorizar **Angular CDK** para Drag&Drop, Overlay, etc.

---

## 10 Testes

- Unitários para lógica pura (pipes, utils, services).  
- Componentes: bindings, renderização condicional, eventos.  
- Integração/E2E para fluxos críticos.  
- Meta de cobertura realista (~80%).

---

## 11 Segurança

- Evitar `innerHTML`. Usar `DomSanitizer` só se necessário.  
- Cookies HttpOnly + SameSite preferíveis a localStorage.  
- Nunca expor segredos no front.  
- CSP no servidor.  
- Auditoria de dependências (`npm audit`, CI).

---

## 12 Observabilidade

- Logger com níveis/contexto.  
- Monitorar tempo de carregamento, falhas HTTP e erros de UI.  
- Correlacionar logs do front e do back quando possível.

---

## 13 i18n

- Usar Angular i18n ou Transloco.  
- Pipes nativos de locale para números, datas e moedas.  

---

## 14 CI/CD

- Pipeline: Install → Lint → Test → Build → Audit → Deploy.  
- Conventional Commits.  
- Branch protection + revisão obrigatória.

---

## 15 Convenções

- Nomes claros e consistentes.  
- Extrair funções/métodos quando crescerem demais.  
- Imports ordenados: Angular → libs → app.  
- Comentários explicando **por quê**, não **o quê**.

---

## 16 Exemplos práticos

**Componente standalone**
```ts
@Component({
  selector: 'task-card',
  standalone: true,
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCardComponent {
  task = input.required<TaskVm>();
  moved = output<Status>();

  onMove(status: Status) {
    this.moved.emit(status);
  }
}
```

**Rota com guard**
```ts
export const canViewTasks = () => inject(AuthService).hasRole('user');

export const TASKS_ROUTES: Routes = [
  { path: '', component: TasksPage, canActivate: [canViewTasks] },
];
```

**Mapeamento DTO → VM**
```ts
export const mapDtoToVm = (dto: TaskDto): TaskVm => ({
  id: dto.id,
  title: dto.title,
  status: dto.status,
  estimateLabel: dto.estimateHours ? `${dto.estimateHours}h` : '—'
});
```

---

## 17 Do & Don’t

**Do**
- Tipagem forte em tudo.  
- Estado local com Signals e RxJS para assíncrono.  
- Organização por features e lazy-loading.  
- Testes focados em comportamento.  
- Acessibilidade desde o início.

**Don’t**
- Usar `any` sem justificativa.  
- Lógica pesada no template.  
- Subscribes sem `takeUntil`/`async pipe`.  
- Expor erros técnicos ao usuário.  
- Usar `DomSanitizer` sem restrição.

---

## 18 Critérios de aceite para PRs

- [ ] Sem `any` ou `unknown` sem explicação.  
- [ ] ESLint + Prettier passam limpos.  
- [ ] Testes unitários para a lógica.  
- [ ] Acessibilidade básica validada.  
- [ ] Performance garantida (trackBy, etc.).  
- [ ] Documentação mínima do porquê das decisões.  

---

## 19) Documentação no README

- Cada **feature** ou módulo importante deve ter uma explicação no README ou em um arquivo `README.md` próprio dentro da pasta da feature.  
- A documentação deve responder **o porquê** de certas escolhas técnicas, e não apenas o "como".  
- Incluir no README:
  - **Objetivo da feature** (para que serve, qual problema resolve).  
  - **Decisões técnicas** (por que Signals, por que determinado padrão de estado, etc.).  
  - **Exemplos de uso** (como importar o componente/serviço, como consumir).  
  - **Dependências relevantes** (libs externas usadas e justificativa).  
  - **Checklist de manutenção** (testes, acessibilidade, performance).  
- O README deve ser **curto, claro e atualizado**. Evite documentar detalhes que ficam obsoletos rápido (ex.: nomes de variáveis ou caminhos de arquivo).  
- Sempre que uma PR introduzir algo novo, **atualizar o README** junto faz parte da entrega.  

---

## 20 UI com Angular Material

- Priorizar componentes do Angular Material para shell, formulários e cards (toolbar, sidenav, buttons, form-field, select, chip, progress-bar).
- Sempre habilitar `provideAnimationsAsync()` no `app.config.ts` quando usar Material.
- Preferir `mat-icon` com Material Symbols pré-carregados no `index.html`.
- Configure o tema global em `styles.scss` (via prebuilt theme ou API de theming) garantindo coerência com o visual escuro existente.
- Para criar um **tema novo**, adicione um arquivo JSON em `src/assets/themes` descrevendo as propriedades do tema e inclua uma regra `:root[data-theme='tema-novo']` correspondente em `src/styles.scss`.
