<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- Domain shapes live in `src/domain/types.ts`; pages and components depend only on these types — so data sources can change without UI rewrites.
- Pages read data only through query options in `src/services/queries.ts`, each returning `Sourced<T>` (`source: "demo" | "live"`) — to swap demo data for server functions later and keep demo content visibly flagged.
- Demo content lives only in `src/data/demo/*` and UI marks it with `DemoBadge`/`DemoNotice` — so demo and real data never get mixed up.
- Product sections are registered in `src/config/navigation.ts` (`live` vs `planned`, `client` vs `team`); navigation is derived from it — new modules (AI Concierge, analytics, segments, campaigns) plug in by adding an entry and a route.
- Loyalty calculations are pure functions in `src/lib/loyalty.ts`, covered by `src/test/loyalty.test.ts` — business rules stay testable and UI-free.
- Shared layout (header, footer, toaster) is in `src/routes/__root.tsx`; all styling uses tokens/utilities from `src/styles.css` and button variants in `src/components/ui/button.tsx`.
