import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Memodate',
    short_name: 'Memodate',
    description: 'Lembretes de datas importantes',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icone_memodate.webp',
        sizes: '512x512',
        type: 'image/webp',
        purpose: 'any',
      },
      {
        src: '/icone_memodate.webp',
        sizes: '512x512',
        type: 'image/webp',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Novo evento',
        short_name: 'Novo',
        description: 'Criar um novo evento',
        url: '/dashboard/events/new',
        icons: [{ src: '/icone_memodate.webp', sizes: '512x512' }],
      },
      {
        name: 'Meus eventos',
        short_name: 'Início',
        description: 'Ver seus eventos',
        url: '/dashboard',
        icons: [{ src: '/icone_memodate.webp', sizes: '512x512' }],
      },
    ],
  }
}
