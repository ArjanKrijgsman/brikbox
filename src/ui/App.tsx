import { printers } from '../config/printers';

export function App() {
  return (
    <main className="app">
      <h1>BrikBox</h1>
      <p>
        Modulaire, afsluitbare en stapelbare opbergdozen voor brikken. Kies je maat, indeling en
        thema en download de printbestanden.
      </p>
      <p className="status">
        In aanbouw — {printers.length} printerprofielen geladen. Zie <code>docs/ontwerpdocument.md</code>.
      </p>
    </main>
  );
}
