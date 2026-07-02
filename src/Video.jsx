import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import videojs from 'video.js'
import './Video.css'
import VideoPlayer from './VideoPlayer'

const SPEED_STEP = 0.25
const MIN_SPEED = 0.25
const MAX_SPEED = 4
const SEEK_STEP = 5
const VOLUME_STEP = 0.1

function Video() {
  const playerRef = useRef(null)
  const flashTimer = useRef(null)
  const [speed, setSpeed] = useState(1)
  const [videos, setVideos] = useState([])
  const [selectedSrc, setSelectedSrc] = useState('')
  const [flash, setFlash] = useState(null)
  const selectedSrcRef = useRef('')

  const videoPlayerOptions = useMemo(() => ({
    controls: true,
    responsive: true,
    fluid: true,
  }), [])

  const showFlash = useCallback((icon, text) => {
    setFlash({ icon, text, id: Date.now() })
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 800)
  }, [])

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    if (selectedSrcRef.current) {
      player.src({ src: selectedSrcRef.current, type: 'application/x-mpegURL' })
    }

    player.on("ratechange", () => {
      setSpeed(player.playbackRate());
    });

    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };

  useEffect(() => {
    fetch('/uploads/manifest.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        setVideos(list)
        if (list.length > 0) {
          setSelectedSrc(list[0].src)
          selectedSrcRef.current = list[0].src
        }
      })
      .catch(() => setVideos([]))
  }, [])

  useEffect(() => {
    selectedSrcRef.current = selectedSrc
    const player = playerRef.current
    if (player && selectedSrc) {
      player.src({ src: selectedSrc, type: 'application/x-mpegURL' })
      player.play().catch(() => {})
    }
  }, [selectedSrc])

  useEffect(() => {
    const onKeyDown = (e) => {
      const player = playerRef.current
      if (!player) return

      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key) {
        case ' ':
        case 'Spacebar': {
          e.preventDefault()
          if (player.paused()) {
            player.play()
            showFlash('▶', 'Play')
          } else {
            player.pause()
            showFlash('❚❚', 'Pause')
          }
          break
        }
        case 'f':
        case 'F': {
          e.preventDefault()
          if (player.isFullscreen()) {
            player.exitFullscreen()
          } else {
            player.requestFullscreen()
          }
          break
        }
        case '=':
        case '+': {
          e.preventDefault()
          const next = Math.min(MAX_SPEED, player.playbackRate() + SPEED_STEP)
          player.playbackRate(next)
          showFlash('⏩', `${next.toFixed(2)}x`)
          break
        }
        case '-':
        case '_': {
          e.preventDefault()
          const next = Math.max(MIN_SPEED, player.playbackRate() - SPEED_STEP)
          player.playbackRate(next)
          showFlash('⏪', `${next.toFixed(2)}x`)
          break
        }
        case '0': {
          e.preventDefault()
          player.playbackRate(1)
          showFlash('⭮', '1.00x')
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          const next = Math.min(1, player.volume() + VOLUME_STEP)
          player.volume(next)
          if (player.muted()) player.muted(false)
          showFlash('🔊', `${Math.round(next * 100)}%`)
          break
        }
        case 'ArrowDown': {
          e.preventDefault()
          const next = Math.max(0, player.volume() - VOLUME_STEP)
          player.volume(next)
          showFlash(next === 0 ? '🔇' : '🔉', `${Math.round(next * 100)}%`)
          break
        }
        case 'ArrowRight': {
          e.preventDefault()
          player.currentTime(player.currentTime() + SEEK_STEP)
          showFlash('⏩', '+5s')
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          player.currentTime(Math.max(0, player.currentTime() - SEEK_STEP))
          showFlash('⏪', '-5s')
          break
        }
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showFlash])

  return (
    <div className="vp">
      <header className="vp-header">
        <h1 className="vp-title">
          <span className="vp-logo">▶</span> Video Player
        </h1>
        {videos.length > 0 && (
          <div className="video-picker">
            <span className="video-picker-label">Now playing</span>
            <select
              id="video-select"
              value={selectedSrc}
              onChange={(e) => setSelectedSrc(e.target.value)}
            >
              {videos.map((v, i) => (
                <option key={v.id} value={v.src}>
                  {`Video ${i + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      <div className="video-stage">
        <VideoPlayer
          options={videoPlayerOptions}
          onReady={handlePlayerReady}
        />
        <div className="speed-badge">{speed.toFixed(2)}x</div>
        {flash && (
          <div className="flash" key={flash.id}>
            <span className="flash-icon">{flash.icon}</span>
            <span className="flash-text">{flash.text}</span>
          </div>
        )}
      </div>

      <div className="shortcuts">
        <span><kbd>Space</kbd> Play / Pause</span>
        <span><kbd>←</kbd> <kbd>→</kbd> Seek 5s</span>
        <span><kbd>↑</kbd> <kbd>↓</kbd> Volume</span>
        <span><kbd>F</kbd> Fullscreen</span>
        <span><kbd>=</kbd> <kbd>−</kbd> Speed</span>
        <span><kbd>0</kbd> Normal</span>
      </div>
    </div>
  )
}

export default Video
