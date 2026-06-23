import { useRef, useState, useEffect, useCallback } from 'react'
import './App.css'

const DEFAULT_VIDEO_URL =
  'https://rr2---sn-2ocvhc-5o.googlevideo.com/videoplayback?expire=1782261174&ei=VtE6arrrBdCTvcAPqJXwGQ&ip=14.172.174.170&id=o-ANCvd0EG6X2dB140iZb6mSPImA54PMuYpFTLk2mE4_Rx&itag=136&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=157&bui=ARmQxEWKUvARNAhVGfYswzWb5rNGE4xzCzgV7PnNgVU15LmifpVCxrHdzacL73NFKzCf7_-Z0reI8k4t&spc=SQ-umsLM2HQxKFBdZjeWAYobA7yNNdHxLlXFNwWAsU9Y&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=1458909453&dur=15145.000&lmt=1762466066663041&keepalive=yes&fexp=51565116,51565682,51987687&c=ANDROID_VR&txp=5309224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AHEqNM4wRQIgHHxRksRYm1kuikpDov4jmK8CWpaT1wLOwnl2b48r3K8CIQD7ecBV4FbKpsHJLpknVc-CNCMGr7BQ17XOgnMQ_dQDGQ%3D%3D&rm=sn-8qj-nbody7e,sn-8qj-nbodd7z,sn-npokk7z&rrc=79,79,104&req_id=beb4a17d88f2a3ee&rms=nxu,au&redirect_counter=3&cms_redirect=yes&cmsv=e&ipbypass=yes&met=1782239589,&mh=7C&mip=103.133.65.141&mm=30&mn=sn-2ocvhc-5o&ms=nxu&mt=1782237881&mv=m&mvi=2&pl=24&lsparams=cps,ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRAIgAY2tiKTFXwnGDIIHH3amko8sTl9UkJ75yOPiNhI99IUCIC57aTROVxdChs1MDZlZd6TDz1b_afbrNPiWUAchnYcC'

const DEFAULT_AUDIO_URL =
  'https://rr2---sn-2ocvhc-5o.googlevideo.com/videoplayback?expire=1782261174&ei=VtE6arrrBdCTvcAPqJXwGQ&ip=14.172.174.170&id=o-ANCvd0EG6X2dB140iZb6mSPImA54PMuYpFTLk2mE4_Rx&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=157&bui=ARmQxEWKUvARNAhVGfYswzWb5rNGE4xzCzgV7PnNgVU15LmifpVCxrHdzacL73NFKzCf7_-Z0reI8k4t&spc=SQ-umsLM2HQxKFBdZjeWAYobA7yNNdHxLlXFNwWAsU9Y&vprv=1&svpuc=1&mime=audio%2Fmp4&rqh=1&gir=yes&clen=245107058&dur=15145.052&lmt=1762465938173410&keepalive=yes&fexp=51565116,51565682,51987687&c=ANDROID_VR&txp=5318224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AHEqNM4wRQIgZ-5ESI5j8y_M7erV23PZUQn8NNU1XVZlj85kpugC8YsCIQDrrBY6bYWR73lOmiJV2JdUVmjXxyCqlXCgqcwG2hQx1g%3D%3D&rm=sn-8qj-nbody7e,sn-8qj-nbodd7z,sn-npokk7z&rrc=79,79,104&req_id=6412e6eb2924a3ee&rms=nxu,au&redirect_counter=3&cms_redirect=yes&cmsv=e&ipbypass=yes&met=1782239639,&mh=7C&mip=103.133.65.141&mm=30&mn=sn-2ocvhc-5o&ms=nxu&mt=1782237881&mv=m&mvi=2&pl=24&lsparams=cps,ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRQIhAJqVWth8QyRkmEL2Kgf90_HxVRRKRLQ0l7LTFIbejGLtAiARlFMWp8_XDfzhth_qkhDLgGDG_efhtLj6rUdaMbxhmQ%3D%3D'

