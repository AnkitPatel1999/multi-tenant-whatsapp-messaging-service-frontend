import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import {
  FaWhatsapp,
  FaMobile,
  FaComments,
  FaAddressBook,
  FaUsers,
  FaPlus,
  FaQrcode,
  FaPaperPlane
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    devices: 0,
    messages: 0,
    contacts: 0,
    users: 0
  });
  const [recentDevices, setRecentDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch devices
      const devicesResponse = await axios.get('/whatsapp/devices');
      if (devicesResponse.data.error === 0) {
        setRecentDevices(devicesResponse.data.data.slice(0, 3));
        setStats(prev => ({ ...prev, devices: devicesResponse.data.data.length }));
      }

      // Fetch messages count
      const messagesResponse = await axios.get('/messages?limit=1');
      if (messagesResponse.data.error === 0) {
        // This would need a proper count endpoint in the backend
        setStats(prev => ({ ...prev, messages: messagesResponse.data.data.length }));
      }

      // Fetch users count
      const usersResponse = await axios.get('/users');
      if (usersResponse.data.error === 0) {
        setStats(prev => ({ ...prev, users: usersResponse.data.data.length }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      connected: 'success',
      disconnected: 'danger',
      connecting: 'warning'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const StatCard = ({ title, value, icon: Icon, variant, description }) => (
    <Col lg={3} md={6} className="mb-4">
      <Card className="border-0 shadow-sm h-100">
        <Card.Body className="d-flex align-items-center">
          <div className={`bg-${variant} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3`}
            style={{ width: '60px', height: '60px' }}>
            <Icon size={24} className={`text-${variant}`} />
          </div>
          <div>
            <h3 className="fw-bold mb-1">{value}</h3>
            <p className="text-muted mb-0 small">{title}</p>
            {description && <small className="text-muted">{description}</small>}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  const QuickActionCard = ({ title, description, icon: Icon, variant, onClick }) => (
    <Col lg={4} md={6} className="mb-4">
      <Card className="border-0 shadow-sm h-100 quick-action-card"
        style={{ cursor: 'pointer' }}
        onClick={onClick}>
        <Card.Body className="text-center p-4">
          <div className={`bg-${variant} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
            style={{ width: '80px', height: '80px' }}>
            <Icon size={32} className={`text-${variant}`} />
          </div>
          <h5 className="fw-bold mb-2">{title}</h5>
          <p className="text-muted mb-0 small">{description}</p>
        </Card.Body>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-muted mb-0">Here's what's happening with your WhatsApp devices</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-5">
        <StatCard
          title="WhatsApp Devices"
          value={stats.devices}
          icon={FaMobile}
          variant="primary"
          description="Connected devices"
        />
        <StatCard
          title="Total Messages"
          value={stats.messages}
          icon={FaComments}
          variant="success"
          description="This month"
        />
        <StatCard
          title="Contacts"
          value={stats.contacts}
          icon={FaAddressBook}
          variant="info"
          description="Synced contacts"
        />
        <StatCard
          title="Users"
          value={stats.users}
          icon={FaUsers}
          variant="warning"
          description="Team members"
        />
      </Row>

      {/* Quick Actions */}
      <Row className="mb-5">
        <Col>
          <h4 className="mb-3">Quick Actions</h4>
        </Col>
      </Row>
      <Row>
        <QuickActionCard
          title="Add Device"
          description="Connect a new WhatsApp device to start messaging"
          icon={FaPlus}
          variant="success"
          onClick={() => {/* Navigate to devices page */ }}
        />
        <QuickActionCard
          title="Generate QR"
          description="Generate QR code for device connection"
          icon={FaQrcode}
          variant="primary"
          onClick={() => navigate('/devices')}
        />
        <QuickActionCard
          title="Send Message"
          description="Send a quick message to your contacts"
          icon={FaPaperPlane}
          variant="info"
          onClick={() => {/* Navigate to messages page */ }}
        />
      </Row>

      {/* Recent Devices */}
      <Row className="mb-4">
        <Col>
          <h4 className="mb-3">Recent Devices</h4>
        </Col>
      </Row>
      <Row>
        {recentDevices.length > 0 ? (
          recentDevices.map((device) => (
            <Col lg={4} md={6} className="mb-3" key={device.deviceId}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-2">
                    <FaWhatsapp size={20} className="text-success me-2" />
                    <h6 className="mb-0 fw-bold">{device.deviceName}</h6>
                  </div>
                  <p className="text-muted small mb-2">{device.phoneNumber}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    {getStatusBadge(device.status)}
                    <small className="text-muted">
                      {new Date(device.lastSeen).toLocaleDateString()}
                    </small>
                  </div>
                  <small className="text-muted">ID: {device.deviceId || 'N/A'}</small>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-4">
                <FaWhatsapp size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No devices connected</h5>
                <p className="text-muted mb-3">Connect your first WhatsApp device to get started</p>
                <Button variant="success">
                  <FaPlus className="me-2" />
                  Add Device
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Dashboard;
