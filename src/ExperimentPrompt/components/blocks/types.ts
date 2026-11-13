import { ComponentType } from "react";
import { ExperimentsLocaleText } from "../../consts";
import { AnswerValue, Block, BlockType } from "../../types";

export interface BlockProps<TBlock extends Block = Block> {
    block: TBlock;
    value: AnswerValue | undefined;
    onChange: (value: AnswerValue) => void;
    error?: string;
    localeText: ExperimentsLocaleText;
}

export type BlockComponents = {
    [TType in BlockType]: ComponentType<
        BlockProps<Extract<Block, { type: TType }>>
    >;
};
