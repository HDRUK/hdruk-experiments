# @hdruk/experiments

Targeted in-app feedback prompts and design preference tests, and the builder
to make them. A prompt can mix headings, rich text, images, ratings, choices,
free text and a Design A vs B pick, across several steps with branching.

It has two layers:

-   **Prompt**: `ExperimentPrompt` picks the first experiment whose `paths`
    match the current page, opens it when its trigger fires and hands the
    answers to `onSubmit`. It remembers what a visitor has seen, dismissed or
    answered in one first-party cookie, `hdruk-experiments`.
-   **Builder**: `ExperimentBuilder` edits an experiment's definition (steps,
    blocks and branches) with a live preview of the prompt.

Fetching experiments, targeting by audience, saving responses and branding
belong to the app. The package has no branding of its own.

## Install

```sh
npm install @hdruk/experiments
```

Peer dependencies: `react`, `@mui/material`, `@mui/icons-material`,
`@mui/utils`, `@emotion/*` and `@tiptap/*`. The builder also needs
`@dnd-kit/*`, which is optional for apps that only show prompts. The package
does not depend on `@hdruk/ui`.

There are three entry points, so the builder stays out of the site-wide bundle:

| Entry                        | Contents                                                           | Where                   |
| ---------------------------- | ------------------------------------------------------------------ | ----------------------- |
| `@hdruk/experiments`         | Types, `ExperimentsLocaleText` and `validateDefinition`            | Server or client        |
| `@hdruk/experiments/client`  | `ExperimentPrompt`                                                 | Client (`"use client"`) |
| `@hdruk/experiments/builder` | `ExperimentBuilder`, `BuilderLocaleText` and the editor slot types | Client (`"use client"`) |

## Show a prompt

```tsx
import { ExperimentPrompt } from "@hdruk/experiments/client";

<ExperimentPrompt
    experiments={experiments}
    pathname={pathname}
    onSubmit={(experiment, answers, { path, variant, contactEmail }) =>
        save(experiment.id, { answers, path, variant, contactEmail })
    }
/>;
```

`experiments` are the ones already running for this visitor. In `paths`, `*`
matches one segment and `**` any number. Pass `allowContact` and
`contactEmail` to show the last step's contact opt-in with an email you already
hold.

## Build an experiment

```tsx
import { validateDefinition } from "@hdruk/experiments";
import { ExperimentBuilder } from "@hdruk/experiments/builder";

<ExperimentBuilder
    value={definition}
    onChange={setDefinition}
    uploadImage={uploadImage}
    slots={{ richTextEditor: MyRichTextEditor }}
/>;
```

Run `validateDefinition(definition)` before saving. It returns one error per
problem, such as a step with no blocks or a branch to a missing step, and an
empty array when the definition is valid. The builder shows the same errors
against the steps and blocks they belong to.

`uploadImage` receives a `File` and resolves to `{ src }`, the image's URL. Without it, image
blocks take a URL only. Without `slots.richTextEditor`, rich text is a plain
text area.

### Branding

Strings the package renders itself are injected through `localeText` (and
`previewLocaleText` on the builder), with English defaults.

Pass `slots.blocks` to `ExperimentPrompt` to replace how a block type renders.

Colours and `shape.borderRadius` come from the surrounding MUI theme. The focus
ring uses `palette.status.keyboardFocus` when the theme has it, falling back to
`primary.main`. Every styled part is a named slot, so the app can restyle any
of them from its theme:

```ts
components: {
    HdrukExperiment: { styleOverrides: { scalePoint: ({ theme }) => ({}) } },
    HdrukExperimentBuilder: { styleOverrides: { item: ({ theme }) => ({}) } },
}
```

## Develop

```sh
npm test          # vitest
npm run typecheck
npm run build     # tsup: ESM + CJS + .d.ts, "use client" on the client and builder entries
npm run dev:link  # rebuild and yalc push on every save
```
