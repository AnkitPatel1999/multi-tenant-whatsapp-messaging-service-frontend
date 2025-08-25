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
  InputGroup
} from 'react-bootstrap';
import { 
  FaUsers, 
  FaPlus, 
  FaSearch,
  FaToggleOn,
  FaToggleOff,
  FaSync
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    whatsappGroupId: '',
    deviceId: ''
  });
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchGroups();
    fetchDevices();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/groups');
      if (response.data.error === 0) {
        setGroups(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get('/whatsapp/devices');
      if (response.data.error === 0) {
        setDevices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      // Don't show error toast for devices as it's not critical
    }
  };

  const handleCreateGroup = async () => {
    try {
      setCreating(true);
      
      // Generate a unique WhatsApp group ID if not provided
      const groupData = {
        ...formData,
        whatsappGroupId: formData.whatsappGroupId || `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deviceId: formData.deviceId || (devices.length > 0 ? devices[0].deviceId : 'default')
      };
      
      const response = await axios.post('/groups', groupData);
      if (response.data.error === 0) {
        toast.success('Group created successfully!');
        setShowCreateModal(false);
        setFormData({ name: '', description: '', isActive: true, whatsappGroupId: '', deviceId: '' });
        fetchGroups();
      }
    } catch (error) {
      console.error('Group creation error:', error);
      const confidentialError = error.response?.data?.confidentialErrorMessage;
      if (confidentialError) {
        toast.error(confidentialError);
      } else {
        toast.error('Failed to create group: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setCreating(false);
    }
  };







  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge bg="success">
        <FaToggleOn className="me-1" />
        Active
      </Badge>
    ) : (
      <Badge bg="danger">
        <FaToggleOff className="me-1" />
        Inactive
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Loading groups...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Chat Groups</h1>
          <p className="text-muted mb-0">Manage your WhatsApp chat groups</p>
        </div>
        <Button 
          variant="success" 
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus className="me-2" />
          Create Group
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search groups by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex justify-content-end">
              <Button 
                variant="outline-primary" 
                onClick={fetchGroups}
                className="me-2"
              >
                <FaSync className="me-2" />
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Groups Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredGroups.length > 0 ? (
            <Table responsive className="mb-0">
              <thead className="bg-light">
                                 <tr>
                   <th className="border-0 px-3 py-3">Group</th>
                   <th className="border-0 px-3 py-3">Description</th>
                   <th className="border-0 px-3 py-3">Status</th>
                   <th className="border-0 px-3 py-3">Members</th>
                   <th className="border-0 px-3 py-3">Created</th>
                 </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group) => (
                  <tr key={group.whatsappGroupId || group._id} className="border-bottom">
                    <td className="px-3 py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px' }}>
                          <FaUsers size={20} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{group.name || group.groupName}</h6>
                          <small className="text-muted">ID: {group.whatsappGroupId || group.groupId || 'N/A'}</small>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-muted">
                        {group.description || 'No description'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {getStatusBadge(group.isActive)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge bg="info">
                        <FaUsers className="me-1" />
                        {group.memberCount || 0} members
                      </Badge>
                    </td>
                                         <td className="px-3 py-3">
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
              <h5 className="text-muted">
                {searchTerm ? 'No groups found matching your search' : 'No groups found'}
              </h5>
              <p className="text-muted mb-3">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first chat group to get started'
                }
              </p>
              {!searchTerm && (
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                  <FaPlus className="me-2" />
                  Create Your First Group
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create Group Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-info mb-3">
            <small>
              <strong>Note:</strong> The following fields are required by the backend:
              <ul className="mb-0 mt-1">
                <li><strong>name</strong> - Group name</li>
                <li><strong>whatsappGroupId</strong> - Unique WhatsApp group identifier</li>
                <li><strong>deviceId</strong> - Associated WhatsApp device</li>
              </ul>
            </small>
          </div>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Group Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter group name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter group description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>WhatsApp Group ID *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter WhatsApp group ID (will auto-generate if empty)"
                value={formData.whatsappGroupId}
                onChange={(e) => setFormData({ ...formData, whatsappGroupId: e.target.value })}
              />
              <Form.Text className="text-muted">
                Leave empty to auto-generate a unique ID
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Device ID *</Form.Label>
              <Form.Select
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
              >
                <option value="">Select a device (optional)</option>
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.deviceName} - {device.isConnected ? 'Connected' : 'Disconnected'}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Select a WhatsApp device to associate with this group
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Group is active"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleCreateGroup}
            disabled={creating || !formData.name.trim() || !formData.deviceId}
          >
            {creating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      
    </div>
  );
};

export default Groups;
