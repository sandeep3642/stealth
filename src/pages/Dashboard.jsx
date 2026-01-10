import ThemeCustomizer from "../components/ThemeCustomizer";
import { useTheme } from "../context/ThemeContext";

export default function Dashboard() {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300">
      <ThemeCustomizer />
      <div className="p-10">
        <h1 className="text-5xl font-bold text-primary mb-6">
          Welcome to Stealth App
        </h1>
        <p className="text-xl mb-8">
          Current Mode:{" "}
          <span className="font-bold">{isDark ? "Dark" : "Light"}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-primary text-primary-foreground p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold">Card 1</h3>
            <p>Primary background with white text</p>
          </div>
          <div className="bg-primary text-primary-foreground p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-primary">Card 2</h3>
            <p>Auto-adjusting card with primary accent</p>
          </div>
          <div className="bg-primary text-primary-foreground p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold">Card 3</h3>
            <p>Normal card - changes with mode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
