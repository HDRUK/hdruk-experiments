import { ChangeEvent, ComponentType, useId, useState } from "react";
import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Upload from "@mui/icons-material/Upload";
import {
    Button,
    FormHelperText,
    IconButton,
    MenuItem,
    Switch,
    TextField,
} from "@mui/material";
import { formatText } from "../../ExperimentPrompt/consts";
import {
    AbOption,
    Block,
    ChoiceOption,
    QuestionBlock,
    RatingVariant,
} from "../../ExperimentPrompt/types";
import { isQuestionBlock } from "../../ExperimentPrompt/utils/answers";
import {
    BuilderActions,
    BuilderToggle,
    BuilderFieldRow,
    BuilderFields,
    BuilderFieldset,
    BuilderHelp,
    BuilderLegend,
    BuilderThumbnail,
    BuilderUploadInput,
} from "../Builder.styles";
import { BuilderLocaleText } from "../consts";
import { createId } from "../utils/factories";

export interface RichTextEditorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export type UploadImage = (file: File) => Promise<{ src: string }>;

export const PlainTextEditor = ({
    label,
    value,
    onChange,
}: RichTextEditorProps) => (
    <TextField
        label={label}
        value={value}
        onChange={event => onChange(event.target.value)}
        multiline
        minRows={3}
        fullWidth
    />
);

interface ImageFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    uploadImage?: UploadImage;
    text: BuilderLocaleText;
}

const ImageField = ({
    label,
    value,
    onChange,
    uploadImage,
    text,
}: ImageFieldProps) => {
    const id = useId();
    const [uploading, setUploading] = useState(false);
    const [failed, setFailed] = useState(false);

    const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = "";
        if (!file || !uploadImage) {
            return;
        }
        setUploading(true);
        setFailed(false);
        try {
            const { src } = await uploadImage(file);
            onChange(src);
        } catch (_) {
            setFailed(true);
        } finally {
            setUploading(false);
        }
    };

    if (!uploadImage) {
        return (
            <TextField
                label={label}
                value={value}
                onChange={event => onChange(event.target.value)}
                fullWidth
            />
        );
    }

    return (
        <BuilderFieldset>
            <BuilderLegend>{label}</BuilderLegend>
            {value ? (
                <BuilderThumbnail src={value} alt="" />
            ) : (
                <BuilderHelp>{text.noImage}</BuilderHelp>
            )}
            <BuilderActions>
                <Button
                    component="label"
                    htmlFor={id}
                    variant="outlined"
                    size="small"
                    startIcon={<Upload />}
                    loading={uploading}>
                    {value ? text.replaceImage : text.upload}
                </Button>
                {value && (
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<DeleteOutline />}
                        disabled={uploading}
                        onClick={() => onChange("")}>
                        {text.removeImage}
                    </Button>
                )}
            </BuilderActions>
            <BuilderUploadInput
                id={id}
                type="file"
                accept="image/*"
                onChange={handleFile}
            />
            {failed && (
                <FormHelperText error>{text.uploadFailed}</FormHelperText>
            )}
        </BuilderFieldset>
    );
};

interface OptionsFieldProps {
    options: ChoiceOption[];
    onChange: (options: ChoiceOption[]) => void;
    text: BuilderLocaleText;
}

const OptionsField = ({ options, onChange, text }: OptionsFieldProps) => (
    <BuilderFieldset>
        <BuilderLegend>{text.options}</BuilderLegend>
        {options.map((option, index) => {
            const name = formatText(text.option, { number: index + 1 });
            return (
                <BuilderFieldRow key={option.id}>
                    <TextField
                        size="small"
                        label={name}
                        value={option.label}
                        onChange={event =>
                            onChange(
                                options.map(current =>
                                    current.id === option.id
                                        ? {
                                              ...current,
                                              label: event.target.value,
                                          }
                                        : current
                                )
                            )
                        }
                    />
                    <IconButton
                        aria-label={`${text.deleteOption}: ${name}`}
                        disabled={options.length <= 2}
                        onClick={() =>
                            onChange(
                                options.filter(
                                    current => current.id !== option.id
                                )
                            )
                        }>
                        <DeleteOutline />
                    </IconButton>
                </BuilderFieldRow>
            );
        })}
        <div>
            <Button
                variant="text"
                size="small"
                startIcon={<Add />}
                onClick={() =>
                    onChange([
                        ...options,
                        { id: createId("option"), label: "" },
                    ])
                }>
                {text.addOption}
            </Button>
        </div>
    </BuilderFieldset>
);

interface BlockPropertiesProps {
    block: Block;
    onChange: (block: Block) => void;
    text: BuilderLocaleText;
    uploadImage?: UploadImage;
    RichTextEditor: ComponentType<RichTextEditorProps>;
}

