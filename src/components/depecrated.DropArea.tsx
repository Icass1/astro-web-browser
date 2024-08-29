import React, { useState, type DragEvent } from 'react';



const DropArea = () => {
    const [isDragging, setIsDragging] = useState(false);

    const onDrop = (files: FileList) => {
        
        for (let file of files) {
            console.log(file)
            file.text().then(data => {console.log(data)})
        }
    }

    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        if (event.dataTransfer.files.length > 0) {
            onDrop(event.dataTransfer.files);
        }
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
                border: '2px dashed #ccc',
                borderRadius: '4px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: isDragging ? '#f0f0f0' : '#fff',
            }}
        >
            {isDragging ? 'Release to drop' : 'Drag & drop files here or click to select'}
        </div>
    );
};

export default DropArea;
