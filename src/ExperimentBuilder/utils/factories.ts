import { Block, BlockType, Step } from "../../ExperimentPrompt/types";

export const createId = (prefix: string) =>
    `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export const newStep = (): Step => ({
    id: createId("step"),
    blocks: [],
});

export const newBlock = (type: BlockType): Block => {
    const id = createId(type);

    switch (type) {
        case "heading":
            return { id, type, text: "" };
        case "richText":
            return { id, type, content: "" };
        case "image":
            return { id, type, src: "", alt: "" };
        case "consentNotice":
            return { id, type, content: "" };
        case "rating":
            return { id, type, label: "", variant: "faces", max: 5 };
        case "choice":
            return {
                id,
                type,
                label: "",
                options: [
                    { id: createId("option"), label: "" },
                    { id: createId("option"), label: "" },
                ],
            };
        case "textInput":
            return { id, type, label: "", multiline: true, maxLength: 500 };
        case "abChoice":
            return {
                id,
                type,
                label: "",
                askReason: true,
                options: [
                    { id: "a", label: "" },
                    { id: "b", label: "" },
                ],
            };
        default:
            throw new Error(`Unknown block type ${type}`);
    }
};

export const moveItem = <T>(items: T[], from: number, to: number) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
};
