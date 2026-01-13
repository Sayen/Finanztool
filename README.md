# Miete vs. Eigentum Vergleichstool

Eine vollständige, produktionsreife Webapplikation zum Vergleich von Miete und Wohneigentum im Kanton Zürich.

## ✨ Was ist neu? (2026)

### 🌙 Verbesserte Dark Mode Unterstützung
- Optimierter Kontrast für bessere Lesbarkeit aller Texte und Buttons
- Perfekt lesbare Tab-Navigation und Header-Elemente

### 📝 Umfassende Parameter-Dokumentation
- **20+ detaillierte Tooltips** mit Beschreibung, Einfluss und Richtwerten
- Spezielle Erklärungen für Schweizer Besonderheiten (Eigenmietwert, etc.)
- Kontextsensitive Hilfe bei jedem Eingabefeld

### ➕ 6 neue Parameter
- Hypothekar-Bearbeitungsgebühr und Schätzungsgebühr
- Parkplatzkosten und Verwaltungskosten (Stockwerkeigentum)
- Renovationsrücklagen
- **Bug-Fix**: Inflation wird jetzt korrekt auf alle Kosten angewendet

### 📊 5 neue Visualisierungen
- **Cashflow-Analyse**: Monatliche Kostenverteilung
- **Tragbarkeitsentwicklung**: 30-Jahres-Prognose mit 33%-Linie
- **Steuereffekt-Chart**: Zinsabzug vs. Eigenmietwert im Detail
- **Break-Even-Visualisierung**: Mit Markierung und farbigen Zonen
- **Opportunitätskosten**: Eigenkapital vs. ETF-Investment

### 🎯 Intelligente Features
- **Echtzeit-Validierung** mit Warnungen bei Regelverletzungen
- **Live-Vorschau** der Berechnungen in jedem Tab
- **Suchfunktion** für Szenarien
- **Filter & Sortierung** (Favoriten, Tragbarkeit, Preis, etc.)

## Features

### 🚀 Schnellstart-Modul
- 5 Kernparameter für schnelle Berechnung
- Automatische Ableitung von Hypothekenbedarf und Vergleichsmiete
- Sofortige Ergebnisanzeige mit KPI-Cards
- Tragfähigkeitsprüfung nach 33%-Regel

### 📊 Detaillierte Parametereinstellung
- **Miete**: Netto-Miete, Nebenkosten, Versicherungen, jährliche Steigerung
- **Eigentum**: Kaufpreis, Eigenkapital, Kaufnebenkosten (Notar, Grundbuch, Makler, Hypothekargebühren, Schätzung)
- **Hypothek**: 1. & 2. Hypothek mit Zinssätzen, Amortisation, Zinsfestschreibung
- **Laufende Kosten**: Nebenkosten, Versicherungen, Unterhalt, Parkplatz, Verwaltungskosten, Renovationsrücklagen
- **Steuern**: Grenzsteuersatz, Zinsabzug, Eigenmietwert-Besteuerung
- **💡 Umfassende Tooltips**: Jeder Parameter hat detaillierte Erklärungen mit Einfluss und Richtwerten für die Schweiz

### 🎯 Intelligente Validierung
- Echtzeit-Warnungen bei Verletzung von Finanzierungsregeln
- Hinweise auf zu geringes Eigenkapital (< 20%)
- Warnung bei zu hoher Belehnung (> 80%)
- Live-Berechnungsvorschau in jedem Tab

### 💰 Umfassende Berechnungs-Engine
- Hypothekarkosten (Zins + Amortisation)
- Vermögensaufbau über Zeit mit Wertsteigerung
- Break-Even-Punkt Berechnung
- Tragfähigkeitsprüfung mit 5% kalkulatorischem Zins
- Steuerersparnis durch Zinsabzug
- Eigenmietwert-Besteuerung (Schweizer Spezialität)
- Kumulierte Kosten über 50 Jahre
- Opportunitätskosten (ETF-Rendite auf Eigenkapital)
- **Inflation-Berücksichtigung** auf alle laufenden Kosten

### 📈 Umfassende Visualisierungen

#### Übersicht-Charts
- **Kumulierte Kosten**: Linien-Chart über Zeit mit Vergleich Miete vs. Eigentum
- **Nettovermögen-Entwicklung**: Vermögensaufbau über 30 Jahre
- **Jährliche Kostenaufteilung**: Stacked Bar Chart mit detaillierter Aufschlüsselung

