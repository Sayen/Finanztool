# Finanztool

Ein umfassendes Finanz-Tool mit:
- **Budget Planer**: Sankey-Diagramm Visualisierung, mehrere Konfigurationen, Import/Export.
- **Miete vs. Kaufen Rechner**: Detaillierter Vergleich mit Szenarien.

## Features

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Zustand.
- **Backend**: PHP (Vanilla), MySQL.
- **Funktionen**:
  - Lokale Speicherung (LocalStorage) für Gäste.
  - Benutzerregistrierung & Login.
  - Cloud-Synchronisation für registrierte Benutzer.
  - Admin-Bereich für Benutzerverwaltung & Statistiken.

## Installation (Entwicklung)

1. `npm install`
2. `npm run dev`

Hinweis: Die Backend-API (`/api/...`) funktioniert lokal nur, wenn ein PHP-Server läuft und entsprechend proxy-konfiguriert ist, oder direkt auf dem Server.

## Deployment (FTP)

Das Projekt wird via GitHub Actions automatisch kompiliert und auf den FTP Server geladen.

Erforderliche Secrets in GitHub:
- `FTP_SERVER`: Adresse des FTP Servers (z.B. sl234.web.hostpoint.ch)
- `FTP_USERNAME`: FTP Benutzername
- `FTP_PASSWORD`: FTP Passwort

## Erstinstallation auf dem Server

1. Code via GitHub Action deployen lassen.
2. Rufen Sie `https://ihre-domain.ch/api/install.php` auf.
3. Füllen Sie die Datenbank-Zugangsdaten und den Admin-Account aus.
4. Nach erfolgreicher Installation wird eine `config.php` erstellt.
5. Löschen Sie `install.php` sicherheitshalber (optional, da Skript sich selbst sperrt wenn config existiert).
