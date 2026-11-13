import { useState } from "react";
import { ExperimentDefinition } from "../ExperimentPrompt/types";
import { preferenceDefinition } from "../test/fixtures";
import { render, screen, within } from "../test/testUtils";
import ExperimentBuilder from "./ExperimentBuilder";
import { moveItem } from "./utils/factories";

const Harness = ({
    initial,
    onChange,
}: {
    initial: ExperimentDefinition;
    onChange: (value: ExperimentDefinition) => void;
}) => {
    const [value, setValue] = useState(initial);
    return (
        <ExperimentBuilder
            value={value}
            onChange={next => {
                setValue(next);
                onChange(next);
            }}
        />
    );
};

const lastValue = (onChange: ReturnType<typeof vi.fn>) =>
    onChange.mock.calls[
        onChange.mock.calls.length - 1
    ][0] as ExperimentDefinition;

describe("ExperimentBuilder", () => {
    it("adds a block and edits it with a live preview", async () => {
        const onChange = vi.fn();
        const { user } = render(
            <Harness
                initial={{ steps: [{ id: "one", blocks: [] }] }}
                onChange={onChange}
            />
        );

        await user.click(screen.getByRole("button", { name: "Add block" }));
        await user.click(screen.getByRole("menuitem", { name: "Text answer" }));
        await user.type(
            screen.getByRole("textbox", { name: "Question" }),
            "Anything else?"
        );

        expect(lastValue(onChange).steps[0].blocks).toEqual([
            expect.objectContaining({
                type: "textInput",
                label: "Anything else?",
            }),
        ]);
        const preview = screen.getByRole("region", { name: "Preview" });
        expect(
            within(preview).getByRole("textbox", { name: "Anything else?" })
        ).toBeInTheDocument();
    });

    it("deletes a block and the rules that use it", async () => {
        const onChange = vi.fn();
        const { user } = render(
            <Harness initial={preferenceDefinition} onChange={onChange} />
        );

        await user.click(
            screen.getByRole("button", { name: "Delete block: Rate the form" })
        );

        expect(lastValue(onChange).steps[0]).toEqual(
            expect.objectContaining({
                blocks: [expect.objectContaining({ id: "intro" })],
                rules: [],
            })
        );
    });

    it("adds a branching rule to a step", async () => {
        const onChange = vi.fn();
        const { user } = render(
            <Harness initial={preferenceDefinition} onChange={onChange} />
        );

        await user.click(screen.getByRole("button", { name: "Add rule" }));

        expect(lastValue(onChange).steps[0].rules).toEqual([
            expect.objectContaining({ blockId: "score", goTo: "why" }),
            { blockId: "score", operator: "answered", goTo: "designs" },
        ]);
    });

    it("only offers later steps as rule targets", async () => {
        const onChange = vi.fn();
        const { user } = render(
            <Harness initial={preferenceDefinition} onChange={onChange} />
        );

        await user.click(screen.getByRole("button", { name: "Step 2" }));
        await user.click(screen.getByRole("button", { name: "Add rule" }));

        expect(lastValue(onChange).steps[1].rules).toEqual([
            expect.objectContaining({ blockId: "pick", goTo: "end" }),
            { blockId: "pick", operator: "answered", goTo: "why" },
        ]);
    });

    it("keeps preview answers while a block is edited", async () => {
        const { user } = render(
            <Harness
                initial={{
                    steps: [
                        {
                            id: "one",
                            blocks: [
                                {
                                    id: "note",
                                    type: "textInput",
                                    label: "Note",
                                },
                            ],
                        },
                    ],
                }}
                onChange={vi.fn()}
            />
        );
        const preview = screen.getByRole("region", { name: "Preview" });

        await user.type(
            within(preview).getByRole("textbox", { name: "Note" }),
            "Draft"
        );
        await user.click(screen.getByRole("button", { name: /^Text answer/ }));
        await user.type(screen.getByRole("textbox", { name: "Question" }), "s");

        expect(
            within(preview).getByRole("textbox", { name: "Notes" })
        ).toHaveValue("Draft");
    });

    it("flags a step with no blocks until one is added", async () => {
        const { user } = render(
            <Harness
                initial={{ steps: [{ id: "one", blocks: [] }] }}
                onChange={vi.fn()}
            />
        );

        expect(
            screen.getByRole("img", { name: "Needs attention" })
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Add block" }));
        await user.click(screen.getByRole("menuitem", { name: "Heading" }));

        expect(
            screen.queryByRole("img", { name: "Needs attention" })
        ).not.toBeInTheDocument();
    });

    it("moves items", () => {
        expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
        expect(moveItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    });
});
