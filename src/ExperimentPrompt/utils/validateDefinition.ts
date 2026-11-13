import {
    BranchRule,
    END_STEP,
    ExperimentDefinition,
    QuestionBlock,
} from "../types";
import { isQuestionBlock } from "./answers";
import { isWebUrl } from "./isWebUrl";
import { operatorsFor } from "./operatorsFor";

const hasRuleValue = (rule: BranchRule, block: QuestionBlock) => {
    if (rule.operator === "answered") {
        return true;
    }
    if (block.type === "choice" || block.type === "abChoice") {
        return block.options.some(option => option.id === rule.value);
    }
    return typeof rule.value === "number" && Number.isFinite(rule.value);
};

export interface DefinitionError {
    path: string;
    message: string;
}

export const validateDefinition = (
    definition: ExperimentDefinition
): DefinitionError[] => {
    const errors: DefinitionError[] = [];

    if (!definition.steps.length) {
        errors.push({ path: "steps", message: "Add at least one step" });
    }

    const stepIds = new Set<string>();
    const blockIds = new Set<string>();

    definition.steps.forEach((step, stepIndex) => {
        const stepPath = `steps.${stepIndex}`;

        if (stepIds.has(step.id)) {
            errors.push({ path: stepPath, message: "Duplicate step id" });
        }
        stepIds.add(step.id);

        if (!step.blocks.length) {
            errors.push({ path: stepPath, message: "Add at least one block" });
        }

        step.blocks.forEach((block, blockIndex) => {
            const blockPath = `${stepPath}.blocks.${blockIndex}`;

            if (blockIds.has(block.id)) {
                errors.push({ path: blockPath, message: "Duplicate block id" });
            }
            blockIds.add(block.id);

            if (isQuestionBlock(block) && !(block.label || "").trim()) {
                errors.push({ path: blockPath, message: "Add a question" });
            }

            if (block.type === "choice" && block.options.length < 2) {
                errors.push({
                    path: blockPath,
                    message: "Add at least two options",
                });
            }

            if (
                block.type === "abChoice" &&
                block.options.some(option => !option.imageSrc && !option.url)
            ) {
                errors.push({
                    path: blockPath,
                    message: "Each design needs an image or a URL",
                });
            }

            if (
                block.type === "abChoice" &&
                block.options.some(
                    option => option.url && !isWebUrl(option.url)
                )
            ) {
                errors.push({
                    path: blockPath,
                    message: "Links must start with https:// or http://",
                });
            }

            if (block.type === "image" && !(block.alt || "").trim()) {
                errors.push({ path: blockPath, message: "Add alt text" });
            }

            if (block.type === "rating" && !(block.max >= 2)) {
                errors.push({
                    path: blockPath,
                    message: "Rating needs at least two points",
                });
            }

            if (
                block.type === "rating" &&
                block.variant === "faces" &&
                block.max !== 5
            ) {
                errors.push({
                    path: blockPath,
                    message: "Face ratings have five points",
                });
            }
        });
    });

    definition.steps.forEach((step, stepIndex) => {
        (step.rules || []).forEach((rule, ruleIndex) => {
            const rulePath = `steps.${stepIndex}.rules.${ruleIndex}`;
            const block = step.blocks.find(
                candidate => candidate.id === rule.blockId
            );

            if (!block || !isQuestionBlock(block)) {
                errors.push({
                    path: rulePath,
                    message: "Rule must use a question on this step",
                });
            } else if (!operatorsFor(block).includes(rule.operator)) {
                errors.push({
                    path: rulePath,
                    message: "This condition does not fit the question",
                });
            } else if (!hasRuleValue(rule, block)) {
                errors.push({
                    path: rulePath,
                    message: "Choose a value for this rule",
                });
            }

            if (rule.goTo !== END_STEP && !stepIds.has(rule.goTo)) {
                errors.push({
                    path: rulePath,
                    message: "Rule goes to a missing step",
                });
            } else if (
                rule.goTo !== END_STEP &&
                definition.steps.findIndex(
                    candidate => candidate.id === rule.goTo
                ) <= stepIndex
            ) {
                errors.push({
                    path: rulePath,
                    message: "Rule must go to a later step",
                });
            }
        });
    });

    return errors;
};
