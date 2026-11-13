export type BlockType =
    | "heading"
    | "richText"
    | "image"
    | "rating"
    | "choice"
    | "textInput"
    | "abChoice"
    | "consentNotice";

interface BaseBlock {
    id: string;
    type: BlockType;
}

interface QuestionBase extends BaseBlock {
    label: string;
    helperText?: string;
    required?: boolean;
}

export interface HeadingBlock extends BaseBlock {
    type: "heading";
    text: string;
}

export interface RichTextBlock extends BaseBlock {
    type: "richText";
    content: string;
}

export interface ImageBlock extends BaseBlock {
    type: "image";
    src: string;
    alt: string;
    caption?: string;
}

export interface ConsentNoticeBlock extends BaseBlock {
    type: "consentNotice";
    content: string;
}

export type RatingVariant = "faces" | "stars" | "scale";

export interface RatingBlock extends QuestionBase {
    type: "rating";
    variant: RatingVariant;
    max: number;
    minLabel?: string;
    maxLabel?: string;
}

export interface ChoiceOption {
    id: string;
    label: string;
}

export interface ChoiceBlock extends QuestionBase {
    type: "choice";
    multiple?: boolean;
    options: ChoiceOption[];
}

export interface TextInputBlock extends QuestionBase {
    type: "textInput";
    multiline?: boolean;
    maxLength?: number;
    placeholder?: string;
}

export interface AbOption {
    id: string;
    label: string;
    imageSrc?: string;
    imageAlt?: string;
    url?: string;
}

export interface AbChoiceBlock extends QuestionBase {
    type: "abChoice";
    options: [AbOption, AbOption];
    askReason?: boolean;
    reasonLabel?: string;
}

export type QuestionBlock =
    | RatingBlock
    | ChoiceBlock
    | TextInputBlock
    | AbChoiceBlock;

export type ContentBlock =
    | HeadingBlock
    | RichTextBlock
    | ImageBlock
    | ConsentNoticeBlock;

export type Block = QuestionBlock | ContentBlock;

export type BranchOperator =
    | "equals"
    | "notEquals"
    | "lessThan"
    | "greaterThan"
    | "includes"
    | "answered";

export const END_STEP = "end";

export interface BranchRule {
    blockId: string;
    operator: BranchOperator;
    value?: string | number;
    goTo: string;
}

export interface Step {
    id: string;
    title?: string;
    blocks: Block[];
    rules?: BranchRule[];
}

export interface ExperimentDefinition {
    steps: Step[];
    thankYou?: string;
}

export type TriggerOn = "load" | "delay" | "exitIntent";

export type TriggerFrequency = "once" | "untilAnswered" | "always";

export interface Trigger {
    on: TriggerOn;
    delaySeconds?: number;
    frequency: TriggerFrequency;
}

export interface AbChoiceAnswer {
    optionId: string;
    reason?: string;
}

export type AnswerValue = string | number | string[] | AbChoiceAnswer;

export type Answers = Record<string, AnswerValue>;

export interface Experiment {
    id: string | number;
    name: string;
    paths: string[];
    trigger: Trigger;
    definition: ExperimentDefinition;
    variant?: string | null;
    endsAt?: string | null;
}

export interface ExperimentResponseMeta {
    path: string;
    variant?: string | null;
    stepIds: string[];
    contactEmail: string | null;
}
