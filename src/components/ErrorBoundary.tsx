'use client'

import { Component, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Algo deu errado. Tente recarregar a página.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white active:scale-[0.97] transition-all touch-manipulation"
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
