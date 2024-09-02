
import { toast } from "sonner";

export async function oldUploadFile(path: string, file: File) {

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

export async function uploadFile(path: string, file: File) {

    toast(`Uploading '${file.name}'`)

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const xhr = new XMLHttpRequest();
    const success = await new Promise((resolve) => {
        xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
                console.log("upload progress:", event.loaded / event.total);
                // uploadProgress.value = event.loaded / event.total;
                console.log(event.loaded / event.total)
            }
        });
        xhr.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
                console.log("download progress:", event.loaded / event.total);
                console.log(event.loaded / event.total)
                // downloadProgress.value = event.loaded / event.total;
            }
        });
        xhr.addEventListener("loadend", () => {
            resolve(xhr.readyState === 4 && xhr.status === 200);
        });
        xhr.open("POST", '/api/upload-file', true);
        // xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(formData);
    });


}