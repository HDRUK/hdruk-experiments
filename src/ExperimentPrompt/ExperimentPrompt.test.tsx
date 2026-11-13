import { experiment } from "../test/fixtures";
import { act, fireEvent, render, screen } from "../test/testUtils";
import ExperimentPrompt from "./ExperimentPrompt";

const PATH = "/en/account/team/3/datasets/create";

describe("ExperimentPrompt", () => {
    beforeEach(() => {
        document.cookie.split(";").forEach(cookie => {
            document.cookie = `${cookie
                .split("=")[0]
                .trim()}=; max-age=0; path=/`;
        });
    });

    it("opens on a matching page and reports the impression", async () => {
        const onOpen = vi.fn();
        render(
            <ExperimentPrompt
                experiments={[experiment]}
                pathname={PATH}
                onOpen={onOpen}
                onSubmit={vi.fn()}
            />
        );

        expect(
            await screen.findByRole("dialog", { name: "Feedback" })
        ).toBeInTheDocument();
        expect(onOpen).toHaveBeenCalledWith(experiment);
    });

    it("stays closed elsewhere and while disabled", () => {
        const { rerender } = render(
            <ExperimentPrompt
                experiments={[experiment]}
                pathname="/en/search"
                onSubmit={vi.fn()}
            />
        );
        rerender(
            <ExperimentPrompt
                experiments={[experiment]}
                pathname={PATH}
                disabled
                onSubmit={vi.fn()}
            />
        );

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("waits for a delay trigger", () => {
        vi.useFakeTimers();
        render(
            <ExperimentPrompt
                experiments={[
                    {
                        ...experiment,
                        trigger: {
                            on: "delay",
                            delaySeconds: 5,
                            frequency: "once",
                        },
                    },
                ]}
                pathname={PATH}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        act(() => {
            vi.advanceTimersByTime(5000);
        });
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        vi.useRealTimers();
    });

    describe("exit intent", () => {
        const exitIntent = {
            ...experiment,
            trigger: { on: "exitIntent" as const, frequency: "once" as const },
        };

        const setHover = (hover: boolean) => {
            window.matchMedia = vi.fn().mockReturnValue({ matches: hover });
        };

        it("opens when the pointer leaves through the top of the page", () => {
            setHover(true);
            render(
                <ExperimentPrompt
                    experiments={[exitIntent]}
                    pathname={PATH}
                    onSubmit={vi.fn()}
                />
            );

            fireEvent.mouseOut(document, { clientY: 300, relatedTarget: null });
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

            fireEvent.mouseOut(document, { clientY: 0, relatedTarget: null });
            expect(screen.getByRole("dialog")).toBeInTheDocument();
        });

        it("never opens on touch devices", () => {
            setHover(false);
            render(
                <ExperimentPrompt
                    experiments={[exitIntent]}
                    pathname={PATH}
                    onSubmit={vi.fn()}
                />
            );

            fireEvent.mouseOut(document, { clientY: 0, relatedTarget: null });
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
    });

    it("reports a close and does not reopen a once prompt", async () => {
        const onClose = vi.fn();
        const once = {
            ...experiment,
            trigger: { on: "load" as const, frequency: "once" as const },
        };
        const { user, unmount } = render(
            <ExperimentPrompt
                experiments={[once]}
                pathname={PATH}
                onClose={onClose}
                onSubmit={vi.fn()}
            />
        );

        await user.click(await screen.findByRole("button", { name: "Close" }));

        expect(onClose).toHaveBeenCalledWith(expect.anything(), {
            experiment: once,
            reason: "closeButton",
            answered: false,
        });
        unmount();

        render(
            <ExperimentPrompt
                experiments={[once]}
                pathname={PATH}
                onSubmit={vi.fn()}
            />
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not reopen an untilAnswered prompt once closed", async () => {
        const { user, unmount } = render(
            <ExperimentPrompt
                experiments={[experiment]}
                pathname={PATH}
                onSubmit={vi.fn()}
            />
        );

        await user.click(await screen.findByRole("button", { name: "Close" }));
        unmount();

        render(
            <ExperimentPrompt
                experiments={[experiment]}
                pathname={PATH}
                onSubmit={vi.fn()}
            />
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("remembers a closed prompt in a cookie", async () => {
        const { user } = render(
            <ExperimentPrompt
                experiments={[experiment]}
                pathname={PATH}
                onSubmit={vi.fn()}
            />
        );

        await user.click(await screen.findByRole("button", { name: "Close" }));

        expect(document.cookie).toContain("hdruk-experiments=1:dismissed");
    });

    it("keeps every experiment in one cookie until the last one ends", async () => {
        const daysAway = (days: number) => {
            const date = new Date();
            date.setUTCDate(date.getUTCDate() + days);
            return date.toISOString().slice(0, 10);
        };
        const later = daysAway(20);
        const expires = new Date(`${later}T00:00:00Z`);
        expires.setUTCDate(expires.getUTCDate() + 1);
        const setCookie = vi.spyOn(document, "cookie", "set");
        const { user } = render(
            <ExperimentPrompt
                experiments={[
                    { ...experiment, endsAt: daysAway(10) },
                    { ...experiment, id: 2, endsAt: later },
                ]}
                pathname={PATH}
                onSubmit={vi.fn()}
            />
        );

        await user.click(await screen.findByRole("button", { name: "Close" }));
        await user.click(await screen.findByRole("button", { name: "Close" }));

        expect(document.cookie).toContain(
            "hdruk-experiments=1:dismissed|2:dismissed"
        );
        expect(setCookie).toHaveBeenLastCalledWith(
            expect.stringContaining(`expires=${expires.toUTCString()}`)
        );
        setCookie.mockRestore();
    });

    it("keeps earlier entries and expires with the current experiments", async () => {
        document.cookie = "hdruk-experiments=99:answered; path=/";
        const nextWeek = new Date();
        nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
        const expires = new Date(
            `${nextWeek.toISOString().slice(0, 10)}T00:00:00Z`
        );
        expires.setUTCDate(expires.getUTCDate() + 1);
        const setCookie = vi.spyOn(document, "cookie", "set");
        const { user } = render(
            <ExperimentPrompt
                experiments={[
                    {
                        ...experiment,
                        endsAt: nextWeek.toISOString().slice(0, 10),
                    },
                ]}
                pathname={PATH}
                onSubmit={vi.fn()}
            />
        );

        await user.click(await screen.findByRole("button", { name: "Close" }));

        expect(document.cookie).toBe(
            "hdruk-experiments=99:answered|1:dismissed"
        );
        expect(setCookie).toHaveBeenLastCalledWith(
            expect.stringContaining(`expires=${expires.toUTCString()}`)
        );
        setCookie.mockRestore();
    });

    it("submits with the page and variant", async () => {
        const onSubmit = vi.fn();
        const { user } = render(
            <ExperimentPrompt
                experiments={[{ ...experiment, variant: "B" }]}
                pathname={PATH}
                onSubmit={onSubmit}
            />
        );

        await user.click(await screen.findByRole("radio", { name: "5 of 5" }));
        await user.click(screen.getByRole("button", { name: "Next" }));
        await user.click(screen.getByRole("radio", { name: "Design A" }));
        await user.click(screen.getByRole("button", { name: "Submit" }));

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1 }),
            { score: 5, pick: { optionId: "a" } },
            {
                path: PATH,
                variant: "B",
                stepIds: ["rate", "designs"],
                contactEmail: null,
            }
        );
    });
});
