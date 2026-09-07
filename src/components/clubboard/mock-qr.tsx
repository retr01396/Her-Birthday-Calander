function hashChar(str: string, i: number) {
  let h = 0
  for (let j = 0; j < str.length; j++) {
    h = (h * 31 + str.charCodeAt(j) + i * 7) & 0xffffffff
  }
  return Math.abs(h)
}

export function MockQr({ value, size = 148 }: { value: string; size?: number }) {
  const grid = 11
  const cell = size / grid
  const cells: boolean[] = []
  for (let i = 0; i < grid * grid; i++) {
    cells.push(hashChar(value, i) % 5 < 2)
  }

  const isFinder = (row: number, col: number) =>
    (row < 3 && col < 3) || (row < 3 && col > grid - 4) || (row > grid - 4 && col < 3)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR pass code" className="shrink-0">
      <rect width={size} height={size} fill="white" />
      {Array.from({ length: grid }).map((_, row) =>
        Array.from({ length: grid }).map((_, col) => {
          const idx = row * grid + col
          const finder = isFinder(row, col)
          const filled = finder ? true : cells[idx]
          if (!filled) return null
          return <rect key={`${row}-${col}`} x={col * cell} y={row * cell} width={cell} height={cell} fill="#1e293b" />
        }),
      )}
    </svg>
  )
}
