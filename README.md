# Miete vs. Eigentum Vergleichstool

Eine vollständige, produktionsreife Webapplikation zum Vergleich von Miete und Wohneigentum im Kanton Zürich.

## Features

### 🚀 Schnellstart-Modul
- 5 Kernparameter für schnelle Berechnung
- Automatische Ableitung von Hypothekenbedarf und Vergleichsmiete
- Sofortige Ergebnisanzeige mit KPI-Cards
- Tragfähigkeitsprüfung nach 33%-Regel

### 📊 Detaillierte Parametereinstellung
- **Miete**: Netto-Miete, Nebenkosten, Versicherungen, jährliche Steigerung
- **Eigentum**: Kaufpreis, Eigenkapital, Kaufnebenkosten (Notar, Grundbuch, Makler)
- **Hypothek**: 1. & 2. Hypothek mit Zinssätzen, Amortisation, Zinsfestschreibung
- **Laufende Kosten**: Nebenkosten, Versicherungen, Unterhalt (vereinfacht + detailliertes zyklisches Modell)
- **Steuern**: Grenzsteuersatz, Zinsabzug, Eigenmietwert-Besteuerung

### 💰 Umfassende Berechnungs-Engine
- Hypothekarkosten (Zins + Amortisation)
- Vermögensaufbau über Zeit mit Wertsteigerung
- Break-Even-Punkt Berechnung
- Tragfähigkeitsprüfung mit 5% kalkulatorischem Zins
- Steuerersparnis durch Zinsabzug
- Eigenmietwert-Besteuerung
- Kumulierte Kosten über 50 Jahre
- Opportunitätskosten (ETF-Rendite auf Eigenkapital)

### 📈 Visualisierungen
- Linien-Chart: Kumulierte Kosten über Zeit
- Linien-Chart: Nettovermögen-Entwicklung
- Stacked Bar: Jährliche Kostenaufteilung
- KPI-Cards mit Kennzahlen

### 💾 Szenarien-Management
- Mehrere Szenarien erstellen, benennen, duplizieren, löschen
- LocalStorage-Persistierung für alle Szenarien
- Favoriten markieren
- JSON Export/Import für Backup und Sharing

### 📤 Export-Funktionen
- PDF-Bericht mit professionellem Layout
- Excel/CSV Export mit detaillierten Jahreswerten
- Link-Sharing (URL mit Query-Params)
- Zwischenablage-Funktion

### 🎨 Benutzerfreundlichkeit
- Dark Mode Support
- Responsive Design (Mobile-First)
- Schweizer Währungsformatierung (CHF 1'300'000)
- Vollständig auf Deutsch (DE-CH)
- Moderne UI mit Tailwind CSS & Radix UI

## Technologie-Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI**: Tailwind CSS + Radix UI (Shadcn/ui Komponenten)
- **State Management**: Zustand mit localStorage persistence
- **Charts**: Recharts
- **Export**: jsPDF + SheetJS (xlsx)
- **Icons**: Lucide React

## Installation & Entwicklung

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Production Build erstellen
npm run build

# Build testen
npm run preview
```

## Deployment

Die App ist als statische Website konzipiert und kann auf jedem Standard-Webhosting deployed werden:

1. Build erstellen: `npm run build`
2. `dist/` Ordner auf Webserver hochladen
3. Fertig!

### Kompatible Hosting-Plattformen
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- Beliebiger statischer Webserver (Apache, Nginx, etc.)

## Verwendung

### Schnellstart
1. Öffnen Sie die Anwendung
2. Geben Sie die 5 Kernparameter ein:
   - Kaufpreis der Immobilie
   - Immobilientyp (Wohnung, Haus, Stockwerkeigentum)
   - Ihr Eigenkapital
   - Haushaltseinkommen (jährlich)
   - Wohnlage
3. Klicken Sie auf "Berechnung starten"
4. Ergebnisse werden sofort angezeigt

### Detaillierte Anpassung
1. Wechseln Sie zum Tab "Detailliert"
2. Passen Sie alle Parameter nach Ihren Bedürfnissen an
3. Die Berechnung aktualisiert sich automatisch

### Szenarien verwalten
1. Erstellen Sie mehrere Szenarien für verschiedene Immobilien
2. Vergleichen Sie die Szenarien in der Übersicht
3. Exportieren Sie Ihre Favoriten als PDF oder Excel
4. Teilen Sie Berechnungen über den Link

## Berechnungslogik

Die App verwendet folgende Formeln und Annahmen:

- **Tragbarkeit**: Max. 33% des Bruttoeinkommens, kalkuliert mit 5% Zins
- **Steuerersparnis**: Hypothekarzinsen × Grenzsteuersatz
- **Eigenmietwert**: ca. 3.5% des Immobilienwerts (steuerbar)
- **Wertsteigerung**: Konfigurierbar (Standard: 2% p.a.)
- **ETF-Rendite**: Für Opportunitätskosten (Standard: 6% p.a.)
- **Inflation**: Berücksichtigt bei Mietsteigerung (Standard: 2% p.a.)

## Browser-Kompatibilität

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Browser (iOS Safari, Chrome Mobile)

## Lizenz

© 2026 Finanztool - Alle Rechte vorbehalten

## Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im GitHub Repository.
