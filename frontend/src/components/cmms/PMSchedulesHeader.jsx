// src/components/cmms/PMSchedulesHeader.jsx
import React from "react";
import { FaCalendarCheck } from "react-icons/fa";

export default function PMSchedulesHeader() {
  return (
    <div className="modern-header">
      <div className="header-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="header-content">
        <div className="container-fluid">
          {/* Main Title Area */}
          <div className="title-section">
            <div className="icon-wrapper">
              <div className="main-icon">
                <FaCalendarCheck />
              </div>
              <div className="icon-glow"></div>
            </div>
            <div className="title-text">
              <h1 className="page-title">برنامه‌ریزی نگهداری پیشگیرانه</h1>
              <p className="page-subtitle">
                مدیریت و برنامه‌ریزی زمان‌بندی‌های نگهداری پیشگیرانه تجهیزات
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modern-header {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
          position: relative;
          overflow: hidden;
          padding-bottom: 2rem;
          height: 300px;
        }

        .header-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .floating-shapes {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 6s ease-in-out infinite;
        }

        .shape-1 {
          width: 200px;
          height: 200px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 100px;
          height: 100px;
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .header-content {
          position: relative;
          z-index: 10;
          padding-top: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .title-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: center;
        }

        .icon-wrapper {
          position: relative;
        }

        .main-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          position: relative;
          z-index: 2;
        }

        .main-icon svg {
          font-size: 2rem;
          color: white;
        }

        .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.8;
          }
        }

        .title-text {
          color: white;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .page-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          max-width: 500px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .title-section {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .main-icon {
            width: 60px;
            height: 60px;
          }

          .main-icon svg {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}