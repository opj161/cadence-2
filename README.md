# Cadence - Silbenanalysator für Songtexte

Ein spezialisierter Texteditor zur Echtzeit-Analyse von Silben in **deutschen** Songtexten.

Dieses Tool verwendet CodeMirror 6 und das `hyphen/de` Paket, um Songschreibern ein direktes visuelles Feedback zur Silbenstruktur ihrer Texte zu geben.

## Kernfunktionen

* **Silbenzählung pro Zeile:** Zeigt die Gesamtzahl der Silben für jede Zeile in einer Leiste an.
* **Inline-Silben-Trennung:** Stellt Wörter mit visuellen Trennern dar (z.B. `wun·der·bar`).
* **Intelligente Formatierung:** Erkennt und formatiert automatisch Sektions-Überschriften (z.B. `[Refrain]`) und Kommentare (z.B. `# Text`).

## Tech-Stack

* React 19
* TypeScript
* Vite
* Tailwind CSS v4
* CodeMirror 6
* `hyphen/de` für die deutsche Silbentrennung

