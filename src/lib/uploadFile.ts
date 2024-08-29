
import { toast } from "sonner";

export async function uploadFile(path: string, file: File) {

    toast(`Uploading '${file.name}'`)

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    try {
        // Send the file to the server
        const response = await fetch('/api/upload-file', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Error uploading file: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('File upload successful:', result);
        toast(`'${file.name}' uploaded succesfully`)
    } catch (error) {
        toast(`'${file.name}' couldn't be uploaded`, { style: { color: '#ed4337' } })
    }

}