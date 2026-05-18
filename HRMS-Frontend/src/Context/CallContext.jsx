import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from './Authcontext';
import { connectSocket, sendCallSignal } from '../api/socket';
import TokenManager from '../Utils/tokenManager';
import webrtcPeer from '../Services/webrtcPeer';
import ringtoneManager from '../Utils/ringtone';

const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  
  const LOGGED_IN_EMAIL = (() => {
    if (user?.email) return user.email.trim().toLowerCase();
    if (user?.userEmail) return user.userEmail.trim().toLowerCase();
    
    try {
      const storedUser = localStorage.getItem('loggedUser');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const email = parsed.email || parsed.userEmail;
        return email ? email.trim().toLowerCase() : null;
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
    return null;
  })();

  const [call, setCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callState, setCallState] = useState('idle');
  const [wsConnected, setWsConnected] = useState(false);
  
  const socketConnected = useRef(false);

  // Helper function to stop ring tone
  const stopRingTone = () => {
    ringtoneManager.stop();
  };

  // Debug: Log call state changes
  useEffect(() => {
    console.log('📞 [CallContext] Call state changed:', {
      call,
      incomingCall,
      callState,
      timestamp: new Date().toISOString()
    });
  }, [call, incomingCall, callState]);

  // Connect WebSocket when user is logged in
  useEffect(() => {
    if (!token || !LOGGED_IN_EMAIL || socketConnected.current) return;
    
    console.log('🔌 [CallContext] Connecting WebSocket globally');
    
    const connectWithRetry = async () => {
      try {
        const activeToken = await TokenManager.getValidToken();
        if (!activeToken) {
          console.error('❌ [CallContext] No valid token available for WebSocket');
          return;
        }

        await connectSocket(
          LOGGED_IN_EMAIL,
          activeToken,
          () => {}, // onPrivateMessage - handled in WorkChat
          () => {}, // onTask
          () => {} // onStatus
        );
        socketConnected.current = true;
        setWsConnected(true);
        console.log('✅ [CallContext] WebSocket connected globally');
      } catch (error) {
        console.error('❌ [CallContext] Failed to connect WebSocket:', error);
      }
    };
    
    connectWithRetry();
  }, [token, LOGGED_IN_EMAIL]);

  // Monitor WebSocket connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = window.stompClient?.connected || false;
      setWsConnected(connected);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle call signals globally
  useEffect(() => {
    const handleCallSignal = async (e) => {
      const data = e.detail;
      const normalizedCurrentUser = LOGGED_IN_EMAIL?.trim().toLowerCase();
      const normalizedToEmail = data.toEmail?.trim().toLowerCase();
      const normalizedFromEmail = data.fromEmail?.trim().toLowerCase();

      console.log('📞 [CallContext] Call signal received:', data, {
        currentUser: normalizedCurrentUser,
        toEmail: normalizedToEmail,
        fromEmail: normalizedFromEmail,
        hasIncomingCallSubscription: !!LOGGED_IN_EMAIL
      });

      try {
        switch (data.action) {
          case 'CALL':
            if (normalizedToEmail === normalizedCurrentUser) {
              console.log('✅ [CallContext] Incoming call for current user');
              setIncomingCall({
                type: data.type.toLowerCase(),
                fromEmail: data.fromEmail,
                callId: data.callId || `call_${Date.now()}`,
                fromName: data.fromName || data.fromEmail
              });
              setCallState('ringing');
              
              // Browser notification
              if (window.Notification && Notification.permission === 'granted') {
                new Notification(`Incoming ${data.type} call`, {
                  body: `From: ${data.fromName || data.fromEmail}`,
                  icon: '/call-icon.png'
                });
              }
              
              // Play ring tone
              ringtoneManager.play();
            }
            break;

          case 'ACCEPT':
            let targetCall = call;
            
            if (!targetCall || targetCall.callId !== data.callId) {
              try {
                const storedCall = localStorage.getItem('ongoingCall');
                if (storedCall) {
                  const parsedCall = JSON.parse(storedCall);
                  if (parsedCall.callId === data.callId) {
                    targetCall = parsedCall;
                    setCall(parsedCall);
                  }
                }
              } catch (e) {
                console.error('Error parsing stored call:', e);
              }
            }
            
            if (targetCall && targetCall.callId === data.callId && targetCall.isInitiator) {
              console.log('✅ [CallContext] Call accepted');
              
              if (targetCall.timeoutId) {
                clearTimeout(targetCall.timeoutId);
              }
              
              setCallState('connected');
              
              const updatedCallData = {
                ...targetCall,
                waitingForAccept: false,
                timeoutId: undefined
              };
              setCall(updatedCallData);
              localStorage.setItem('ongoingCall', JSON.stringify(updatedCallData));
            }
            break;

          case 'REJECT':
            let shouldProcessReject = false;
            let rejectTargetCall = null;
            
            if (call && call.callId === data.callId && call.isInitiator && 
                normalizedFromEmail !== normalizedCurrentUser) {
              shouldProcessReject = true;
              rejectTargetCall = call;
            } else if (incomingCall && incomingCall.callId === data.callId && 
                       normalizedFromEmail === normalizedCurrentUser) {
              shouldProcessReject = true;
            }
            
            if (shouldProcessReject) {
              console.log('✅ [CallContext] Processing REJECT signal');
              
              if (rejectTargetCall?.timeoutId) {
                clearTimeout(rejectTargetCall.timeoutId);
              }
              
              stopRingTone();
              
              setCall(null);
              setIncomingCall(null);
              setCallState('idle');
              localStorage.removeItem('ongoingCall');
              
              if (webrtcPeer) {
                webrtcPeer.close();
              }
            }
            break;

          case 'END':
            let shouldEndCall = false;
            let endTargetCall = null;
            
            if (call && call.callId === data.callId) {
              shouldEndCall = true;
              endTargetCall = call;
            } else if (incomingCall && incomingCall.callId === data.callId) {
              shouldEndCall = true;
            }
            
            if (shouldEndCall) {
              console.log('✅ [CallContext] Processing END signal');
              
              if (endTargetCall?.timeoutId) {
                clearTimeout(endTargetCall.timeoutId);
              }
              
              stopRingTone();
              
              setCall(null);
              setIncomingCall(null);
              setCallState('idle');
              localStorage.removeItem('ongoingCall');
              
              if (webrtcPeer) {
                webrtcPeer.close();
              }
            }
            break;

          case 'OFFER':
            if (data.sdp && webrtcPeer.peerConnection) {
              console.log('📞 Handling OFFER signal...');
              await webrtcPeer.handleOffer(data.sdp);
            } else if (data.sdp && !webrtcPeer.peerConnection) {
              console.warn('⚠️ Received OFFER but peer connection not ready yet (CallScreen not rendered)');
            }
            break;

          case 'ANSWER':
            if (webrtcPeer.peerConnection && data.sdp) {
              console.log('📞 Handling ANSWER signal...');
              await webrtcPeer.handleAnswer(data.sdp);
            } else if (data.sdp && !webrtcPeer.peerConnection) {
              console.warn('⚠️ Received ANSWER but peer connection not ready yet');
            }
            break;

          case 'ICE_CANDIDATE':
            if (data.candidate && webrtcPeer.peerConnection) {
              console.log('🧊 Handling ICE_CANDIDATE signal...');
              await webrtcPeer.handleIceCandidate(
                data.candidate,
                data.sdpMid,
                data.sdpMLineIndex
              );
            } else if (data.candidate && !webrtcPeer.peerConnection) {
              console.warn('⚠️ Received ICE_CANDIDATE but peer connection not ready yet (will be queued)');
              // The webrtcPeer.handleIceCandidate will queue it automatically
              await webrtcPeer.handleIceCandidate(
                data.candidate,
                data.sdpMid,
                data.sdpMLineIndex
              );
            }
            break;

          case 'ADD_PARTICIPANT':
            if (normalizedToEmail === normalizedCurrentUser) {
              console.log('📞 [CallContext] Participant invitation received');
              
              const inviterName = data.participant?.name || data.fromEmail;
              const callType = data.type || 'VOICE';
              
              setIncomingCall({
                type: callType.toLowerCase(),
                fromEmail: data.fromEmail,
                fromName: inviterName,
                callId: data.callId,
                isParticipantInvite: true
              });
              setCallState('ringing');
            }
            break;
        }
      } catch (error) {
        console.error('❌ [CallContext] Error handling call signal:', error);
      }
    };

    window.addEventListener('call_signal', handleCallSignal);
    return () => window.removeEventListener('call_signal', handleCallSignal);
  }, [call, incomingCall, LOGGED_IN_EMAIL]);

  // Call functions
  const startCall = (type, targetUser) => {
    if (!targetUser || !targetUser.email) {
      alert('Please select a user to call');
      return;
    }

    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    console.log(`📞 [CallContext] Starting ${type} call to:`, targetUser.email);
    
    const normalizedFromEmail = LOGGED_IN_EMAIL.trim().toLowerCase();
    const normalizedToEmail = targetUser.email.trim().toLowerCase();
    
    sendCallSignal({
      fromEmail: normalizedFromEmail,
      toEmail: normalizedToEmail,
      type: type.toUpperCase(),
      action: 'CALL',
      callId: callId,
      fromName: user?.name || LOGGED_IN_EMAIL
    });

    const callerCallData = {
      type: type.toLowerCase(),
      user: {
        email: targetUser.email,
        name: targetUser.name || targetUser.email,
        currentUserEmail: LOGGED_IN_EMAIL
      },
      callId: callId,
      isInitiator: true,
      waitingForAccept: true
    };
    
    const timeoutId = setTimeout(() => {
      setCall(currentCall => {
        if (currentCall && currentCall.callId === callId && currentCall.waitingForAccept) {
          console.log('📞 [CallContext] Call timeout - no response, sending END signal to receiver');
          
          // Send END signal to receiver to dismiss their notification
          const normalizedFromEmail = LOGGED_IN_EMAIL.trim().toLowerCase();
          const normalizedToEmail = targetUser.email.trim().toLowerCase();
          
          sendCallSignal({
            fromEmail: normalizedFromEmail,
            toEmail: normalizedToEmail,
            type: type.toUpperCase(),
            action: 'END',
            callId: callId
          });
          
          setCallState('idle');
          localStorage.removeItem('ongoingCall');
          return null;
        }
        return currentCall;
      });
    }, 30000);
    
    const completeCallData = {
      ...callerCallData,
      timeoutId: timeoutId
    };
    
    setCall(completeCallData);
    setCallState('calling');
    localStorage.setItem('ongoingCall', JSON.stringify(completeCallData));
  };

  const acceptCall = () => {
    if (!incomingCall) return;

    console.log('✅ [CallContext] Accepting call');
    
    stopRingTone();
    
    const normalizedFromEmail = LOGGED_IN_EMAIL.trim().toLowerCase();
    const normalizedToEmail = incomingCall.fromEmail.trim().toLowerCase();
    
    sendCallSignal({
      fromEmail: normalizedFromEmail,
      toEmail: normalizedToEmail,
      type: incomingCall.type.toUpperCase(),
      action: 'ACCEPT',
      callId: incomingCall.callId
    });

    const acceptedCallData = {
      type: incomingCall.type,
      user: {
        email: incomingCall.fromEmail,
        name: incomingCall.fromName || incomingCall.fromEmail,
        currentUserEmail: LOGGED_IN_EMAIL
      },
      callId: incomingCall.callId,
      isInitiator: false
    };

    setCall(acceptedCallData);
    setIncomingCall(null);
    setCallState('connected');
    localStorage.setItem('ongoingCall', JSON.stringify(acceptedCallData));
  };

  const rejectCall = () => {
    if (!incomingCall) return;

    console.log('❌ [CallContext] Rejecting call');
    
    stopRingTone();
    
    const normalizedFromEmail = LOGGED_IN_EMAIL.trim().toLowerCase();
    const normalizedToEmail = incomingCall.fromEmail.trim().toLowerCase();
    
    sendCallSignal({
      fromEmail: normalizedFromEmail,
      toEmail: normalizedToEmail,
      type: incomingCall.type.toUpperCase(),
      action: 'REJECT',
      callId: incomingCall.callId
    });

    setIncomingCall(null);
    setCallState('idle');
  };

  const endCall = () => {
    if (!call) return;

    console.log('📞 [CallContext] Ending call');
    
    stopRingTone();
    
    if (call.timeoutId) {
      clearTimeout(call.timeoutId);
    }
    
    const normalizedFromEmail = LOGGED_IN_EMAIL.trim().toLowerCase();
    const normalizedToEmail = call.user.email.trim().toLowerCase();
    
    sendCallSignal({
      fromEmail: normalizedFromEmail,
      toEmail: normalizedToEmail,
      type: call.type.toUpperCase(),
      action: 'END',
      callId: call.callId
    });

    setCall(null);
    setCallState('idle');
    localStorage.removeItem('ongoingCall');
    
    if (webrtcPeer) {
      webrtcPeer.close();
    }
  };

  const value = {
    call,
    incomingCall,
    callState,
    wsConnected,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    setCall,
    setCallState
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export default CallContext;