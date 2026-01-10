import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useLayout } from "../context/LayoutContext";
import { useColor } from "../context/ColorContext";

const presetColors = [
  "#6366f1", // indigo
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
];

export default function ThemeCustomizer() {
  const { isDark, setIsDark, setPrimaryHsl } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const { layout, setLayout } = useLayout();

  const {
    selectedColor,
    handleColorChange,
    colorBlock,
    setColorBlock,
    hexToHsl,
  } = useColor();

  const handlePresetColor = (hex) => {
    handleColorChange(hex);
    setPrimaryHsl(hexToHsl(hex));
  };
  // Closed state button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-1/2 right-8 -translate-y-1/2 z-50 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition"
        style={{ backgroundColor: selectedColor }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    );
  }

  // Open panel
  return (
    <div
      className={`fixed top-1/2 right-8 -translate-y-1/2 z-50 w-90 rounded-2xl shadow-2xl border overflow-hidden ${
        isDark
          ? "bg-gray-950 text-white border-gray-800"
          : "bg-white text-gray-900 border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 py-4 border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <h3 className="text-base font-semibold">Theme Customizer</h3>
        <button
          onClick={() => setIsOpen(false)}
          className={`transition text-lg ${
            isDark
              ? "text-gray-400 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-6">
        {/* Color Palette */}
        <div>
          <label
            className={`block text-xs font-medium mb-3 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Color
          </label>
          <div className="grid grid-cols-4 gap-3">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => handlePresetColor(color)}
                className="w-full h-10 rounded-md transition-all relative"
                style={{
                  backgroundColor: "#f1f5f980",
                  border:
                    selectedColor === color
                      ? `2px solid ${color}`
                      : "2px solid transparent", // light gray border for unselected
                }}
              >
                {selectedColor === color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-3 h-3 bg-white rounded-full"
                      style={{
                        backgroundColor:
                          selectedColor === color ? color : "transparent",
                      }}
                    ></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Layout */}
        <div>
          <label
            className={`block text-xs font-medium mb-3 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Menu Layout
          </label>
          {/* Menu Layout */}
          <div>
            <div className="flex gap-3">
              <button
                onClick={() => setLayout("sidebar")}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all border-2 ${
                  layout === "sidebar"
                    ? "text-primary-foreground border-primary" // White text + primary border
                    : isDark
                    ? "border-gray-700 text-gray-400 hover:border-gray-600"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
                style={
                  layout === "sidebar"
                    ? {
                        backgroundColor: selectedColor,
                        borderColor: selectedColor,
                      }
                    : {}
                }
              >
                <span className="mr-1.5">⊞</span> Sidebar
              </button>

              <button
                onClick={() => setLayout("topnav")}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all border-2 ${
                  layout === "topnav"
                    ? "text-primary-foreground border-primary" // White text + primary border
                    : isDark
                    ? "border-gray-700 text-gray-400 hover:border-gray-600"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
                style={
                  layout === "topnav"
                    ? {
                        backgroundColor: selectedColor,
                        borderColor: selectedColor,
                      }
                    : {}
                }
              >
                <span className="mr-1.5">▭</span> Top Nav
              </button>
            </div>
          </div>
        </div>

        {/* Color Block Toggle */}
        <div>
          <label
            className={`block text-xs font-medium mb-3 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Sidebar Style
          </label>
          <div
            className={`flex items-center justify-between border rounded-lg px-4 py-3 ${
              isDark ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <span className="text-sm">Color Block</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={colorBlock}
                onChange={(e) => setColorBlock(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md ${
                  isDark ? "bg-gray-700" : "bg-gray-300"
                }`}
                style={colorBlock ? { backgroundColor: selectedColor } : {}}
              ></div>
            </label>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div>
          <label
            className={`block text-xs font-medium mb-3 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Mode
          </label>
          <div
            className={`flex items-center justify-between border rounded-lg px-4 py-3 ${
              isDark ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <span className="text-sm">Dark Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDark}
                onChange={(e) => setIsDark(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md ${
                  isDark ? "bg-gray-700" : "bg-gray-300"
                }`}
                style={isDark ? { backgroundColor: selectedColor } : {}}
              ></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
