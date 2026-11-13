import { preferenceDefinition } from "../test/fixtures";
import { act, fireEvent, render, screen } from "../test/testUtils";
import ExperimentForm from "./ExperimentForm";
import { ExperimentDefinition } from "./types";

const singleStep: ExperimentDefinition = {
    steps: [
        {
            id: "only",
            blocks: [
                { id: "note", type: "textInput", label: "Anything else?" },
            ],
        },
    ],
};

describe("ExperimentForm", () => {
    it("blocks a step until required questions are answered", async () => {
        const onSubmit = vi.fn();
        const { user } = render(
            <ExperimentForm
                definition={preferenceDefinition}
                onSubmit={onSubmit}
            />
        );

        await user.click(screen.getByRole("button", { name: "Next" }));

        expect(
            screen.getByText("This question needs an answer")
        ).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("follows the preference path and submits only visited answers", async () => {
        const onSubmit = vi.fn();
        const { user } = render(
            <ExperimentForm
                definition={preferenceDefinition}
                onSubmit={onSubmit}
            />
        );

        await user.click(screen.getByRole("radio", { name: "4 of 5" }));
        await user.click(screen.getByRole("button", { name: "Next" }));
        await user.click(screen.getByRole("radio", { name: "Design B" }));
        await user.type(
            screen.getByRole("textbox", { name: "Tell us why (optional)" }),
            "Clearer"
        );
        await user.click(screen.getByRole("button", { name: "Submit" }));

        expect(onSubmit).toHaveBeenCalledWith(
            expect.anything(),
            { score: 4, pick: { optionId: "b", reason: "Clearer" } },
            { stepIds: ["rate", "designs"], contactEmail: null }
        );
        expect(screen.getByRole("status")).toHaveTextContent(
            "Thank you for your feedback"
        );
    });

    it("branches and drops answers from abandoned steps", async () => {
        const onSubmit = vi.fn();
        const { user } = render(
            <ExperimentForm
                definition={preferenceDefinition}
                onSubmit={onSubmit}
            />
        );

        await user.click(screen.getByRole("radio", { name: "4 of 5" }));
        await user.click(screen.getByRole("button", { name: "Next" }));
        await user.click(screen.getByRole("radio", { name: "Design A" }));
        await user.click(screen.getByRole("button", { name: "Back" }));
        await user.click(screen.getByRole("radio", { name: "1 of 5" }));
        await user.click(screen.getByRole("button", { name: "Next" }));
        await user.type(
            screen.getByRole("textbox", { name: "What went wrong?" }),
            "Slow"
        );
        await user.click(screen.getByRole("button", { name: "Submit" }));

        expect(onSubmit).toHaveBeenCalledWith(
            expect.anything(),
            { score: 1, comment: "Slow" },
            { stepIds: ["rate", "why"], contactEmail: null }
        );
    });

    it("sends once when submit is pressed twice", () => {
        const onSubmit = vi.fn(() => new Promise<void>(() => undefined));
        render(<ExperimentForm definition={singleStep} onSubmit={onSubmit} />);
        const submit = screen.getByRole("button", { name: "Submit" });

        act(() => {
            fireEvent.click(submit);
            fireEvent.click(submit);
        });

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(submit).toBeDisabled();
    });

    it("keeps the answers when submitting fails", async () => {
        const onSubmit = vi.fn().mockRejectedValue(new Error("offline"));
        const { user } = render(
            <ExperimentForm
                definition={{ steps: [preferenceDefinition.steps[2]] }}
                onSubmit={onSubmit}
            />
        );

        await user.type(screen.getByRole("textbox"), "Slow");
        await user.click(screen.getByRole("button", { name: "Submit" }));

        expect(
            screen.getByText(
                "Your answers could not be sent. Please try again."
            )
        ).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toHaveValue("Slow");
    });

    it("asks a signed-out person for an email when they opt in to contact", async () => {
        const onSubmit = vi.fn();
        const { user } = render(
            <ExperimentForm
                definition={singleStep}
                onSubmit={onSubmit}
                allowContact
            />
        );

        expect(
            screen.queryByRole("textbox", { name: "Email address" })
        ).not.toBeInTheDocument();

        await user.click(
            screen.getByRole("checkbox", { name: "Yes, contact me" })
        );
        await user.type(
            screen.getByRole("textbox", { name: "Email address" }),
            "not-an-email"
        );
        await user.click(screen.getByRole("button", { name: "Submit" }));

        expect(onSubmit).not.toHaveBeenCalled();
        expect(
            screen.getByText("Enter a valid email address")
        ).toBeInTheDocument();

        await user.clear(
            screen.getByRole("textbox", { name: "Email address" })
        );
        await user.type(
            screen.getByRole("textbox", { name: "Email address" }),
            "user@example.com"
        );
        await user.click(screen.getByRole("button", { name: "Submit" }));

        expect(onSubmit).toHaveBeenCalledWith(
            expect.anything(),
            {},
            { stepIds: ["only"], contactEmail: "user@example.com" }
        );
        expect(
            await screen.findByText("We may be in touch about your feedback.")
        ).toBeInTheDocument();
    });

    it("opts a signed-in person in with their account email", async () => {
        const onSubmit = vi.fn();
        const { user } = render(
            <ExperimentForm
                definition={singleStep}
                onSubmit={onSubmit}
                allowContact
                contactEmail="user@example.com"
            />
        );

        await user.click(
            screen.getByRole("checkbox", { name: "Yes, contact me" })
        );

        expect(
            screen.queryByRole("textbox", { name: "Email address" })
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Submit" }));

        expect(onSubmit).toHaveBeenCalledWith(
            expect.anything(),
            {},
            { stepIds: ["only"], contactEmail: "user@example.com" }
        );
    });

    it("only asks about contact on the last step", () => {
        render(
            <ExperimentForm
                definition={preferenceDefinition}
                onSubmit={vi.fn()}
                allowContact
            />
        );

        expect(
            screen.queryByRole("checkbox", { name: "Yes, contact me" })
        ).not.toBeInTheDocument();
    });

    it("only links prototypes over http or https", () => {
        render(
            <ExperimentForm
                definition={{
                    steps: [
                        {
                            id: "only",
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
                }}
                onSubmit={vi.fn()}
            />
        );

        expect(
            screen.getAllByRole("link", { name: "Open design in a new tab" })
        ).toHaveLength(1);
    });
});
