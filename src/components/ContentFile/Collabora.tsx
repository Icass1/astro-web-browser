
export default function Collabora(
    {
        userId,
        filePath,
        collaboraURL,
        share,
        shareId,
        WOPIHost
    }: {
        userId: string,
        filePath: string,
        collaboraURL: string,
        share: boolean,
        shareId: string,
        WOPIHost: string
    }) {

    const fileId = filePath.replace(/\//g, '_._._')

    const wopiSrc = `${WOPIHost}/api/wopi/files/${fileId}`;
    const accessToken = JSON.stringify({ share: share, id: share ? shareId : userId });

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