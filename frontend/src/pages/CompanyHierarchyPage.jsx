import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Tree from "react-d3-tree";
import { Card, Spinner, Alert, Button } from "react-bootstrap";

const transformData = (companies) => {
  return companies.map((company) => ({
    name: company.name,
    attributes: {
      type: "کارخانه",
      description: company.description,
      location: company.location?.name || "تعیین نشده"
    },
    children: company.plants.map((plant) => ({
      name: plant.name,
      attributes: {
        type: "واحد",
        description: plant.description || "بدون توضیحات"
      },
      children: plant.sections.map((section) => ({
        name: section.name,
        attributes: {
          type: "بخش",
          description: section.description || "بدون توضیحات"
        },
      })),
    })),
  }));
};

const CompanyHierarchyPage = () => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const treeContainerRef = useRef();

  useEffect(() => {
    axios
      .get("http://192.168.150.10:8000/api/factories/company-hierarchy/")
      .then((res) => {
        setTreeData(transformData(res.data));
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching hierarchy data:", err);
        setError("خطا در بارگذاری داده‌های سلسله مراتب");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const renderCustomNode = ({ nodeDatum, toggleNode }) => (
    <g>
      {/* Node background */}
      <rect
        x="-80"
        y="-20"
        width="160"
        height="40"
        rx="8"
        fill={getNodeColor(nodeDatum.attributes.type)}
        stroke="#374151"
        strokeWidth="2"
      />

      {/* Node content */}
      <text
        fill="white"
        strokeWidth="0"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        dy="-.3em"
      >
        {nodeDatum.name}
      </text>

      <text
        fill="white"
        strokeWidth="0"
        textAnchor="middle"
        fontSize="10"
        dy="1.2em"
      >
        {nodeDatum.attributes.type}
      </text>

      {/* Collapse/expand circle */}
      {nodeDatum.children && (
        <circle
          r="12"
          fill="white"
          stroke="#374151"
          strokeWidth="2"
          onClick={toggleNode}
          style={{ cursor: "pointer" }}
        >
          <title>{nodeDatum.__rd3t.collapsed ? "باز کردن" : "بستن"}</title>
        </circle>
      )}
    </g>
  );

  const getNodeColor = (type) => {
    const colors = {
      "کارخانه": "#3B82F6", // Blue
      "واحد": "#10B981",    // Green
      "بخش": "#F59E0B"      // Yellow
    };
    return colors[type] || "#6B7280"; // Default gray
  };

  if (loading) {
    return (
      <div className="col-12 p-2">
        <Card className="shade h-100">
          <Card.Body className="d-flex justify-content-center align-items-center py-5">
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted">در حال بارگذاری سلسله مراتب سازمانی...</div>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-12 p-2">
        <Card className="shade h-100">
          <Card.Body>
            <Alert variant="danger" className="text-center">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (!treeData.length) {
    return (
      <div className="col-12 p-2">
        <Card className="shade h-100">
          <Card.Body className="text-center py-5">
            <i className="fas fa-sitemap fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">هیچ داده‌ای برای نمایش وجود ندارد</h5>
            <p className="text-muted">سلسله مراتب سازمانی یافت نشد</p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="col-12 p-2">
      <Card className="shade h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="card-title mb-1">سلسله مراتب سازمانی</h5>
              <small className="text-muted">نمایش فلوچارت کامل کارخانه‌ها، واحدها و بخش‌ها</small>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleZoomOut}
                title="کوچک‌نمایی"
              >
                <i className="fas fa-search-minus"></i>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleResetZoom}
                title="بازنشانی اندازه"
              >
                <i className="fas fa-expand-alt"></i>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleZoomIn}
                title="بزرگ‌نمایی"
              >
                <i className="fas fa-search-plus"></i>
              </Button>
            </div>
          </div>

          <hr />

          <div className="border rounded bg-light">
            <div
              id="treeWrapper"
              ref={treeContainerRef}
              style={{
                width: "100%",
                height: "600px",
                position: "relative"
              }}
            >
              <Tree
                data={treeData}
                orientation="vertical"
                collapsible={true}
                zoomable={true}
                translate={{ x: 300, y: 50 }}
                scaleExtent={{ min: 0.5, max: 2 }}
                zoom={zoomLevel}
                renderCustomNodeElement={renderCustomNode}
                pathFunc="step"
                separation={{ siblings: 1.5, nonSiblings: 2 }}
                styles={{
                  links: {
                    stroke: "#6B7280",
                    strokeWidth: 2,
                  }
                }}
              />

              {/* Legend */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  background: "white",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px"
                }}
              >
                <div className="fw-bold mb-2">راهنما:</div>
                <div className="d-flex align-items-center mb-1">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#3B82F6",
                      borderRadius: "2px",
                      marginLeft: "5px"
                    }}
                  ></div>
                  <span>کارخانه</span>
                </div>
                <div className="d-flex align-items-center mb-1">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#10B981",
                      borderRadius: "2px",
                      marginLeft: "5px"
                    }}
                  ></div>
                  <span>واحد</span>
                </div>
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#F59E0B",
                      borderRadius: "2px",
                      marginLeft: "5px"
                    }}
                  ></div>
                  <span>بخش</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-muted small">
            <i className="fas fa-info-circle me-1"></i>
            برای مشاهده جزئیات هر گره، روی آن کلیک کنید. برای بزرگ‌نمایی از دکمه‌های بالا استفاده کنید.
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CompanyHierarchyPage;