import { printers } from '../config/printers';

export function App() {
  return (
    <main className="app">
      <h1>NopBox</h1>
      <p>
        Modulaire, afsluitbare en stapelbare opbergdozen voor LEGO®-steentjes. Kies je maat,
        indeling en thema en download de printbestanden.
      </p>
      <p className="status">
        In aanbouw — {printers.length} printerprofielen geladen. Zie <code>docs/ontwerpdocument.md</code>.
      </p>
      <footer>
        LEGO® is een handelsmerk van de LEGO Group, die dit project niet sponsort of goedkeurt.
      </footer>
    </main>
  );
}
