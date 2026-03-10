import React, { useEffect, useMemo, useState } from "react"
import { Sparkles, RotateCcw, Trophy, Clock3, Flame } from "lucide-react"

const SHINY_RATE = 8192

const STARTERS = [
  { key: "bulbasaur", label: "Bulbasaur" },
  { key: "charmander", label: "Charmander" },
  { key: "squirtle", label: "Squirtle" }
]

function resetsNeeded(prob) {
  return Math.ceil(Math.log(1 - prob) / Math.log((SHINY_RATE - 1) / SHINY_RATE))
}

function formatTime(ms) {
  const sec = Math.floor(ms / 1000)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${s}s`
}

export default function App() {

  const [starter, setStarter] = useState("charmander")
  const [count, setCount] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem("hunt-history")
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (!startTime) return
    const t = setInterval(() => {
      setElapsed(Date.now() - startTime)
    }, 500)
    return () => clearInterval(t)
  }, [startTime])

  const resetsPerHour = useMemo(() => {
    if (elapsed === 0) return 0
    return (count / elapsed) * 3600000
  }, [count, elapsed])

  const shinyChance = useMemo(() => {
    return 1 - Math.pow((SHINY_RATE - 1) / SHINY_RATE, count)
  }, [count])

  const milestones = [
    { label: "25%", value: resetsNeeded(0.25) },
    { label: "50%", value: resetsNeeded(0.5) },
    { label: "90%", value: resetsNeeded(0.9) }
  ]

  function addReset() {
    if (!startTime) setStartTime(Date.now())
    setCount(c => c + 1)
  }

  function resetHunt() {
    setCount(0)
    setStartTime(Date.now())
    setElapsed(0)
  }

  function saveHunt() {
    const entry = {
      starter,
      resets: count,
      time: elapsed,
      date: new Date().toLocaleDateString()
    }

    const updated = [...history, entry]
      .sort((a,b)=>a.resets-b.resets)
      .slice(0,10)

    setHistory(updated)
    localStorage.setItem("hunt-history", JSON.stringify(updated))
  }

  return (

    <div className="min-h-screen bg-slate-950 text-slate-100 p-4">

      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles size={16}/> Starter Hunt Counter
          </div>

          <h1 className="text-xl font-bold mt-1">
            Shiny Starter Tracker
          </h1>
        </div>

        {/* Starter selection */}
        <div className="grid grid-cols-3 bg-slate-800 rounded-xl p-1">
          {STARTERS.map(s => (
            <button
              key={s.key}
              onClick={()=>setStarter(s.key)}
              className={`py-2 rounded-lg text-sm ${
                starter===s.key
                  ? "bg-slate-700 text-white"
                  : "text-slate-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Counter */}
        <div className="grid grid-cols-2 gap-3">

          <div className="bg-orange-950/40 border border-orange-900 rounded-xl p-4">
            <div className="text-xs text-slate-400">Resets</div>
            <div className="text-4xl font-bold">{count}</div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-400">Session</div>
            <div className="text-xl font-bold">
              {formatTime(elapsed)}
            </div>
          </div>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock3 size={14}/> Pace
            </div>
            <div className="text-xl font-bold">
              {resetsPerHour.toFixed(0)}/hr
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Flame size={14}/> Shiny odds
            </div>
            <div className="text-xl font-bold">
              {(shinyChance*100).toFixed(2)}%
            </div>
          </div>

        </div>

        {/* Milestones */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">

          <div className="font-semibold text-sm mb-2">
            Probability milestones
          </div>

          {milestones.map(m => (
            <div key={m.label} className="flex justify-between text-sm text-slate-300">
              <span>{m.label}</span>
              <span>{m.value} resets</span>
            </div>
          ))}

        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">

          <button
            onClick={addReset}
            className="bg-orange-500 hover:bg-orange-400 rounded-xl py-3 font-medium"
          >
            +1 Reset
          </button>

          <button
            onClick={resetHunt}
            className="bg-slate-800 hover:bg-slate-700 rounded-xl py-3 flex items-center justify-center gap-2"
          >
            <RotateCcw size={16}/>
            Reset
          </button>

        </div>

        {/* Save hunt */}
        <button
          onClick={saveHunt}
          className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl py-3 flex items-center justify-center gap-2"
        >
          <Trophy size={16}/>
          Save Hunt
        </button>

        {/* Leaderboard */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">

          <div className="font-semibold mb-2">
            Best Hunts
          </div>

          {history.length===0 && (
            <div className="text-sm text-slate-400">
              No saved hunts yet
            </div>
          )}

          {history.map((h,i)=>(
            <div key={i} className="flex justify-between text-sm text-slate-300">
              <span>{h.starter}</span>
              <span>{h.resets}</span>
            </div>
          ))}

        </div>

      </div>

    </div>

  )
}