# Copilot Instructions for PDVsystem

## Project Architecture
- **Frontend**: React (Vite) SPA in `dist/`, source in `components/`, `pages/`, and `src/`.
- **Backend**: Node.js/Express in `server/` (TypeScript source in `server/src/`, compiled JS in `server/dist/`).
- **Database**: SQLite, file at `data/novabev.sqlite`. Migrations in `server/migrations/` and `server/src/db/migrations/`.
- **Scripts**: Windows `.bat` scripts for install, build, and launch automation.

## Key Workflows
- **Install**: Run `instalar-app.bat` (installs dependencies, pm2, prepares backend).
- **Build**: Run `npm run build` (builds both frontend and backend).
- **Start (prod)**: `npm run start:prod` (runs backend via pm2, serves frontend).
- **Manual start**: `pm2 start server/dist/index.js --name PDVsystem --env production`.
- **Frontend access**: Open `http://localhost:8787` (served by backend).
- **Migrations**: Run on first start or manually via scripts in `server/migrations/`.

## Patterns & Conventions
- **IP Whitelisting**: Only allowed IPs (table `allowed_ips`) can access; others are blocked and logged.
- **User Auth**: Default admin is `root`/`root` (see migrations for changes).
- **API**: All endpoints under `/api/*`.
- **Database**: Always use `data/novabev.sqlite` (see `server/src/db/database.ts`).
- **Logs**: Use `pm2 logs PDVsystem` for backend logs.
- **Backups**: Regularly backup `data/novabev.sqlite` and `public/uploads/`.

## Integration Points
- **Frontend/Backend**: Served together; no CORS needed in production.
- **External**: No external APIs by default, but dependencies include `better-sqlite3`, `express`, `multer`, etc.

## Examples
- To add a new migration: Place SQL in `server/migrations/`, run via SQLite CLI or migration script.
- To add a new API route: Implement in `server/src/routes/`, export via `server/src/index.ts`.
- To debug: Use `pm2 logs PDVsystem` and check `data/novabev.sqlite` for data integrity.

## Special Notes
- All automation assumes Windows environment.
- Always check that the backend is using the correct database file (`data/novabev.sqlite`).
- For production, restrict firewall to port 8787 and trusted IPs only.

---

For more, see `README.md` and scripts in the project root.
