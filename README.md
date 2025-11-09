# ⭐ Star Wars Graph App

A **React + TypeScript + Vite** application that visualizes Star Wars characters, their films, and starships using an interactive graph powered by **React Flow**.

Includes full **Vitest + React Testing Library + MSW** setup for isolated, network-free testing.

---

## 🚀 Tech Stack

| Category | Tools |
|-----------|-------|
| UI Framework | React 19 + TypeScript |
| Styling | TailwindCSS + custom Star Wars theme |
| State / Data | TanStack React Query |
| Graph Rendering | React Flow + ELK layout |
| Build Tool | Vite |
| Testing | Vitest + Testing Library + MSW |
| Code Quality | ESLint + Prettier |

---

## 📂 Project Structure

```
src/
 ├─ app/               # App providers, router, root layout
 ├─ entities/          # Low-level API + types
 │   ├─ person/
 │   └─ starship/
 ├─ features/          # Functional units (People List, Person Details, etc.)
 │   ├─ people-list/
 │   └─ person-details/
 ├─ pages/             # Page-level containers for routing
 ├─ shared/            # Reusable hooks, UI, libs, styles
 ├─ widgets/           # Layout-level reusable components
 └─ utils/             # Test helpers
tests/
 ├─ msw/               # Mock Service Worker setup
 ├─ utils/             # Shared render utilities
 └─ ...                # Individual test files
```

---

## 🧩 Features

- Browse Star Wars characters via SWAPI.
- Infinite scroll with intersection observer.
- Debounced search.
- Graph visualization of films and starships.
- Fully responsive “Star Wars-style” UI.
- Background animated starfield.
- Type-safe data layer using Zod types.

---

## ⚙️ Development

```bash
# Install dependencies
npm install

# Run local dev server
npm run dev

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Testing

The project uses **Vitest** instead of Jest for faster execution and full compatibility with Vite.

### Run tests

```bash
npm run test
```

or watch mode:

```bash
npm run test:watch
```

### Coverage report

```bash
npm run test:cov
```

---

## 🧠 Vitest Configuration Highlights

Located in `vite.config.ts`:

```ts
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './tests/setupTests.ts',
  alias: {
    '@': '/src',
  },
},
```

This ensures:
- Browser-like DOM environment (`jsdom`)
- Path aliases (`@/features/...`)
- Shared mocks from `setupTests.ts`

---

## 🧱 Mock API (MSW)

All network calls are mocked via **MSW (Mock Service Worker)**.  
This ensures no real API requests during testing.

Handlers are defined in:
```
tests/msw/handlers.ts
```

Example:
```ts
http.get('https://sw-api.starnavi.io/people/', () =>
  HttpResponse.json({ results: [{ name: 'Luke Skywalker', url: '/people/1/' }] })
);
```

Server lifecycle is controlled in:
```
tests/setupTests.ts
```
```ts
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 🧩 Example Tests

### ✅ Component Test

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { PeopleList } from '@/features/people-list/PeopleList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

test('renders people from MSW mock', async () => {
  renderWithClient(<PeopleList search="" />);
  await waitFor(() => expect(screen.getByText(/Luke Skywalker/i)).toBeInTheDocument());
});
```

---

## 🧩 Mocked Browser APIs

`setupTests.ts` includes safe stubs for missing DOM APIs:

```ts
class IOStub implements IntersectionObserver { /* ... */ }
globalThis.IntersectionObserver = IOStub;

class ROStub implements ResizeObserver { /* ... */ }
globalThis.ResizeObserver = ROStub;
```

This prevents JSDOM crashes for components using scrolling or layout detection.

---

## 🎨 Star Wars Theming

Theme colors are stored in `src/shared/styles/theme.css`:

```css
:root {
  --sw-holo: #00d1ff;
  --sw-jedi: #ffe81f;
  --sw-panel: rgba(15, 23, 42, 0.6);
  --sw-border: rgba(148, 163, 184, 0.2);
}
```

The animated starfield background is in `src/shared/styles/starfield.css`.

---

## 🧰 ESLint & Prettier

Linting rules configured in:
- `.eslintrc.js` (TypeScript, React, Hooks)
- `prettier.config.cjs`

Run manually:
```bash
npm run lint
```

---

## 📦 Environment Variables

Create `.env` file if needed:

```bash
VITE_SWAPI_BASE=https://sw-api.starnavi.io
```

---

## 🪐 Summary

✅ Type-safe  
✅ Fully mocked API  
✅ Animated Star Wars visuals  
✅ Unit + integration tests  
✅ Clean, modular architecture  

---

**Author:** _Ihor Kapsomun_  
**Goal:** Building a complete, production-ready Star Wars data explorer with cinematic UI.
