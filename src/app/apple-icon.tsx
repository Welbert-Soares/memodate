import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      }}
    >
      <div
        style={{
          fontSize: 110,
          fontWeight: 800,
          color: 'white',
          fontFamily: 'sans-serif',
          lineHeight: 1,
        }}
      >
        M
      </div>
    </div>,
    { ...size },
  )
}
