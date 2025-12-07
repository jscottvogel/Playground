import { ConsoleLogger } from 'aws-amplify/utils';

// Log Levels: DEBUG, INFO, WARN, ERROR
// Amplify Logger defaults to INFO level.

/**
 * Logger for Authentication and Review State logic
 */
export const AuthLogger = new ConsoleLogger('Auth');

/**
 * Logger for Admin Dashboard and CRUD operations
 */
export const AdminLogger = new ConsoleLogger('AdminDashboard');

/**
 * Logger for Guest Gateway and entry logic
 */
export const GuestLogger = new ConsoleLogger('GuestGateway');

/**
 * Logger for Chatbot interactions
 */
export const ChatLogger = new ConsoleLogger('MeetMeBot');

/**
 * Logger for Project Gallery data fetching
 */
export const GalleryLogger = new ConsoleLogger('ProjectGallery');

/**
 * Logger for System/Global events (like ErrorBoundary)
 */
export const SystemLogger = new ConsoleLogger('System');
