import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Offcanvas, NavDropdown } from 'react-bootstrap';
import { 
  FaWhatsapp, 
  FaBars, 
  FaTachometerAlt, 
  FaMobile, 
  FaComments, 
  FaAddressBook, 
  FaUsers, 
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/devices', label: 'WhatsApp Devices', icon: FaMobile },
    { path: '/messages', label: 'Messages', icon: FaComments },
    { path: '/contacts', label: 'Contacts', icon: FaAddressBook },
    { path: '/users', label: 'Users', icon: FaUsers },
  ];

  const isActive = (path) => location.pathname === path;

  const Sidebar = () => (
    <div className="bg-dark text-white" style={{ minHeight: '100vh', width: '250px' }}>
      <div className="p-3 border-bottom border-secondary">
        <div className="d-flex align-items-center">
          <FaWhatsapp size={24} className="text-success me-2" />
          <span className="fw-bold fs-5">Alchemy</span>
        </div>
      </div>
      
      <Nav className="flex-column p-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Nav.Link
              key={item.path}
              href={item.path}
              className={`d-flex align-items-center py-2 px-3 mb-1 rounded ${
                isActive(item.path) 
                  ? 'bg-success text-white' 
                  : 'text-white-50 hover-white'
              }`}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
                setShowSidebar(false);
              }}
            >
              <Icon className="me-3" />
              {item.label}
            </Nav.Link>
          );
        })}
      </Nav>
    </div>
  );

  return (
    <div className="d-flex">
      {/* Desktop Sidebar */}
      <div className="d-none d-lg-block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Offcanvas 
        show={showSidebar} 
        onHide={() => setShowSidebar(false)}
        className="bg-dark"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="text-white">
            <FaWhatsapp size={24} className="text-success me-2" />
            Alchemy
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Sidebar />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Top Navigation */}
        <Navbar bg="white" className="border-bottom shadow-sm">
          <Container fluid>
            <Button
              variant="outline-secondary"
              className="d-lg-none me-2"
              onClick={() => setShowSidebar(true)}
            >
              <FaBars />
            </Button>

            <Navbar.Brand className="d-none d-lg-block">
              <span className="text-muted">WhatsApp Management System</span>
            </Navbar.Brand>

            <Nav className="ms-auto">
              <NavDropdown 
                title={
                  <span>
                    <FaUser className="me-2" />
                    {user?.name || user?.email || 'User'}
                  </span>
                } 
                id="user-dropdown"
              >
                <NavDropdown.Item disabled>
                  <small className="text-muted">
                    Role: {user?.role || 'User'}
                  </small>
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Container>
        </Navbar>

        {/* Page Content */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
