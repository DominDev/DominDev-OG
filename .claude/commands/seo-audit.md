---
description: Audyt SEO + techniczny (meta, struktura, CWV, schema, content) i raport do _docs/report-seo.md.
argument-hint: [url | repo | oba]
allowed-tools: WebSearch, WebFetch, Read, Grep, Glob
---

Wykonaj audyt SEO i techniczny dla: $ARGUMENTS

Wynik ma mieć 3 części:

1. Executive summary (5–10 punktów: co boli najbardziej i dlaczego)
2. Lista rekomendacji pogrupowana (Must / Should / Could) z uzasadnieniem
3. Konkretne zadania wdrożeniowe (checklista) + jeśli to repo: wskazanie plików/miejsc do zmiany

Zakres minimalny:

- meta: title/description/canonical/robots/OG/Twitter
- nagłówki i semantyka, linkowanie wewnętrzne
- schema.org (dobór + poprawność)
- CWV (LCP/CLS/INP) + render-blocking (CSS/JS)
- obrazy (formaty, lazy-load, wymiary), sitemap/robots (jeśli dotyczy)
- treść: intencje, frazy, duplikacja, FAQ (jeśli pasuje)
- ryzyka: index bloat, thin content, parametry URL, błędy 4xx/5xx

Na końcu:

- zapisz pełny raport do `_docs/report-seo.md`
- w odpowiedzi pokaż tylko streszczenie + listę „Must” (bez lania wody)
