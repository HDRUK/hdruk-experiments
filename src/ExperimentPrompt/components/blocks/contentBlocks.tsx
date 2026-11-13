import {
    ExperimentCaption,
    ExperimentFigure,
    ExperimentHeading,
    ExperimentImage,
    ExperimentNotice,
    ExperimentRichText,
} from "../../Experiment.styles";
import {
    ConsentNoticeBlock,
    HeadingBlock,
    ImageBlock,
    RichTextBlock,
} from "../../types";
import RichTextContent from "./RichTextContent";
import { BlockProps } from "./types";

export const Heading = ({ block }: BlockProps<HeadingBlock>) => (
    <ExperimentHeading id={`${block.id}-heading`}>
        {block.text}
    </ExperimentHeading>
);

export const RichText = ({ block }: BlockProps<RichTextBlock>) => (
    <ExperimentRichText>
        <RichTextContent content={block.content} />
    </ExperimentRichText>
);

export const Image = ({ block }: BlockProps<ImageBlock>) => (
    <ExperimentFigure>
        <ExperimentImage src={block.src} alt={block.alt} />
        {block.caption && (
            <ExperimentCaption>{block.caption}</ExperimentCaption>
        )}
    </ExperimentFigure>
);

export const ConsentNotice = ({ block }: BlockProps<ConsentNoticeBlock>) => (
    <ExperimentNotice>
        <RichTextContent content={block.content} />
    </ExperimentNotice>
);
