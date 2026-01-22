import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, Home, Calculator, PieChart, User, LogIn, Shield } from 'lucide-react'
import { Button } from './ui/Button'
import { useTheme } from '../hooks/useTheme'
import { useAuthStore } from '../stores/authStore'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useEffect } from 'react'

export function Layout() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const { user, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [])

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard'
      case '/rent-vs-own':
        return 'Miete vs. Eigentum'
      case '/budget-planner':
        return 'Budget Planer'
      case '/auth':
        return 'Anmelden'
      case '/profile':
        return 'Profil'
      case '/admin':
        return 'Administration'
      default:
        return 'Finanz Tools'
    }
  }

  useEffect(() => {
    document.title = `${getPageTitle()} | Finanz Tools Schweiz`
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="z-50 min-w-[200px] bg-popover text-popover-foreground rounded-md border p-1 shadow-md animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2">
                    <DropdownMenu.Item asChild>
                      <Link to="/" className="flex items-center px-2 py-2 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm">
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link to="/rent-vs-own" className="flex items-center px-2 py-2 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm">
                        <Calculator className="mr-2 h-4 w-4" />
                        Miete vs. Eigentum
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link to="/budget-planner" className="flex items-center px-2 py-2 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm">
                        <PieChart className="mr-2 h-4 w-4" />
                        Budget Planer
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px bg-border my-1" />

                    {!user && (
                        <DropdownMenu.Item asChild>
                            <Link to="/auth" className="flex items-center px-2 py-2 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm">
                                <LogIn className="mr-2 h-4 w-4" />
                                Anmelden
                            </Link>
                        </DropdownMenu.Item>
                    )}

                    {user && (
                        <>
                            <DropdownMenu.Item asChild>
                                <Link to="/profile" className="flex items-center px-2 py-2 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm">
                                    <User className="mr-2 h-4 w-4" />
                                    Profil
                                </Link>
                            </DropdownMenu.Item>
                            {user.isAdmin && (
                                <DropdownMenu.Item asChild>
                                    <Link to="/admin" className="flex items-center px-2 py-2 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Administration
                                    </Link>
                                </DropdownMenu.Item>
                            )}
                        </>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-primary leading-tight">{getPageTitle()}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Schweizer Finanz-Tools</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                    <Link to={user ? "/profile" : "/auth"}>
                        {user ? <User className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                    </Link>
                </Button>

                <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="dark:ring-1 dark:ring-border"
                aria-label={theme === 'light' ? 'Zu Dark Mode wechseln' : 'Zu Light Mode wechseln'}
                >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-6 bg-card mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Finanz Tools Schweiz © 2026</p>
        </div>
      </footer>
    </div>
  )
}
