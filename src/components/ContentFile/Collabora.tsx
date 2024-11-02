
export default function Collabora(
    {
        userId,
        filePath,
        collaboraURL,
        type,
        id,
        WOPIHost
    }: {
        userId: string,
        filePath: string,
        collaboraURL: string,
        type: "normal" | "share" | "backup",
        id: string,
        WOPIHost: string
    }) {

    const fileId = filePath.replace(/\//g, '_._._')

    let wopiSrc
    if (type == "backup") {
        wopiSrc = `${WOPIHost}/api/wopi/backup/${id}`;
    } else {
        wopiSrc = `${WOPIHost}/api/wopi/files/${fileId}`;
    }



    let accessToken
    if (type == "share") {
        accessToken = JSON.stringify({ share: true, id: id });
    } else {
        accessToken = JSON.stringify({ share: false, id: userId });

    }

    const editorUrl = `${collaboraURL}/browser/3456/cool.html?access_token=${accessToken}&WOPISrc=${encodeURIComponent(wopiSrc)}`

    if (collaboraURL == '') {
        return (
            <div>
                TODO - Collabora URL is not set
            </div>
        )
    }

    console.log({ fileId: fileId, wopiSrc: wopiSrc, accessToken: accessToken, editorUrl: editorUrl })

    return (
        <div className="bg-neutral-800 h-full w-full">
            <iframe src={editorUrl} width="100%" height="100%"></iframe>
        </div>

    )

}