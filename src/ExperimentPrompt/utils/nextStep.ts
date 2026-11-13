import {
    AnswerValue,
    Answers,
    BranchRule,
    END_STEP,
    ExperimentDefinition,
} from "../types";
import { isAbChoiceAnswer, isAnswered } from "./answers";

const comparable = (value: AnswerValue | undefined) =>
    isAbChoiceAnswer(value) ? value.optionId : value;

const ruleMatches = (rule: BranchRule, answers: Answers) => {
    const value = comparable(answers[rule.blockId]);

    switch (rule.operator) {
        case "answered":
            return isAnswered(answers[rule.blockId]);
        case "equals":
            return value !== undefined && String(value) === String(rule.value);
        case "notEquals":
            return value !== undefined && String(value) !== String(rule.value);
        case "lessThan":
            return typeof value === "number" && value < Number(rule.value);
        case "greaterThan":
            return typeof value === "number" && value > Number(rule.value);
        case "includes":
            return Array.isArray(value) && value.includes(String(rule.value));
        default:
            return false;
    }
};

export const nextStep = (
    definition: ExperimentDefinition,
    currentStepId: string,
    answers: Answers
): string | null => {
    const index = definition.steps.findIndex(step => step.id === currentStepId);
    if (index === -1) {
        return null;
    }

    const match = (definition.steps[index].rules || []).find(rule =>
        ruleMatches(rule, answers)
    );

    if (match) {
        if (match.goTo === END_STEP) {
            return null;
        }
        const exists = definition.steps.some(step => step.id === match.goTo);
        return exists ? match.goTo : null;
    }

    const following = definition.steps[index + 1];
    return following ? following.id : null;
};
