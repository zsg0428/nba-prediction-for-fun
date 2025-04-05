import { useEffect, useState } from "react";
import { Moon, Sun, ToggleLeft, ToggleRight } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export const ThemeToggler = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
    >
      <span className="text-xl">
        {theme === "light" ? (
          <div className="text-black">
            <ToggleLeft />
            <Moon />
          </div>
        ) : (
          <div>
            <ToggleRight />
            <Sun />
          </div>
        )}
      </span>
    </Button>
  );
};
