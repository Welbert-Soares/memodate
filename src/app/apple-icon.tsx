import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  const imgData = readFileSync(join(process.cwd(), 'public', 'icone_memodate.webp'))
  const base64 = `data:image/webp;base64,${imgData.toString('base64')}`

  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img src={base64} alt="Memodate" style={{ width: '100%', height: '100%' }} />,
    { ...size },
  )
}
