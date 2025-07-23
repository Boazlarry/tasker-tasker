# Project-specific guidelines for Gemini

This project is a Next.js application with a Tauri backend.

## General Instructions:
- When making changes, prioritize consistency with existing code style and patterns.
- Before suggesting or implementing new libraries, check `package.json` and `src-tauri/Cargo.toml` for existing dependencies.

## Verification:
- For frontend changes, run `npm run build` and `npm run lint`.
- For backend (Rust/Tauri) changes, run `cargo check` and `cargo clippy` in the `src-tauri` directory.
