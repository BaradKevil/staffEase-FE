/**
 * ===========================================
 *  staffEase WebRTC Audio & Video Call Context
 * ===========================================
 *
 * Provides real-time peer-to-peer and group audio/video calling:
 *  - Native WebRTC RTCPeerConnection with Google STUN servers.
 *  - Socket.IO signaling for SDP Offers, Answers, and ICE Candidates.
 *  - Device media acquisition (camera, microphone, and screen share).
 *  - Multi-peer connection management for group conference calls.
 *  - In-call state tracking (audio mute, video pause, call timer).
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { playIncomingRingtone, stopRingtone } from '../utils/ringtone';
import { toast } from 'react-toastify';

const CallContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
};

export const CallProvider = ({ children }) => {
  const { socket } = useSocket();

  // Call session state
  const [callState, setCallState] = useState({
    status: 'idle', // 'idle' | 'calling' | 'incoming' | 'connected' | 'ended'
    callId: null,
    conversationId: null,
    targetUserId: null,
    isGroup: false,
    callType: 'voice', // 'voice' | 'video'
    title: '',
    caller: null,
  });

  // Media streams & controls
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { [userId: number]: MediaStream }
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [peerMediaStates, setPeerMediaStates] = useState({}); // { [userId: number]: { isMuted?: boolean, isVideoOff?: boolean, isScreenSharing?: boolean } }
  const [callDuration, setCallDuration] = useState(0);

  // References
  const peerConnectionsRef = useRef(new Map()); // Map<number, RTCPeerConnection>
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const originalVideoTrackRef = useRef(null);
  const callStateRef = useRef(callState);
  callStateRef.current = callState;

  // Sync localStream to ref
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // Duration counter when connected
  useEffect(() => {
    if (callState.status !== 'connected') {
      setCallDuration(0);
      return;
    }

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callState.status]);

  /**
   * Helper to clean up all peer connections & hardware tracks
   */
  const cleanupMediaAndPeers = useCallback(() => {
    stopRingtone();

    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
    }

    if (screenTrackRef.current) {
      try {
        screenTrackRef.current.stop();
      } catch {
        // ignore
      }
      screenTrackRef.current = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => {
      try {
        pc.close();
      } catch {
        // ignore
      }
    });
    peerConnectionsRef.current.clear();

    setLocalStream(null);
    setRemoteStreams({});
    setPeerMediaStates({});
    originalVideoTrackRef.current = null;
    setIsMicMuted(false);
    setIsCamOff(false);
    setIsScreenSharing(false);
  }, []);

  /**
   * Creates or retrieves an RTCPeerConnection for a specific remote peer.
   */
  const getOrCreatePeerConnection = useCallback((peerUserId, callId) => {
    if (peerConnectionsRef.current.has(peerUserId)) {
      return peerConnectionsRef.current.get(peerUserId);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to the connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('call:webrtc-signal', {
          callId,
          toUserId: peerUserId,
          signal: { type: 'candidate', candidate: event.candidate },
        });
      }
    };

    // Handle remote track received
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        setRemoteStreams((prev) => ({
          ...prev,
          [peerUserId]: remoteStream,
        }));
      }
    };

    // Handle connection state change
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[peerUserId];
          return next;
        });
      }
    };

    peerConnectionsRef.current.set(peerUserId, pc);
    return pc;
  }, [socket]);

  /**
   * 1. Start a call (Initiator)
   */
  const startCall = useCallback(async ({ conversationId, targetUserId, isGroup = false, callType = 'video', title = '' }) => {
    try {
      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Request media permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: 30 } : false,
      });

      setLocalStream(stream);
      localStreamRef.current = stream;

      const newState = {
        status: 'calling',
        callId,
        conversationId,
        targetUserId,
        isGroup,
        callType,
        title,
        caller: null,
      };
      setCallState(newState);

      // Emit initiation to Socket.IO signaling server
      if (socket) {
        socket.emit('call:initiate', {
          callId,
          conversationId,
          callType,
          targetUserId,
          isGroup,
          title,
        });
      }
    } catch (err) {
      console.error('Failed to get media devices:', err);
      toast.error('Unable to access camera or microphone. Please check permissions.');
      cleanupMediaAndPeers();
      setCallState({ status: 'idle', callId: null, conversationId: null, targetUserId: null, isGroup: false, callType: 'voice', title: '', caller: null });
    }
  }, [socket, cleanupMediaAndPeers]);

  /**
   * 2. Accept an incoming call (Recipient)
   */
  const acceptCall = useCallback(async () => {
    const current = callStateRef.current;
    if (!current.callId) return;

    stopRingtone();

    try {
      // Request media permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: current.callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: 30 } : false,
      });

      setLocalStream(stream);
      localStreamRef.current = stream;

      setCallState((prev) => ({ ...prev, status: 'connected' }));

      if (socket) {
        socket.emit('call:accept', {
          callId: current.callId,
          conversationId: current.conversationId,
          targetUserId: current.caller?.id,
        });
      }
    } catch (err) {
      console.error('Failed to accept call:', err);
      toast.error('Could not access microphone or camera to answer the call.');
      cleanupMediaAndPeers();
      setCallState({ status: 'idle', callId: null, conversationId: null, targetUserId: null, isGroup: false, callType: 'voice', title: '', caller: null });
    }
  }, [socket, cleanupMediaAndPeers]);

  /**
   * 3. Decline/Reject incoming call
   */
  const rejectCall = useCallback(() => {
    const current = callStateRef.current;
    stopRingtone();

    if (socket && current.callId) {
      socket.emit('call:reject', {
        callId: current.callId,
        conversationId: current.conversationId,
        targetUserId: current.caller?.id,
        reason: 'declined',
      });
    }

    cleanupMediaAndPeers();
    setCallState({ status: 'idle', callId: null, conversationId: null, targetUserId: null, isGroup: false, callType: 'voice', title: '', caller: null });
  }, [socket, cleanupMediaAndPeers]);

  /**
   * 4. End or Leave active call
   */
  const endCall = useCallback(() => {
    const current = callStateRef.current;
    if (socket && current.callId) {
      socket.emit('call:end', {
        callId: current.callId,
        conversationId: current.conversationId,
      });
    }

    cleanupMediaAndPeers();
    setCallState({ status: 'idle', callId: null, conversationId: null, targetUserId: null, isGroup: false, callType: 'voice', title: '', caller: null });
    toast.info('Call ended');
  }, [socket, cleanupMediaAndPeers]);

  /**
   * Toggle local microphone
   */
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks.forEach((t) => (t.enabled = nextState));
        setIsMicMuted(!nextState);

        if (socket && callStateRef.current.callId) {
          socket.emit('call:toggle-media', {
            callId: callStateRef.current.callId,
            isMuted: !nextState,
          });
        }
      }
    }
  }, [socket]);

  /**
   * Toggle local camera
   */
  const toggleCam = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks.forEach((t) => (t.enabled = nextState));
        setIsCamOff(!nextState);

        if (socket && callStateRef.current.callId) {
          socket.emit('call:toggle-media', {
            callId: callStateRef.current.callId,
            isVideoOff: !nextState,
          });
        }
      }
    }
  }, [socket]);

  /**
   * Toggle Screen Sharing (Full-System Entire Screen)
   */
  const toggleScreenShare = useCallback(async () => {
    const current = callStateRef.current;
    if (current.status !== 'connected') {
      toast.warn('Screen sharing is only available once the call is connected.');
      return;
    }
    if (current.callType !== 'video') {
      toast.warn('Screen sharing is only available during video calls.');
      return;
    }

    if (isScreenSharing) {
      // Revert back to original camera track
      if (originalVideoTrackRef.current) {
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(originalVideoTrackRef.current);
          }
        });

        if (localStreamRef.current) {
          const audioTracks = localStreamRef.current.getAudioTracks();
          const revertedStream = new MediaStream([...audioTracks, originalVideoTrackRef.current]);
          setLocalStream(revertedStream);
          localStreamRef.current = revertedStream;
        }
      }

      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }

      setIsScreenSharing(false);

      if (socket && current.callId) {
        socket.emit('call:toggle-media', {
          callId: current.callId,
          isScreenSharing: false,
        });
      }
      return;
    }

    try {
      // W3C Screen Capture API configured to request the ENTIRE system/screen:
      // displaySurface: 'monitor' automatically directs the browser to the "Entire Screen" option
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          cursor: 'always',
          width: { ideal: 1920, max: 2560 },
          height: { ideal: 1080, max: 1440 },
          frameRate: { ideal: 30 },
        },
        audio: true,
        systemAudio: 'include',
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'include',
        preferCurrentTab: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) {
        toast.error('No video track found in screen capture.');
        return;
      }
      screenTrackRef.current = screenTrack;

      // Save original camera video track
      if (localStreamRef.current) {
        const currentVideoTracks = localStreamRef.current.getVideoTracks();
        if (currentVideoTracks.length > 0) {
          originalVideoTrackRef.current = currentVideoTracks[0];
        }
      }

      // Replace video track in all active peer connections
      peerConnectionsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      // Update local preview with the screen share stream
      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        const screenMediaStream = new MediaStream([...audioTracks, screenTrack]);
        setLocalStream(screenMediaStream);
        localStreamRef.current = screenMediaStream;
      }

      setIsScreenSharing(true);

      if (socket && current.callId) {
        socket.emit('call:toggle-media', {
          callId: current.callId,
          isScreenSharing: true,
        });
      }

      // Handle user stopping screen share via browser's native floating bar
      screenTrack.onended = () => {
        if (originalVideoTrackRef.current) {
          peerConnectionsRef.current.forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
            if (sender) {
              sender.replaceTrack(originalVideoTrackRef.current);
            }
          });

          if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            const revertedStream = new MediaStream([...audioTracks, originalVideoTrackRef.current]);
            setLocalStream(revertedStream);
            localStreamRef.current = revertedStream;
          }
        }
        screenTrackRef.current = null;
        setIsScreenSharing(false);

        if (socket && current.callId) {
          socket.emit('call:toggle-media', {
            callId: current.callId,
            isScreenSharing: false,
          });
        }
      };
    } catch (err) {
      console.warn('Screen share cancelled or failed:', err);
    }
  }, [isScreenSharing, socket]);

  // -------------------------------------------------------------
  //  Socket Event Listeners for Call Lifecycle & Signaling
  // -------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    // 1. Incoming Call Notification
    const handleIncomingCall = (payload) => {
      const current = callStateRef.current;
      // If already in a call, reject as busy
      if (current.status !== 'idle') {
        socket.emit('call:reject', {
          callId: payload.callId,
          targetUserId: payload.caller?.id,
          reason: 'busy',
        });
        return;
      }

      setCallState({
        status: 'incoming',
        callId: payload.callId,
        conversationId: payload.conversationId,
        targetUserId: payload.caller?.id,
        isGroup: payload.isGroup,
        callType: payload.callType,
        title: payload.title || payload.caller?.name,
        caller: payload.caller,
      });

      playIncomingRingtone();
    };

    // 2. Call Accepted
    const handleCallAccepted = async (payload) => {
      stopRingtone();
      setCallState((prev) => ({ ...prev, status: 'connected' }));

      // If we are the caller, create offer for this joined peer
      if (payload?.user?.id && localStreamRef.current) {
        const peerId = Number(payload.user.id);
        const pc = getOrCreatePeerConnection(peerId, payload.callId);

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit('call:webrtc-signal', {
            callId: payload.callId,
            toUserId: peerId,
            signal: { type: 'offer', sdp: offer },
          });
        } catch (err) {
          console.error('Failed to create WebRTC offer:', err);
        }
      }
    };

    // 3. User joined conference (for group calling)
    const handleUserJoined = async (payload) => {
      if (payload?.user?.id && localStreamRef.current) {
        const peerId = Number(payload.user.id);
        const pc = getOrCreatePeerConnection(peerId, payload.callId);

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit('call:webrtc-signal', {
            callId: payload.callId,
            toUserId: peerId,
            signal: { type: 'offer', sdp: offer },
          });
        } catch (err) {
          console.error('Failed to create offer for joined user:', err);
        }
      }
    };

    // 4. Call Rejected
    const handleCallRejected = (payload) => {
      stopRingtone();
      toast.info(payload.reason === 'busy' ? 'User is busy on another call.' : 'Call was declined.');
      cleanupMediaAndPeers();
      setCallState({ status: 'idle', callId: null, conversationId: null, targetUserId: null, isGroup: false, callType: 'voice', title: '', caller: null });
    };

    // 5. Call Ended
    const handleCallEnded = () => {
      stopRingtone();
      toast.info('Call ended');
      cleanupMediaAndPeers();
      setCallState({ status: 'idle', callId: null, conversationId: null, targetUserId: null, isGroup: false, callType: 'voice', title: '', caller: null });
    };

    // 6. WebRTC P2P Signaling Message
    const handleWebRTCSignal = async (payload) => {
      const { fromUserId, signal, callId } = payload;
      const pc = getOrCreatePeerConnection(fromUserId, callId);

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('call:webrtc-signal', {
            callId,
            toUserId: fromUserId,
            signal: { type: 'answer', sdp: answer },
          });
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } else if (signal.type === 'candidate') {
          if (signal.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
      } catch (err) {
        console.warn('WebRTC signal handling error:', err);
      }
    };

    const handleMediaStateChanged = (payload) => {
      setPeerMediaStates((prev) => ({
        ...prev,
        [payload.userId]: {
          ...(prev[payload.userId] || {}),
          ...(payload.isMuted !== undefined ? { isMuted: payload.isMuted } : {}),
          ...(payload.isVideoOff !== undefined ? { isVideoOff: payload.isVideoOff } : {}),
          ...(payload.isScreenSharing !== undefined ? { isScreenSharing: payload.isScreenSharing } : {}),
        },
      }));
    };

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:user-joined', handleUserJoined);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:ended', handleCallEnded);
    socket.on('call:webrtc-signal', handleWebRTCSignal);
    socket.on('call:media-state-changed', handleMediaStateChanged);

    return () => {
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:user-joined', handleUserJoined);
      socket.off('call:rejected', handleCallRejected);
      socket.off('call:ended', handleCallEnded);
      socket.off('call:webrtc-signal', handleWebRTCSignal);
      socket.off('call:media-state-changed', handleMediaStateChanged);
    };
  }, [socket, getOrCreatePeerConnection, cleanupMediaAndPeers]);

  const value = {
    callState,
    localStream,
    remoteStreams,
    peerMediaStates,
    isMicMuted,
    isCamOff,
    isScreenSharing,
    callDuration,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCam,
    toggleScreenShare,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export default CallContext;
