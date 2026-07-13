@import "tailwindcss";

:root {
  --ink: #17313b;
  --ink-soft: #31515c;
  --brand: #21869a;
  --brand-dark: #16697a;
  --brand-pale: #e8f4f6;
  --surface: #ffffff;
  --surface-soft: #f4f7f7;
  --line: #dfe8e9;
  --gold: #b79345;
  --success: #147a55;
  --danger: #a43d3d;
  --shadow: 0 18px 45px rgba(23, 49, 59, 0.10);
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: var(--surface-soft);
}

body {
  margin: 0;
  color: var(--ink);
  background:
    radial-gradient(circle at top right, rgba(33, 134, 154, 0.10), transparent 34rem),
    var(--surface-soft);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  text-rendering: optimizeLegibility;
}

button,
input,
select,
textarea {
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

::selection {
  background: rgba(33, 134, 154, 0.22);
}

.container-app {
  width: min(100% - 2rem, 1120px);
  margin-inline: auto;
}

.card {
  border: 1px solid var(--line);
  border-radius: 1.4rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 30px rgba(23, 49, 59, 0.06);
}

.card-hover {
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.card-hover:hover {
  transform: translateY(-2px);
  border-color: rgba(33, 134, 154, 0.32);
  box-shadow: var(--shadow);
}

.input-field {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 0.9rem;
  background: white;
  padding: 0.85rem 1rem;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.input-field:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(33, 134, 154, 0.12);
}

.btn-primary,
.btn-secondary,
.btn-ghost {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border-radius: 0.9rem;
  padding: 0.72rem 1rem;
  font-weight: 750;
  cursor: pointer;
  transition: transform 150ms ease, opacity 150ms ease, background 150ms ease;
}

.btn-primary {
  border: 1px solid var(--brand);
  color: white;
  background: linear-gradient(135deg, var(--brand), var(--brand-dark));
  box-shadow: 0 9px 22px rgba(33, 134, 154, 0.24);
}

.btn-secondary {
  border: 1px solid var(--line);
  color: var(--ink);
  background: white;
}

.btn-ghost {
  border: 1px solid transparent;
  color: var(--brand-dark);
  background: transparent;
}

.btn-primary:hover,
.btn-secondary:hover,
.btn-ghost:hover {
  transform: translateY(-1px);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.badge-brand {
  color: var(--brand-dark);
  background: var(--brand-pale);
}

.badge-gold {
  color: #71581f;
  background: #f8efd9;
}

.page-title {
  font-size: clamp(1.65rem, 4vw, 2.4rem);
  line-height: 1.08;
  font-weight: 850;
  letter-spacing: -0.035em;
}

.muted {
  color: #647b83;
}

.safe-bottom {
  padding-bottom: calc(6.5rem + env(safe-area-inset-bottom));
}

@media (min-width: 900px) {
  .safe-bottom {
    padding-bottom: 2.5rem;
  }
}
