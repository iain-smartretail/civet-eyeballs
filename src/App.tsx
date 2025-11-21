import React, { useState } from 'react'
import './App.css'

function App() {
  const [videoFilename, setVideoFilename] = useState<string | undefined>(undefined)
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined)
  const [maleCount, setMaleCount] = useState(0)
  const [femaleCount, setFemaleCount] = useState(0)
  const [lineSegmentInput, setLineSegmentInput] = useSavedState("civet-eyeballs.lineSegment", '')

  const lineSegmentMatch = lineSegmentInput.matchAll(/([\d.]+)%/g)
  const lineSegment = Array.from(lineSegmentMatch).map(m => parseFloat(m[1]) / 100) as [number, number, number, number]

  if (!videoSrc) {
    return (
      <div className="upload-container" onClick={e => e.currentTarget.querySelector("input")?.click()}>
        <h2>Open a Video File</h2>
        <input
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const url = URL.createObjectURL(file)
              setVideoSrc(url)
              setVideoFilename(file.name)
            }
          }}
        />
      </div>
    )
  }

  return (
    <>
      <p className='subtle'>{videoFilename}</p>
      <Player src={videoSrc} lineSegment={lineSegment.length === 4 ? lineSegment : undefined} />
      <div className="counters">
        <button className="counter" onClick={() => setMaleCount(m => m + 1)}> Male: {maleCount}</button>
        <button className="counter" onClick={() => setFemaleCount(f => f + 1)}> Female: {femaleCount}</button>
      </div>
      <div className='reset'>
        <button className="reset-button" onClick={() => {
          setMaleCount(0)
          setFemaleCount(0)
        }}>Reset Counts</button>
      </div>
      <div className="line-segment-input">
        <label>
          Line Segment
          <input
            type="text"
            value={lineSegmentInput}
            placeholder='(x1%, y1%) -&gt; (x2%, y2%)'
            onChange={(e) => setLineSegmentInput(e.target.value)}
          />
        </label>
      </div>
    </>
  )
}

function Player({ src, lineSegment }: { src?: string, lineSegment?: [number, number, number, number] }) {
  const [width, setWidth] = useState(640)
  const [height, setHeight] = useState(360)

  function handleLoad(e: React.SyntheticEvent<HTMLVideoElement, Event>) {
    const video = e.currentTarget
    setWidth(video.videoWidth)
    setHeight(video.videoHeight)
  }

  const stroke = "red"
  
  return (
    <div className="player" style={{position: 'relative'}}>
      <video src={src} controls onLoad={handleLoad} style={{maxWidth: "100%"}} />
      <svg viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', top: 0, left: 0, pointerEvents: 'none'}}>
        {lineSegment && (
          <>
            <line
              x1={lineSegment[0] * width}
              y1={lineSegment[1] * height}
              x2={lineSegment[2] * width}
              y2={lineSegment[3] * height}
              stroke={stroke}
              strokeWidth={4}
            />
            <ellipse
              cx={lineSegment[0] * width}
              cy={lineSegment[1] * height}
              rx={5}
              ry={5}
              fill={stroke}
            />
            <ellipse
              cx={lineSegment[2] * width}
              cy={lineSegment[3] * height}
              rx={5}
              ry={5}
              fill={stroke}
            />
          </>
        )}
      </svg>
    </div>
  )
}

export default App

function useSavedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        return JSON.parse(saved) as T
      } catch {
        return defaultValue
      }
    }
    return defaultValue
  })

  function setAndSaveState(value: React.SetStateAction<T>) {
    setState(prev => {
      const newValue = typeof value === 'function' ? (value as (prevState: T) => T)(prev) : value
      localStorage.setItem(key, JSON.stringify(newValue))
      return newValue
    })
  }

  return [state, setAndSaveState]
}

