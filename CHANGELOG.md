# Changelog

All notable changes to LV-Tools are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.0] - Complete rewrite

Full rewrite from the command-based v1 into a modern, UI-driven developer toolkit.

### Added
- Floating, resizable, draggable, dockable **NUI window** (React + TypeScript + Tailwind), remembers layout.
- **State-machine architecture** — expensive per-frame loops only run for the active tool. Idle cost is effectively 0.00ms.
- **Dashboard** with live player/world stats.
- **Coordinates** panel with one-click copy in every format (vector2/3/4, JSON, Lua, target, PolyZone, spawn, `/tp`, …).
- **Raycast** tool: toggleable world ray + crosshair, live "what you're looking at" data, and `E` (Vector3) / `Q` (Vector4) copy shortcuts with notifications.
- **Door Locks** creator: aim at a door, capture it, pick authorized jobs pulled from your framework, toggle locked/pickable, and export ready-to-paste `qb-doorlocks` config.
- **Polyzones**, **Props**, **Markers**, **Measurements**, **Clipboard**, **Utilities**, **History**, **Performance**, and **Debug** panels.
- **Framework-agnostic** support: qb-core, Qbox, ESX, or standalone (`server/framework.lua`).
- **Permission system**: ACE, framework admin groups, license whitelist, or standalone.
- **Browser dev mode** with mocked NUI callbacks for building/previewing the UI outside FiveM.
- Movement while the menu is open (`SetNuiFocusKeepInput`) so you can walk around and place things without closing the toolkit.

### Notes
- The compiled UI bundle (`ui/dist`) is committed so the resource runs immediately after cloning — no build step required.
- To develop the UI: `cd ui && npm install && npm run dev`; to rebuild for production: `npm run build`.
