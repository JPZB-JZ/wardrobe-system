import { useEffect, useState } from 'react'

interface Props {
  message: string
  type?: string
}

export default function Toast({ message, type = 'info' }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2200)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  const bg = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-pri' : 'bg-gray-800'

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] animate-bounce-in">
      <div className={`${bg} text-white px-5 py-3 rounded-full text-sm font-semibold shadow-lg`}>
        {message}
      </div>
    </div>
  )
}