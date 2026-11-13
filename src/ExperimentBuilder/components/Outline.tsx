import { useState } from "react";
import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import { formatText } from "../../ExperimentPrompt/consts";
import {
    Block,
    BlockType,
    ExperimentDefinition,
    Step,
} from "../../ExperimentPrompt/types";
import {
    RichTextNode,
    richTextDoc,
} from "../../ExperimentPrompt/utils/richText";
import { DefinitionError } from "../../ExperimentPrompt/utils/validateDefinition";
import {
    BuilderBlockList,
    BuilderItem,
    BuilderItemButton,
    BuilderItemMeta,
    BuilderItemText,
    BuilderList,
    BuilderStepGroup,
} from "../Builder.styles";
import { BuilderLocaleText } from "../consts";
import { moveItem, newBlock, newStep } from "../utils/factories";
import SortableList from "./SortableList";

export interface Selection {
    stepId: string;
    blockId: string | null;
}

interface OutlineProps {
    definition: ExperimentDefinition;
    selection: Selection | null;
    errors: DefinitionError[];
    onSelect: (selection: Selection | null) => void;
    onChange: (definition: ExperimentDefinition) => void;
    text: BuilderLocaleText;
}

const collectText = (node: RichTextNode): string =>
    node.text || (node.content || []).map(collectText).join(" ");

const plainText = (content: string) => collectText(richTextDoc(content)).trim();

const blockSummary = (block: Block, text: BuilderLocaleText) => {
    if ("label" in block && block.label) {
        return block.label;
    }
    if (block.type === "heading" && block.text) {
        return block.text;
    }
    if (block.type === "image" && block.alt) {
        return block.alt;
    }
    if (
        (block.type === "richText" || block.type === "consentNotice") &&
        block.content
    ) {
        return plainText(block.content) || text.blockTypes[block.type];
    }
    return text.blockTypes[block.type];
};

const hasError = (errors: DefinitionError[], path: string) =>
    errors.some(
        error => error.path === path || error.path.startsWith(`${path}.rules`)
    );

