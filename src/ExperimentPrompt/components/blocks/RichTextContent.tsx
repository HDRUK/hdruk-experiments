import { useEffect } from "react";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { richTextDoc } from "../../utils/richText";

const EXTENSIONS = [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: true }),
];

export interface RichTextContentProps {
    content: string;
}

const RichTextContent = ({ content }: RichTextContentProps) => {
    const editor = useEditor({
        extensions: EXTENSIONS,
        editable: false,
        immediatelyRender: false,
        content: richTextDoc(content),
    });

    useEffect(() => {
        if (editor) {
            editor.commands.setContent(richTextDoc(content));
        }
    }, [editor, content]);

    return <EditorContent editor={editor} />;
};

export default RichTextContent;
