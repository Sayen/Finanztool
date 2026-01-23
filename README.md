# 💰 Finanz-Tool Suite

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)

Eine umfassende Webanwendung zur persönlichen Finanzplanung, die hilft, fundierte Entscheidungen zu treffen. Die Suite kombiniert einen leistungsstarken Budgetplaner mit einem detaillierten "Miete vs. Kaufen"-Rechner.

---

## ✨ Features

### 📊 Budget Planer
Visualisieren Sie Ihre Einnahmen und Ausgabenflüsse.
- **Sankey-Diagramme**: Interaktive Visualisierung Ihrer Geldflüsse.
- **Hierarchische Kategorien**: Erstellen und verwalten Sie verschachtelte Kategorien für präzise Analysen.
- **Zeiträume**: Unterstützung für monatliche, jährliche und prozentuale Ansichten.
- **Flexibilität**: Drag & Drop, Farbanpassungen und vollständige Bearbeitungsmöglichkeiten.
- **Import/Export**: Sichern Sie Ihre Daten oder übertragen Sie sie zwischen Geräten.

### 🏠 Miete vs. Eigentum Rechner
Ein mathematisch fundiertes Tool zur Entscheidungsfindung bei Immobilien.
- **Langzeit-Projektion**: 50-Jahre Finanzsimulation.
- **Szenario-Vergleich**: Vergleichen Sie Mietszenarien direkt mit Kaufoptionen.
- **Detaillierte Parameter**: Berücksichtigung von Inflation, Wertsteigerung, Zinsen, Instandhaltung und Opportunitätskosten (ETF-Investments).
- **Visuelle Auswertung**: Klare Charts zur Vermögensentwicklung über die Zeit.

### ☁️ Synchronisation & Verwaltung
- **Offline-First**: Gast-Modus mit `localStorage` Speicherung für sofortigen Start ohne Anmeldung.
- **Cloud-Sync**: Nahtlose Synchronisation für registrierte Benutzer über verschiedene Geräte hinweg.
- **Admin-Dashboard**: Integrierter Bereich für Benutzerverwaltung und Nutzungsstatistiken.

---

## 🛠 Tech Stack

**Frontend:**
- **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Komponenten**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) (Icons)
- **Visualisierung**: [Recharts](https://recharts.org/) (Charts), Kundenspezifische SVG Sankey-Logik
- **Validierung**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

**Backend:**
- **Sprache**: Vanilla PHP 8+
- **Datenbank**: MySQL / MariaDB
- **API**: RESTful Endpoints mit Session-basierter Authentifizierung

---

## 🚀 Installation & Entwicklung

### Voraussetzungen
- Node.js (v18 oder neuer)
- PHP Server (für Backend-Funktionalität)
- MySQL Datenbank

### Frontend Starten

1. **Repository klonen:**
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

3. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```
   Die Anwendung ist nun unter `http://localhost:5173` erreichbar.

### Backend Einrichtung (Optional)

Das Backend wird für Login, Registrierung und Cloud-Sync benötigt. Ohne Backend läuft die App im lokalen "Gast-Modus".

1. **Datenbank erstellen:** Legen Sie eine leere MySQL-Datenbank an.
2. **PHP-Server konfigurieren:** Stellen Sie sicher, dass der `public/api` Ordner von einem PHP-Server bedient wird.
3. **Installation:**
   - Navigieren Sie zu `http://<ihr-server>/api/install.php`.
   - Folgen Sie dem Installationsassistenten, um die Datenbanktabellen zu erstellen und den Admin-User anzulegen.
   - Eine `config.php` wird automatisch generiert.
   - **Sicherheit:** Löschen Sie die `install.php` nach erfolgreicher Installation.

---

## 📦 Deployment

Das Projekt ist für ein **FTP-Deployment** konfiguriert (via GitHub Actions).

### Workflow
Bei einem Push auf den `main` Branch:
1. Das Frontend wird gebaut (`npm run build`).
2. Die Artefakte aus `dist/` und das Backend aus `public/api/` werden auf den konfigurierten FTP-Server hochgeladen.

### Konfiguration
Setzen Sie folgende GitHub Secrets im Repository:
- `FTP_SERVER`: Hostname (z.B. `ftp.example.com`)
- `FTP_USERNAME`: FTP-Benutzer
- `FTP_PASSWORD`: FTP-Passwort

---

## 📄 Lizenz

Dieses Projekt ist unter der [MIT Lizenz](LICENSE) lizenziert.

---

*Entwickelt mit ❤️ für bessere finanzielle Transparenz.*
