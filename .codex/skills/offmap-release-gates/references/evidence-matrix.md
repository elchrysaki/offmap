# Evidence matrix

| Change         | Minimum automated evidence                    | Remaining manual/external evidence                         |
| -------------- | --------------------------------------------- | ---------------------------------------------------------- |
| Taxonomy/DTO   | unit and contract tests, typecheck            | representative editorial review                            |
| Payload/access | integration tests with anonymous/editor/admin | production environment and recovery                        |
| Expo UI        | unit, web E2E, Expo Doctor, web export        | iOS/Android physical device and screen reader              |
| AI research    | recorded fixtures and schema/injection evals  | manually triggered live smoke with cost approval           |
| Migration      | dry-run report, 23/2 counts, idempotency      | representative admin comparison and production smoke       |
| Release        | clean install, all builds, staging E2E        | TestFlight, Play internal, store, backup restore, rollback |
