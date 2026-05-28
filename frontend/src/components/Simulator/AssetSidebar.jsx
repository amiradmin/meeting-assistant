import React from 'react';

const AssetSidebar = ({ selectedAsset }) => {
  if (!selectedAsset) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#777' }}>
        هیچ تجهیزی انتخاب نشده است.
      </div>
    );
  }

  return (
    <div>
      <h2>{selectedAsset.name}</h2>
      <p><strong>نوع تجهیز:</strong> {selectedAsset.type}</p>
      <p><strong>وضعیت:</strong> {selectedAsset.status}</p>

      {selectedAsset.photos && selectedAsset.photos.length > 0 && (
        <div>
          <h4>تصاویر:</h4>
          {selectedAsset.photos.map(photo => (
            <img
              key={photo.id}
              src={`http://192.168.150.10:8000${photo.image.replace('http://localhost', '')}`}
              alt=""
              style={{ width: '100%', marginBottom: '5px', borderRadius: '5px' }}
            />
          ))}
        </div>
      )}

      {selectedAsset.documents && selectedAsset.documents.length > 0 && (
        <div>
          <h4>مستندات:</h4>
          {selectedAsset.documents.map(doc => (
            <a
              key={doc.id}
              href={`http://192.168.150.10:8000${doc.file.replace('http://localhost', '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {doc.file.split('/').pop()}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetSidebar;