const Outline = ({
    definition,
    selection,
    errors,
    onSelect,
    onChange,
    text,
}: OutlineProps) => {
    const [menu, setMenu] = useState<{
        anchor: HTMLElement;
        stepId: string;
    } | null>(null);

    const replaceStep = (stepId: string, update: (step: Step) => Step) =>
        onChange({
            ...definition,
            steps: definition.steps.map(step =>
                step.id === stepId ? update(step) : step
            ),
        });

    const addStep = () => {
        const step = newStep();
        onChange({ ...definition, steps: [...definition.steps, step] });
        onSelect({ stepId: step.id, blockId: null });
    };

    const deleteStep = (stepId: string) => {
        onChange({
            ...definition,
            steps: definition.steps
                .filter(step => step.id !== stepId)
                .map(step => ({
                    ...step,
                    rules: (step.rules || []).filter(
                        rule => rule.goTo !== stepId
                    ),
                })),
        });
        onSelect(null);
    };

    const addBlock = (stepId: string, type: BlockType) => {
        const block = newBlock(type);
        replaceStep(stepId, step => ({
            ...step,
            blocks: [...step.blocks, block],
        }));
        onSelect({ stepId, blockId: block.id });
        setMenu(null);
    };

    const deleteBlock = (stepId: string, blockId: string) => {
        replaceStep(stepId, step => ({
            ...step,
            blocks: step.blocks.filter(block => block.id !== blockId),
            rules: (step.rules || []).filter(rule => rule.blockId !== blockId),
        }));
        onSelect({ stepId, blockId: null });
    };

    return (
        <>
            <BuilderList>
                <SortableList
                    items={definition.steps}
                    getId={step => step.id}
                    handleLabel={text.dragHandle}
                    onMove={(from, to) =>
                        onChange({
                            ...definition,
                            steps: moveItem(definition.steps, from, to),
                        })
                    }
                    renderItem={(step, { handle, dragging }) => {
                        const stepIndex = definition.steps.indexOf(step);
                        const stepPath = `steps.${stepIndex}`;
                        const stepName =
                            step.title ||
                            formatText(text.untitledStep, {
                                number: stepIndex + 1,
                            });
                        const stepInvalid = hasError(errors, stepPath);

                        return (
                            <BuilderStepGroup>
                                <BuilderItem
                                    ownerState={{
                                        selected:
                                            !!selection &&
                                            selection.stepId === step.id &&
                                            !selection.blockId,
                                        dragging,
                                        invalid: stepInvalid,
                                    }}>
                                    {handle}
                                    <BuilderItemButton
                                        type="button"
                                        onClick={() =>
                                            onSelect({
                                                stepId: step.id,
                                                blockId: null,
                                            })
                                        }>
                                        <BuilderItemText>
                                            {stepName}
                                        </BuilderItemText>
                                    </BuilderItemButton>
                                    {stepInvalid && (
                                        <ErrorOutline
                                            fontSize="small"
                                            color="error"
                                            titleAccess={text.invalidItem}
                                        />
                                    )}
                                    <IconButton
                                        size="small"
                                        aria-label={`${text.deleteStep}: ${stepName}`}
                                        onClick={() => deleteStep(step.id)}>
                                        <DeleteOutline fontSize="small" />
                                    </IconButton>
                                </BuilderItem>
                                <BuilderBlockList>
                                    <SortableList
                                        items={step.blocks}
                                        getId={block => block.id}
                                        handleLabel={text.dragHandle}
                                        onMove={(from, to) =>
                                            replaceStep(step.id, current => ({
                                                ...current,
                                                blocks: moveItem(
                                                    current.blocks,
                                                    from,
                                                    to
                                                ),
                                            }))
                                        }
                                        renderItem={(block, blockState) => {
                                            const blockIndex =
                                                step.blocks.indexOf(block);
                                            const summary = blockSummary(
                                                block,
                                                text
                                            );
                                            const blockInvalid = hasError(
                                                errors,
                                                `${stepPath}.blocks.${blockIndex}`
                                            );
                                            return (
                                                <BuilderItem
                                                    ownerState={{
                                                        selected:
                                                            !!selection &&
                                                            selection.blockId ===
                                                                block.id,
                                                        dragging:
                                                            blockState.dragging,
                                                        invalid: blockInvalid,
                                                    }}>
                                                    {blockState.handle}
                                                    <BuilderItemButton
                                                        type="button"
                                                        onClick={() =>
                                                            onSelect({
                                                                stepId: step.id,
                                                                blockId:
                                                                    block.id,
                                                            })
                                                        }>
                                                        <BuilderItemMeta>
                                                            {
                                                                text.blockTypes[
                                                                    block.type
                                                                ]
                                                            }
                                                        </BuilderItemMeta>
                                                        <BuilderItemText>
                                                            {summary}
                                                        </BuilderItemText>
                                                    </BuilderItemButton>
                                                    {blockInvalid && (
                                                        <ErrorOutline
                                                            fontSize="small"
                                                            color="error"
                                                            titleAccess={
                                                                text.invalidItem
                                                            }
                                                        />
                                                    )}
                                                    <IconButton
                                                        size="small"
                                                        aria-label={`${text.deleteBlock}: ${summary}`}
                                                        onClick={() =>
                                                            deleteBlock(
                                                                step.id,
                                                                block.id
                                                            )
                                                        }>
                                                        <DeleteOutline fontSize="small" />
                                                    </IconButton>
                                                </BuilderItem>
                                            );
                                        }}
                                    />
                                    <li>
                                        <Button
                                            variant="text"
                                            size="small"
                                            startIcon={<Add />}
                                            aria-haspopup="menu"
                                            onClick={event =>
                                                setMenu({
                                                    anchor: event.currentTarget,
                                                    stepId: step.id,
                                                })
                                            }>
                                            {text.addBlock}
                                        </Button>
                                    </li>
                                </BuilderBlockList>
                            </BuilderStepGroup>
                        );
                    }}
                />
            </BuilderList>
            <Button variant="outlined" startIcon={<Add />} onClick={addStep}>
                {text.addStep}
            </Button>
            <Menu
                anchorEl={menu && menu.anchor}
                open={!!menu}
                onClose={() => setMenu(null)}>
                {(Object.keys(text.blockTypes) as BlockType[]).map(type => (
                    <MenuItem
                        key={type}
                        onClick={() => menu && addBlock(menu.stepId, type)}>
                        {text.blockTypes[type]}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default Outline;
