import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login')
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')
  const isPublicRoute = req.nextUrl.pathname === '/'

  // Deixa passar rotas de auth e públicas
  if (isApiAuthRoute || isAuthRoute || isPublicRoute) {
    return NextResponse.next()
  }

  // Redireciona para login se não estiver autenticado
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|sw.js|manifest.webmanifest).*)',
  ],
}
