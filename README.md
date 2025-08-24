# Alchemy WhatsApp Frontend

A modern, responsive React frontend for the Alchemy WhatsApp Backend API. Built with Bootstrap CSS for a beautiful and professional user interface.

## Features

- 🔐 **Authentication System** - JWT-based login with role-based access control
- 📱 **WhatsApp Device Management** - Create, connect, and manage WhatsApp devices
- 💬 **Messaging** - Send messages and view message history
- 👥 **Contact Management** - Manage WhatsApp contacts with search and CRUD operations
- 👤 **User Management** - Admin panel for managing system users and permissions
- 📊 **Dashboard** - Overview of system statistics and recent activity
- 🎨 **Modern UI** - Beautiful Bootstrap-based interface with responsive design
- 📱 **Mobile Responsive** - Works perfectly on all device sizes

## Tech Stack

- **Frontend Framework**: React 19
- **CSS Framework**: Bootstrap 5.3.2
- **UI Components**: React Bootstrap
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: React Icons (FontAwesome)
- **Notifications**: React Hot Toast
- **State Management**: React Context API

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Alchemy Backend running (see backend documentation)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alchemy-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Backend API Endpoints

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /auth/login` - User login

### WhatsApp Devices
- `GET /whatsapp/devices` - List devices
- `POST /whatsapp/devices` - Create device
- `POST /whatsapp/generate-qr` - Generate QR code
- `POST /whatsapp/disconnect` - Disconnect device
- `DELETE /whatsapp/devices/:id` - Delete device
- `POST /whatsapp/send-message` - Send message

### Messages
- `GET /messages` - List messages with filters

### Contacts
- `GET /contacts` - List contacts
- `POST /contacts` - Create contact
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact
- `POST /contacts/sync` - Sync contacts

### Users
- `GET /users` - List users
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── Login.js          # Login component
│   ├── dashboard/
│   │   └── Dashboard.js      # Main dashboard
│   ├── whatsapp/
│   │   └── WhatsAppDevices.js # Device management
│   ├── messages/
│   │   └── Messages.js       # Message handling
│   ├── contacts/
│   │   └── Contacts.js       # Contact management
│   ├── users/
│   │   └── Users.js          # User management
│   └── layout/
│       └── Layout.js         # Main layout with navigation
├── context/
│   └── AuthContext.js        # Authentication context
├── App.js                    # Main app component
└── index.js                  # Entry point
```

## Usage

### Login
1. Navigate to the login page
2. Use demo credentials:
   - Email: `admin@example.com`
   - Password: `SecurePassword123!`

### Dashboard
- View system statistics
- Quick access to main features
- Recent device activity

### WhatsApp Devices
1. **Add Device**: Click "Add Device" and provide a name
2. **Connect**: Generate QR code and scan with WhatsApp mobile app
3. **Monitor**: View device status and connection details
4. **Manage**: Disconnect or delete devices as needed

### Messaging
1. **Send Messages**: Select device, recipient, and compose message
2. **View History**: Browse message history with filters
3. **Track Status**: Monitor message delivery and status

### Contacts
1. **Add Contacts**: Manually add new contacts
2. **Sync**: Sync contacts from WhatsApp
3. **Search**: Find contacts quickly with search functionality
4. **Manage**: Edit and delete contacts as needed

### User Management
1. **Create Users**: Add new system users with roles
2. **Set Permissions**: Assign admin or regular user roles
3. **Manage Status**: Activate/deactivate users
4. **Security**: Secure user management with proper validation

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Bootstrap classes for styling
- Implement proper error handling
- Add loading states for better UX

### Adding New Features

1. Create new component in appropriate directory
2. Add route in `App.js`
3. Update navigation in `Layout.js`
4. Implement API integration with proper error handling
5. Add toasts for user feedback

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set `REACT_APP_API_URL` to your production backend URL.

### Static Hosting
The build folder can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3
- GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the backend API documentation
- Review the Swagger docs at `/api/docs`
- Open an issue in the repository

## Screenshots

*Add screenshots of the application here*

---

Built with ❤️ using React and Bootstrap
