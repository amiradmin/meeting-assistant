import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState
} from 'react-flow-renderer';
import axios from 'axios';
import AssetNode from './AssetNode';
import AssetSidebar from './AssetSidebar';

const FactoryCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Fetch assets from backend
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await axios.get('http://192.168.150.10:8000/api/assets/assets/');
        const assets = res.data;

        const nodesFromAPI = assets.map((asset, index) => ({
          id: asset.id.toString(),
          type: 'default',
          data: {
            id: asset.id,
            name: asset.name,
            type: asset.asset_type || 'Unknown',
            status: asset.status || 'Operational',
            photos: asset.photos || [],
            documents: asset.documents || [],
            icon_file: asset.icon_file || null,
            pdm: asset.pdm || null, // PdM data
          },
          position: {
            x: 150 + (index % 5) * 180,
            y: 100 + Math.floor(index / 5) * 160
          }
        }));

        setNodes(nodesFromAPI);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchAssets();
  }, []);

  // Node click
  const onNodeClick = (_, node) => {
    if (node?.data) setSelectedAsset(node.data);
  };

  // Connect nodes dynamically
  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) => {
        // avoid duplicate connections
        const exists = eds.some(
          (e) =>
            e.source === connection.source &&
            e.target === connection.target
        );
        if (exists) return eds;

        return addEdge({ ...connection, type: 'smoothstep' }, eds);
      });
    },
    [setEdges]
  );

  // Add new node
  const addNewAsset = (type = 'Pump') => {
    const newId = (nodes.length + 1).toString();
    const newNode = {
      id: newId,
      type: 'default',
      data: {
        id: newId,
        name: `تجهیز ${newId}`,
        type,
        status: 'Operational',
        photos: [],
        documents: [],
        pdm: null
      },
      position: { x: 150 + Math.random() * 200, y: 150 + Math.random() * 200 }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Delete selected node
  const deleteSelected = () => {
    if (!selectedAsset) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedAsset.id.toString()));
    setEdges((eds) =>
      eds.filter(
        (e) =>
          e.source !== selectedAsset.id.toString() &&
          e.target !== selectedAsset.id.toString()
      )
    );
    setSelectedAsset(null);
  };

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', height: '90vh', width: '100%' }}>
        {/* Canvas */}
        <div style={{ flex: 4, border: '1px solid #ccc' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes.map((n) => ({
              ...n,
              data: {
                ...n.data,
                label: <AssetNode data={n.data} />
              }
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onInit={setReactFlowInstance}
            fitView
            connectionLineType="smoothstep"
            snapToGrid
            snapGrid={[15, 15]}
            style={{ width: '100%', height: '100%' }}
          >
            <MiniMap
              nodeColor={(n) =>
                n.data.status === 'Operational'
                  ? 'green'
                  : n.data.status === 'Warning'
                  ? 'orange'
                  : 'red'
              }
            />
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        <div
          style={{
            flex: 1,
            borderLeft: '1px solid #ccc',
            padding: '10px',
            height: '100%',
            overflowY: 'auto',
            backgroundColor: '#f9f9f9'
          }}
        >
          <AssetSidebar selectedAsset={selectedAsset} />
        </div>
      </div>

      {/* Floating Buttons */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '16px',
          padding: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}
      >
        <button
          onClick={() => addNewAsset('Pump')}
          style={buttonStyle('#007BFF', '#0056b3')}
        >
          ➕ افزودن پمپ
        </button>
        <button
          onClick={() => addNewAsset('Motor')}
          style={buttonStyle('#28a745', '#1e7e34')}
        >
          ⚙️ افزودن موتور
        </button>
        <button
          onClick={() => addNewAsset('Furnace')}
          style={buttonStyle('#fd7e14', '#e05d00')}
        >
          🔥 افزودن کوره
        </button>
        <button
          onClick={deleteSelected}
          disabled={!selectedAsset}
          style={deleteButtonStyle(selectedAsset)}
        >
          ❌ حذف تجهیز
        </button>
      </div>
    </ReactFlowProvider>
  );
};

// Helper button styles
const buttonStyle = (bg, hoverBg) => ({
  padding: '10px 16px',
  borderRadius: '12px',
  border: 'none',
  background: bg,
  color: '#fff',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginBottom: '5px'
});

const deleteButtonStyle = (selected) => ({
  padding: '10px 16px',
  borderRadius: '12px',
  border: 'none',
  background: selected ? '#dc3545' : '#aaa',
  color: '#fff',
  fontWeight: '600',
  cursor: selected ? 'pointer' : 'not-allowed',
  transition: 'all 0.2s ease'
});

export default FactoryCanvas;
