import { useTheme } from "../context/ThemeContext";

export default function ThemeCustomizer() {
  const { isDark, setIsDark, setPrimaryHsl } = useTheme();

  const handleColorChange = (e) => {
    const hex = e.target.value;
    // Convert hex to HSL (you can use a tiny lib or simple converter)
    const hsl = hexToHsl(hex);
    setPrimaryHsl(hsl);
  };

  // Simple hex to HSL converter
  const hexToHsl = (hex) => {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg space-y-4">
      <h3 className="font-bold">Theme Customizer</h3>

      <div>
        <label className="block text-sm">Primary Color</label>
        <input
          type="color"
          onChange={handleColorChange}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>

      <button
        onClick={() => setIsDark(!isDark)}
        className="w-full py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition"
      >
        Toggle {isDark ? "Light" : "Dark"} Mode
      </button>
    </div>
  );
}
