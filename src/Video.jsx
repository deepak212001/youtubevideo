import { useRef, useEffect, useState, useMemo } from 'react'
import videojs from 'video.js'
import './Video.css'
import VideoPlayer from './VideoPlayer'

const SPEED_STEP = 0.25
const MIN_SPEED = 0.25
const MAX_SPEED = 4
const SEEK_STEP = 5

function Video() {
  const playerRef = useRef(null)
  const [speed, setSpeed] = useState(1)
  const [videos, setVideos] = useState([])
  const [selectedSrc, setSelectedSrc] = useState('')
  const selectedSrcRef = useRef('')

  const videoPlayerOptions = useMemo(() => ({
    controls: true,
    responsive: true,
    fluid: true,
  }), [])

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
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      switch (e.key) {
        case ' ':
        case 'Spacebar': {
          e.preventDefault()
          if (player.paused()) {
            player.play()
          } else {
            player.pause()
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
          break
        }
        case '-':
        case '_': {
          e.preventDefault()
          const next = Math.max(MIN_SPEED, player.playbackRate() - SPEED_STEP)
          player.playbackRate(next)
          break
        }
        case '0': {
          e.preventDefault()
          player.playbackRate(1)
          break
        }
        case 'ArrowRight': {
          e.preventDefault()
          player.currentTime(player.currentTime() + SEEK_STEP)
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          player.currentTime(Math.max(0, player.currentTime() - SEEK_STEP))
          break
        }
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <div>
        <h1>Video player</h1>
      </div>

      {videos.length > 0 && (
        <div className="video-picker">
          <label htmlFor="video-select">Video: </label>
          <select
            id="video-select"
            value={selectedSrc}
            onChange={(e) => setSelectedSrc(e.target.value)}
          >
            {videos.map((v, i) => (
              <option key={v.id} value={v.src}>
                {`Video ${i + 1} (${v.id.slice(0, 8)})`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="video-stage">
        <VideoPlayer
          options={videoPlayerOptions}
          onReady={handlePlayerReady}
        />
        <div className="speed-badge">{speed.toFixed(2)}x</div>
      </div>
    </>
  )
}

export default Video
