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
  InputGroup,
  FormSelect
} from 'react-bootstrap';
import { 
  FaComments, 
  FaPlus, 
  FaPaperPlane, 
  FaFilter,
  FaSearch,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [filters, setFilters] = useState({
    userId: '',
    groupId: '',
    limit: 50
  });
  const [formData, setFormData] = useState({
    deviceId: '',
    to: '',
    message: '',
    type: 'text'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch devices for the send message form
      const devicesResponse = await axios.get('/whatsapp/devices');
      if (devicesResponse.data.error === 0) {
        setDevices(devicesResponse.data.data);
      }

      // Fetch messages
      await fetchMessages();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.groupId) params.append('groupId', filters.groupId);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axios.get(`/messages?${params.toString()}`);
      if (response.data.error === 0) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    try {
      setSending(true);
      
      // Debug: Log the data being sent
      console.log('Sending message with data:', formData);
      console.log('Device ID being sent:', formData.deviceId);
      
      // Use the exact endpoint from Postman collection
      const response = await axios.post('/whatsapp/send', formData);
      if (response.data.error === 0) {
        toast.success('Message sent successfully!');
        setShowSendModal(false);
        setFormData({
          deviceId: '',
          to: '',
          message: '',
          type: 'text'
        });
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      toast.error('Failed to send message: ' + error.message);
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
      media: 'warning'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchMessages();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Loading messages...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Messages</h1>
          <p className="text-muted mb-0">View message history and send new messages</p>
        </div>
        <Button 
          variant="success" 
          onClick={() => setShowSendModal(true)}
          disabled={devices.length === 0}
        >
          <FaPlus className="me-2" />
          Send Message
        </Button>
        
        {devices.length === 0 && (
          <small className="text-muted d-block mt-2">
            No WhatsApp devices available. Please connect a device first.
          </small>
        )}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>User ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Filter by user ID"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Group ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Filter by group ID"
                  value={filters.groupId}
                  onChange={(e) => handleFilterChange('groupId', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Limit</Form.Label>
                <FormSelect
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                >
                  <option value={25}>25 messages</option>
                  <option value={50}>50 messages</option>
                  <option value={100}>100 messages</option>
                  <option value={200}>200 messages</option>
                </FormSelect>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button 
                variant="outline-primary" 
                onClick={applyFilters}
                className="w-100"
              >
                <FaFilter className="me-2" />
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Messages Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {messages.length > 0 ? (
            <Table responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-3 py-3">Message</th>
                  <th className="border-0 px-3 py-3">From/To</th>
                  <th className="border-0 px-3 py-3">Type</th>
                  <th className="border-0 px-3 py-3">Direction</th>
                  <th className="border-0 px-3 py-3">Timestamp</th>
                  <th className="border-0 px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id} className="border-bottom">
                    <td className="px-3 py-3">
                      <div>
                        <p className="mb-1 fw-semibold">
                          {message.content.length > 100 
                            ? `${message.content.substring(0, 100)}...` 
                            : message.content
                          }
                        </p>
                        <small className="text-muted">ID: {message.id}</small>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div>
                        <div className="mb-1">
                          <strong>From:</strong> {message.from}
                        </div>
                        <div>
                          <strong>To:</strong> {message.to}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {getTypeBadge(message.type)}
                    </td>
                    <td className="px-3 py-3">
                      {getDirectionBadge(message.direction)}
                    </td>
                    <td className="px-3 py-3">
                      <small className="text-muted">
                        {formatTimestamp(message.timestamp)}
                      </small>
                    </td>
                    <td className="px-3 py-3">
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            // View full message
                            alert(`Full message: ${message.content}`);
                          }}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            // Download message (placeholder)
                            toast.info('Download feature coming soon');
                          }}
                        >
                          <FaDownload />
                        </Button>
                      </ButtonGroup>
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
                {devices.length === 0 
                  ? 'Connect a WhatsApp device first to start messaging'
                  : 'No messages match your current filters'
                }
              </p>
              {devices.length > 0 && (
                <Button variant="success" onClick={() => setShowSendModal(true)}>
                  <FaPaperPlane className="me-2" />
                  Send Your First Message
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Send Message Modal */}
      <Modal show={showSendModal} onHide={() => setShowSendModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Send New Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Device</Form.Label>
                  <FormSelect
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    required
                  >
                    <option value="">Select a device</option>
                    {devices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.deviceName} ({device.phoneNumber})
                      </option>
                    ))}
                  </FormSelect>
                  {formData.deviceId && (
                    <Form.Text className="text-success">
                      ✓ Selected Device ID: <strong>{formData.deviceId}</strong>
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Message Type</Form.Label>
                  <FormSelect
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="text">Text</option>
                    <option value="media">Media</option>
                  </FormSelect>
                </Form.Group>
              </Col>
            </Row>
            
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSendModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleSendMessage}
            disabled={sending || !formData.deviceId || !formData.to || !formData.message.trim()}
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

export default Messages;
