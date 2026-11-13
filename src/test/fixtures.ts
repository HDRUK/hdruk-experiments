import { Experiment, ExperimentDefinition } from "../ExperimentPrompt/types";

export const preferenceDefinition: ExperimentDefinition = {
    steps: [
        {
            id: "rate",
            blocks: [
                { id: "intro", type: "heading", text: "How was onboarding?" },
                {
                    id: "score",
                    type: "rating",
                    variant: "scale",
                    max: 5,
                    label: "Rate the form",
                    required: true,
                },
            ],
            rules: [
                {
                    blockId: "score",
                    operator: "lessThan",
                    value: 3,
                    goTo: "why",
                },
            ],
        },
        {
            id: "designs",
            blocks: [
                {
                    id: "pick",
                    type: "abChoice",
                    label: "Which layout do you prefer?",
                    required: true,
                    askReason: true,
                    options: [
                        {
                            id: "a",
                            label: "Design A",
                            imageSrc: "https://example.com/a.png",
                            imageAlt: "Two-column layout",
                        },
                        {
                            id: "b",
                            label: "Design B",
                            url: "https://example.com/prototype-b",
                        },
                    ],
                },
            ],
            rules: [{ blockId: "pick", operator: "answered", goTo: "end" }],
        },
        {
            id: "why",
            blocks: [
                {
                    id: "comment",
                    type: "textInput",
                    label: "What went wrong?",
                    multiline: true,
                    maxLength: 500,
                },
            ],
        },
    ],
};

export const experiment: Experiment = {
    id: 1,
    name: "Onboarding layout",
    paths: ["/en/account/team/*/datasets/create"],
    trigger: { on: "load", frequency: "untilAnswered" },
    definition: preferenceDefinition,
    variant: null,
};
