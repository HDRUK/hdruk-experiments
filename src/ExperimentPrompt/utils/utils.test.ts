import { preferenceDefinition } from "../../test/fixtures";
import { ExperimentDefinition } from "../types";
import { hasFreeText, missingRequired } from "./answers";
import { matchPath } from "./matchPath";
import { nextStep } from "./nextStep";
import { richTextDoc } from "./richText";
import { validateDefinition } from "./validateDefinition";

const messages = (definition: ExperimentDefinition) =>
    validateDefinition(definition).map(error => error.message);

describe("matchPath", () => {
    it.each([
        [
            "/en/account/team/*/datasets/create",
            "/en/account/team/12/datasets/create",
            true,
        ],
        [
            "/en/account/team/*/datasets/create",
            "/en/account/team/12/datasets/create/",
            true,
        ],
        [
            "/en/account/team/*/datasets/create",
            "/en/account/team/12/datasets/create?step=2",
            true,
        ],
        [
            "/en/account/team/*/datasets/create",
            "/en/account/team/12/34/datasets/create",
            false,
        ],
        ["/en/dataset/**", "/en/dataset", true],
        ["/en/dataset/**", "/en/dataset/1/section", true],
        ["/en/dataset/**", "/en/datasets", false],
        ["/**", "/en/anything", true],
        ["/en/search", "/en/search-admin", false],
    ])("%s vs %s → %s", (pattern, pathname, expected) => {
        expect(matchPath([pattern], pathname)).toBe(expected);
    });

    it("matches nothing without patterns", () => {
        expect(matchPath([], "/en")).toBe(false);
    });
});

describe("nextStep", () => {
    it("follows a matching rule", () => {
        expect(nextStep(preferenceDefinition, "rate", { score: 2 })).toBe(
            "why"
        );
    });

    it("falls through to the next step", () => {
        expect(nextStep(preferenceDefinition, "rate", { score: 4 })).toBe(
            "designs"
        );
    });

    it("ends on an end rule", () => {
        expect(
            nextStep(preferenceDefinition, "designs", {
                pick: { optionId: "b" },
            })
        ).toBeNull();
    });

    it("ends after the last step", () => {
        expect(nextStep(preferenceDefinition, "why", {})).toBeNull();
    });
});

describe("answers", () => {
    it("lists missing required questions", () => {
        expect(missingRequired(preferenceDefinition.steps[0], {})).toEqual([
            "score",
        ]);
        expect(
            missingRequired(preferenceDefinition.steps[0], { score: 1 })
        ).toEqual([]);
    });

    it("detects free text", () => {
        const blocks = preferenceDefinition.steps.flatMap(step => step.blocks);
        expect(hasFreeText(blocks, { score: 5 })).toBe(false);
        expect(
            hasFreeText(blocks, { pick: { optionId: "a", reason: "Clearer" } })
        ).toBe(true);
        expect(hasFreeText(blocks, { comment: "Too long" })).toBe(true);
    });
});

describe("validateDefinition", () => {
    it("accepts a valid definition", () => {
        expect(validateDefinition(preferenceDefinition)).toEqual([]);
    });

    it("reports broken definitions", () => {
        const errors = validateDefinition({
            steps: [
                {
                    id: "one",
                    blocks: [
                        {
                            id: "pick",
                            type: "abChoice",
                            label: "",
                            options: [
                                { id: "a", label: "A" },
                                { id: "b", label: "B", url: "https://x.test" },
                            ],
                        },
                    ],
                    rules: [
                        {
                            blockId: "other",
                            operator: "answered",
                            goTo: "nowhere",
                        },
                    ],
                },
            ],
        });

        expect(errors.map(error => error.message)).toEqual([
            "Add a question",
            "Each design needs an image or a URL",
            "Rule must use a question on this step",
            "Rule goes to a missing step",
        ]);
    });

    it("reports cleared text instead of throwing", () => {
        expect(
            messages({
                steps: [
                    {
                        id: "one",
                        blocks: [
                            {
                                id: "note",
                                type: "textInput",
                                label: undefined as unknown as string,
                            },
                            {
                                id: "picture",
                                type: "image",
                                src: "https://example.com/a.png",
                                alt: undefined as unknown as string,
                            },
                        ],
                    },
                ],
            })
        ).toEqual(["Add a question", "Add alt text"]);
    });

    it("reports a rating whose points were cleared", () => {
        expect(
            messages({
                steps: [
                    {
                        id: "one",
                        blocks: [
                            {
                                id: "score",
                                type: "rating",
                                variant: "scale",
                                label: "Rate it",
                                max: undefined as unknown as number,
                            },
                        ],
                    },
                ],
            })
        ).toEqual(["Rating needs at least two points"]);
    });

    it("only accepts http and https prototype links", () => {
        expect(
            messages({
                steps: [
                    {
                        id: "one",
                        blocks: [
                            {
                                id: "pick",
                                type: "abChoice",
                                label: "Which?",
                                options: [
                                    {
                                        id: "a",
                                        label: "A",
                                        url: "javascript:alert(1)",
                                    },
                                    {
                                        id: "b",
                                        label: "B",
                                        url: "https://example.com/b",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            })
        ).toEqual(["Links must start with https:// or http://"]);
    });

    it("reports rules with no value, a removed option or the wrong condition", () => {
        expect(
            messages({
                steps: [
                    {
                        id: "one",
                        blocks: [
                            {
                                id: "colour",
                                type: "choice",
                                label: "Colour?",
                                options: [
                                    { id: "red", label: "Red" },
                                    { id: "blue", label: "Blue" },
                                ],
                            },
                            {
                                id: "score",
                                type: "rating",
                                variant: "scale",
                                label: "Rate it",
                                max: 5,
                            },
                        ],
                        rules: [
                            {
                                blockId: "colour",
                                operator: "notEquals",
                                goTo: "end",
                            },
                            {
                                blockId: "colour",
                                operator: "equals",
                                value: "green",
                                goTo: "end",
                            },
                            {
                                blockId: "colour",
                                operator: "includes",
                                value: "red",
                                goTo: "end",
                            },
                            {
                                blockId: "score",
                                operator: "lessThan",
                                goTo: "end",
                            },
                        ],
                    },
                ],
            })
        ).toEqual([
            "Choose a value for this rule",
            "Choose a value for this rule",
            "This condition does not fit the question",
            "Choose a value for this rule",
        ]);
    });

    it("reports rules that go back to an earlier step", () => {
        expect(
            messages({
                steps: [
                    {
                        id: "one",
                        blocks: [
                            { id: "first", type: "textInput", label: "First?" },
                        ],
                    },
                    {
                        id: "two",
                        blocks: [
                            {
                                id: "second",
                                type: "textInput",
                                label: "Second?",
                            },
                        ],
                        rules: [
                            {
                                blockId: "second",
                                operator: "answered",
                                goTo: "one",
                            },
                        ],
                    },
                ],
            })
        ).toEqual(["Rule must go to a later step"]);
    });
});

describe("richTextDoc", () => {
    it("keeps a stored document", () => {
        const doc = { type: "doc", content: [{ type: "paragraph" }] };
        expect(richTextDoc(JSON.stringify(doc))).toEqual(doc);
    });

    it.each(["5", "null", "true", '"hi"', "[1]", "Plain words"])(
        "treats %s as plain text",
        content => {
            expect(richTextDoc(content)).toEqual({
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [{ type: "text", text: content }],
                    },
                ],
            });
        }
    );
});
