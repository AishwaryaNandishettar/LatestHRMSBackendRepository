import React, { useContext, useState } from "react";
import styles from "./Navbar.module.css";
import { FiBell, FiCopy ,FiMenu} from "react-icons/fi";
import logo from "../assets/Transperant Background.png";
import { AuthContext } from "../Context/Authcontext";
import { useNavigate } from "react-router-dom";

const AvatarCircle = ({ name, photo, email }) => {
  // 👇 Extract name from email if name not available
  const displayName =
    name ||
    (email ? email.split("@")[0] : "User");

  const letter = displayName.charAt(0).toUpperCase();

  return (
    <div className={styles.userdp}>
      {photo ? (
        <img src={photo} alt="User DP" className={styles.userdpImg} />
      ) : (
        <span>{letter}</span>
      )}
    </div>
  );
};

const Navbar = ({
  notifications,
  setNotifications,
  showNotif,
  setShowNotif,
   onMenuToggle   // ADD THIS
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/", { replace: true });
  };

  const copyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      alert("Email copied to clipboard!");
    }
  };
const sortedNotifications = [...notifications].sort(
  (a, b) => a.read - b.read
);

const markAsRead = (id) => {
  setNotifications(prev =>
    prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
  );
};

const handleNotificationClick = (notification) => {
  // Mark as read
  markAsRead(notification.id);
  
  // Navigate based on notification type
  if (notification.link) {
    navigate(notification.link);
    setShowNotif(false);
  }
};
  return (
    <header className={styles.navbarContainer}>
      {/* LOGO */}
      <div className={styles.navbarLeft}>
         {/* ADD THIS */}
  <button
    className={styles.hamburger}
    onClick={onMenuToggle}
  >
    <FiMenu />
  </button>
        <img src={logo} alt="Logo" className={styles.logo} />
      </div>

      {/* RIGHT SIDE */}
      <div className={styles.navbarRight}>
        {user && (
          <div className={styles.userInfo}>
            <span className={styles.username}>
              {user.name} ({user.role})
            </span>

            <div className={styles.userEmail}>
              <span>{user.email}</span>
              <FiCopy
                className={styles.copyIcon}
                onClick={copyEmail}
                title="Copy email"
              />
            </div>
          </div>
        )}

       <div className={styles.bellContainer}>
  <FiBell
    className={styles.icon}
    onClick={() => setShowNotif(!showNotif)}
  />

  {/* 🔴 UNREAD COUNT */}
  {notifications.filter(n => !n.read).length > 0 && (
    <span className={styles.badge}>
      {notifications.filter(n => !n.read).length}
    </span>
  )}

  {/* 📩 DROPDOWN */}
  {showNotif && (
    <div className={styles.dropdown}>
      {sortedNotifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        sortedNotifications.map(n => (
          <div
            key={n.id}
            className={`${styles.notify} ${
              n.read ? styles.read : styles.unread
            }`}
            onClick={() => handleNotificationClick(n)}
            style={{ cursor: 'pointer' }}
          >
            <div>{n.message}</div>
            <small>{n.time}</small>
          </div>
        ))
      )}
    </div>
  )}
</div>

        {/* USER MENU */}
        <div className={styles.userMenu}>
          {user && (
            <div
              onClick={() => setMenuOpen((v) => !v)}
              style={{ cursor: "pointer" }}
            >
              <AvatarCircle
  name={user?.name}
  photo={user?.photo}
  email={user?.email}
/>
            </div>
          )}

          {menuOpen && (
            <>
              <div className={styles.dropdownMenu}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/Profile");
                  }}
                >
                  Profile
                </button>

                <button
                  className={styles.dropdownItem}
                  onClick={doLogout}
                >
                  Logout
                </button>
              </div>

              <div
                className={styles.overlay}
                onClick={() => setMenuOpen(false)}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
