
import { useEffect, useRef, useState } from "react";
import ace, { Ace, version as ace_version } from "ace-builds";
import modelist from "ace-builds/src-noconflict/ext-modelist"
//***************
// Necesary for Autocompletion of ace text editor
// @ts-ignore
import aceLanguageTools from "ace-builds/src-noconflict/ext-language_tools"
//***************

import { SaveIcon, XIcon } from "lucide-react";


export default function TextFileView({ relativePath, fileContent }: { relativePath: string, fileContent: string }) {

    const editorContainer = useRef<HTMLDivElement>(null)

    const [editor, setEditor] = useState<ace.Ace.Editor>()

    useEffect(() => {
        if (!editorContainer.current) { return }

        ace.config.set(
            "basePath",
            `https://cdn.jsdelivr.net/npm/ace-builds@${ace_version}/src-min-noconflict/`
        );
        ace.require("ace/ext/language_tools");

        // snippetManager.insertSnippet(editor, "");

        const tempEditor = ace.edit(editorContainer.current,
            {
                value: fileContent,
                showPrintMargin: false,
                readOnly: false,
                theme: "ace/theme/chrome",
                mode: modelist.getModeForPath(relativePath).mode,
                wrap: true,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
            }
        )

        tempEditor.setOptions({
            enableBasicAutocompletion: true
        })
        tempEditor.setTheme('ace/theme/vibrant_ink')


        setEditor(tempEditor)
    }, [editorContainer])

    useEffect(() => {

        if (!editor) return

        const registerSnippets = function (editor: Ace.Editor, session: Ace.EditSession, mode: string, snippetText: string) {
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
            })

            var snippetManager = ace.require('ace/snippets').snippetManager

            // @ts-ignore
            var id = session.$mode.$id || ''
            var m = snippetManager.files[id]

            if (!m) { return }

            m.scope = mode
            m.snippetText = snippetText
            m.snippet = snippetManager.parseSnippetFile(snippetText, m.scope)

            snippetManager.register(m.snippet, m.scope)
        }
        type Snippet = { name: string; code: string };

        const createSnippets = (snippets: Snippet | Snippet[]) =>
            (Array.isArray(snippets) ? snippets : [snippets])
                .map(({ name, code }) =>
                    [
                        'snippet ' + name,
                        code
                            .split('\n')
                            .map((c: string) => '\t' + c)
                            .join('\n'),
                    ].join('\n')
                )
                .join('\n')

        registerSnippets(
            editor,
            editor.session,
            'python',
            createSnippets([
                { name: 'Class', code: 'class ClassName:\n\tdef __init__(self):\n\t\treturn' },
            ])
        )


    }, [editor])

    const handleSave = () => {
        console.log(editor?.getValue())

        // Path should be change to relative
        fetch("/api/file-content", {
            method: "POST",
            body: JSON.stringify({
                path: relativePath,
                content: editor?.getValue()
            })
        })
    }

    const handleExit = () => {
        // @ts-ignore
        // navigation.navigate(window.location.pathname.split("/").slice(undefined, -1).join("/"))
        location.href = window.location.pathname.split("/").slice(undefined, -1).join("/")
    }



    return (
        <div className="h-full w-full grid grid-rows-[50px_1fr]">
            <div className="grid grid-cols-[50px_1fr_50px] items-center">
                <XIcon className="mx-auto cursor-pointer" onClick={handleExit} />
                <label className="text-lg font-semibold">
                    {relativePath}
                </label>
                <SaveIcon className="mx-auto cursor-pointer" onClick={handleSave} />
            </div>
            <div id="editor" ref={editorContainer} className=""></div>
        </div>
    )

}