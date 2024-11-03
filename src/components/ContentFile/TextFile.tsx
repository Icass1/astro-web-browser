
import { Fragment } from "react/jsx-runtime";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    const lineNumberRef = useRef<HTMLDivElement>(null)
    const [content, setContent] = useState(fileContent)

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

        // editor.renderer.getContainerElement = () => { return editorContainer.current }

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
        alert("TODO")
    }

    const handleExit = () => {
        // @ts-ignore
        navigation.navigate(window.location.pathname.split("/").slice(undefined, -1).join("/"))
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

    return (
        <div className="w-full h-full relative grid grid-cols-[40px_1fr] gap-x-2">
            <div ref={lineNumberRef} className="flex flex-col h-full overflow-y-hidden">
                {[...content.split("\n"), " ", " ", " "].map((line, index) => (
                    <label key={index} className="text-primary/70 text-right border-r-2 border-solid border-muted  pr-2 select-none">{index}</label>
                ))}
            </div>
            <textarea value={content} onInput={(e) => { setContent((e.target as HTMLTextAreaElement).value) }} className="w-full bg-muted/60 h-full resize-none relative outline-none" onScroll={(e) => { if (lineNumberRef.current) lineNumberRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop }} />
        </div>
    )

    return (
        <ScrollArea className="bg-muted/60 rounded p-2">
            <div className="grid grid-cols-[40px_1fr] gap-x-2">
                {fileContent.split("\n").map((line, index) => (
                    <Fragment key={index}>
                        <label className="text-primary/70 text-right border-r-2 border-solid border-muted  pr-2 select-none">{index}</label>
                        <input className="bg-transparent outline-none" defaultValue={line} style={{ fontFamily: 'Consola' }}></input>
                    </Fragment>
                ))}
            </div>
        </ScrollArea>
    )
}