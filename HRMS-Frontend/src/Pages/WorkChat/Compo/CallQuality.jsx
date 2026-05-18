import { useState, useEffect, useRef } from "react";
import webrtcPeer from "../../../Services/webrtcPeer";
import "./CallQuality.css";

/**
 * Call quality indicator — shows signal bars and RTT/packet-loss tooltip
 * Polls WebRTC stats every 3 seconds
 */
export default function CallQuality({ participantEmail }) {
  const [quality, setQuality] = useState(null); // "excellent" | "good" | "fair" | "poor" | null
  const [stats, setStats]     = useState(null);
  const [showTip, setShowTip] = useState(false);
  const intervalRef           = useRef(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const pc = participantEmail
          ? webrtcPeer.peerConnections.get(participantEmail)
          : webrtcPeer.peerConnection;

        if (!pc) return;

        const rawStats = await pc.getStats();
        let rtt = null;
        let packetsLost = 0;
        let packetsReceived = 0;

        rawStats.forEach(s => {
          if (s.type === "candidate-pair" && s.state === "succeeded") {
            rtt = s.currentRoundTripTime; // seconds
          }
          if (s.type === "inbound-rtp") {
            packetsLost     += s.packetsLost     || 0;
            packetsReceived += s.packetsReceived || 0;
          }
        });

        const lossRate = packetsReceived > 0
          ? packetsLost / (packetsLost + packetsReceived)
          : 0;

        const rttMs = rtt != null ? Math.round(rtt * 1000) : null;

        setStats({ rttMs, lossRate: Math.round(lossRate * 100) });

        // Classify quality
        if (rttMs == null) {
          setQuality(null);
        } else if (rttMs < 80 && lossRate < 0.01) {
          setQuality("excellent");
        } else if (rttMs < 200 && lossRate < 0.03) {
          setQuality("good");
        } else if (rttMs < 400 && lossRate < 0.08) {
          setQuality("fair");
        } else {
          setQuality("poor");
        }
      } catch (e) {
        // silently ignore
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => clearInterval(intervalRef.current);
  }, [participantEmail]);

  if (!quality) return null;

  const bars = quality === "excellent" ? 4
             : quality === "good"      ? 3
             : quality === "fair"      ? 2
             : 1;

  const color = quality === "excellent" ? "#92c353"
              : quality === "good"      ? "#92c353"
              : quality === "fair"      ? "#f8c537"
              : "#c4314b";

  return (
    <div
      className="call-quality"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      title={`Network: ${quality}`}
    >
      {/* Signal bars */}
      <div className="quality-bars">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="quality-bar"
            style={{
              height: `${i * 4 + 4}px`,
              background: i <= bars ? color : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      {/* Tooltip */}
      {showTip && stats && (
        <div className="quality-tooltip">
          <div className="quality-tooltip-title">Network quality: <strong>{quality}</strong></div>
          {stats.rttMs != null && (
            <div className="quality-tooltip-row">
              <span>Latency</span>
              <span>{stats.rttMs} ms</span>
            </div>
          )}
          <div className="quality-tooltip-row">
            <span>Packet loss</span>
            <span>{stats.lossRate}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
