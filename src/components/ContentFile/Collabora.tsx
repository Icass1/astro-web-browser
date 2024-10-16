
// import crypto from 'crypto';

// function generateWopiToken(fileId: number, userId: number) {
//     const secret = 'your-secure-secret'; // Use a secure method to store this
//     const payload = JSON.stringify({ fileId, userId, exp: Date.now() + 3600 * 1000 }); // Expiration in 1 hour
//     return crypto.createHmac('sha256', secret).update(payload).digest('hex');
// }

export default function Collabora({ userId, filePath, collaboraURL }: { userId: string, filePath: string, collaboraURL: string }) {

    const fileId = filePath.replace(/\//g, '_._._')

    const wopiSrc = `http://host.docker.internal:4321/api/wopi/files/${fileId}`;
    const accessToken = userId;

    const editorUrl = `${collaboraURL}/browser/3456/cool.html?access_token=${accessToken}&WOPISrc=${encodeURIComponent(wopiSrc)}`

    if (collaboraURL == '') {
        return (
            <div>
                TODO - Collabora URL is not set
            </div>
        )
    }

    return (
        <div className="bg-red-400 h-full w-full">
            <iframe src={editorUrl} width="100%" height="100%"></iframe>
        </div>

    )

}