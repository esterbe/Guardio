import { Moon, Sun, Monitor } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheme } from "@/hooks/useTheme"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Select value={theme} onValueChange={(value: "dark" | "light" | "system") => setTheme(value)}>
      <SelectTrigger className="w-[130px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            {theme === "light" && <Sun className="h-4 w-4" />}
            {theme === "dark" && <Moon className="h-4 w-4" />}
            {theme === "system" && <Monitor className="h-4 w-4" />}
            <span className="capitalize">{theme}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>System</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
