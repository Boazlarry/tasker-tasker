# Project-specific guidelines for Gemini

This project is a Next.js application. Tauri packaging is planned after the MVP; do not assume a Rust backend until `src-tauri/` exists.

## General Instructions:
- When making changes, prioritize consistency with existing code style and patterns.
- Before suggesting or implementing new libraries, check `package.json` and `src-tauri/Cargo.toml` for existing dependencies.

## Verification:
- For code changes, run `npm run verify`.
- For focused frontend checks, run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
- For backend (Rust/Tauri) changes, run `cargo check` and `cargo clippy` in the `src-tauri` directory after that directory exists.
