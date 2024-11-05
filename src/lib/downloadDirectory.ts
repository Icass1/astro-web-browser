import { toast } from "sonner";

export default async function downloadDirectory({ path, format }: { path: string, format: "zip" | "tar" }) {

    const response = await fetch('/api/download-directory', { method: "POST", body: JSON.stringify({ path: path, format: format }) });

    if (!response.body) { return }

    // Start downloading the file as a blob
    const reader = response.body.getReader();
    const chunks = [];
    // const totalBytes = parseInt(response.headers.get('Content-Length'), 10);
    let receivedBytes = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedBytes += value.length;

        // Calculate and display progress
        // const progress = (receivedBytes / totalBytes) * 100;
        // console.log(progress, value.length, receivedBytes)

        // toast(`Progress: ${progress.toFixed(2)}%`)
    }

    // Create a blob and download link
    const blob = new Blob(chunks, { type: `application/${format}` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (path.split("/").at(-1) || "Home") + `.${format}`;
    link.click();
    URL.revokeObjectURL(url);

    toast("Done")

}