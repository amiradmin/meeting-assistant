import React from 'react';

const AssetNode = ({ data }) => {
  const iconUrl = data.icon_file
    ? data.icon_file.startsWith('http')
      ? data.icon_file.includes(':8000')
        ? data.icon_file
        : data.icon_file.replace('http://localhost', 'http://192.168.150.10:8000')
      : `http://192.168.150.10:8000${data.icon_file}`
    : null;

  return (
    <div
      style={{
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        background: '#fff',
        textAlign: 'center',
        minWidth: '80px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      }}
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={data.name}
          style={{ width: '40px', height: '40px', marginBottom: '5px' }}
        />
      ) : (
        <div style={{ fontSize: '24px', marginBottom: '5px' }}>⚙️</div>
      )}

      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#2c3e50' }}>
        {data.name}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>{data.type}</div>

      <div
        style={{
          marginTop: '5px',
          height: '6px',
          borderRadius: '3px',
          background:
            data.status === 'Operational'
              ? '#2ecc71'
              : data.status === 'Warning'
              ? '#f39c12'
              : '#e74c3c',
        }}
      />
    </div>
  );
};

export default AssetNode;
