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
  InputGroup
} from 'react-bootstrap';
import { 
  FaAddressBook, 
  FaPlus, 
  FaSync, 
  FaSearch,
  FaEdit,
  FaTrash,
  FaUser,
  FaPhone,
  FaWhatsapp
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/contacts');
      if (response.data.error === 0) {
        setContacts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    try {
      setCreating(true);
      const response = await axios.post('/contacts', formData);
      if (response.data.error === 0) {
        toast.success('Contact created successfully!');
        setShowCreateModal(false);
        setFormData({ name: '', phoneNumber: '', email: '', notes: '' });
        fetchContacts();
      }
    } catch (error) {
      toast.error('Failed to create contact: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateContact = async () => {
    try {
      setUpdating(true);
      const response = await axios.put(`/contacts/${selectedContact.id}`, formData);
      if (response.data.error === 0) {
        toast.success('Contact updated successfully!');
        setShowEditModal(false);
        setSelectedContact(null);
        setFormData({ name: '', phoneNumber: '', email: '', notes: '' });
        fetchContacts();
      }
    } catch (error) {
      toast.error('Failed to update contact: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`/contacts/${contactId}`);
        if (response.data.error === 0) {
          toast.success('Contact deleted successfully!');
          fetchContacts();
        }
      } catch (error) {
        toast.error('Failed to delete contact: ' + error.message);
      }
    }
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name || '',
      phoneNumber: contact.phoneNumber || '',
      email: contact.email || '',
      notes: contact.notes || ''
    });
    setShowEditModal(true);
  };

  const handleSyncContacts = async () => {
    try {
      toast.loading('Syncing contacts...');
      const response = await axios.post('/contacts/sync');
      if (response.data.error === 0) {
        toast.dismiss();
        toast.success('Contacts synced successfully!');
        fetchContacts();
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to sync contacts: ' + error.message);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phoneNumber?.includes(searchTerm) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Contacts</h1>
          <p className="text-muted mb-0">Manage your WhatsApp contacts</p>
        </div>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={handleSyncContacts}
          >
            <FaSync className="me-2" />
            Sync Contacts
          </Button>
          <Button 
            variant="success" 
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus className="me-2" />
            Add Contact
          </Button>
        </div>
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
              placeholder="Search contacts by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Contacts Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredContacts.length > 0 ? (
            <Table responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-3 py-3">Contact</th>
                  <th className="border-0 px-3 py-3">Phone Number</th>
                  <th className="border-0 px-3 py-3">Email</th>
                  <th className="border-0 px-3 py-3">Status</th>
                  <th className="border-0 px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-bottom">
                    <td className="px-3 py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style={{ width: '40px', height: '40px' }}>
                          <FaUser size={20} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{contact.name}</h6>
                          <small className="text-muted">ID: {contact.id}</small>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="d-flex align-items-center">
                        <FaPhone className="text-muted me-2" />
                        <span className="fw-semibold">{contact.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {contact.email ? (
                        <span className="text-muted">{contact.email}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Badge bg="success">Active</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditContact(contact)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
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
              <FaAddressBook size={64} className="text-muted mb-3" />
              <h5 className="text-muted">
                {searchTerm ? 'No contacts found' : 'No contacts available'}
              </h5>
              <p className="text-muted mb-3">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Add your first contact or sync from WhatsApp'
                }
              </p>
              {!searchTerm && (
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                  <FaPlus className="me-2" />
                  Add Your First Contact
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create Contact Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter contact name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email (Optional)</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add any additional notes about this contact"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            onClick={handleCreateContact}
            disabled={creating || !formData.name.trim() || !formData.phoneNumber.trim()}
          >
            {creating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              'Create Contact'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter contact name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email (Optional)</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add any additional notes about this contact"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            onClick={handleUpdateContact}
            disabled={updating || !formData.name.trim() || !formData.phoneNumber.trim()}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Update Contact'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Contacts;
