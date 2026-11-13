import {
    SyntheticEvent,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Dialog, DialogContent, DialogProps, IconButton } from "@mui/material";
import {
    ExperimentDialogClose,
    ExperimentDialogLabel,
} from "./Experiment.styles";
import ExperimentForm, { ExperimentFormProps } from "./ExperimentForm";
import { DEFAULT_LOCALE_TEXT, ExperimentsLocaleText } from "./consts";
import { Answers, Experiment, ExperimentResponseMeta } from "./types";
import { matchPath } from "./utils/matchPath";
import { isDue, writeStatus } from "./utils/seenState";

export type ExperimentCloseReason =
    | "backdropClick"
    | "escapeKeyDown"
    | "closeButton";

export interface ExperimentPromptProps {
    experiments: Experiment[];
    pathname: string;
    disabled?: boolean;
    onOpen?: (experiment: Experiment) => void;
    onClose?: (
        event: SyntheticEvent | {},
        details: {
            experiment: Experiment;
            reason: ExperimentCloseReason;
            answered: boolean;
        }
    ) => void;
    onSubmit: (
        experiment: Experiment,
        answers: Answers,
        meta: ExperimentResponseMeta
    ) => void | Promise<void>;
    allowContact?: boolean;
    contactEmail?: string | null;
    localeText?: Partial<ExperimentsLocaleText>;
    slots?: ExperimentFormProps["slots"];
    slotProps?: {
        dialog?: Omit<DialogProps, "open" | "onClose" | "children">;
    };
}

const ExperimentPrompt = ({
    experiments,
    pathname,
    disabled,
    onOpen,
    onClose,
    onSubmit,
    allowContact,
    contactEmail,
    localeText,
    slots,
    slotProps,
}: ExperimentPromptProps) => {
    const text = useMemo(
        () => ({ ...DEFAULT_LOCALE_TEXT, ...localeText }),
        [localeText]
    );
    const [current, setCurrent] = useState<Experiment | null>(null);
    const [answered, setAnswered] = useState(false);
    const labelId = useId();
    const [closedIds, setClosedIds] = useState<Experiment["id"][]>([]);
    const onOpenRef = useRef(onOpen);

    useEffect(() => {
        onOpenRef.current = onOpen;
    }, [onOpen]);

    const candidate = useMemo(
        () =>
            experiments.find(
                experiment =>
                    !closedIds.includes(experiment.id) &&
                    matchPath(experiment.paths, pathname) &&
                    isDue(experiment)
            ) || null,
        [experiments, pathname, closedIds]
    );

    useEffect(() => {
        if (disabled || current || !candidate) {
            return undefined;
        }

        const show = () => {
            writeStatus(experiments, candidate, "seen");
            setAnswered(false);
            setCurrent(candidate);
            if (onOpenRef.current) {
                onOpenRef.current(candidate);
            }
        };

        if (candidate.trigger.on === "exitIntent") {
            if (!window.matchMedia("(hover: hover)").matches) {
                return undefined;
            }

            const handleMouseOut = (event: MouseEvent) => {
                if (!event.relatedTarget && event.clientY <= 0) {
                    show();
                }
            };
            document.addEventListener("mouseout", handleMouseOut);

            return () =>
                document.removeEventListener("mouseout", handleMouseOut);
        }

        const delay =
            candidate.trigger.on === "delay"
                ? (candidate.trigger.delaySeconds || 0) * 1000
                : 0;
        const timer = window.setTimeout(show, delay);

        return () => window.clearTimeout(timer);
    }, [candidate, current, disabled, experiments]);

    useEffect(() => {
        if (current && !matchPath(current.paths, pathname)) {
            setCurrent(null);
        }
    }, [current, pathname]);

    if (!current) {
        return null;
    }

    const handleClose = (
        event: SyntheticEvent | {},
        reason: ExperimentCloseReason
    ) => {
        setClosedIds(ids => [...ids, current.id]);
        if (!answered) {
            writeStatus(experiments, current, "dismissed");
        }
        setCurrent(null);
        if (onClose) {
            onClose(event, { experiment: current, reason, answered });
        }
    };

    const handleSubmit: ExperimentFormProps["onSubmit"] = async (
        _,
        answers,
        { stepIds, contactEmail: optedInEmail }
    ) => {
        await onSubmit(current, answers, {
            path: pathname,
            variant: current.variant,
            stepIds,
            contactEmail: optedInEmail,
        });
        writeStatus(experiments, current, "answered");
        setAnswered(true);
    };

    const dialogProps = slotProps && slotProps.dialog;

    return (
        <Dialog
            maxWidth="sm"
            fullWidth
            {...dialogProps}
            aria-labelledby={labelId}
            open
            onClose={(event, reason) => handleClose(event, reason)}>
            <ExperimentDialogLabel id={labelId}>
                {text.dialogLabel}
            </ExperimentDialogLabel>
            <ExperimentDialogClose>
                <IconButton
                    aria-label={text.close}
                    onClick={event => handleClose(event, "closeButton")}>
                    <CloseIcon />
                </IconButton>
            </ExperimentDialogClose>
            <DialogContent>
                <ExperimentForm
                    key={current.id}
                    definition={current.definition}
                    onSubmit={handleSubmit}
                    allowContact={allowContact}
                    contactEmail={contactEmail}
                    localeText={localeText}
                    slots={slots}
                    onClose={event => handleClose(event, "closeButton")}
                />
            </DialogContent>
        </Dialog>
    );
};

export default ExperimentPrompt;
