import React, { useState } from "react";
import {
  Search,
  Bell,
  Globe,
  Menu,
  Home,
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  Cog,
  ChevronDown,
  List,
  Layers,
  GitBranch,
  Settings,
  Tag,
  User,
  Shield,
  Activity,
  Package,
} from "lucide-react";
import { useLayout } from "../context/LayoutContext";
import { useColor } from "../context/ColorContext";
import { Outlet } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
const DualHeaderLayout = () => {
  const { layout: menuLayout, setLayout: setMenuLayout } = useLayout();
  const { selectedColor, colorBlock } = useColor();
  const { isDark } = useTheme();
  const [expandedMenus, setExpandedMenus] = useState([
    "accounts",
    "users",
    "assets",
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Complete menu structure with nested items
  const sidebarSections = [
    {
      title: "OVERVIEW",
      items: [
        { id: "home", label: "Home", icon: Home, active: false, path: "/home" },
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          active: true,
          path: "/dashboard",
        },
        {
          id: "report",
          label: "Report",
          icon: FileText,
          active: false,
          path: "/report",
        },
      ],
    },
    {
      title: "CONFIGURATIONS",
      items: [
        {
          id: "accounts",
          label: "Accounts",
          icon: Briefcase,
          active: false,
          expandable: true,
          children: [
            {
              id: "account-list",
              label: "Account List",
              icon: List,
              path: "/accounts",
            },
            {
              id: "categories",
              label: "Categories",
              icon: Layers,
              path: "/accounts/categories",
            },
            {
              id: "hierarchy",
              label: "Hierarchy",
              icon: GitBranch,
              path: "/accounts/hierarchy",
            },
            {
              id: "configuration",
              label: "Configuration",
              icon: Settings,
              path: "/accounts/configuration",
            },
            {
              id: "white-label",
              label: "White Label",
              icon: Tag,
              path: "/accounts/white-label",
            },
          ],
        },
        {
          id: "users",
          label: "Users",
          icon: Users,
          active: false,
          expandable: true,
          children: [
            { id: "user-list", label: "User List", icon: User, path: "/users" },
            {
              id: "roles-permissions",
              label: "Roles & Permissions",
              icon: Shield,
              path: "/users/roles-permissions",
            },
            {
              id: "activity-logs",
              label: "Activity Logs",
              icon: Activity,
              path: "/users/activity-logs",
            },
          ],
        },
        {
          id: "assets",
          label: "Assets",
          icon: Package,
          active: false,
          expandable: true,
          children: [
            {
              id: "asset-list",
              label: "Asset List",
              icon: List,
              path: "/assets",
            },
          ],
        },
      ],
    },
    {
      title: "SYSTEM SETUP",
      items: [
        {
          id: "settings",
          label: "Settings",
          icon: Cog,
          active: false,
          path: "/settings",
        },
      ],
    },
  ];

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Header classes for Top Nav - NEVER uses color block
  const getTopNavHeaderClasses = () => {
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

  // Header for Top Nav Layout (Horizontal with all menus)
  const TopNavHeader = () => {
    const headerClasses = getTopNavHeaderClasses();

    return (
      <header
        className={`${headerClasses.header} border-b`}
        style={
          headerClasses.useCustomBg
            ? { background: headerClasses.customBg }
            : {}
        }
      >
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Left side: Logo and Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                S
              </div>
              <span className={`text-xl font-semibold ${headerClasses.text}`}>
                Stealth
              </span>
            </div>

            {/* Main Navigation */}
            <nav className="flex items-center gap-6">
              {sidebarSections.map((section) =>
                section.items.map((item) => {
                  if (item.expandable) {
                    return (
                      <div key={item.id} className="relative group">
                        <button
                          className={`flex items-center gap-2 py-1 text-sm ${headerClasses.textSecondary} ${headerClasses.hover}`}
                        >
                          <span>{item.label}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        {/* Dropdown */}
                        <div
                          className={`absolute left-0 top-full mt-2 w-56 ${headerClasses.dropdown} border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50`}
                        >
                          {item.children.map((child, idx) => {
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.id}
                                to={child.path}
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm ${headerClasses.textSecondary} ${headerClasses.dropdownHover}`}
                              >
                                <ChildIcon className="w-4 h-4" />
                                <span>{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`text-sm py-1 ${
                        item.active
                          ? `${headerClasses.text} font-semibold`
                          : `${headerClasses.textSecondary} ${headerClasses.hover}`
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })
              )}
            </nav>
          </div>

          {/* Right side: Search and User controls */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40`}
              />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2 border ${headerClasses.inputBorder} ${headerClasses.inputBg} ${headerClasses.inputText} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64`}
              />
            </div>

            <button
              className={`flex items-center gap-2 text-sm ${headerClasses.textSecondary} ${headerClasses.hover}`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden xl:inline">English</span>
            </button>

            <button
              className={`relative p-2 ${headerClasses.hoverBg} rounded-lg`}
            >
              <Bell className={`w-5 h-5 ${headerClasses.textSecondary}`} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              className={`flex items-center gap-2 ${headerClasses.hoverBg} rounded-lg p-2`}
            >
              <div className="text-right hidden xl:block">
                <div className={`text-sm font-medium ${headerClasses.text}`}>
                  Alex Johnson
                </div>
                <div className={`text-xs ${headerClasses.textSecondary}`}>
                  alex@stealth.com
                </div>
              </div>
              <div
                className={`w-8 h-8 bg-foreground/10 rounded flex items-center justify-center ${headerClasses.textSecondary} text-sm font-medium`}
              >
                <Package className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </header>
    );
  };

  // Header for Sidebar Layout (Minimal)
  const SidebarHeader = () => {
    const headerClasses = isDark
      ? {
          header: "bg-card border-border",
          text: "text-white",
          textSecondary: "text-white/70",
          hover: "hover:text-white",
          inputBg: "bg-background",
          inputBorder: "border-white/20",
          inputText: "text-white",
          inputPlaceholder: "placeholder:text-white/40",
          hoverBg: "hover:bg-background/50",
          logo: "bg-primary",
          logoText: "text-primary-foreground",
          iconColor: "text-white/70",
        }
      : {
          header: "bg-card border-border",
          text: "text-black",
          textSecondary: "text-black/60",
          hover: "hover:text-black",
          inputBg: "bg-background",
          inputBorder: "border-black/20",
          inputText: "text-black",
          inputPlaceholder: "placeholder:text-black/40",
          hoverBg: "hover:bg-background/50",
          logo: "bg-primary",
          logoText: "text-primary-foreground",
          iconColor: "text-black/70",
        };

    return (
      <header
        className={`${
          headerClasses.header
        } border-b px-6 py-3 flex items-center justify-between ${
          isSidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 ${headerClasses.hoverBg} rounded-lg`}
          >
            <Menu className={`w-5 h-5 ${headerClasses.textSecondary}`} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${headerClasses.iconColor}`}
            />
            <input
              type="text"
              placeholder="Search..."
              className={`pl-10 pr-4 py-2 border ${headerClasses.inputBorder} ${headerClasses.inputBg} ${headerClasses.inputText} ${headerClasses.inputPlaceholder} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64`}
            />
          </div>

          <button
            className={`flex items-center gap-2 text-sm ${headerClasses.textSecondary} ${headerClasses.hover}`}
          >
            <Globe className={`w-4 h-4 ${headerClasses.iconColor}`} />
            <span>English</span>
          </button>

          <button
            className={`relative p-2 ${headerClasses.hoverBg} rounded-lg`}
          >
            <Bell className={`w-5 h-5 ${headerClasses.iconColor}`} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            className={`flex items-center gap-2 ${headerClasses.hoverBg} rounded-lg p-2`}
          >
            <div
              className={`w-8 h-8 ${headerClasses.logo} rounded-full flex items-center justify-center ${headerClasses.logoText} text-sm font-medium`}
            >
              AJ
            </div>
            <div className="text-left hidden lg:block">
              <div className={`text-sm font-medium ${headerClasses.text}`}>
                Alex Johnson
              </div>
              <div className={`text-xs ${headerClasses.textSecondary}`}>
                alex@stealth.com
              </div>
            </div>
          </button>
        </div>
      </header>
    );
  };

  // Sidebar Menu Component
  const Sidebar = () => {
    // Sidebar styling - ONLY uses color block for sidebar layout
    const getSidebarClasses = () => {
      if (colorBlock && selectedColor && menuLayout === "sidebar") {
        // Color block mode ONLY for sidebar layout
        return {
          useCustomBg: true,
          customBg: selectedColor,
          border: "border-transparent",
          logo: "bg-white/20",
          logoText: "text-white",
          brandText: "text-white",
          sectionTitle: "text-white/60",
          menuText: "text-white",
          menuIcon: "text-white",
          menuHover: "hover:bg-white/10",
          activeMenuBg: "bg-white/20",
          activeMenuText: "text-white",
          activeMenuIcon: "text-white",
          chevron: "text-white/60",
          gridIcon: "text-white/70",
          gridHover: "hover:bg-white/10",
        };
      } else if (isDark) {
        return {
          bg: "bg-card",
          border: "border-border",
          logo: "bg-primary",
          logoText: "text-primary-foreground",
          brandText: "text-foreground",
          sectionTitle: "text-foreground",
          menuText: "text-foreground",
          menuIcon: "text-foreground/70",
          menuHover: "hover:bg-background/50",
          activeMenuBg: "bg-primary/10",
          activeMenuText: "text-primary",
          activeMenuIcon: "text-primary",
          chevron: "text-foreground/40",
          gridIcon: "text-foreground/50",
          gridHover: "hover:bg-background/50",
        };
      } else {
        return {
          bg: "bg-card",
          border: "border-border",
          logo: "bg-primary",
          logoText: "text-primary-foreground",
          brandText: "text-foreground",
          sectionTitle: "text-foreground/50",
          menuText: "text-foreground",
          menuIcon: "text-foreground/70",
          menuHover: "hover:bg-background/50",
          activeMenuBg: "bg-primary/10",
          activeMenuText: "text-primary",
          activeMenuIcon: "text-primary",
          chevron: "text-foreground/40",
          gridIcon: "text-foreground/50",
          gridHover: "hover:bg-background/50",
        };
      }
    };

    const sidebarClasses = getSidebarClasses();

    return (
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"} ${
          sidebarClasses.bg
        } border-r ${
          sidebarClasses.border
        } h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300`}
        style={
          sidebarClasses.useCustomBg
            ? { background: sidebarClasses.customBg }
            : {}
        }
      >
        <div className="p-4">
          {/* Logo Section */}
          <div
            className={`flex items-center ${
              isSidebarOpen ? "justify-between" : "justify-center"
            } px-3 py-4 mb-6`}
          >
            <div
              className={`flex items-center gap-2 ${
                isSidebarOpen ? "" : "flex-col"
              }`}
            >
              <div
                className={`w-8 h-8 ${sidebarClasses.logo} rounded-lg flex items-center justify-center ${sidebarClasses.logoText} font-bold`}
              >
                S
              </div>
              {isSidebarOpen && (
                <span
                  className={`text-xl font-semibold ${sidebarClasses.brandText}`}
                >
                  Stealth
                </span>
              )}
            </div>
          </div>

          {sidebarSections.map((section, index) => (
            <div key={index} className="mb-6">
              {isSidebarOpen && (
                <h3
                  className={`text-xs font-semibold ${sidebarClasses.sectionTitle} uppercase tracking-wider mb-3 px-3`}
                >
                  {section.title}
                </h3>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const IconComponent = item.icon;
                  const isExpanded = expandedMenus.includes(item.id);

                  return (
                    <div key={item.id}>
                      {item.expandable ? (
                        <>
                          <button
                            onClick={() => isSidebarOpen && toggleMenu(item.id)}
                            className={`w-full flex items-center ${
                              isSidebarOpen
                                ? "justify-between"
                                : "justify-center"
                            } px-3 py-2.5 rounded-lg ${
                              sidebarClasses.menuText
                            } ${sidebarClasses.menuHover}`}
                            title={!isSidebarOpen ? item.label : ""}
                          >
                            <div
                              className={`flex items-center gap-3 ${
                                isSidebarOpen ? "" : "justify-center"
                              }`}
                            >
                              <IconComponent
                                className={`w-5 h-5 ${sidebarClasses.menuIcon}`}
                              />
                              {isSidebarOpen && (
                                <span className="text-sm font-medium">
                                  {item.label}
                                </span>
                              )}
                            </div>
                            {isSidebarOpen && (
                              <ChevronDown
                                className={`w-4 h-4 ${
                                  sidebarClasses.chevron
                                } transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </button>

                          {isSidebarOpen && isExpanded && item.children && (
                            <div className="ml-11 mt-1 space-y-1">
                              {item.children.map((child) => {
                                const ChildIcon = child.icon;
                                return (
                                  <Link
                                    key={child.id}
                                    to={child.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${sidebarClasses.menuText} ${sidebarClasses.menuHover} text-sm`}
                                  >
                                    <ChildIcon
                                      className={`w-4 h-4 ${sidebarClasses.menuIcon}`}
                                    />
                                    <span>{child.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 ${
                            isSidebarOpen ? "" : "justify-center"
                          } px-3 py-2.5 rounded-lg ${
                            item.active
                              ? `${sidebarClasses.activeMenuBg} ${sidebarClasses.activeMenuText}`
                              : `${sidebarClasses.menuText} ${sidebarClasses.menuHover}`
                          }`}
                          title={!isSidebarOpen ? item.label : ""}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${
                              item.active
                                ? sidebarClasses.activeMenuIcon
                                : sidebarClasses.menuIcon
                            }`}
                          />
                          {isSidebarOpen && (
                            <span
                              className={`text-sm ${
                                item.active ? "font-semibold" : "font-medium"
                              }`}
                            >
                              {item.label}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Render appropriate header based on layout */}
      {menuLayout === "topnav" ? <TopNavHeader /> : <SidebarHeader />}

      {/* Show Sidebar only for sidebar layout */}
      {menuLayout === "sidebar" && <Sidebar />}

      <main
        className={`p-6 ${
          menuLayout === "sidebar" ? (isSidebarOpen ? "ml-64" : "ml-20") : ""
        } ${menuLayout === "sidebar" ? "" : ""} transition-all duration-300`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DualHeaderLayout;
