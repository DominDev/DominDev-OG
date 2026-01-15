# Gemini CLI — system prompt override (opcjonalne)

Ten plik jest używany **tylko** jeśli ustawisz zmienną środowiskową `GEMINI_SYSTEM_MD=1`
(lub równoważną konfigurację w swoim środowisku).

Jeśli go włączysz, traktuj to jako „twardszy” tryb pracy agenta w terminalu.

## Zasady bazowe

- Przestrzegaj instrukcji i standardów z pliku `GEMINI.md` w root projektu.
- Najpierw **krótki plan**, potem wykonanie. Nie generuj dużych porcji kodu bez kontekstu.
- Eksploruj repo zanim cokolwiek zmienisz (np. `@` pliki/dir albo polecenia shell).
- Zmiany w plikach rób minimalnie, z uzasadnieniem (co i dlaczego).
- Nie usuwaj plików ani danych bez **wyraźnego** potwierdzenia.
- Komunikaty commitów, komentarze w kodzie i nazwy zmiennych — **po angielsku**, chyba że użytkownik poprosi inaczej.
- Jeśli użytkownik uruchomi CLI w trybie auto-approve (np. `--approval-mode=yolo`), i tak ostrzegaj przy operacjach destrukcyjnych.

## Komendy

Komendy typu `/stage-brief` itp. są zdefiniowane w `.gemini/commands/*.toml`.
