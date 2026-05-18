import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaPhoneSlash } from "react-icons/fa";
import "./CallLobby.css";

/**
 * Pre-join lobby — shown before entering a call.
 * Lets the user preview their camera/mic and choose devices.
 */
export default function CallLobby({ callerName, callType, onJoin, onDecline, isIncoming }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [micOn, setMicOn]   = useState(true);
  const [camOn, setCamOn]   = useState(callType === "video");
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selAudio, setSelAudio] = useState("");
  const [selVideo, setSelVideo] = useState("");
  const [error, setError]   = useState(null);
  const [ready, setReady]   = useState(false);

  // Start preview stream
  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioIn = devices.filter(d => d.kind === "audioinput");
        const videoIn = devices.filter(d => d.kind === "videoinput");
        setAudioDevices(audioIn);
        setVideoDevices(videoIn);
        if (audioIn[0]) setSelAudio(audioIn[0].deviceId);
        if (videoIn[0]) setSelVideo(videoIn[0].deviceId);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });

        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      } catch (e) {
        if (active) setError("Could not access camera/microphone. Check permissions.");
      }
    };

    start();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [callType]);

  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = next; });
  };

  const toggleCam = () => {
    const next = !camOn;
    setCamOn(next);
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = next; });
  };

  const handleJoin = () => {
    // Stop preview — CallScreen will start its own stream
    streamRef.current?.getTracks().forEach(t => t.stop());
    onJoin({ micOn, camOn, selAudio, selVideo });
  };

  const handleDecline = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    onDecline();
  };

  const initials = (s) => (s || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="lobby-overlay">
      <div className="lobby-card">
        {/* Header */}
        <div className="lobby-header">
          <div className="lobby-caller-avatar">{initials(callerName)}</div>
          <div className="lobby-caller-info">
            <span className="lobby-caller-name">{callerName}</span>
            <span className="lobby-call-type">
              {isIncoming
                ? `Incoming ${callType === "video" ? "video" : "voice"} call`
                : `${callType === "video" ? "Video" : "Voice"} call`}
            </span>
          </div>
        </div>

        {/* Preview */}
        <div className="lobby-preview">
          {callType === "video" && camOn ? (
            <video ref={videoRef} autoPlay muted playsInline className="lobby-video" />
          ) : (
            <div className="lobby-no-video">
              <div className="lobby-avatar-large">{initials(callerName)}</div>
              <p>{callType === "video" ? "Camera is off" : "Voice call"}</p>
            </div>
          )}

          {/* Preview controls */}
          <div className="lobby-preview-controls">
            <button
              className={`lobby-ctrl-btn${!micOn ? " lobby-ctrl-off" : ""}`}
              onClick={toggleMic}
              title={micOn ? "Mute microphone" : "Unmute microphone"}
            >
              {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>
            {callType === "video" && (
              <button
                className={`lobby-ctrl-btn${!camOn ? " lobby-ctrl-off" : ""}`}
                onClick={toggleCam}
                title={camOn ? "Turn off camera" : "Turn on camera"}
              >
                {camOn ? <FaVideo /> : <FaVideoSlash />}
              </button>
            )}
          </div>
        </div>

        {/* Device selectors */}
        <div className="lobby-devices">
          <div className="lobby-device-row">
            <label>🎤 Microphone</label>
            <select value={selAudio} onChange={e => setSelAudio(e.target.value)}>
              {audioDevices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone ${d.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          </div>
          {callType === "video" && (
            <div className="lobby-device-row">
              <label>📹 Camera</label>
              <select value={selVideo} onChange={e => setSelVideo(e.target.value)}>
                {videoDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && <p className="lobby-error">{error}</p>}

        {/* Action buttons */}
        <div className="lobby-actions">
          <button className="lobby-decline-btn" onClick={handleDecline}>
            <FaPhoneSlash /> {isIncoming ? "Decline" : "Cancel"}
          </button>
          <button className="lobby-join-btn" onClick={handleJoin} disabled={!ready && !error}>
            <FaPhone /> {isIncoming ? "Accept" : "Join now"}
          </button>
        </div>
      </div>
    </div>
  );
}
