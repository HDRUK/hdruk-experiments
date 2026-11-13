import { FocusEvent, ReactNode, useId, useState } from "react";
import OpenInNew from "@mui/icons-material/OpenInNew";
import SentimentDissatisfied from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfied from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAlt from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentVeryDissatisfied from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentVerySatisfied from "@mui/icons-material/SentimentVerySatisfied";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
} from "@mui/material";
import isFocusVisible from "@mui/utils/isFocusVisible";
import {
    ExperimentAbOption,
    ExperimentAbOptionLabel,
    ExperimentAbOptions,
    ExperimentAbOptionTitle,
    ExperimentFacePoint,
    ExperimentFaces,
    ExperimentHiddenInput,
    ExperimentImage,
    ExperimentQuestionBody,
    ExperimentRatingControl,
    ExperimentStars,
    ExperimentReason,
    ExperimentScale,
    ExperimentScaleLabels,
    ExperimentScalePoint,
    ExperimentTextQuestion,
} from "../../Experiment.styles";
import { formatText } from "../../consts";
import {
    AbChoiceBlock,
    ChoiceBlock,
    QuestionBlock,
    RatingBlock,
    TextInputBlock,
} from "../../types";
import { isAbChoiceAnswer } from "../../utils/answers";
import { isWebUrl } from "../../utils/isWebUrl";
import { BlockProps } from "./types";

const FACES = [
    SentimentVeryDissatisfied,
    SentimentDissatisfied,
    SentimentSatisfied,
    SentimentSatisfiedAlt,
    SentimentVerySatisfied,
];

interface QuestionFieldsetProps {
    block: QuestionBlock;
    error?: string;
    children: ReactNode;
}

const QuestionFieldset = ({
    block,
    error,
    children,
}: QuestionFieldsetProps) => (
    <FormControl component="fieldset" error={!!error} required={block.required}>
        <FormLabel component="legend">{block.label}</FormLabel>
        <ExperimentQuestionBody>
            {children}
            {(error || block.helperText) && (
                <FormHelperText>{error || block.helperText}</FormHelperText>
            )}
        </ExperimentQuestionBody>
    </FormControl>
);

export const RatingQuestion = ({
    block,
    value,
    onChange,
    error,
    localeText,
}: BlockProps<RatingBlock>) => {
    const current = typeof value === "number" ? value : null;
    const [focusedPoint, setFocusedPoint] = useState<number | null>(null);
    const focusHandlers = (point: number) => ({
        onFocus: (event: FocusEvent<HTMLInputElement>) =>
            setFocusedPoint(isFocusVisible(event.currentTarget) ? point : null),
        onBlur: () => setFocusedPoint(null),
    });
    const getLabelText = (rating: number) =>
        formatText(localeText.ratingValue, { value: rating, max: block.max });

    const scaleLabels = (block.minLabel || block.maxLabel) && (
        <ExperimentScaleLabels aria-hidden>
            <span>{block.minLabel}</span>
            <span>{block.maxLabel}</span>
        </ExperimentScaleLabels>
    );

    if (block.variant === "scale") {
        return (
            <QuestionFieldset block={block} error={error}>
                <ExperimentScale>
                    {Array.from({ length: block.max }, (_, index) => {
                        const point = index + 1;
                        return (
                            <ExperimentScalePoint
                                key={point}
                                ownerState={{
                                    selected: point === current,
                                    focusVisible: point === focusedPoint,
                                }}>
                                <ExperimentHiddenInput
                                    type="radio"
                                    name={block.id}
                                    value={point}
                                    checked={point === current}
                                    aria-label={getLabelText(point)}
                                    onChange={() => onChange(point)}
                                    {...focusHandlers(point)}
                                />
                                <span aria-hidden>{point}</span>
                            </ExperimentScalePoint>
                        );
                    })}
                </ExperimentScale>
                {scaleLabels}
            </QuestionFieldset>
        );
    }

    if (block.variant === "faces") {
        return (
            <QuestionFieldset block={block} error={error}>
                <ExperimentRatingControl>
                    <ExperimentFaces>
                        {FACES.map((Icon, index) => {
                            const point = index + 1;
                            return (
                                <ExperimentFacePoint
                                    key={point}
                                    ownerState={{
                                        selected: point === current,
                                        focusVisible: point === focusedPoint,
                                    }}>
                                    <ExperimentHiddenInput
                                        type="radio"
                                        name={block.id}
                                        value={point}
                                        checked={point === current}
                                        aria-label={formatText(
                                            localeText.ratingValue,
                                            { value: point, max: FACES.length }
                                        )}
                                        onChange={() => onChange(point)}
                                        {...focusHandlers(point)}
                                    />
                                    <Icon fontSize="large" />
                                </ExperimentFacePoint>
                            );
                        })}
                    </ExperimentFaces>
                    {scaleLabels}
                </ExperimentRatingControl>
            </QuestionFieldset>
        );
    }

    return (
        <QuestionFieldset block={block} error={error}>
            <ExperimentRatingControl>
                <ExperimentStars
                    name={block.id}
                    value={current}
                    max={block.max}
                    getLabelText={getLabelText}
                    icon={<Star fontSize="large" />}
                    emptyIcon={<StarBorder fontSize="large" />}
                    onChange={(_, selected) => {
                        if (selected !== null) {
                            onChange(selected);
                        }
                    }}
                />
                {scaleLabels}
            </ExperimentRatingControl>
        </QuestionFieldset>
    );
};

