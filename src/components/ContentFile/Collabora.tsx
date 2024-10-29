
// import crypto from 'crypto';

// function generateWopiToken(fileId: number, userId: number) {
//     const secret = 'your-secure-secret'; // Use a secure method to store this
//     const payload = JSON.stringify({ fileId, userId, exp: Date.now() + 3600 * 1000 }); // Expiration in 1 hour
//     return crypto.createHmac('sha256', secret).update(payload).digest('hex');
// }

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

    return (
        <div className="bg-neutral-800 h-full w-full">
            <iframe src={editorUrl} width="100%" height="100%"></iframe>
        </div>

    )

}