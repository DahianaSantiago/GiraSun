"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import { useEffect } from "react";

const TOOLBAR_BTN_STYLE: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--rule)",
  padding: "5px 10px",
  fontSize: 12,
  letterSpacing: "0.04em",
  color: "var(--ink-soft)",
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: "inherit",
};

const ACTIVE_BTN_STYLE: React.CSSProperties = {
  ...TOOLBAR_BTN_STYLE,
  background: "var(--accent-soft)",
  color: "var(--accent-ink)",
  borderColor: "transparent",
};

function ToolbarBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" style={active ? ACTIVE_BTN_STYLE : TOOLBAR_BTN_STYLE} onClick={onClick}>
      {label}
    </button>
  );
}

export type TipTapEditorHandle = {
  getMarkdown: () => string;
};

export function TipTapEditor({
  initialMarkdown = "",
  placeholder = "Escribe el cuerpo del texto...",
  onChange,
}: {
  initialMarkdown?: string;
  placeholder?: string;
  /** Fires on every change with the latest markdown. */
  onChange?: (markdown: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true }),
      Markdown.configure({ html: false, transformPastedText: true }),
    ],
    content: initialMarkdown,
    onUpdate: ({ editor: e }) => {
      // tiptap-markdown adds editor.storage.markdown.getMarkdown()
      const md =
        (e.storage as { markdown?: { getMarkdown: () => string } }).markdown?.getMarkdown() ?? "";
      onChange?.(md);
    },
  });

  // Keep external markdown in sync if it changes (e.g. when loading a draft).
  useEffect(() => {
    if (!editor) return;
    const current =
      (editor.storage as { markdown?: { getMarkdown: () => string } }).markdown?.getMarkdown() ??
      "";
    if (current !== initialMarkdown) {
      editor.commands.setContent(initialMarkdown, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-editor">
      <div className="tiptap-toolbar">
        <ToolbarBtn
          label="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarBtn
          label="H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarBtn
          label="B"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarBtn
          label="I"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarBtn
          label="«»"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarBtn
          label="•"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarBtn label="—" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <ToolbarBtn
          label="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const previous = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("URL", previous ?? "https://");
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
