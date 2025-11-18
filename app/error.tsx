"use client"
import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
  }, [error])
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Ocorreu um erro.</h2>
      <button className="mt-4 border px-3 py-2 rounded" onClick={() => reset()}>Tentar novamente</button>
    </div>
  )
}