export const ChoiceQuestion = ({
    block,
    value,
    onChange,
    error,
}: BlockProps<ChoiceBlock>) => {
    if (block.multiple) {
        const selected = Array.isArray(value) ? value : [];
        const toggle = (optionId: string, checked: boolean) =>
            onChange(
                checked
                    ? [...selected, optionId]
                    : selected.filter(id => id !== optionId)
            );

        return (
            <QuestionFieldset block={block} error={error}>
                <FormGroup>
                    {block.options.map(option => (
                        <FormControlLabel
                            key={option.id}
                            control={
                                <Checkbox
                                    name={block.id}
                                    checked={selected.includes(option.id)}
                                    onChange={(_, checked) =>
                                        toggle(option.id, checked)
                                    }
                                />
                            }
                            label={option.label}
                        />
                    ))}
                </FormGroup>
            </QuestionFieldset>
        );
    }

    return (
        <QuestionFieldset block={block} error={error}>
            <RadioGroup
                name={block.id}
                value={typeof value === "string" ? value : ""}
                onChange={(_, selected) => onChange(selected)}>
                {block.options.map(option => (
                    <FormControlLabel
                        key={option.id}
                        value={option.id}
                        control={<Radio />}
                        label={option.label}
                    />
                ))}
            </RadioGroup>
        </QuestionFieldset>
    );
};

export const TextInputQuestion = ({
    block,
    value,
    onChange,
    error,
    localeText,
}: BlockProps<TextInputBlock>) => {
    const id = useId();
    const text = typeof value === "string" ? value : "";
    const count =
        block.maxLength &&
        formatText(localeText.characterCount, {
            count: text.length,
            max: block.maxLength,
        });

    return (
        <ExperimentTextQuestion>
            <FormLabel htmlFor={id} required={block.required} error={!!error}>
                {block.label}
            </FormLabel>
            <TextField
                id={id}
                name={block.id}
                required={block.required}
                value={text}
                placeholder={block.placeholder}
                multiline={block.multiline}
                minRows={block.multiline ? 3 : undefined}
                error={!!error}
                helperText={error || block.helperText || count}
                onChange={event => onChange(event.target.value)}
                slotProps={{ htmlInput: { maxLength: block.maxLength } }}
                fullWidth
            />
        </ExperimentTextQuestion>
    );
};

export const AbChoiceQuestion = ({
    block,
    value,
    onChange,
    error,
    localeText,
}: BlockProps<AbChoiceBlock>) => {
    const labelId = useId();
    const answer = isAbChoiceAnswer(value) ? value : undefined;
    const optionId = answer ? answer.optionId : "";
    const [focusedOption, setFocusedOption] = useState<string | null>(null);

    return (
        <QuestionFieldset block={block} error={error}>
            <ExperimentAbOptions
                name={block.id}
                value={optionId}
                onChange={(_, selected) =>
                    onChange(
                        answer && answer.reason
                            ? { optionId: selected, reason: answer.reason }
                            : { optionId: selected }
                    )
                }>
                {block.options.map(option => (
                    <ExperimentAbOption
                        key={option.id}
                        ownerState={{
                            selected: option.id === optionId,
                            focusVisible: option.id === focusedOption,
                        }}>
                        <ExperimentAbOptionLabel>
                            {option.imageSrc && (
                                <ExperimentImage
                                    src={option.imageSrc}
                                    alt={option.imageAlt || ""}
                                />
                            )}
                            <ExperimentAbOptionTitle>
                                <Radio
                                    value={option.id}
                                    slotProps={{
                                        input: {
                                            "aria-labelledby": `${labelId}-${option.id}`,
                                            onFocus: event =>
                                                setFocusedOption(
                                                    isFocusVisible(
                                                        event.currentTarget
                                                    )
                                                        ? option.id
                                                        : null
                                                ),
                                            onBlur: () =>
                                                setFocusedOption(null),
                                        },
                                    }}
                                />
                                <span id={`${labelId}-${option.id}`}>
                                    {option.label}
                                </span>
                            </ExperimentAbOptionTitle>
                        </ExperimentAbOptionLabel>
                        {option.url && isWebUrl(option.url) && (
                            <Button
                                href={option.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="text"
                                size="small"
                                startIcon={<OpenInNew />}>
                                {localeText.openPrototype}
                            </Button>
                        )}
                    </ExperimentAbOption>
                ))}
            </ExperimentAbOptions>
            {block.askReason && optionId && (
                <ExperimentReason>
                    <FormLabel htmlFor={`${labelId}-reason`} required={false}>
                        {block.reasonLabel || localeText.reasonLabel}
                    </FormLabel>
                    <TextField
                        id={`${labelId}-reason`}
                        name={`${block.id}-reason`}
                        value={(answer && answer.reason) || ""}
                        onChange={event =>
                            onChange({ optionId, reason: event.target.value })
                        }
                        multiline
                        minRows={2}
                        fullWidth
                    />
                </ExperimentReason>
            )}
        </QuestionFieldset>
    );
};