#### Neue Spezial-Charts
- **💰 Cashflow-Analyse**: Monatliche Kostenverteilung im ersten Jahr
- **📊 Tragbarkeitsentwicklung**: 30-Jahres-Prognose mit 33%-Referenzlinie und Inflation
- **💸 Steuereffekt-Analyse**: Zinsabzug vs. Eigenmietwert mit Netto-Effekt
- **⚖️ Break-Even-Visualisierung**: Mit Markierung und farbigen Zonen
- **📈 Opportunitätskosten**: Eigenkapital in Immobilie vs. alternatives ETF-Investment

Alle Charts sind interaktiv mit Tooltips und responsivem Design.

### 💾 Erweiterte Szenarien-Verwaltung
- Mehrere Szenarien erstellen, benennen, duplizieren, löschen
- LocalStorage-Persistierung für alle Szenarien
- Favoriten markieren
- **🔍 Suchfunktion** für schnelles Finden von Szenarien
- **🎯 Filter**: Alle, Favoriten, Tragbare, Nicht tragbare
- **📊 Sortierung**: Nach Datum, Name, Kaufpreis oder Tragbarkeit
- JSON Export/Import für Backup und Sharing

### 📤 Export-Funktionen
- PDF-Bericht mit professionellem Layout
- Excel/CSV Export mit detaillierten Jahreswerten
- Link-Sharing (URL mit Query-Params)
- Zwischenablage-Funktion

### 🎨 Benutzerfreundlichkeit
- **Dark Mode Support** mit verbesserter Sichtbarkeit aller Elemente
- **Responsive Design** (Mobile-First) - funktioniert auf allen Geräten
- Schweizer Währungsformatierung (CHF 1'300'000)
- Vollständig auf Deutsch (DE-CH)
- Moderne UI mit Tailwind CSS & Radix UI
- **Accessibility**: Aria-Labels, Keyboard-Navigation, Touch-friendly
- **Tabbed Interface** in Visualisierungen für bessere Organisation
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
2. Nutzen Sie die **Suchfunktion** um Szenarien schnell zu finden
3. Filtern Sie nach Favoriten oder Tragbarkeit
4. Sortieren Sie nach verschiedenen Kriterien
5. Vergleichen Sie die Szenarien in der Übersicht
6. Exportieren Sie Ihre Favoriten als PDF oder Excel
7. Teilen Sie Berechnungen über den Link

### Visualisierungen erkunden
1. Wechseln Sie zum Tab "Visualisierungen"
2. Nutzen Sie die 6 Unter-Tabs für verschiedene Analysen:
   - **Übersicht**: Klassische Kosten- und Vermögenscharts
   - **Cashflow**: Monatliche Kostenverteilung
   - **Tragbarkeit**: Langfristige Tragbarkeitsentwicklung
   - **Steuern**: Steuereffekte im Detail
   - **Break-Even**: Wann lohnt sich Eigentum?
   - **Opportunität**: Alternative Kapitalverwendung

## Parameter-Leitfaden

### Mietparameter
| Parameter | Beschreibung | Richtwert Zürich |
|-----------|--------------|------------------|
| **Netto-Miete** | Monatliche Kaltmiete | CHF 1'500-3'000 |
| **Nebenkosten (Miete)** | Heizung, Wasser, Hauswartung | CHF 150-300/Monat |
| **Hausratversicherung** | Versicherung für persönlichen Besitz | CHF 300-600/Jahr |
| **Jährliche Mietsteigerung** | Durchschnittliche Erhöhung | 1-2% p.a. |

### Kaufparameter
| Parameter | Beschreibung | Richtwert Zürich |
|-----------|--------------|------------------|
| **Kaufpreis** | Immobilienpreis ohne Nebenkosten | Marktwert |
| **Eigenkapital** | Min. 20% des Kaufpreises, 10% als "hartes" EK | ≥ 20% |
| **Notargebühren** | Beurkundung des Kaufvertrags | 0.4-0.7% |
| **Grundbuchgebühren** | Eintragung ins Grundbuch | 0.2-0.4% |
| **Maklergebühren** | Optional, je nach Vereinbarung | 0-3% |
| **Hypothekar-Bearbeitungsgebühr** | Einmalige Bankgebühr | 0.5-1% der Hypothek |
| **Schätzungsgebühr** | Immobilienbewertung | CHF 500-2'000 |

