import { ConsentNotice, Heading, Image, RichText } from "./contentBlocks";
import {
    AbChoiceQuestion,
    ChoiceQuestion,
    RatingQuestion,
    TextInputQuestion,
} from "./questionBlocks";
import { BlockComponents } from "./types";

export const defaultBlocks: BlockComponents = {
    heading: Heading,
    richText: RichText,
    image: Image,
    consentNotice: ConsentNotice,
    rating: RatingQuestion,
    choice: ChoiceQuestion,
    textInput: TextInputQuestion,
    abChoice: AbChoiceQuestion,
};
