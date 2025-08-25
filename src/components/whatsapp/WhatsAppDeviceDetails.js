import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  Table,
  Spinner,
  ButtonGroup,
  Nav,
  Tab,
  Alert
} from 'react-bootstrap';
import {
  FaWhatsapp,
  FaComments,
  FaAddressBook,
  FaUsers,
  FaSync,
  FaPaperPlane,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaArrowLeft,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const WhatsAppDeviceDetails = ({ deviceId, onBack }) => {
  const [activeTab, setActiveTab] = useState('messages');
  const [loading, setLoading] = useState(true);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    to: '',
    message: '',
    type: 'text'
  });
  const [filters, setFilters] = useState({
    search: '',
    limit: 50
  });

  useEffect(() => {
    if (deviceId) {
      fetchDeviceData();
    }
  }, [deviceId]);

  const fetchDeviceData = async () => {
    try {
      setLoading(true);
      
      // Fetch device details
      const deviceResponse = await axios.get(`/whatsapp/devices/${deviceId}/details`);
      if (deviceResponse.data.error === 0) {
        setDeviceDetails(deviceResponse.data.data);
      }

      // Fetch messages
      const messagesResponse = await axios.get(`/whatsapp/devices/${deviceId}/messages`);
      if (messagesResponse.data.error === 0) {
        setMessages(messagesResponse.data.data);
      }

      // Fetch contacts
      const contactsResponse = await axios.get(`/whatsapp/devices/${deviceId}/contacts`);
      if (contactsResponse.data.error === 0) {
        setContacts(contactsResponse.data.data);
      }

      // Fetch groups
      const groupsResponse = await axios.get(`/whatsapp/devices/${deviceId}/groups`);
      if (groupsResponse.data.error === 0) {
        setGroups(groupsResponse.data.data);
      }

    } catch (error) {
      console.error('Error fetching device data:', error);
      const confidentialError = error.response?.data?.confidentialErrorMessage;
      if (confidentialError) {
        toast.error(confidentialError);
      } else {
        toast.error('Failed to load device data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      setSending(true);
      
      const messageData = {
        deviceId,
        ...formData
      };

      const response = await axios.post('/whatsapp/send', messageData);
      if (response.data.error === 0) {
        toast.success('Message sent successfully!');
        setShowSendModal(false);
        setFormData({ to: '', message: '', type: 'text' });
        // Refresh messages
        const messagesResponse = await axios.get(`/whatsapp/devices/${deviceId}/messages`);
        if (messagesResponse.data.error === 0) {
          setMessages(messagesResponse.data.data);
        }
      }
    } catch (error) {
      const confidentialError = error.response?.data?.confidentialErrorMessage;
      if (confidentialError) {
        toast.error(confidentialError);
      } else {
        toast.error('Failed to send message: ' + error.message);
      }
    } finally {
      setSending(false);
    }
  };

  const getDirectionBadge = (direction) => {
    const variants = {
      incoming: 'info',
      outgoing: 'success'
    };
    return <Badge bg={variants[direction] || 'secondary'}>{direction}</Badge>;
  };

  const getTypeBadge = (type) => {
    const variants = {
      text: 'primary',
      media: 'warning',
      image: 'success',
      document: 'info'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredMessages = messages.filter(message =>
    message.content?.toLowerCase().includes(filters.search.toLowerCase()) ||
    message.from?.toLowerCase().includes(filters.search.toLowerCase()) ||
    message.to?.toLowerCase().includes(filters.search.toLowerCase())
  ).slice(0, filters.limit);

  const filteredContacts = contacts.filter(contact =>
    contact.contactName?.toLowerCase().includes(filters.search.toLowerCase()) ||
    contact.phoneNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
    contact.email?.toLowerCase().includes(filters.search.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.groupName?.toLowerCase().includes(filters.search.toLowerCase()) ||
    group.description?.toLowerCase().includes(filters.search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Loading device details...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button variant="outline-secondary" onClick={onBack} className="me-3">
            <FaArrowLeft className="me-2" />
            Back to Devices
          </Button>
          <div>
            <h1 className="h3 mb-1">WhatsApp Device Details</h1>
            <p className="text-muted mb-0">
              {deviceDetails?.deviceName || 'Device'} - {deviceDetails?.phoneNumber || 'No Phone Number'}
            </p>
          </div>
        </div>
        <Button
          variant="success"
          onClick={() => setShowSendModal(true)}
        >
          <FaPaperPlane className="me-2" />
          Send Message
        </Button>
      </div>

      {/* Device Status Card */}
      {deviceDetails && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row>
              <Col md={3}>
                <div className="text-center">
                  <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '80px', height: '80px' }}>
                    <FaWhatsapp size={40} className="text-success" />
                  </div>
                  <h6 className="mb-1">{deviceDetails.deviceName}</h6>
                  <Badge bg={deviceDetails.isConnected ? 'success' : 'danger'}>
                    {deviceDetails.isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              </Col>
              <Col md={9}>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <small className="text-muted">Phone Number</small>
                      <div className="fw-semibold">{deviceDetails.phoneNumber || 'N/A'}</div>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">Device ID</small>
                      <div className="fw-semibold">{deviceDetails.deviceId}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <small className="text-muted">Last Connected</small>
                      <div className="fw-semibold">
                        {deviceDetails.lastConnectedAt ? new Date(deviceDetails.lastConnectedAt).toLocaleString() : 'Never'}
                      </div>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">Status</small>
                      <div className="fw-semibold">
                        {deviceDetails.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Search messages, contacts, or groups..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Message Limit</Form.Label>
                <Form.Select
                  value={filters.limit}
                  onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                >
                  <option value={25}>25 messages</option>
                  <option value={50}>50 messages</option>
                  <option value={100}>100 messages</option>
                  <option value={200}>200 messages</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button
                variant="outline-primary"
                onClick={fetchDeviceData}
                className="w-100"
              >
                <FaSync className="me-2" />
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Nav variant="tabs" className="border-0">
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'messages'}
                onClick={() => setActiveTab('messages')}
                className="border-0"
              >
                <FaComments className="me-2" />
                Messages ({filteredMessages.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'contacts'}
                onClick={() => setActiveTab('contacts')}
                className="border-0"
              >
                <FaAddressBook className="me-2" />
                Contacts ({filteredContacts.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'groups'}
                onClick={() => setActiveTab('groups')}
                className="border-0"
              >
                <FaUsers className="me-2" />
                Groups ({filteredGroups.length})
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <div className="p-4">
            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div>
                {filteredMessages.length > 0 ? (
                  <Table responsive className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Message</th>
                        <th>From/To</th>
                        <th>Type</th>
                        <th>Direction</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.map((message, index) => (
                        <tr key={index} className="border-bottom">
                          <td>
                            <div>
                              <p className="mb-1 fw-semibold">
                                {message.content?.length > 100 
                                  ? `${message.content.substring(0, 100)}...` 
                                  : message.content || 'No content'
                                }
                              </p>
                              <small className="text-muted">ID: {message.id || index}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="mb-1">
                                <strong>From:</strong> {message.from || 'N/A'}
                              </div>
                              <div>
                                <strong>To:</strong> {message.to || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td>{getTypeBadge(message.type || 'text')}</td>
                          <td>{getDirectionBadge(message.direction || 'unknown')}</td>
                          <td>
                            <small className="text-muted">
                              {message.timestamp ? formatTimestamp(message.timestamp) : 'N/A'}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5">
                    <FaComments size={64} className="text-muted mb-3" />
                    <h5 className="text-muted">No messages found</h5>
                    <p className="text-muted mb-3">
                      {filters.search ? 'No messages match your search criteria' : 'No messages available for this device'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div>
                {filteredContacts.length > 0 ? (
                  <Table responsive className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Contact</th>
                        <th>Phone Number</th>
                        <th>Email</th>
                        <th>Notes</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact, index) => (
                        <tr key={index} className="border-bottom">
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{ width: '40px', height: '40px' }}>
                                <FaUser size={20} className="text-primary" />
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">{contact.contactName || 'Unnamed Contact'}</h6>
                                <small className="text-muted">ID: {contact.id || index}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaPhone className="text-muted me-2" />
                              <span className="fw-semibold">{contact.phoneNumber || 'N/A'}</span>
                            </div>
                          </td>
                          <td>
                            {contact.email ? (
                              <div className="d-flex align-items-center">
                                <FaEnvelope className="text-muted me-2" />
                                <span>{contact.email}</span>
                              </div>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            <span className="text-muted">
                              {contact.notes || 'No notes'}
                            </span>
                          </td>
                          <td>
                            <Badge bg={contact.isActive ? 'success' : 'secondary'}>
                              {contact.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5">
                    <FaAddressBook size={64} className="text-muted mb-3" />
                    <h5 className="text-muted">No contacts found</h5>
                    <p className="text-muted mb-3">
                      {filters.search ? 'No contacts match your search criteria' : 'No contacts available for this device'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Groups Tab */}
            {activeTab === 'groups' && (
              <div>
                {filteredGroups.length > 0 ? (
                  <Table responsive className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Group</th>
                        <th>Description</th>
                        <th>Members</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGroups.map((group, index) => (
                        <tr key={index} className="border-bottom">
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{ width: '40px', height: '40px' }}>
                                <FaUsers size={20} className="text-info" />
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">{group.groupName || 'Unnamed Group'}</h6>
                                <small className="text-muted">ID: {group.groupId || group.id || index}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="text-muted">
                              {group.description || 'No description'}
                            </span>
                          </td>
                          <td>
                            <Badge bg="info">{group.memberCount || group.participants?.length || 0} members</Badge>
                          </td>
                          <td>
                            <Badge bg={group.isActive ? 'success' : 'secondary'}>
                              {group.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">
                              {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5">
                    <FaUsers size={64} className="text-muted mb-3" />
                    <h5 className="text-muted">No groups found</h5>
                    <p className="text-muted mb-3">
                      {filters.search ? 'No groups match your search criteria' : 'No groups available for this device'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Send Message Modal */}
      <Modal show={showSendModal} onHide={() => setShowSendModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Send WhatsApp Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Message Type</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="text">Text</option>
                    <option value="media">Media</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Recipient</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter phone number (e.g., 1234567890@c.us) or group ID"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    required
                  />
                  <Form.Text className="text-muted">
                    Use format: 1234567890@c.us for individual or group ID for groups
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Message Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter your message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </Form.Group>

            <Alert variant="info">
              <small>
                <strong>Device:</strong> {deviceDetails?.deviceName} ({deviceDetails?.phoneNumber})
                <br />
                <strong>Status:</strong> {deviceDetails?.isConnected ? 'Connected' : 'Disconnected'}
                {!deviceDetails?.isConnected && (
                  <span className="text-danger ms-2">
                    ⚠️ Device must be connected to send messages
                  </span>
                )}
              </small>
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSendModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleSendMessage}
            disabled={sending || !formData.to || !formData.message.trim() || !deviceDetails?.isConnected}
          >
            {sending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane className="me-2" />
                Send Message
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WhatsAppDeviceDetails;