const BlockProperties = ({
    block,
    onChange,
    text,
    uploadImage,
    RichTextEditor,
}: BlockPropertiesProps) => {
    const update = (changes: Partial<Block>) =>
        onChange({ ...block, ...changes } as Block);

    const textField = (
        label: string,
        value: string | undefined,
        key: string,
        props: { required?: boolean; type?: string } = {}
    ) => (
        <TextField
            label={label}
            value={value === undefined ? "" : value}
            onChange={event =>
                update({
                    [key]:
                        props.type === "number" && event.target.value !== ""
                            ? Number(event.target.value)
                            : event.target.value || undefined,
                } as Partial<Block>)
            }
            fullWidth
            {...props}
        />
    );

    const toggle = (
        label: string,
        checked: boolean | undefined,
        key: string
    ) => (
        <BuilderToggle
            control={
                <Switch
                    checked={!!checked}
                    onChange={(_, value) =>
                        update({ [key]: value } as Partial<Block>)
                    }
                />
            }
            label={label}
        />
    );

    const questionFields = (question: QuestionBlock) => (
        <>
            {textField(text.label, question.label, "label", { required: true })}
            {textField(text.helperText, question.helperText, "helperText")}
            {toggle(text.required, question.required, "required")}
        </>
    );

    const fields = () => {
        switch (block.type) {
            case "heading":
                return textField(text.text, block.text, "text", {
                    required: true,
                });
            case "richText":
            case "consentNotice":
                return (
                    <RichTextEditor
                        key={block.id}
                        label={text.content}
                        value={block.content}
                        onChange={content => update({ content })}
                    />
                );
            case "image":
                return (
                    <>
                        <ImageField
                            label={text.image}
                            value={block.src}
                            onChange={src => update({ src })}
                            uploadImage={uploadImage}
                            text={text}
                        />
                        {textField(text.altText, block.alt, "alt", {
                            required: true,
                        })}
                        {textField(text.caption, block.caption, "caption")}
                    </>
                );
            case "rating":
                return (
                    <>
                        <TextField
                            select
                            label={text.ratingVariant}
                            value={block.variant}
                            onChange={event => {
                                const variant = event.target
                                    .value as RatingVariant;
                                update({
                                    variant,
                                    max: variant === "faces" ? 5 : block.max,
                                });
                            }}
                            fullWidth>
                            {(
                                Object.keys(
                                    text.ratingVariants
                                ) as RatingVariant[]
                            ).map(variant => (
                                <MenuItem key={variant} value={variant}>
                                    {text.ratingVariants[variant]}
                                </MenuItem>
                            ))}
                        </TextField>
                        {block.variant !== "faces" &&
                            textField(
                                text.ratingMax,
                                block.max === undefined
                                    ? undefined
                                    : String(block.max),
                                "max",
                                {
                                    type: "number",
                                }
                            )}
                        <BuilderFieldRow>
                            {textField(
                                text.minLabel,
                                block.minLabel,
                                "minLabel"
                            )}
                            {textField(
                                text.maxLabel,
                                block.maxLabel,
                                "maxLabel"
                            )}
                        </BuilderFieldRow>
                    </>
                );
            case "choice":
                return (
                    <>
                        {toggle(text.multiple, block.multiple, "multiple")}
                        <OptionsField
                            options={block.options}
                            onChange={options => update({ options })}
                            text={text}
                        />
                    </>
                );
            case "textInput":
                return (
                    <>
                        {toggle(text.multiline, block.multiline, "multiline")}
                        {textField(
                            text.maxLength,
                            block.maxLength === undefined
                                ? ""
                                : String(block.maxLength),
                            "maxLength",
                            { type: "number" }
                        )}
                        {textField(
                            text.placeholder,
                            block.placeholder,
                            "placeholder"
                        )}
                    </>
                );
            case "abChoice": {
                const updateOption = (id: string, changes: Partial<AbOption>) =>
                    update({
                        options: block.options.map(option =>
                            option.id === id
                                ? { ...option, ...changes }
                                : option
                        ) as [AbOption, AbOption],
                    });

                return (
                    <>
                        {block.options.map((option, index) => (
                            <BuilderFieldset key={option.id}>
                                <BuilderLegend>
                                    {formatText(text.design, {
                                        letter: String.fromCharCode(65 + index),
                                    })}
                                </BuilderLegend>
                                <TextField
                                    size="small"
                                    label={text.designLabel}
                                    value={option.label}
                                    onChange={event =>
                                        updateOption(option.id, {
                                            label: event.target.value,
                                        })
                                    }
                                    required
                                />
                                <ImageField
                                    label={text.image}
                                    value={option.imageSrc || ""}
                                    onChange={imageSrc =>
                                        updateOption(option.id, { imageSrc })
                                    }
                                    uploadImage={uploadImage}
                                    text={text}
                                />
                                <TextField
                                    size="small"
                                    label={text.altText}
                                    value={option.imageAlt || ""}
                                    onChange={event =>
                                        updateOption(option.id, {
                                            imageAlt: event.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    size="small"
                                    label={text.prototypeUrl}
                                    value={option.url || ""}
                                    onChange={event =>
                                        updateOption(option.id, {
                                            url: event.target.value,
                                        })
                                    }
                                />
                            </BuilderFieldset>
                        ))}
                        {toggle(text.askReason, block.askReason, "askReason")}
                        {block.askReason &&
                            textField(
                                text.reasonLabel,
                                block.reasonLabel,
                                "reasonLabel"
                            )}
                    </>
                );
            }
            default:
                return null;
        }
    };

    return (
        <BuilderFields>
            {isQuestionBlock(block) && questionFields(block)}
            {fields()}
        </BuilderFields>
    );
};

export default BlockProperties;
