/**
 * ===========================================
 *  Web Push Notifications & PWA Installation Hook
 * ===========================================
 *
 * Provides:
 *  - Native Web Push subscription lifecycle (subscribe/unsubscribe)
 *  - Browser permission status tracking
 *  - PWA "Install staffEase App" desktop/mobile installation trigger
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../Api/ApiClient';
import { toast } from 'react-toastify';

/**
 * Converts a URL-safe Base64 public VAPID key into a Uint8Array
 * required by the browser's PushManager.
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Check browser support and existing push subscription on mount
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);

      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(Boolean(sub));
        });
      });
    }

    // Capture PWA install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  /**
   * Subscribes the user to Native Web Push Notifications
   */
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.info('Push notifications are not supported on this browser.');
      return false;
    }

    try {
      setIsLoading(true);

      // 1. Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.warn('Notification permission was not granted.');
        setIsLoading(false);
        return false;
      }

      // 2. Fetch public VAPID key from backend
      const res = await apiClient.get('/notifications/push/public-key');
      const publicKey = res.data?.data?.publicKey;

      if (!publicKey) {
        throw new Error('VAPID public key not received from server.');
      }

      // 3. Register push manager subscription
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(publicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      // 4. Send subscription credentials to backend database
      await apiClient.post('/notifications/push/subscribe', {
        subscription: subscription.toJSON(),
      });

      setIsSubscribed(true);
      toast.success('🔔 Push notifications enabled! You will now receive alerts even when offline.');
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Push notification subscription error:', err);
      toast.error('Failed to enable push notifications.');
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  /**
   * Unsubscribes the user from Web Push Notifications
   */
  const unsubscribe = useCallback(async () => {
    try {
      setIsLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await apiClient.post('/notifications/push/unsubscribe', {
          endpoint: subscription.endpoint,
        });
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      toast.info('Push notifications disabled.');
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Push unsubscribe error:', err);
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Triggers the native PWA browser install dialog (Desktop taskbar or Mobile homescreen)
   */
  const installApp = useCallback(async () => {
    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success('staffEase app installed successfully!');
      setIsInstallable(false);
      setDeferredInstallPrompt(null);
    }
  }, [deferredInstallPrompt]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    isInstallable,
    subscribe,
    unsubscribe,
    installApp,
  };
}
