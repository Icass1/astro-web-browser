import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

interface ModeToggleProps {
  className?: string; // Optional string type for className prop
}

const ModeToggle: React.FC<ModeToggleProps> = ({ className }) => {
  const [theme, setThemeState] = useState<
    "theme-light" | "dark" | "system"
  >("theme-light");

  const [darkTheme, setDarkTheme] = useState<boolean>()

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setThemeState(isDarkMode ? "dark" : "theme-light");
  }, []);

  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList[isDark ? "add" : "remove"]("dark");
    setDarkTheme(isDark)
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className} variant="outline" size="icon">
          {darkTheme ?
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            :
            <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          }
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="p-0">
          <Button onClick={() => setThemeState("theme-light")} variant='ghost' className="hover:bg-muted w-full">Light</Button>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-0">
          <Button onClick={() => setThemeState("dark")} variant='ghost' className="hover:bg-muted w-full">Dark</Button>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-0">
          <Button onClick={() => setThemeState("system")} variant='ghost' className="hover:bg-muted w-full">System</Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ModeToggle