'use client'

import { Truck, ArrowRight } from 'lucide-react'

interface AuthHeroPanelProps {
  subtitle?: string
}

export function AuthHeroPanel({ subtitle = 'Gestión logística y optimización de rutas para tu empresa' }: AuthHeroPanelProps) {
  return (
    <div className="hidden md:flex md:w-[60%] relative overflow-hidden bg-gradient-to-br from-[#0A1628] to-[#001F3F]">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Ambient glow blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen blur-[100px] opacity-20 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500 rounded-full mix-blend-screen blur-[120px] opacity-10 animate-pulse-slow" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between w-full h-full p-12 lg:p-16 text-white">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide">Transportadora</span>
        </div>

        {/* Center - Animated route visualization */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="relative w-full max-w-2xl h-[400px] animate-float">
            <svg
              className="w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              fill="none"
              viewBox="0 0 600 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M150 100 L 280 150 L 400 120 L 450 200 L 350 280 L 200 250 Z"
                fill="rgba(10, 22, 40, 0.3)"
                stroke="url(#lineGradient)"
                strokeOpacity="0.6"
                strokeWidth="1.5"
              />
              <path
                className="animate-pulse"
                d="M280 150 L 350 280"
                stroke="#22d3ee"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <path
                className="animate-pulse"
                d="M400 120 L 200 250"
                stroke="#22d3ee"
                strokeDasharray="4 4"
                strokeWidth="1"
                style={{ animationDelay: '1s' }}
              />
              {/* Node dots */}
              <g className="animate-pulse">
                <circle cx="280" cy="150" fill="#22d3ee" r="4" />
                <circle cx="280" cy="150" r="12" stroke="#22d3ee" strokeOpacity="0.3" strokeWidth="1" />
              </g>
              <g className="animate-pulse" style={{ animationDelay: '0.5s' }}>
                <circle cx="400" cy="120" fill="#3b82f6" r="4" />
                <circle cx="400" cy="120" r="12" stroke="#3b82f6" strokeOpacity="0.3" strokeWidth="1" />
              </g>
              <g className="animate-pulse" style={{ animationDelay: '1.2s' }}>
                <circle cx="350" cy="280" fill="#22d3ee" r="4" />
                <circle cx="350" cy="280" r="12" stroke="#22d3ee" strokeOpacity="0.3" strokeWidth="1" />
              </g>
              {/* Moving dots along paths */}
              <circle fill="#ffffff" filter="url(#glow)" r="3">
                <animateMotion dur="4s" path="M150 100 L 280 150 L 400 120" repeatCount="indefinite" />
              </circle>
              <circle fill="#ffffff" filter="url(#glow)" r="3">
                <animateMotion dur="5s" path="M450 200 L 350 280 L 200 250" repeatCount="indefinite" />
              </circle>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="lineGradient" x1="150" x2="450" y1="100" y2="280">
                  <stop stopColor="#3b82f6" stopOpacity="0.1" />
                  <stop offset="0.5" stopColor="#22d3ee" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#3b82f6" stopOpacity="0.1" />
                </linearGradient>
                <filter height="200%" id="glow" width="200%" x="-50%" y="-50%">
                  <feGaussianBlur result="coloredBlur" stdDeviation="2.5" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>

            {/* Floating glass cards */}
            <div className="absolute top-[20%] right-[10%] bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-lg text-xs font-mono text-cyan-200 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Ruta Optimizada</span>
              </div>
              <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 w-[85%]" />
              </div>
            </div>

            <div className="absolute bottom-[30%] left-[10%] bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-lg text-xs font-mono text-blue-200 shadow-xl">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Sincronizando flota...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hero text */}
        <div className="max-w-xl">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200">
              Logística Inteligente
            </span>
            <br />
            para el futuro
          </h1>
          <p className="text-lg text-blue-100/80 mb-8 font-light leading-relaxed border-l-2 border-cyan-400 pl-4">
            {subtitle}
          </p>
          <button className="group relative px-8 py-3.5 rounded-full text-white border border-cyan-500/50 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 flex items-center gap-3 w-fit overflow-hidden">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative font-medium tracking-wide">Ver demo</span>
            <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* System status */}
        <div className="absolute bottom-12 right-12">
          <div className="flex items-center gap-2 text-cyan-300/60 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            SYSTEM ONLINE
          </div>
        </div>
      </div>
    </div>
  )
}
