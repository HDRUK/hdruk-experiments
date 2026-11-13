import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { Button, IconButton, MenuItem, TextField } from "@mui/material";
import { formatText } from "../../ExperimentPrompt/consts";
import {
    BranchOperator,
    BranchRule,
    END_STEP,
    Step,
} from "../../ExperimentPrompt/types";
import { isQuestionBlock } from "../../ExperimentPrompt/utils/answers";
import { operatorsFor } from "../../ExperimentPrompt/utils/operatorsFor";
import {
    BuilderFieldRow,
    BuilderFields,
    BuilderFieldset,
    BuilderHelp,
    BuilderLegend,
} from "../Builder.styles";
import { BuilderLocaleText } from "../consts";

interface StepPropertiesProps {
    step: Step;
    steps: Step[];
    onChange: (step: Step) => void;
    text: BuilderLocaleText;
}

const StepProperties = ({
    step,
    steps,
    onChange,
    text,
}: StepPropertiesProps) => {
    const questions = step.blocks.filter(isQuestionBlock);
    const rules = step.rules || [];
    const targets = steps.slice(steps.indexOf(step) + 1);

    const stepName = (target: Step) =>
        target.title ||
        formatText(text.untitledStep, { number: steps.indexOf(target) + 1 });

    const updateRule = (index: number, changes: Partial<BranchRule>) =>
        onChange({
            ...step,
            rules: rules.map((rule, current) =>
                current === index ? { ...rule, ...changes } : rule
            ),
        });

    const addRule = () =>
        onChange({
            ...step,
            rules: [
                ...rules,
                {
                    blockId: questions[0].id,
                    operator: "answered",
                    goTo: targets.length ? targets[0].id : END_STEP,
                },
            ],
        });

    const valueField = (rule: BranchRule, index: number) => {
        if (rule.operator === "answered") {
            return null;
        }
        const block = questions.find(question => question.id === rule.blockId);
        const options =
            block && (block.type === "choice" || block.type === "abChoice")
                ? block.options
                : null;

        if (options) {
            return (
                <TextField
                    select
                    size="small"
                    label={text.ruleValue}
                    value={rule.value === undefined ? "" : String(rule.value)}
                    onChange={event =>
                        updateRule(index, { value: event.target.value })
                    }>
                    {options.map(option => (
                        <MenuItem key={option.id} value={option.id}>
                            {option.label || option.id}
                        </MenuItem>
                    ))}
                </TextField>
            );
        }

        return (
            <TextField
                size="small"
                type="number"
                label={text.ruleValue}
                value={rule.value === undefined ? "" : rule.value}
                onChange={event =>
                    updateRule(index, {
                        value:
                            event.target.value === ""
                                ? undefined
                                : Number(event.target.value),
                    })
                }
            />
        );
    };

    return (
        <BuilderFields>
            <TextField
                label={text.stepTitle}
                value={step.title || ""}
                onChange={event =>
                    onChange({
                        ...step,
                        title: event.target.value || undefined,
                    })
                }
                fullWidth
            />
            <BuilderFieldset>
                <BuilderLegend>{text.rules}</BuilderLegend>
                <BuilderHelp>{text.rulesHelp}</BuilderHelp>
                {rules.map((rule, index) => {
                    const block = questions.find(
                        question => question.id === rule.blockId
                    );
                    return (
                        <BuilderFieldset key={index}>
                            <TextField
                                select
                                size="small"
                                label={text.ruleQuestion}
                                value={block ? rule.blockId : ""}
                                onChange={event =>
                                    updateRule(index, {
                                        blockId: event.target.value,
                                        operator: "answered",
                                        value: undefined,
                                    })
                                }>
                                {questions.map(question => (
                                    <MenuItem
                                        key={question.id}
                                        value={question.id}>
                                        {question.label ||
                                            text.blockTypes[question.type]}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <BuilderFieldRow>
                                <TextField
                                    select
                                    size="small"
                                    label={text.ruleOperator}
                                    value={rule.operator}
                                    onChange={event =>
                                        updateRule(index, {
                                            operator: event.target
                                                .value as BranchOperator,
                                        })
                                    }>
                                    {operatorsFor(block).map(operator => (
                                        <MenuItem
                                            key={operator}
                                            value={operator}>
                                            {text.operators[operator]}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                {valueField(rule, index)}
                            </BuilderFieldRow>
                            <BuilderFieldRow>
                                <TextField
                                    select
                                    size="small"
                                    label={text.ruleGoTo}
                                    value={rule.goTo}
                                    onChange={event =>
                                        updateRule(index, {
                                            goTo: event.target.value,
                                        })
                                    }>
                                    {targets.map(target => (
                                        <MenuItem
                                            key={target.id}
                                            value={target.id}>
                                            {stepName(target)}
                                        </MenuItem>
                                    ))}
                                    <MenuItem value={END_STEP}>
                                        {text.endOfForm}
                                    </MenuItem>
                                </TextField>
                                <IconButton
                                    aria-label={`${text.deleteRule} ${
                                        index + 1
                                    }`}
                                    onClick={() =>
                                        onChange({
                                            ...step,
                                            rules: rules.filter(
                                                (_, current) =>
                                                    current !== index
                                            ),
                                        })
                                    }>
                                    <DeleteOutline />
                                </IconButton>
                            </BuilderFieldRow>
                        </BuilderFieldset>
                    );
                })}
                <div>
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<Add />}
                        disabled={!questions.length}
                        onClick={addRule}>
                        {text.addRule}
                    </Button>
                </div>
            </BuilderFieldset>
        </BuilderFields>
    );
};

export default StepProperties;
