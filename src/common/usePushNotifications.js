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
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Check browser support and existing push subscription on mount
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);

    // Detect if already installed / running in standalone window
    const standaloneMode =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true);
    setIsStandalone(Boolean(standaloneMode));

    if (supported) {
      setPermission(Notification.permission);

      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          setIsSubscribed(Boolean(sub));
        })
        .catch(() => {});
    }

    // Check if global prompt was already captured
    if (typeof window !== 'undefined' && window.__staffEaseInstallPrompt) {
      setDeferredInstallPrompt(window.__staffEaseInstallPrompt);
    }

    const handleInstallable = () => {
      if (window.__staffEaseInstallPrompt) {
        setDeferredInstallPrompt(window.__staffEaseInstallPrompt);
      }
    };

    window.addEventListener('staffease:installable', handleInstallable);
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.__staffEaseInstallPrompt = e;
      setDeferredInstallPrompt(e);
    });

    return () => {
      window.removeEventListener('staffease:installable', handleInstallable);
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

      // Check if permission was already denied by the user
      if (Notification.permission === 'denied') {
        toast.warn(
          'Notifications are blocked in your browser. Click the lock/settings icon next to the URL to allow notifications.',
          { autoClose: 7000 }
        );
        setIsLoading(false);
        return false;
      }

      // 1. Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'denied') {
        toast.warn(
          'Notification permission was blocked. Click the lock/settings icon next to the URL to enable notifications.',
          { autoClose: 7000 }
        );
        setIsLoading(false);
        return false;
      }

      if (perm !== 'granted') {
        toast.info('Notification permission was dismissed.');
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
      toast.success('🔔 Push notifications active! You will now receive alerts even when offline.');
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
   * Triggers the native PWA browser install dialog or opens helpful install guide
   */
  const installApp = useCallback(async () => {
    const prompt = deferredInstallPrompt || window.__staffEaseInstallPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('staffEase app installed successfully!');
        setDeferredInstallPrompt(null);
        window.__staffEaseInstallPrompt = null;
      }
    } else {
      // If native prompt is not active, open modal with browser-specific instructions
      setIsInstallModalOpen(true);
    }
  }, [deferredInstallPrompt]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    isStandalone,
    isInstallable: !isStandalone, // Show unless already installed in standalone window
    isInstallModalOpen,
    setIsInstallModalOpen,
    subscribe,
    unsubscribe,
    installApp,
  };
}
