 export const getTopNavHeaderClasses = (isDark:boolean): HeaderClasses => {
    if (isDark) {
      return {
        header: "bg-card border-border",
        text: "text-white",
        textSecondary: "text-white/70",
        hover: "hover:text-white",
        inputBg: "bg-background",
        inputBorder: "border-border",
        inputText: "text-white",
        hoverBg: "hover:bg-background/50",
        dropdown: "bg-card border-border",
        dropdownHover: "hover:bg-background/50",
        useCustomBg: false,
      };
    } else {
      return {
        header: "bg-card border-border",
        text: "text-black",
        textSecondary: "text-black/60",
        hover: "hover:text-black",
        inputBg: "bg-background",
        inputBorder: "border-border",
        inputText: "text-black",
        hoverBg: "hover:bg-background/50",
        dropdown: "bg-card border-border",
        dropdownHover: "hover:bg-background/50",
        useCustomBg: false,
      };
    }
  };

export const getInitials = (name?: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
