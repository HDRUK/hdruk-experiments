import {
    AbChoiceAnswer,
    AnswerValue,
    Block,
    QuestionBlock,
    Step,
} from "../types";

const QUESTION_TYPES = ["rating", "choice", "textInput", "abChoice"];

export const isQuestionBlock = (block: Block): block is QuestionBlock =>
    QUESTION_TYPES.includes(block.type);

export const isAbChoiceAnswer = (
    value: AnswerValue | undefined
): value is AbChoiceAnswer =>
    typeof value === "object" && value !== null && !Array.isArray(value);

export const isAnswered = (value: AnswerValue | undefined) => {
    if (value === undefined || value === null) {
        return false;
    }
    if (typeof value === "string") {
        return value.trim() !== "";
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    if (isAbChoiceAnswer(value)) {
        return value.optionId !== "";
    }
    return true;
};

export const missingRequired = (
    step: Step,
    answers: Record<string, AnswerValue>
) =>
    step.blocks
        .filter(isQuestionBlock)
        .filter(block => block.required && !isAnswered(answers[block.id]))
        .map(block => block.id);

export const hasFreeText = (
    blocks: Block[],
    answers: Record<string, AnswerValue>
) =>
    blocks.some(block => {
        const value = answers[block.id];
        if (block.type === "textInput") {
            return isAnswered(value);
        }
        if (block.type === "abChoice" && isAbChoiceAnswer(value)) {
            return !!value.reason && value.reason.trim() !== "";
        }
        return false;
    });
