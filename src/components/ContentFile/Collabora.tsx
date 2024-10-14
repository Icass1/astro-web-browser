
// import crypto from 'crypto';

// function generateWopiToken(fileId: number, userId: number) {
//     const secret = 'your-secure-secret'; // Use a secure method to store this
//     const payload = JSON.stringify({ fileId, userId, exp: Date.now() + 3600 * 1000 }); // Expiration in 1 hour
//     return crypto.createHmac('sha256', secret).update(payload).digest('hex');
// }

export default function Collabora({ userId, filePath }: { userId: string, filePath: string }) {

    console.log(userId)

    const fileId = filePath.replace(/\//g, '_._._')

    const wopiSrc = `http://host.docker.internal:4321/api/wopi/files/${fileId}`;
    const accessToken = userId;

    const editorUrl = `http://localhost:9980/browser/3456/cool.html?access_token=${accessToken}&WOPISrc=${encodeURIComponent(wopiSrc)}`

    return (
        <div className="bg-red-400 h-full w-full">
            <iframe src={editorUrl} width="100%" height="100%"></iframe>
        </div>

    )

}