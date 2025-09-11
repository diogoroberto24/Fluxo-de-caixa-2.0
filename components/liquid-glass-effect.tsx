"use client"

import type React from "react"
import { useRef, useState } from "react"

interface LiquidGlassEffectProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  isButton?: boolean
}

export function LiquidGlassEffect({ children, className = "", style, isButton = false }: LiquidGlassEffectProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [ripples, setRipples] = useState<any[]>([])

  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = () => setIsHovering(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = elementRef.current?.getBoundingClientRect()
    if (!rect) return
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = elementRef.current?.getBoundingClientRect()
    if (!rect) return
    setRipples((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    ])
  }

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden rounded-2xl border border-border bg-card/70 shadow-lg backdrop-blur-lg ${
        isButton ? "cursor-pointer select-none" : ""
      } ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
    >
      {/* Blur circular que segue o mouse */}
      {isHovering && (
        <div
          className="absolute pointer-events-none transition-opacity duration-200"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            width: isButton ? "60px" : "80px",
            height: isButton ? "60px" : "80px",
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            filter: "blur(10px)",
            zIndex: 2,
          }}
        />
      )}

      {/* Ripple effect */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: isButton ? "6px" : "4px",
            height: isButton ? "6px" : "4px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.4)",
            transform: "translate(-50%, -50%)",
            animation: "liquidRipple 0.6s ease-out forwards",
          }}
        />
      ))}

      {/* Conteúdo real */}
      <div className="relative z-10 h-full p-1">{children}</div>

      {/* Overlay de brilho */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none z-5" />
    </div>
  )
}
