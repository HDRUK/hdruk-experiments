import { BranchOperator, QuestionBlock } from "../types";

export const operatorsFor = (
    block: QuestionBlock | undefined
): BranchOperator[] => {
    if (!block) {
        return ["answered"];
    }
    switch (block.type) {
        case "rating":
            return [
                "answered",
                "equals",
                "notEquals",
                "lessThan",
                "greaterThan",
            ];
        case "choice":
            return block.multiple
                ? ["answered", "includes"]
                : ["answered", "equals", "notEquals"];
        case "abChoice":
            return ["answered", "equals", "notEquals"];
        default:
            return ["answered"];
    }
};
