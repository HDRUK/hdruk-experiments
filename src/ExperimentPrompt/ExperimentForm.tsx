import {
    ComponentType,
    MouseEvent,
    SyntheticEvent,
    useMemo,
    useRef,
    useState,
} from "react";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import { Alert, Button } from "@mui/material";
import {
    ExperimentActions,
    ExperimentFormRoot,
    ExperimentStepTitle,
    ExperimentThankYou,
    ExperimentThankYouBody,
    ExperimentThankYouTitle,
} from "./Experiment.styles";
import ContactOptIn, {
    ContactOptInValue,
    EMAIL,
} from "./components/ContactOptIn";
import RichTextContent from "./components/blocks/RichTextContent";
import { defaultBlocks } from "./components/blocks/defaultBlocks";
import { BlockComponents, BlockProps } from "./components/blocks/types";
import { DEFAULT_LOCALE_TEXT, ExperimentsLocaleText } from "./consts";
import { AnswerValue, Answers, Block, ExperimentDefinition } from "./types";
import { isQuestionBlock, missingRequired } from "./utils/answers";
import { nextStep } from "./utils/nextStep";

export interface ExperimentFormProps {
    definition: ExperimentDefinition;
    onSubmit: (
        event: SyntheticEvent,
        answers: Answers,
        details: { stepIds: string[]; contactEmail: string | null }
    ) => void | Promise<void>;
    localeText?: Partial<ExperimentsLocaleText>;
    slots?: { blocks?: Partial<BlockComponents> };
    onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
    component?: "form" | "div";
    allowContact?: boolean;
    contactEmail?: string | null;
}

const visitedAnswers = (
    definition: ExperimentDefinition,
    stepIds: string[],
    answers: Answers
) =>
    definition.steps
        .filter(step => stepIds.includes(step.id))
        .flatMap(step => step.blocks)
        .filter(isQuestionBlock)
        .reduce<Answers>((visited, block) => {
            if (answers[block.id] !== undefined) {
                visited[block.id] = answers[block.id];
            }
            return visited;
        }, {});

const ExperimentForm = ({
    definition,
    onSubmit,
    localeText,
    slots,
    onClose,
    component = "form",
    allowContact,
    contactEmail,
}: ExperimentFormProps) => {
    const text = useMemo(
        () => ({ ...DEFAULT_LOCALE_TEXT, ...localeText }),
        [localeText]
    );
    const blocks = useMemo(
        () => ({ ...defaultBlocks, ...(slots && slots.blocks) }),
        [slots]
    );

    const [history, setHistory] = useState<string[]>([]);
    const [stepId, setStepId] = useState(() =>
        definition.steps.length ? definition.steps[0].id : ""
    );
    const [answers, setAnswers] = useState<Answers>({});
    const [showErrors, setShowErrors] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const sending = useRef(false);
    const [submitError, setSubmitError] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [contact, setContact] = useState<ContactOptInValue>({
        agreed: false,
        email: "",
    });
    const [contactError, setContactError] = useState(false);

    const step =
        definition.steps.find(candidate => candidate.id === stepId) ||
        definition.steps[0];

    if (!step) {
        return null;
    }

    const missing = missingRequired(step, answers);
    const upcoming = nextStep(definition, step.id, answers);

    const handleChange = (blockId: string) => (value: AnswerValue) =>
        setAnswers(current => ({ ...current, [blockId]: value }));

    const handleBack = () => {
        setShowErrors(false);
        setStepId(history[history.length - 1]);
        setHistory(history.slice(0, -1));
    };

    const handleSubmit = async (event: SyntheticEvent) => {
        event.preventDefault();

        if (sending.current) {
            return;
        }

        if (missing.length) {
            setShowErrors(true);
            return;
        }

        setShowErrors(false);

        if (upcoming) {
            setHistory([...history, step.id]);
            setStepId(upcoming);
            return;
        }

        const optedInEmail = contactEmail || contact.email.trim();
        const sendContact = allowContact && contact.agreed;

        if (sendContact && !EMAIL.test(optedInEmail)) {
            setContactError(true);
            return;
        }

        setContactError(false);
        const stepIds = [...history, step.id];
        sending.current = true;
        setSubmitting(true);
        setSubmitError(false);

        try {
            await onSubmit(
                event,
                visitedAnswers(definition, stepIds, answers),
                { stepIds, contactEmail: sendContact ? optedInEmail : null }
            );
            setSubmitted(true);
        } catch (_) {
            setSubmitError(true);
        } finally {
            sending.current = false;
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <ExperimentThankYou role="status">
                <CheckCircleOutline color="success" fontSize="large" />
                <ExperimentThankYouTitle>
                    {text.thankYou}
                </ExperimentThankYouTitle>
                {(definition.thankYou || (allowContact && contact.agreed)) && (
                    <ExperimentThankYouBody>
                        {definition.thankYou && (
                            <RichTextContent content={definition.thankYou} />
                        )}
                        {allowContact && contact.agreed && (
                            <p>{text.contactDone}</p>
                        )}
                    </ExperimentThankYouBody>
                )}
                {onClose && (
                    <Button variant="contained" onClick={onClose}>
                        {text.close}
                    </Button>
                )}
            </ExperimentThankYou>
        );
    }

    const renderBlock = (block: Block) => {
        const Component = blocks[block.type] as ComponentType<BlockProps>;
        return (
            <Component
                key={block.id}
                block={block}
                value={answers[block.id]}
                onChange={handleChange(block.id)}
                error={
                    showErrors && missing.includes(block.id)
                        ? text.required
                        : undefined
                }
                localeText={text}
            />
        );
    };

    return (
        <ExperimentFormRoot
            as={component}
            {...(component === "form"
                ? { noValidate: true, onSubmit: handleSubmit }
                : {})}>
            {step.title && (
                <ExperimentStepTitle>{step.title}</ExperimentStepTitle>
            )}
            {step.blocks.map(renderBlock)}
            {allowContact && !upcoming && (
                <ContactOptIn
                    value={contact}
                    onChange={setContact}
                    contactEmail={contactEmail}
                    error={contactError}
                    localeText={text}
                />
            )}
            {submitError && <Alert severity="error">{text.submitError}</Alert>}
            <ExperimentActions>
                {history.length > 0 && (
                    <Button variant="outlined" onClick={handleBack}>
                        {text.back}
                    </Button>
                )}
                <Button
                    variant="contained"
                    loading={submitting}
                    {...(component === "form"
                        ? { type: "submit" }
                        : { onClick: handleSubmit })}>
                    {upcoming ? text.next : text.submit}
                </Button>
            </ExperimentActions>
        </ExperimentFormRoot>
    );
};

export default ExperimentForm;
