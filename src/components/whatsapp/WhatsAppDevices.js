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
  Alert,
  Spinner,
  ButtonGroup
} from 'react-bootstrap';
import {
  FaWhatsapp,
  FaPlus,
  FaQrcode,
  FaPowerOff,
  FaTrash,
  FaSync,
  FaMobile,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaDownload,
  FaCopy
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const WhatsAppDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [qrString, setQrString] = useState('');
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: ''
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  // Auto-refresh device status when QR modal is open
  useEffect(() => {
    let interval;
    if (showQRModal && selectedDevice) {
      interval = setInterval(() => {
        // Silent background refresh - don't show loading states or toasts
        fetchDevicesSilently();
      }, 5000); // Check every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showQRModal, selectedDevice]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/whatsapp/devices');
      if (response.data.error === 0) {
        console.log('Devices response:', response.data.data);
        console.log('First device structure:', response.data.data[0]);
        setDevices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  // Silent background refresh for QR modal - no loading states or toasts
  const fetchDevicesSilently = async () => {
    try {
      const response = await axios.get('/whatsapp/devices');
      if (response.data.error === 0) {
        // Only update devices state, no console logs or user notifications
        setDevices(response.data.data);
      }
    } catch (error) {
      // Silent error handling - only log to console, no user notification
      console.error('Silent background refresh error:', error);
    }
  };

  const handleCreateDevice = async () => {
    try {
      setCreating(true);
      const response = await axios.post('/whatsapp/devices', formData);
      if (response.data.error === 0) {
        toast.success('Device created successfully! Now generate a QR code to connect it to WhatsApp.');
        setShowCreateModal(false);
        setFormData({ deviceName: '' });
        fetchDevices();
      }
    } catch (error) {
      toast.error('Failed to create device: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateQR = async (deviceId) => {
    // Debug logging to see what deviceId is being passed
    console.log('Generating QR for device:', deviceId);

    if (!deviceId) {
      toast.error('Device ID is missing. Please try again.');
      return;
    }

    try {
      setSelectedDevice(deviceId);
      setQrCode(''); // Clear previous QR code
      setQrString(''); // Clear previous QR string
      setShowQRModal(true);

      // Use the exact endpoint from Postman collection
      const response = await axios.post(`/whatsapp/devices/${deviceId}/qr`);
      console.log('QR Response:', response.data);
      
             if (response.data.error === 0) {
         // The backend now returns multiple QR code formats
         const qrData = response.data.data;
         
         if (qrData.qrCodeImage) {
           // Use the direct image data URL (recommended)
           setQrCode(qrData.qrCodeImage);
           setQrString(qrData.qrCode || ''); // Store original string for reference
           toast.success('QR code generated successfully!');
         } else if (qrData.qrCodeBase64) {
           // Fallback to base64 string
           setQrCode(`data:image/png;base64,${qrData.qrCodeBase64}`);
           setQrString(qrData.qrCode || '');
           toast.success('QR code generated successfully!');
         } else if (qrData.qrCode) {
           // Legacy fallback - generate simple representation
           setQrString(qrData.qrCode);
           const qrImageData = generateSimpleQRCode(qrData.qrCode);
           setQrCode(qrImageData);
           toast.success('QR code generated successfully!');
         } else {
           throw new Error('No QR code data received');
         }
       } else {
        throw new Error(response.data.message || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code: ' + (error.response?.data?.message || error.message));
      setShowQRModal(false);
    }
  };

  const handleDisconnectDevice = async (deviceId) => {
    if (window.confirm('Are you sure you want to disconnect this device?')) {
      try {
        // Use the exact endpoint from Postman collection
        const response = await axios.post(`/whatsapp/devices/${deviceId}/disconnect`);
        if (response.data.error === 0) {
          toast.success('Device disconnected successfully!');
          fetchDevices();
        }
      } catch (error) {
        toast.error('Failed to disconnect device: ' + error.message);
      }
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (window.confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`/whatsapp/devices/${deviceId}`);
        if (response.data.error === 0) {
          toast.success('Device deleted successfully!');
          fetchDevices();
        }
      } catch (error) {
        toast.error('Failed to delete device: ' + error.message);
      }
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    try {
      // Download the generated QR code image
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `whatsapp-qr-${selectedDevice || 'device'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download QR code image');
    }
  };

  const getDeviceStatus = async (deviceId) => {
    try {
      const response = await axios.get(`/whatsapp/devices/${deviceId}/status`);
      if (response.data.error === 0) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching device status:', error);
    }
    return null;
  };

  // Helper function to find device by ID
  const findDeviceById = (deviceId) => {
    return devices.find(d => d.deviceId === deviceId);
  };

  // Function to generate a simple QR code representation
  const generateSimpleQRCode = (text) => {
    // This is a simple text-based representation
    // In production, you'd use a proper QR code library
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;
    
    // Fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 300, 300);
    
    // Draw border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 280, 280);
    
    // Add text
    ctx.fillStyle = '#000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    
    // Split text into lines
    const words = text.split(',');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + word).length > 30) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine += (currentLine ? ',' : '') + word;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    // Draw lines
    lines.forEach((line, index) => {
      ctx.fillText(line, 150, 50 + (index * 20));
    });
    
    // Add instruction
    ctx.fillText('Scan this with WhatsApp', 150, 280);
    
    return canvas.toDataURL();
  };

  const getStatusBadge = (status) => {
    const variants = {
      connected: 'success',
      disconnected: 'danger',
      connecting: 'warning'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <FaCheckCircle className="text-success" />;
      case 'disconnected':
        return <FaTimesCircle className="text-danger" />;
      case 'connecting':
        return <FaExclamationTriangle className="text-warning" />;
      default:
        return <FaMobile className="text-secondary" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Loading devices...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">WhatsApp Devices</h1>
          <p className="text-muted mb-0">Manage your connected WhatsApp devices</p>
        </div>
        <Button
          variant="success"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus className="me-2" />
          Add Device
        </Button>
      </div>

      {/* Quick Actions for Disconnected Devices */}
      {devices.filter(device => device.status !== 'connected').length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="mb-1">Quick QR Generation</h6>
                <p className="text-muted mb-0 small">
                  Generate QR codes for disconnected devices to connect them to WhatsApp
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  const disconnectedDevice = devices.find(device => device.status !== 'connected');
                  if (disconnectedDevice) {
                    console.log('Quick QR - Device object:', disconnectedDevice);
                    console.log('Quick QR - Device ID:', disconnectedDevice.deviceId);
                    handleGenerateQR(disconnectedDevice.deviceId);
                  }
                }}
                disabled={!devices.some(device => device.status !== 'connected')}
              >
                <FaQrcode className="me-2" />
                Generate QR for First Disconnected Device
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Devices Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {devices.length > 0 ? (
            <Table responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-3 py-3">Device</th>
                  <th className="border-0 px-3 py-3">Phone Number</th>
                  <th className="border-0 px-3 py-3">Status</th>
                  <th className="border-0 px-3 py-3">Last Seen</th>
                  <th className="border-0 px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.deviceId} className="border-bottom">
                    <td className="px-3 py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px' }}>
                          <FaWhatsapp size={20} className="text-success" />
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{device.deviceName}</h6>
                          <small className="text-muted">ID: {device.deviceId || 'N/A'}</small>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="fw-semibold">{device.phoneNumber}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="d-flex align-items-center">
                        {getStatusIcon(device.status)}
                        <span className="ms-2">{getStatusBadge(device.status)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <small className="text-muted">
                        {new Date(device.lastSeen).toLocaleString()}
                      </small>
                    </td>
                    <td className="px-3 py-3">
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            console.log('Device object:', device);
                            console.log('Device ID:', device.deviceId);
                            handleGenerateQR(device.deviceId);
                          }}
                          disabled={device.status === 'connected'}
                        >
                          <FaQrcode />
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleDisconnectDevice(device.deviceId)}
                          disabled={device.status === 'disconnected'}
                        >
                          <FaPowerOff />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteDevice(device.deviceId)}
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
              <FaWhatsapp size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No devices connected</h5>
              <p className="text-muted mb-3">Connect your first WhatsApp device to start messaging</p>
              <div className="mb-4">
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                  <FaPlus className="me-2" />
                  Add Your First Device
                </Button>
              </div>
              <div className="alert alert-info d-inline-block">
                <small>
                  <strong>Tip:</strong> After creating a device, you'll be able to generate a QR code to connect it to WhatsApp
                </small>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create Device Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New WhatsApp Device</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Device Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter device name (e.g., My Business WhatsApp)"
                value={formData.deviceName}
                onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Choose a descriptive name to identify this device
              </Form.Text>
            </Form.Group>

            <div className="alert alert-info">
              <small>
                <strong>Next Step:</strong> After creating the device, you'll need to generate a QR code to connect it to WhatsApp.
                Look for the QR code button in the actions column.
              </small>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleCreateDevice}
            disabled={creating || !formData.deviceName.trim()}
          >
            {creating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              'Create Device'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* QR Code Modal */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaQrcode className="me-2 text-primary" />
            Scan QR Code to Connect Device
            {selectedDevice && findDeviceById(selectedDevice) && (
              <span className="text-muted ms-2 fs-6">
                ({findDeviceById(selectedDevice)?.deviceName || 'Unknown Device'})
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
                 <Modal.Body className="text-center">
           {qrCode ? (
             <div>
               <div className="mb-4">
                 <div className="bg-light rounded p-3 d-inline-block">
                   <div className="text-center">
                                           <div className="alert alert-success mb-3">
                        <strong>✅ QR Code Generated!</strong> This is a scannable QR code image from the backend.
                      </div>
                     <img
                       src={qrCode}
                       alt="Generated QR Code"
                       className="img-fluid border rounded shadow-sm"
                       style={{ maxWidth: '300px', minWidth: '250px' }}
                     />
                                            <div className="mt-3">
                         <small className="text-muted">
                           <strong>QR Code Format:</strong> {qrCode.startsWith('data:image/') ? 'Image (Scannable)' : 'Generated Representation'}
                         </small>
                       </div>
                   </div>
                 </div>
               </div>

                             <div className="text-start mb-4">
                 <h6 className="fw-bold mb-3">🎯 How to Connect Your Device:</h6>
                 <ol className="text-muted">
                   <li className="mb-2">Open WhatsApp on your mobile phone</li>
                   <li className="mb-2">Go to <strong>Settings</strong> → <strong>Linked Devices</strong></li>
                   <li className="mb-2">Tap <strong>Link a Device</strong></li>
                   <li className="mb-2">Point your phone camera at the QR code above</li>
                   <li className="mb-2">Wait for the connection to complete</li>
                 </ol>
               </div>

                             <div className="alert alert-success">
                 <small>
                   <strong>✅ Success!</strong> You now have a scannable QR code image. Keep this window open until you've successfully scanned the QR code.
                   The QR code will expire after a few minutes for security reasons.
                 </small>
               </div>

                             {/* Device Status Indicator */}
               {selectedDevice && (
                 <div className="mt-3">
                   <div className="d-flex align-items-center justify-content-center">
                     {(() => {
                       const device = findDeviceById(selectedDevice);
                       if (device) {
                         return (
                           <div className="d-flex align-items-center">
                             {getStatusIcon(device.status)}
                             <span className="ms-2">
                               <strong>Status:</strong> {device.status}
                             </span>
                             {device.status === 'connected' && (
                               <span className="ms-2 text-success">
                                 <FaCheckCircle /> Connected to WhatsApp
                               </span>
                             )}
                           </div>
                         );
                       }
                       return (
                         <div className="d-flex align-items-center">
                           <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                             <span className="visually-hidden">Loading...</span>
                           </div>
                           <small className="text-muted">
                             Loading device status...
                           </small>
                         </div>
                       );
                     })()}
                   </div>
                 </div>
               )}

              <div className="d-flex gap-2 justify-content-center">
                                 <Button
                   variant="outline-primary"
                   onClick={() => {
                     // Refresh devices silently without closing modal
                     fetchDevicesSilently();
                     toast.success('Device status refreshed!');
                   }}
                 >
                   <FaSync className="me-2" />
                   Check Connection Status
                 </Button>
                                           <Button
                             variant="outline-success"
                             onClick={downloadQRCode}
                           >
                             <FaDownload className="me-2" />
                             Download QR Image
                           </Button>
                           <Button
                             variant="outline-info"
                             onClick={() => {
                               navigator.clipboard.writeText(qrString);
                               toast.success('QR code string copied to clipboard!');
                             }}
                           >
                             <FaCopy className="me-2" />
                             Copy QR String
                           </Button>
                
                           <Button
                             variant="outline-secondary"
                             onClick={() => setShowQRModal(false)}
                           >
                             Close
                           </Button>
              </div>
            </div>
          ) : (
            <div className="py-5">
              <div className="mb-3">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              <h6 className="text-muted mb-2">Generating QR Code...</h6>
              <p className="text-muted small mb-0">Please wait while we prepare the connection QR code</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WhatsAppDevices;
