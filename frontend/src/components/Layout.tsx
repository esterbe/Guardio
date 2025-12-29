import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"
import { LayoutDashboard, Activity, Cpu } from "lucide-react"

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Machines", href: "/machines", icon: Cpu },
  { name: "Active Check-ins", href: "/active", icon: Activity },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">PC</span>
                </div>
                <span className="text-xl font-bold">Pokemon Center</span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
