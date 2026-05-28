import React from "react";
import { Row, Col } from "react-bootstrap";
import EnergyCard from "./EnergyCard";

const EnergyGrid = ({
  assets = [],
  onOpenPhotoViewer,
  onOpenDocumentsViewer,
  onOpenSensorModal,
  onOpenHistoryModal,
  onLikeAsset, // New prop for handling likes
  likedAssets = new Set() // New prop for tracking liked assets
}) => {
  if (!assets || assets.length === 0) {
    return <div className="text-center py-4">هیچ داده‌ای یافت نشد</div>;
  }

  return (
    <Row className="mx-0 px-3 mb-4">
      {assets.map(asset => {
        const assetId = asset.id || asset.asset_id;
        const isLiked = likedAssets.has(assetId);

        return (
          <Col key={assetId} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <EnergyCard
              asset={asset}
              prediction={asset.latestPrediction}
              onOpenPhotoViewer={() => onOpenPhotoViewer(asset)}
              onOpenDocumentsViewer={() => onOpenDocumentsViewer(asset)}
              onOpenSensorModal={() => onOpenSensorModal(asset)}
              onOpenHistoryModal={() => onOpenHistoryModal(asset)}
              onLikeAsset={onLikeAsset} // Pass the like handler
              isLiked={isLiked} // Pass the liked status
            />
          </Col>
        );
      })}
    </Row>
  );
};

export default EnergyGrid;