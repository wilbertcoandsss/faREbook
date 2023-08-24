import React, { useState } from 'react';
import Dropzone from 'react-dropzone';

const UploadMedia = () => {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]); // Explicitly set type to File[]

  const handleMediaDrop = (acceptedFiles: File[]) => { // Explicitly set type for acceptedFiles
    setMediaFiles(acceptedFiles);
  };

  return (
    <div>
      <Dropzone onDrop={handleMediaDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <p>Drag and drop photos or videos here, or click to select files.</p>
          </div>
        )}
      </Dropzone>

      {mediaFiles.map((file, index) => (
        <div key={index}>
          {file.type && file.type.startsWith('image/') ? ( // Add a check for file.type
            <img src={URL.createObjectURL(file)} alt={`Uploaded Media ${index}`} />
          ) : (
            <video controls>
              <source src={URL.createObjectURL(file)} type={file.type} />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ))}
    </div>
  );
};

export default UploadMedia;
