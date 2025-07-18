# Threat Intelligence Platform - Frontend

A modern React-based frontend for the Threat Intelligence Platform with beautiful UI/UX.

## Features

### 🎨 Modern UI/UX
- **Clean Design**: Modern, professional interface with Tailwind CSS
- **Interactive Animations**: Smooth transitions and micro-interactions using Framer Motion
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Theme Ready**: Built with theme support

### 📊 Dashboard
- **Real-time Statistics**: Live threat intelligence metrics
- **Interactive Charts**: Beautiful charts showing threat trends and analytics
- **Threat Timeline**: Visual representation of threat activity over time
- **Feed Status Monitor**: Real-time monitoring of threat feed health

### 🛡️ IOC Management
- **Advanced Search**: Powerful search and filtering capabilities
- **Bulk Operations**: Import/export and bulk management of IOCs
- **Real-time Validation**: Instant IOC format validation
- **Detailed Views**: Comprehensive IOC information display

### 📡 Feed Management
- **Visual Feed Setup**: Easy-to-use forms for configuring threat feeds
- **Performance Monitoring**: Real-time feed performance metrics
- **Update Scheduling**: Configure automatic feed updates
- **Error Handling**: Clear error reporting and resolution guidance

### 📈 Analytics
- **Interactive Charts**: Multiple chart types for data visualization
- **Export Capabilities**: Download reports and analytics
- **Custom Dashboards**: Configurable dashboard layouts
- **Real-time Updates**: Live data updates without page refresh

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Unstyled, accessible UI components
- **Framer Motion**: Production-ready motion library
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing
- **React Hook Form**: Performant forms with validation
- **Recharts**: Beautiful charts and data visualization
- **Axios**: HTTP client for API communication
- **React Hot Toast**: Beautiful notifications

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   ├── ui/             # Basic UI components
│   │   ├── forms/          # Form components
│   │   └── charts/         # Chart components
│   ├── pages/              # Page components
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── iocs/           # IOC management pages
│   │   ├── feeds/          # Feed management pages
│   │   └── analytics/      # Analytics pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service functions
│   ├── utils/              # Utility functions
│   ├── contexts/           # React contexts
│   └── App.jsx             # Main app component
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## API Integration

The frontend automatically connects to the backend API running on `http://localhost:8000`. The API integration includes:

- **Automatic Retries**: Failed requests are automatically retried
- **Error Handling**: Graceful error handling with user-friendly messages
- **Caching**: Intelligent caching of API responses
- **Real-time Updates**: Live data updates using React Query

## Key Components

### Dashboard Components
- `Dashboard.jsx` - Main dashboard layout
- `StatsCards.jsx` - Statistics cards with metrics
- `ThreatTimeline.jsx` - Interactive threat timeline chart
- `FeedStatus.jsx` - Real-time feed status monitoring
- `ThreatMap.jsx` - Geographic threat distribution

### IOC Management
- `IOCsPage.jsx` - Main IOC management interface
- `IOCsTable.jsx` - Sortable, filterable IOC table
- `IOCsFilters.jsx` - Advanced filtering interface
- `AddIOCModal.jsx` - IOC creation modal
- `BulkImportModal.jsx` - Bulk IOC import interface

### Feed Management
- `FeedsPage.jsx` - Feed management interface
- `FeedsTable.jsx` - Feed status and management table
- `AddFeedModal.jsx` - New feed creation modal
- `FeedDetailsModal.jsx` - Detailed feed information

## Customization

### Theming
The application uses Tailwind CSS with custom color schemes. Modify `tailwind.config.js` to customize:
- Color palettes
- Typography
- Spacing
- Animations

### Adding New Features
1. Create components in appropriate directories
2. Add API service functions in `src/services/`
3. Create custom hooks in `src/hooks/` if needed
4. Update routing in `App.jsx`

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Deployment

### Production Build
```bash
npm run build
```

The build files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Docker Deployment
A Dockerfile is included for containerized deployment.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
