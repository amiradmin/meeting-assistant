// Header.jsx
import React, { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../../context/NotificationContext";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Header = ({ toggleDrawer }) => {
  const navigate = useNavigate();
  const {
    notifications,
    totalCount,
    unreadCount,
    fetchNotifications,
    markAsRead,
    loading
  } = useContext(NotificationContext);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    username: "",
    userId: "",
    profilePicture: ""
  });

  // Get user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      const fullName = localStorage.getItem("full_name");
      const username = localStorage.getItem("username");
      const userId = localStorage.getItem("user_id");
      const profilePicture = localStorage.getItem("profile_picture");

      setUserData({
        fullName: fullName || "کاربر",
        username: username || "",
        userId: userId || "",
        profilePicture: profilePicture || ""
      });
    };

    loadUserData();

    // Listen for storage changes (in case of multiple tabs)
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get profile picture URL - now uses the actual profile picture from localStorage
  const getProfilePictureUrl = () => {
    if (userData.profilePicture) {
      // If the profile picture is a relative path, prepend the base URL
      // Adjust the base URL according to your Django server
      const baseUrl = "http://192.168.150.10:8000";
      return userData.profilePicture.startsWith('/')
        ? `${baseUrl}${userData.profilePicture}`
        : userData.profilePicture;
    }
    // Fallback to default image
    return "/src/assets/img/user-profile.jpg";
  };


  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    setSelectedNotification(notif);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
    setMarkingAsRead(false);
  };

  const handleMarkAsReadAndClose = async () => {
    if (selectedNotification && !selectedNotification.is_read) {
      setMarkingAsRead(true);
      try {
        await markAsRead(selectedNotification.id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      } finally {
        setMarkingAsRead(false);
        setShowModal(false);
        setSelectedNotification(null);
      }
    } else {
      setShowModal(false);
      setSelectedNotification(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <i className="fas fa-check-circle text-success mr-2"></i>;
      case "error":
        return <i className="fas fa-exclamation-circle text-danger mr-2"></i>;
      case "warning":
        return <i className="fas fa-exclamation-triangle text-warning mr-2"></i>;
      default:
        return <i className="fas fa-info-circle text-info mr-2"></i>;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "همین الان";
    if (diffMins < 60) return `${diffMins} دقیقه قبل`;
    if (diffHours < 24) return `${diffHours} ساعت قبل`;
    if (diffDays < 7) return `${diffDays} روز قبل`;

    return date.toLocaleDateString("fa-IR");
  };

  // تابع Logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("full_name");
    localStorage.removeItem("username");
    localStorage.removeItem("profile_picture"); // Also remove profile picture
    navigate("/login");
  };

  return (
    <>
      <header className="bmd-layout-header">
        <div className="navbar navbar-light bg-faded animate__animated animate__fadeInDown">
          {/* Sidebar Toggle Button */}
          <button
            className="btn btn-outline-primary navbar-toggler animate__animated animate__wobble animate__delay-2s"
            type="button"
            onClick={toggleDrawer}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <ul className="nav navbar-nav p-0">
            {/* Notifications Bell */}
            <li className="nav-item">
              <div className="dropdown">
                <button
                  className="btn dropdown-toggle m-0 position-relative"
                  type="button"
                  id="dropdownMenu3"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i className="far fa-bell fa-lg"></i>
                  {totalCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge badge-pill badge-danger animate__animated animate__flash animate__repeat-3 animate__slower animate__delay-2s">
                      {totalCount}
                      {unreadCount > 0 && (
                        <small className="mr-1" style={{ fontSize: '0.6em' }}>
                          ({unreadCount})
                        </small>
                      )}
                    </span>
                  )}
                </button>

                <div
                  aria-labelledby="dropdownMenu3"
                  className="dropdown-menu dropdown-menu-right dropdown-menu-right-lg shadow-lg border-0"
                  style={{ minWidth: "380px", maxHeight: "500px", overflowY: "auto" }}
                >
                  <div className="dropdown-header bg-light border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="font-weight-bold persianumber">اطلاعیه‌ها</span>
                      <div className="d-flex flex-column align-items-end">
                        {unreadCount > 0 && (
                          <span className="badge badge-primary badge-pill persianumber mb-1">
                            {unreadCount} خوانده نشده
                          </span>
                        )}
                        <small className="text-muted persianumber">
                          کل: {totalCount} اطلاعیه
                        </small>
                      </div>
                    </div>
                    {/* Refresh Button */}
                    <div className="text-center mt-2">
                      <button
                        className="btn btn-sm btn-outline-secondary w-100"
                        onClick={fetchNotifications}
                        disabled={loading}
                      >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''} mr-2`}></i>
                        بروزرسانی
                        {loading && <span className="mr-2">...</span>}
                      </button>
                    </div>
                  </div>

                  <div className="dropdown-divider m-1"></div>

                  {recentNotifications.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="far fa-bell fa-2x text-muted mb-2"></i>
                      <p className="text-muted mb-0">هیچ اطلاعیه‌ای موجود نیست</p>
                    </div>
                  ) : (
                    recentNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`dropdown-item p-3 border-bottom ${
                          !n.is_read
                            ? "bg-light font-weight-bold border-start border-primary border-3"
                            : "border-start border-transparent border-3 m-1"
                        }`}
                        onClick={() => handleNotificationClick(n)}
                        style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = !n.is_read ? "#e3f2fd" : "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = !n.is_read ? "#f8f9fa" : "transparent";
                        }}
                      >
                        <div className="d-flex align-items-start">
                          <div className="flex-shrink-0">{getNotificationIcon(n.notif_type)}</div>
                          <div className="flex-grow-1 ms-3" style={{ minWidth: 0 }}>
                            {/* Show Notification ID */}
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted font-weight-normal" style={{ fontSize: "0.7rem" }}>
                                ID: {n.id}
                              </small>
                              {!n.is_read && (
                                <span className="badge badge-primary badge-pill" style={{ fontSize: "0.6rem" }}>
                                  جدید
                                </span>
                              )}
                            </div>

                            <h6 className={`mb-1 ${!n.is_read ? "text-dark" : "text-secondary"}`}>
                              {n.title || n.message.split("\n")[0]}
                            </h6>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">{formatTime(n.created_at)}</small>
                              <small className={`badge ${
                                n.notif_type === "success"
                                  ? "badge-success"
                                  : n.notif_type === "error"
                                  ? "badge-danger"
                                  : n.notif_type === "warning"
                                  ? "badge-warning"
                                  : "badge-info"
                              }`} style={{ fontSize: "0.6rem" }}>
                                {n.notif_type}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="dropdown-divider"></div>
                  <div className="text-center p-2">
                    <a
                      href="/notifications"
                      className="btn btn-outline-primary btn-sm w-100"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = "/notifications";
                      }}
                    >
                      <i className="fas fa-list mr-2"></i>
                      مشاهده همه اطلاعیه‌ها
                      {notifications.length > 10 && (
                        <span className="badge badge-light text-muted mr-2 persianumber">
                          +{notifications.length - 10}
                        </span>
                      )}
                    </a>
                  </div>
                </div>
              </div>
            </li>

            {/* User Profile */}
            <li className="nav-item">
              <img
                src={getProfilePictureUrl()}
                alt="پروفایل کاربر"
                className="rounded-circle screen-user-profile"
                onError={(e) => {
                  e.target.src = "/src/assets/img/user-profile.jpg";
                }}
              />
            </li>

            <li className="nav-item">
              <div className="dropdown">
                <button
                  className="btn dropdown-toggle m-0"
                  type="button"
                  id="dropdownMenu4"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="user-welcome">
                    {userData.fullName}
                  </span>
                </button>
                <div aria-labelledby="dropdownMenu4" className="dropdown-menu pl-3 dropdown-menu-right">
                  <div className="dropdown-header text-center">
                    <img
                      src={getProfilePictureUrl()}
                      alt="پروفایل"
                      className="rounded-circle mb-2"
                      width="60"
                      height="60"
                      onError={(e) => {
                        e.target.src = "/src/assets/img/user-profile.jpg";
                      }}
                    />
                    <h6 className="mb-1">{userData.fullName}</h6>
                    {userData.username && (
                      <small className="text-muted">@{userData.username}</small>
                    )}
                    {userData.userId && (
                      <small className="text-muted d-block">کد کاربری: {userData.userId}</small>
                    )}
                  </div>
                  <div className="dropdown-divider"></div>

                  <button className="dropdown-item" type="button">
                    <i className="far fa-user c-main fa-sm mr-2"></i>پروفایل
                  </button>
                  <button
                    onClick={() => window.dark()}
                    className="dropdown-item"
                    type="button"
                  >
                    <i className="fas fa-moon fa-sm c-main mr-2"></i>حالت شب
                  </button>
                  <button className="dropdown-item" type="button">
                    <i className="fas fa-cog fa-sm c-main mr-2"></i>تنظیمات
                  </button>
                  {/* Logout */}
                  <button className="dropdown-item" type="button" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt fa-sm c-main mr-2"></i>خروج
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </header>

      {/* Notification Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="d-flex align-items-center">
            {selectedNotification && getNotificationIcon(selectedNotification.notif_type)}
            <span className="mr-2">جزئیات اطلاعیه</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {selectedNotification && (
            <>
              {/* Show Notification ID in modal */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted">شناسه اطلاعیه: {selectedNotification.id}</small>
                <span
                  className={`badge ${
                    selectedNotification.notif_type === "success"
                      ? "badge-success"
                      : selectedNotification.notif_type === "error"
                      ? "badge-danger"
                      : selectedNotification.notif_type === "warning"
                      ? "badge-warning"
                      : "badge-info"
                  }`}
                >
                  {selectedNotification.notif_type}
                </span>
              </div>

              <h5 className="text-primary mb-3">{selectedNotification.title}</h5>
              <div className="bg-light p-3 rounded mb-3">
                <p className="mb-0 text-justify" style={{ lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                  {selectedNotification.message}
                </p>
              </div>
              <div className="d-flex justify-content-between align-items-center text-muted small">
                <span>
                  <i className="far fa-clock mr-1"></i>
                  {formatTime(selectedNotification.created_at)}
                </span>
                <span
                  className={`badge ${
                    selectedNotification.is_read ? "badge-success" : "badge-warning"
                  }`}
                >
                  {selectedNotification.is_read ? "خوانده شده" : "خوانده نشده"}
                </span>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button variant="outline-secondary" onClick={handleCloseModal}>
            بستن
          </Button>
          {selectedNotification && !selectedNotification.is_read && (
            <Button variant="primary" onClick={handleMarkAsReadAndClose} disabled={markingAsRead}>
              {markingAsRead ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                  در حال ثبت...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-1"></i>
                  علامت‌گذاری به عنوان خوانده شده
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Custom CSS */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: auto;
        }
        .dropdown-menu-right-lg {
          min-width: 380px !important;
          margin-left: 4px;
        }
        .border-start {
          border-left-width: 3px !important;
        }
        /* Style for the notification badge */
        .badge-danger {
          background-color: #dc3545;
          color: white;
          font-size: 0.75rem;
          padding: 0.25em 0.4em;
        }
        .user-welcome {
          font-weight: 600;
          color: #495057;
        }
      `}</style>
    </>
  );
};

export default Header;