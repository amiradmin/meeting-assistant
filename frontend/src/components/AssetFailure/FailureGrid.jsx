import React from "react";
import { Row, Col } from "react-bootstrap";
import AssetFailureCard from "./AssetFailureCard";

const FailureGrid = ({
  assets = [],
  onOpenPhotoViewer,
  onOpenDocumentsViewer,
  onOpenSensorModal,
  onOpenHistoryModal
}) => {
  if (!assets || assets.length === 0) {
    return <div className="text-center py-4">هیچ داده‌ای یافت نشد</div>;
  }

  return (
    <Row className="mx-0 px-3 mb-4">
      {assets.map(asset => (
        <Col key={asset.id || asset.asset_id} xs={12} sm={6} md={4} lg={3} className="mb-4">
          <AssetFailureCard
            asset={asset}
            onOpenPhotoViewer={() => onOpenPhotoViewer(asset)}
            onOpenDocumentsViewer={() => onOpenDocumentsViewer(asset)}
            onOpenSensorModal={() => onOpenSensorModal(asset)}
            onOpenHistoryModal={() => onOpenHistoryModal(asset.history || [])}
          />
        </Col>
      ))}
    </Row>
  );
};

export default FailureGrid;
