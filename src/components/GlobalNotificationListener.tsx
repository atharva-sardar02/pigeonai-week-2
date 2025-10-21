import { useGlobalNotifications } from '../hooks/useGlobalNotifications';

/**
 * GlobalNotificationListener
 * 
 * Component that sets up global notification listening
 * Must be rendered once at the root level (in App.tsx)
 * Listens to ALL conversations and triggers notifications for new messages
 */
export function GlobalNotificationListener() {
  useGlobalNotifications();
  return null; // This component doesn't render anything
}