const SYNC_THRESHOLD = 0.25

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function App() {
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const containerRef = useRef(null)
  const isSeekingRef = useRef(false)
  const syncingRef = useRef(false)

  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL)
  const [audioUrl, setAudioUrl] = useState(DEFAULT_AUDIO_URL)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [audioOffset, setAudioOffset] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [error, setError] = useState(null)
  const [showUrlPanel, setShowUrlPanel] = useState(false)
  const [mediaKey, setMediaKey] = useState(0)

  const isReady = videoReady && audioReady

  const syncAudioToVideo = useCallback(() => {
    const video = videoRef.current
    const audio = audioRef.current
    if (!video || !audio || syncingRef.current) return

    const targetTime = video.currentTime + audioOffset
    const drift = Math.abs(audio.currentTime - targetTime)

    if (drift > SYNC_THRESHOLD) {
      syncingRef.current = true
      audio.currentTime = targetTime
      syncingRef.current = false
    }
  }, [audioOffset])

  const playBoth = useCallback(async () => {
    const video = videoRef.current
    const audio = audioRef.current
    if (!video || !audio) return

    audio.currentTime = video.currentTime + audioOffset

    try {
      await Promise.all([video.play(), audio.play()])
      setIsPlaying(true)
      setError(null)
    } catch (err) {
      setError('Play nahi ho paya. Pehle page par click karein ya URLs check karein.')
      setIsPlaying(false)
    }
  }, [audioOffset])

  const pauseBoth = useCallback(() => {
    videoRef.current?.pause()
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseBoth()
    } else {
      playBoth()
    }
  }, [isPlaying, playBoth, pauseBoth])

  const seekTo = useCallback(
    (time) => {
      const video = videoRef.current
      const audio = audioRef.current
      if (!video || !audio) return

      const clamped = Math.max(0, Math.min(time, duration || video.duration || 0))
      video.currentTime = clamped
      audio.currentTime = clamped + audioOffset
      setCurrentTime(clamped)
    },
    [duration, audioOffset],
  )

  const handleSeekStart = () => {
    isSeekingRef.current = true
  }

  const handleSeekChange = (e) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (isSeekingRef.current) {
      seekTo(time)
    }
  }

  const handleSeekEnd = () => {
    isSeekingRef.current = false
    seekTo(currentTime)
  }

  const toggleFullscreen = async () => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      await container.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const reloadMedia = () => {
    pauseBoth()
    setVideoReady(false)
    setAudioReady(false)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
    setMediaKey((k) => k + 1)
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setCurrentTime(video.currentTime)
        syncAudioToVideo()
      }
    }

    const onLoadedMetadata = () => {
      setDuration(video.duration)
      setVideoReady(true)
    }

    const onEnded = () => {
      pauseBoth()
    }

    const onVideoError = () => {
      setError('Video load nahi hui. URL expire ho sakti hai ya network issue hai.')
      setVideoReady(false)
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('ended', onEnded)
    video.addEventListener('error', onVideoError)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', onVideoError)
    }
  }, [mediaKey, syncAudioToVideo, pauseBoth])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoadedMetadata = () => setAudioReady(true)
    const onAudioError = () => {
      setError('Audio load nahi hui. URL expire ho sakti hai ya network issue hai.')
      setAudioReady(false)
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('error', onAudioError)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('error', onAudioError)
    }
  }, [mediaKey])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume, mediaKey])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        togglePlay()
      }
      if (e.code === 'ArrowRight') seekTo(currentTime + 10)
      if (e.code === 'ArrowLeft') seekTo(currentTime - 10)
      if (e.code === 'KeyF') toggleFullscreen()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [togglePlay, seekTo, currentTime])

  return (
    <div className="app">
      <header className="header">
        <h1>Video + Audio Sync Player</h1>
        <p>Alag video aur audio streams ko sync mein chalata hai</p>
      </header>

      <div className="player-wrapper" ref={containerRef}>
        <div className="video-container">
          <video
            key={`video-${mediaKey}`}
            ref={videoRef}
            className="video"
            src={videoUrl}
            muted
            playsInline
            preload="auto"
            referrerPolicy="no-referrer"
          />

          {!isReady && !error && (
            <div className="overlay loading">
              <div className="spinner" />
              <span>Loading video & audio...</span>
            </div>
          )}

          {error && (
            <div className="overlay error">
              <span>{error}</span>
            </div>
          )}

          <div className="controls">
            <button
              className="btn play-btn"
              onClick={togglePlay}
              disabled={!isReady}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span className="sep">/</span>
              <span>{formatTime(duration)}</span>
            </div>

            <input
              type="range"
              className="seek-bar"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}
              onChange={handleSeekChange}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              disabled={!isReady}
            />

            <div className="volume-group">
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <input
                type="range"
                className="volume-bar"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
            </div>

            <button className="btn" onClick={toggleFullscreen} aria-label="Fullscreen">
              <svg viewBox="0 0 24 24" fill="currentColor">
                {isFullscreen ? (
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                ) : (
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <audio
          key={`audio-${mediaKey}`}
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="settings-panel">
        <button className="panel-toggle" onClick={() => setShowUrlPanel(!showUrlPanel)}>
          {showUrlPanel ? '▲ Settings chhupao' : '▼ Settings / URLs'}
        </button>

        {showUrlPanel && (
          <div className="panel-content">
            <label>
              Video URL
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Video stream URL"
              />
            </label>
            <label>
              Audio URL
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="Audio stream URL"
              />
            </label>
            <label>
              Audio offset (seconds) — agar audio peeche/aage ho
              <input
                type="number"
                step={0.1}
                value={audioOffset}
                onChange={(e) => setAudioOffset(parseFloat(e.target.value) || 0)}
              />
            </label>
            <button className="btn reload-btn" onClick={reloadMedia}>
              Reload Media
            </button>
            <p className="hint">
              Keyboard: Space = play/pause, ← → = 10s seek, F = fullscreen
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
