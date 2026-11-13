import { Experiment } from "../types";

export type SeenStatus = "seen" | "dismissed" | "answered";

const NAME = "hdruk-experiments";

const readAll = () => {
    const prefix = `${NAME}=`;
    const match = document.cookie
        .split("; ")
        .find(cookie => cookie.startsWith(prefix));

    return new Map(
        (match ? match.slice(prefix.length).split("|") : [])
            .map(entry => entry.split(":"))
            .filter(([id, status]) => id && status)
            .map(([id, status]) => [id, status as SeenStatus])
    );
};

const expiry = (experiments: Experiment[]) => {
    const yearAway = new Date();
    yearAway.setUTCFullYear(yearAway.getUTCFullYear() + 1);

    if (experiments.some(experiment => !experiment.endsAt)) {
        return yearAway;
    }

    const lastEnd = experiments
        .map(experiment => experiment.endsAt as string)
        .sort()
        .pop();
    const afterEnd = new Date(`${lastEnd}T00:00:00Z`);
    afterEnd.setUTCDate(afterEnd.getUTCDate() + 1);

    return afterEnd < yearAway ? afterEnd : yearAway;
};

export const readStatus = (experiment: Experiment): SeenStatus | null =>
    readAll().get(String(experiment.id)) || null;

export const writeStatus = (
    experiments: Experiment[],
    experiment: Experiment,
    status: SeenStatus
) => {
    const statuses = readAll();
    statuses.set(String(experiment.id), status);

    const running = experiments.filter(candidate =>
        statuses.has(String(candidate.id))
    );
    const value = [...statuses].map(([id, seen]) => `${id}:${seen}`).join("|");
    const secure = window.location.protocol === "https:" ? "; secure" : "";

    document.cookie = `${NAME}=${value}; expires=${expiry(
        running
    ).toUTCString()}; path=/; samesite=lax${secure}`;
};

export const isDue = (experiment: Experiment) => {
    const status = readStatus(experiment);

    switch (experiment.trigger.frequency) {
        case "once":
            return status === null;
        case "untilAnswered":
            return status !== "answered" && status !== "dismissed";
        default:
            return true;
    }
};
