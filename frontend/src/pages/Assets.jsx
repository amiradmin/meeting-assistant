// pages/Assets.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../api/api";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import DeleteConfirm from "../components/DeleteConfirm";
import AssetsTable from "../components/AssetsTable";
import AssetFormModal from "../components/AssetFormModal";
import SensorModal from "../components/SensorModal";
import PhotoViewer from "../components/PhotoViewer";
import DocumentsViewer from "../components/DocumentsViewer";

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [sections, setSections] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    section_id: "",
    description: "",
    serial_number: "",
    asset_type: "",
    model: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Sensor modal states
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [sensorAsset, setSensorAsset] = useState(null);
  const [sensorLoading, setSensorLoading] = useState(false);

  // Photo and Document viewer states
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [showDocumentsViewer, setShowDocumentsViewer] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Real-time states
  const [isRealTime, setIsRealTime] = useState(false);
  const [realTimeLoading, setRealTimeLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const pollingIntervalRef = useRef(null);
  const [dataUpdateTrigger, setDataUpdateTrigger] = useState(0);

  useEffect(() => {
    fetchAssets();
    fetchSections();
    return () => {
      stopRealTimeUpdates();
    };
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/assets/assets/");
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await api.get("/factories/sections/");
      setSections(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSensorData = async (assetId) => {
    try {
      const res = await api.get(`/assets/assets/${assetId}/sensors/`);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const startRealTimeUpdates = async () => {
    if (!sensorAsset) return;

    setIsRealTime(true);
    setConnectionStatus("connecting");
    setRealTimeLoading(true);

    try {
      const data = await fetchSensorData(sensorAsset.id);
      setSensorData(data);
      setLastUpdate(new Date());
      setConnectionStatus("connected");

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const newData = await fetchSensorData(sensorAsset.id);
          if (newData.length > 0 && JSON.stringify(newData) !== JSON.stringify(sensorData)) {
            setSensorData(newData);
            setLastUpdate(new Date());
            setDataUpdateTrigger(prev => prev + 1);
            setConnectionStatus("connected");
          }
        } catch (error) {
          console.error("Polling error:", error);
          setConnectionStatus("error");
        }
      }, 2000);

    } catch (error) {
      console.error("Initial real-time fetch error:", error);
      setConnectionStatus("error");
    } finally {
      setRealTimeLoading(false);
    }
  };

  const stopRealTimeUpdates = () => {
    setIsRealTime(false);
    setConnectionStatus("disconnected");
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const errors = {};
    if (!formData.name.trim()) errors.name = "نام دارایی الزامی است";
    if (!formData.section_id) errors.section_id = "انتخاب بخش الزامی است";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitLoading(false);
      return;
    }

    try {
      if (editing) {
        await api.put(`/assets/assets/${editing.id}/`, formData);
        setAssets((prev) =>
          prev.map((a) =>
            a.id === editing.id
              ? { ...a, ...formData, section: sections.find((s) => s.id === formData.section_id) }
              : a
          )
        );
      } else {
        const res = await api.post("/assets/assets/", formData);
        res.data.section = sections.find((s) => s.id === res.data.section_id) || null;
        setAssets((prev) => [...prev, res.data]);
      }
      setShowAddEdit(false);
      setFormData({
        name: "",
        section_id: "",
        description: "",
        serial_number: "",
        asset_type: "",
        model: "",
      });
      setEditing(null);
      setFormErrors({});
    } catch (err) {
      console.error(err.response || err);
      setFormErrors({ submit: "خطا در ذخیره اطلاعات" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/assets/${deleting.id}/`);
      setAssets((prev) => prev.filter((a) => a.id !== deleting.id));
      setShowDelete(false);
    } catch (err) {
      console.error(err.response || err);
    }
  };

  const handleCloseModal = () => {
    setShowAddEdit(false);
    setEditing(null);
    setFormData({
      name: "",
      section_id: "",
      description: "",
      serial_number: "",
      asset_type: "",
      model: "",
    });
    setFormErrors({});
  };

  const handleEdit = (asset) => {
    setEditing(asset);
    setFormData({
      name: asset.name || "",
      section_id: asset.section?.id || "",
      description: asset.description || "",
      serial_number: asset.serial_number || "",
      asset_type: asset.asset_type || "",
      model: asset.model || "",
    });
    setShowAddEdit(true);
  };

  const handleViewSensor = async (asset) => {
    setSensorAsset(asset);
    setShowSensorModal(true);
    setSensorLoading(true);

    try {
      const data = await fetchSensorData(asset.id);
      setSensorData(data);
    } catch (err) {
      console.error(err);
      setSensorData([]);
    } finally {
      setSensorLoading(false);
    }
  };

  const handleViewPhotos = (asset) => {
    setSelectedAsset(asset);
    setShowPhotoViewer(true);
  };

  const handleViewDocuments = (asset) => {
    setSelectedAsset(asset);
    setShowDocumentsViewer(true);
  };

  const handleSensorModalClose = () => {
    stopRealTimeUpdates();
    setShowSensorModal(false);
    setSensorAsset(null);
    setSensorData([]);
  };

  const handleRefreshSensorData = async () => {
    if (!sensorAsset) return;

    setRealTimeLoading(true);
    try {
      const data = await fetchSensorData(sensorAsset.id);
      setSensorData(data);
      setLastUpdate(new Date());
      setDataUpdateTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setRealTimeLoading(false);
    }
  };

  const filtered = assets.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.section?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.section?.plant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.section?.plant?.factory?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="assets-page-container">
      {/* Modern Header Section */}
      <div className="modern-header">
        <div className="container-fluid">
          {/* Main Title */}
          <div className="row justify-content-center mb-4">
            <div className="col-12 text-center">
              <div className="header-content">
                <div className="assets-icon">
                  <i className="fas fa-industry"></i>
                </div>
                <h1 className="page-title">مدیریت دارایی‌ها</h1>
                <p className="page-subtitle">مدیریت جامع و هوشمند دارایی‌های صنعتی</p>
              </div>
            </div>
          </div>
          
          {/* Action Bar */}
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="action-bar">
                <div className="search-section">
                  <div className="search-container">
                    <div className="search-icon">
                      <FaSearch />
                    </div>
                    <input
                      type="text"
                      placeholder="جستجو در دارایی‌ها، بخش‌ها، واحدها و کارخانه‌ها..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
                
                <div className="action-section">
                  <button 
                    className="add-asset-btn"
                    onClick={() => setShowAddEdit(true)}
                  >
                    <FaPlus />
                    <span>افزودن دارایی</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="container-fluid">
          <div className="modern-content-card">
            <AssetsTable
              assets={assets}
              loading={loading}
              search={search}
              filtered={filtered}
              onEdit={handleEdit}
              onDelete={(asset) => { setDeleting(asset); setShowDelete(true); }}
              onViewSensor={handleViewSensor}
              onViewPhotos={handleViewPhotos}
              onViewDocuments={handleViewDocuments}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssetFormModal
        show={showAddEdit}
        onHide={handleCloseModal}
        editing={editing}
        formData={formData}
        formErrors={formErrors}
        sections={sections}
        submitLoading={submitLoading}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
      />

      <DeleteConfirm
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={handleDelete}
        item={deleting}
      />

      <SensorModal
        show={showSensorModal}
        onHide={handleSensorModalClose}
        sensorAsset={sensorAsset}
        sensorData={sensorData}
        sensorLoading={sensorLoading}
        isRealTime={isRealTime}
        realTimeLoading={realTimeLoading}
        connectionStatus={connectionStatus}
        lastUpdate={lastUpdate}
        onRefresh={handleRefreshSensorData}
        onStartRealTime={startRealTimeUpdates}
        onStopRealTime={stopRealTimeUpdates}
      />

      <PhotoViewer
        photos={selectedAsset?.photos || []}
        show={showPhotoViewer}
        onHide={() => setShowPhotoViewer(false)}
      />

      <DocumentsViewer
        documents={selectedAsset?.documents || []}
        show={showDocumentsViewer}
        onHide={() => setShowDocumentsViewer(false)}
      />

      {/* Page Layout Styles */}
      <style jsx>{`
        .assets-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding-bottom: 2rem;
        }
        
        .modern-header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
          padding: 20px 0;
          position: relative;
          overflow: hidden;
          height:500px;
        }
        
        .modern-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
          animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .header-content {
          position: relative;
          z-index: 2;
        }
        
        .assets-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .assets-icon i {
          font-size: 2rem;
          color: white;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .page-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        
        .action-bar {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .search-section {
          flex: 1;
        }
        
        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-icon {
          position: absolute;
          right: 1rem;
          color: #6b7280;
          z-index: 2;
        }
        
        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          color: #1f2937;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .search-input::placeholder {
          color: #9ca3af;
        }
        
        .search-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .action-section {
          flex-shrink: 0;
        }
        
        .add-asset-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .add-asset-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, #059669, #047857);
        }
        
        .content-section {
          margin: 2rem 0;
        }
        
        .modern-content-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .status-indicator {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
        }
        
        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }
          
          .page-subtitle {
            font-size: 0.9rem;
          }
          
          .assets-icon {
            width: 60px;
            height: 60px;
          }
          
          .assets-icon i {
            font-size: 1.5rem;
          }
          
          .action-bar {
            flex-direction: column;
            gap: 1rem;
          }
          
          .search-section {
            width: 100%;
          }
          
          .add-asset-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Assets;