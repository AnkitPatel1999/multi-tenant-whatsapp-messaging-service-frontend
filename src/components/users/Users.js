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
  FaUsers, 
  FaPlus, 
  FaSearch,
  FaEdit,
  FaTrash,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaToggleOn,
  FaToggleOff,
  FaLink
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    name: '',
    groupId: '',
    isAdmin: false,
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users');
      if (response.data.error === 0) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setCreating(true);
      const response = await axios.post('/users', formData);
      if (response.data.error === 0) {
        toast.success('User created successfully!');
        setShowCreateModal(false);
        setFormData({
          username: '',
          password: '',
          email: '',
          phoneNumber: '',
          name: '',
          groupId: '',
          isAdmin: false,
          isActive: true
        });
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to create user: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      setUpdating(true);
      const response = await axios.put(`/users/${selectedUser.userId}`, formData);
      if (response.data.error === 0) {
        toast.success('User updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
        setFormData({
          username: '',
          password: '',
          email: '',
          phoneNumber: '',
          name: '',
          groupId: '',
          isAdmin: false,
          isActive: true
        });
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`/users/${userId}`);
        if (response.data.error === 0) {
          toast.success('User deleted successfully!');
          fetchUsers();
        }
      } catch (error) {
        toast.error('Failed to delete user: ' + error.message);
      }
    }
  };

  const handleLinkToGroup = async (userId) => {
    const groupId = prompt('Enter Group ID to link user:');
    if (!groupId) return;
    
    try {
      const response = await axios.post(`/users/${userId}/group`, { groupId });
      if (response.data.error === 0) {
        toast.success('User linked to group successfully!');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to link user to group: ' + error.message);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      password: '', // Don't show password in edit form
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      name: user.name || '',
      groupId: user.groupId || '',
      isAdmin: user.isAdmin || false,
      isActive: user.isActive !== undefined ? user.isActive : true
    });
    setShowEditModal(true);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await axios.put(`/users/${userId}`, {
        isActive: !currentStatus
      });
      if (response.data.error === 0) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user status: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Users</h1>
          <p className="text-muted mb-0">Manage system users and permissions</p>
        </div>
        <Button 
          variant="success" 
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus className="me-2" />
          Add User
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredUsers.length > 0 ? (
            <Table responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-3 py-3">User</th>
                  <th className="border-0 px-3 py-3">Contact Info</th>
                  <th className="border-0 px-3 py-3">Role</th>
                  <th className="border-0 px-3 py-3">Status</th>
                  <th className="border-0 px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.userId} className="border-bottom">
                    <td className="px-3 py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style={{ width: '40px', height: '40px' }}>
                          <FaUser size={20} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{user.name || user.username}</h6>
                          <small className="text-muted">@{user.username}</small>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div>
                        {user.email && (
                          <div className="mb-1">
                            <FaEnvelope className="text-muted me-2" />
                            <span className="text-muted">{user.email}</span>
                          </div>
                        )}
                        {user.phoneNumber && (
                          <div>
                            <FaPhone className="text-muted me-2" />
                            <span className="text-muted">{user.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="d-flex align-items-center">
                        <FaShieldAlt className="text-muted me-2" />
                        <Badge bg={user.isAdmin ? 'danger' : 'secondary'}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge bg={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant={user.isActive ? 'outline-warning' : 'outline-success'}
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.userId, user.isActive)}
                        >
                          {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                        </Button>
                                                                         <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleLinkToGroup(user.userId)}
                          title="Link to Group"
                        >
                           <FaLink />
                         </Button>
                         <Button
                           variant="outline-danger"
                           size="sm"
                           onClick={() => handleDeleteUser(user.userId)}
                         >
                           <FaTrash />
                         </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <FaUsers size={64} className="text-muted mb-3" />
              <h5 className="text-muted">
                {searchTerm ? 'No users found' : 'No users available'}
              </h5>
              <p className="text-muted mb-3">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Add your first user to get started'
                }
              </p>
              {!searchTerm && (
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                  <FaPlus className="me-2" />
                  Add Your First User
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Group ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter group ID"
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Admin User"
                    checked={formData.isAdmin}
                    onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active User"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleCreateUser}
            disabled={creating || !formData.username.trim() || !formData.password.trim()}
          >
            {creating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              'Create User'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Group ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter group ID"
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Admin User"
                    checked={formData.isAdmin}
                    onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active User"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateUser}
            disabled={updating || !formData.username.trim()}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Update User'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;
