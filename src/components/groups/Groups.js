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
    groupName: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchGroups();
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

  const handleCreateGroup = async () => {
    try {
      setCreating(true);
      const response = await axios.post('/groups', formData);
      if (response.data.error === 0) {
        toast.success('Group created successfully!');
        setShowCreateModal(false);
        setFormData({ groupName: '', description: '', isActive: true });
        fetchGroups();
      }
    } catch (error) {
      toast.error('Failed to create group: ' + error.message);
    } finally {
      setCreating(false);
    }
  };







  const filteredGroups = groups.filter(group =>
    group.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                  <tr key={group.groupId} className="border-bottom">
                    <td className="px-3 py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px' }}>
                          <FaUsers size={20} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{group.groupName}</h6>
                          <small className="text-muted">ID: {group.groupId}</small>
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
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter group name"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
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
            disabled={creating || !formData.groupName.trim()}
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
