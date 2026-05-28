// components/RUL/Legend.jsx
import React from "react";
import { Card } from "react-bootstrap";

const Legend = () => {
  return (
    <div className="row mx-0 px-3 mb-4">
      <div className="col-12">
        <Card className="border-0 bg-light">
          <Card.Body>
            <div className="row text-center">
              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#2ecc71', borderRadius: '50%' }} />
                  <span className="small text-muted">ایمن (بیش از ۶۰٪)</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#f39c12', borderRadius: '50%' }} />
                  <span className="small text-muted">هشدار (۳۰٪ تا ۶۰٪)</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#e74c3c', borderRadius: '50%' }} />
                  <span className="small text-muted">بحرانی (کمتر از ۳۰٪)</span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
      <br />
    </div>

  );
};

export default Legend;