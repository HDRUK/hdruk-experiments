import { ComponentType, useId, useMemo, useState } from "react";
import ExperimentForm from "../ExperimentPrompt/ExperimentForm";
import { ExperimentsLocaleText } from "../ExperimentPrompt/consts";
import { Block, ExperimentDefinition, Step } from "../ExperimentPrompt/types";
import { validateDefinition } from "../ExperimentPrompt/utils/validateDefinition";
import {
    BuilderHelp,
    BuilderPanel,
    BuilderPanelTitle,
    BuilderPreviewFrame,
    BuilderRoot,
} from "./Builder.styles";
import BlockProperties, {
    PlainTextEditor,
    RichTextEditorProps,
    UploadImage,
} from "./components/BlockProperties";
import Outline, { Selection } from "./components/Outline";
import StepProperties from "./components/StepProperties";
import { BuilderLocaleText, mergeBuilderLocaleText } from "./consts";

export interface ExperimentBuilderProps {
    value: ExperimentDefinition;
    onChange: (value: ExperimentDefinition) => void;
    uploadImage?: UploadImage;
    localeText?: Partial<BuilderLocaleText>;
    previewLocaleText?: Partial<ExperimentsLocaleText>;
    slots?: {
        richTextEditor?: ComponentType<RichTextEditorProps>;
    };
}

const ExperimentBuilder = ({
    value,
    onChange,
    uploadImage,
    localeText,
    previewLocaleText,
    slots,
}: ExperimentBuilderProps) => {
    const id = useId();
    const text = useMemo(
        () => mergeBuilderLocaleText(localeText),
        [localeText]
    );
    const RichTextEditor = (slots && slots.richTextEditor) || PlainTextEditor;
    const errors = useMemo(() => validateDefinition(value), [value]);

    const [selection, setSelection] = useState<Selection | null>(() =>
        value.steps.length ? { stepId: value.steps[0].id, blockId: null } : null
    );

    const step = selection
        ? value.steps.find(candidate => candidate.id === selection.stepId)
        : undefined;
    const block =
        step && selection && selection.blockId
            ? step.blocks.find(candidate => candidate.id === selection.blockId)
            : undefined;
    const previewStep = step || value.steps[0];

    const replaceStep = (next: Step) =>
        onChange({
            ...value,
            steps: value.steps.map(candidate =>
                candidate.id === next.id ? next : candidate
            ),
        });

    const replaceBlock = (next: Block) => {
        if (!step) {
            return;
        }
        replaceStep({
            ...step,
            blocks: step.blocks.map(candidate =>
                candidate.id === next.id ? next : candidate
            ),
        });
    };

    const properties = () => {
        if (step && block) {
            return (
                <BlockProperties
                    key={block.id}
                    block={block}
                    onChange={replaceBlock}
                    text={text}
                    uploadImage={uploadImage}
                    RichTextEditor={RichTextEditor}
                />
            );
        }
        if (step) {
            return (
                <StepProperties
                    key={step.id}
                    step={step}
                    steps={value.steps}
                    onChange={replaceStep}
                    text={text}
                />
            );
        }
        return (
            <>
                <BuilderHelp>{text.emptyProperties}</BuilderHelp>
                <RichTextEditor
                    label={text.thankYou}
                    value={value.thankYou || ""}
                    onChange={thankYou =>
                        onChange({ ...value, thankYou: thankYou || undefined })
                    }
                />
            </>
        );
    };

    return (
        <BuilderRoot>
            <BuilderPanel aria-labelledby={`${id}-outline`}>
                <BuilderPanelTitle id={`${id}-outline`}>
                    {text.outline}
                </BuilderPanelTitle>
                <Outline
                    definition={value}
                    selection={selection}
                    errors={errors}
                    onSelect={setSelection}
                    onChange={onChange}
                    text={text}
                />
            </BuilderPanel>
            <BuilderPanel aria-labelledby={`${id}-preview`}>
                <BuilderPanelTitle id={`${id}-preview`}>
                    {text.preview}
                </BuilderPanelTitle>
                {previewStep && previewStep.blocks.length > 0 ? (
                    <BuilderPreviewFrame>
                        <ExperimentForm
                            key={previewStep.id}
                            definition={{ steps: [previewStep] }}
                            onSubmit={() => undefined}
                            component="div"
                            localeText={previewLocaleText}
                        />
                    </BuilderPreviewFrame>
                ) : (
                    <BuilderHelp>{text.emptyPreview}</BuilderHelp>
                )}
            </BuilderPanel>
            <BuilderPanel aria-labelledby={`${id}-properties`}>
                <BuilderPanelTitle id={`${id}-properties`}>
                    {text.properties}
                </BuilderPanelTitle>
                {properties()}
            </BuilderPanel>
        </BuilderRoot>
    );
};

export default ExperimentBuilder;
