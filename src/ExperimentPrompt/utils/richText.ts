export interface RichTextNode {
    type?: string;
    text?: string;
    content?: RichTextNode[];
}

const plainDoc = (content: string): RichTextNode => ({
    type: "doc",
    content: [
        {
            type: "paragraph",
            content: content ? [{ type: "text", text: content }] : [],
        },
    ],
});

export const richTextDoc = (content: string): RichTextNode => {
    try {
        const parsed = JSON.parse(content);
        return parsed && parsed.type === "doc" ? parsed : plainDoc(content);
    } catch (_) {
        return plainDoc(content);
    }
};
