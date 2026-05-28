// components/RUL/AssetGrid.jsx
import React from "react";
import { Card } from "react-bootstrap";
import { FaIndustry } from "react-icons/fa";
import RULCard from "./RULCard";

const AssetGrid = ({
  assets,
  onOpenPhotoViewer,
  onOpenDocumentsViewer,
  onOpenSensorModal,
  onOpenHistoryModal
}) => {
  // Debug: Log assets structure to understand photo/document data
  React.useEffect(() => {
    console.log('=== ASSETS DATA STRUCTURE DEBUG ===');
    if (assets && assets.length > 0) {
      console.log('Total assets:', assets.length);
      assets.forEach((asset, index) => {
        console.log(`\n--- Asset ${index + 1}: ${asset.asset_name} ---`);
        console.log('All keys:', Object.keys(asset));

        // Find photo-related keys
        const photoKeys = Object.keys(asset).filter(key =>
          key.toLowerCase().includes('photo') ||
          key.toLowerCase().includes('image') ||
          key.toLowerCase().includes('picture') ||
          key.toLowerCase().includes('media')
        );
        console.log('Photo-related keys:', photoKeys);
        photoKeys.forEach(key => {
          console.log(`  ${key}:`, asset[key]);
        });

        // Find document-related keys
        const docKeys = Object.keys(asset).filter(key =>
          key.toLowerCase().includes('doc') ||
          key.toLowerCase().includes('file')
        );
        console.log('Document-related keys:', docKeys);
        docKeys.forEach(key => {
          console.log(`  ${key}:`, asset[key]);
        });
      });
    }
  }, [assets]);

  if (assets.length === 0) {
    return (
      <div className="row mx-0 px-3 mb-4">
        <div className="col-12">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body className="py-5">
              <FaIndustry size={48} className="text-muted mb-3" />
              <h5 className="text-muted">هیچ داده‌ای یافت نشد</h5>
              <p className="text-muted mb-0">اطلاعات عمر تجهیزات در دسترس نمی‌باشد</p>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="row mx-0 px-3 mb-4">
      {assets.map((asset) => (
        <div key={asset.id} className="col-xl-3 col-lg-4 col-md-6 mb-4 px-2">
          <RULCard
            asset={asset}
            onOpenPhotoViewer={onOpenPhotoViewer}
            onOpenDocumentsViewer={onOpenDocumentsViewer}
            onOpenSensorModal={onOpenSensorModal}
            onOpenHistoryModal={onOpenHistoryModal}
          />
        </div>
      ))}
    </div>
  );
};

export default AssetGrid;