### Hypothekenstruktur
| Parameter | Beschreibung | Richtwert |
|-----------|--------------|-----------|
| **1. Hypothek** | Bis max. 65% des Kaufpreises | ≤ 65% LTV |
| **1. Hypothek Zinssatz** | Aktueller Marktzins | 2.0-3.0% p.a. |
| **2. Hypothek** | Bis max. 15% des Kaufpreises | ≤ 15% LTV |
| **2. Hypothek Zinssatz** | Meist gleich wie 1. Hypothek | 2.0-3.0% p.a. |
| **Amortisation** | Rückzahlung 2. Hypothek | Max. 15 Jahre |

### Laufende Kosten (Eigentum)
| Parameter | Beschreibung | Richtwert |
|-----------|--------------|-----------|
| **Nebenkosten** | Heizung, Wasser, Strom | CHF 200-400/Monat |
| **Gebäudeversicherung** | Obligatorisch (kantonal) | CHF 800-1'500/Jahr |
| **Unterhalt** | Reparaturen, Renovationen | 1-1.5% des Kaufpreises p.a. |
| **Parkplatzkosten** | Falls separat gemietet | CHF 100-200/Monat |
| **Verwaltungskosten** | Nur bei Stockwerkeigentum | CHF 200-400/Monat |
| **Renovationsrücklagen** | Für grössere Sanierungen | CHF 0-5'000/Jahr |

### Steuerparameter
| Parameter | Beschreibung | Richtwert Zürich |
|-----------|--------------|------------------|
| **Grenzsteuersatz** | Bund + Kanton + Gemeinde | 20-35% |
| **Eigenmietwert** | Fiktives Einkommen aus Wohneigentum | 3.0-4.0% des Immobilienwerts |
| **Zinsabzug** | Hypothekarzinsen abzugsfähig | ✓ Empfohlen |
| **Eigenmietwert besteuern** | Schweizer Besonderheit | ✓ Obligatorisch |

### Weitere Parameter
| Parameter | Beschreibung | Richtwert |
|-----------|--------------|-----------|
| **Wertsteigerung Immobilie** | Historische Performance CH | 1.0-2.5% p.a. |
| **ETF-Rendite** | Alternative Kapitalanlage | 5-7% p.a. |
| **Inflation** | Teuerung (auf alle Kosten) | 1.0-1.5% p.a. |


## Berechnungslogik

Die App verwendet folgende Formeln und Annahmen:

### Tragbarkeitsberechnung
- **Regel**: Max. 33% des Bruttoeinkommens
- **Kalkulatorischer Zins**: 5% (unabhängig vom tatsächlichen Zinssatz)
- **Berücksichtigt**: Zinsen, Amortisation, Nebenkosten, Unterhalt, alle Zusatzkosten
- **Formel**: (Jährliche Kosten / 12) ≤ (Bruttoeinkommen × 33.33%)

### Steuereffekte
- **Zinsabzug**: Hypothekarzinsen × Grenzsteuersatz = Ersparnis
- **Eigenmietwert**: Immobilienwert × Eigenmietwert-Satz × Grenzsteuersatz = Steuerlast
- **Netto-Steuereffekt**: Zinsabzug - Eigenmietwert (wird über Zeit negativer wegen Amortisation)

### Vermögensaufbau
- **Nettovermögen**: Immobilienwert - Hypothekensaldo - Kumulierte Kosten
- **Wertsteigerung**: Jährliche prozentuale Aufwertung der Immobilie
- **Opportunitätskosten**: Eigenkapital × (1 + ETF-Rendite)^Jahre

### Inflation
- **Anwendung**: Auf alle laufenden Kosten (Nebenkosten, Versicherungen, Unterhalt)
- **Mietsteigerung**: Separate Konfiguration möglich (oft höher als Inflation)
- **Formel**: Kosten × (1 + Inflationsrate)^(Jahr - 1)

### Break-Even
- **Definition**: Jahr, in dem kumulierte Eigentum-Kosten < kumulierte Miet-Kosten
- **Berücksichtigt**: Alle Anfangsinvestitionen, laufenden Kosten, Steuereffekte
- **Hinweis**: Sagt nichts über Vermögensaufbau aus

### Standard-Werte (anpassbar)
- Tragbarkeit: 33% mit 5% kalkulatorischem Zins
- Eigenmietwert: 3.5% des Immobilienwerts (steuerbar)
- Wertsteigerung: 2.0% p.a.
- ETF-Rendite: 6.0% p.a.
- Inflation: 1.5% p.a.

## Browser-Kompatibilität

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Browser (iOS Safari, Chrome Mobile)

## Lizenz

© 2026 Finanztool - Alle Rechte vorbehalten

## Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im GitHub Repository.
