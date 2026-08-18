# OffMap product contract

## Promise

OffMap helps students find credible opportunities without piecing together newsletters, university portals, private chats, spreadsheets, and social posts. It is a directory and editorial service, not an organizer, application platform, or endorsement system.

## MVP audience and jobs

- A student can discover, filter, inspect, save, share, and open the official application page without signing in.
- A student can contribute an official source URL through a short form without signing in.
- An editor can research, normalize, cite, and review a submission as a draft.
- An admin can manage staff, approve, publish, archive, and recover content.

## Included flows

1. Home: editorial hero, featured opportunities, closing soon, and category entry points.
2. Discover: instant search, filter chips, sorting, pagination, and complete UI states.
3. Detail: deadline, eligibility, cost/support, location, verification, source, share, save, and official apply action.
4. Saved: local-only persistence on the current browser/device by default; a student may optionally sign in to sync saves across devices (ADR 0005). Signing in is never required to save.
5. Submit: source URL, title, broad category, note, optional private email, consent, and clear human-review explanation.
6. About: editorial standards, privacy, contribution, and organizational independence.
7. Account (optional): email/password with verification, or Microsoft/Apple sign-in, purely to carry saved opportunities across devices. No profile, feed, or social surface comes with it.

## Explicitly out of scope

Application tracking, document uploads, comments, ratings, social feeds, communities, literal geographic maps, stories, push notifications, personalized recommendations, and automated publication are not MVP features. Student accounts exist only for saved-opportunity sync (see Account above) — anything beyond that remains out of scope.

## Content principles

- Worldwide and English-first, with schemas designed for future localization.
- Missing information remains “Not confirmed”.
- Official sources take priority; every material fact records its support.
- Featured means selected by OffMap editors, not sponsored or endorsed, unless clearly disclosed later.
- Expired and stale records remain visible to moderators for history and re-verification.

## Success criteria

The same published data and core flows work on responsive web, iOS, and Android; students contribute without identity; private records never enter public APIs; and publication always requires an authenticated admin’s explicit action.
