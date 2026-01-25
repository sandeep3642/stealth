"use client";

import React, { useState, useEffect } from "react";
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
  X,
  LogOut,
  CreditCard,
  Receipt,
  SubscriptIcon,
} from "lucide-react";
import Link from "next/link";
import { useLayout } from "../context/LayoutContext";
import { useColor } from "../context/ColorContext";
import { useTheme } from "../context/ThemeContext";
import {
  SidebarSection,
  HeaderClasses,
  SidebarClasses,
} from "@/interfaces/navbar.interface";
import { getInitials } from "@/utils/utils";
import Cookies from "js-cookie";

const DualHeaderLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { layout: menuLayout, setLayout: setMenuLayout } = useLayout();
  const { selectedColor, colorBlock } = useColor();
  const { isDark } = useTheme();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "accounts",
    "users",
    "assets",
    "billing",
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsMobileSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    Cookies.remove("authToken", { path: "/" });

    window.location.href = "/";
  };

  // Complete menu structure with nested items
  const sidebarSections: SidebarSection[] = [
    {
      title: "OVERVIEW",
      items: [
        { id: "home", label: "Home", icon: Home, active: false, path: "/home" },
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          active: false,
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
              path: "/categories",
            },
            {
              id: "hierarchy",
              label: "Hierarchy",
              icon: GitBranch,
              path: "/hierarchy",
            },
            {
              id: "configuration",
              label: "Configuration",
              icon: Settings,
              path: "/configuration",
            },
            {
              id: "white-label",
              label: "White Label",
              icon: Tag,
              path: "/whiteLabel",
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
        {
          id: "billing",
          label: "Billing",
          icon: CreditCard,
          active: false,
          expandable: true,
          children: [
            {
              id: "manage-plans",
              label: "Manage Plans",
              icon: List,
              path: "/manage-plans",
            },
            {
              id: "subscriptions",
              label: "Subscriptions",
              icon: SubscriptIcon,
              path: "/subscriptions",
            },
            {
              id: "invoices",
              label: "Invoice",
              icon: Receipt,
              path: "/invoices",
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
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  // Header classes for Top Nav - NEVER uses color block
  const getTopNavHeaderClasses = (): HeaderClasses => {
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
  const TopNavHeader: React.FC = () => {
    const headerClasses = getTopNavHeaderClasses();
    return (
      <header
        className={`${headerClasses.header} border-b fixed w-full`}
        style={
          headerClasses.useCustomBg
            ? { background: headerClasses.customBg }
            : {}
        }
      >
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          {/* Left side: Logo and Navigation */}
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                A
              </div>
              <span
                className={`text-lg md:text-xl font-semibold ${headerClasses.text}`}
              >
                Agentix
              </span>
            </div>

            {/* Main Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-6">
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
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.id}
                                href={child.path}
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm ${headerClasses.textSecondary} ${headerClasses.dropdownHover}`}
                                onClick={() => setSelectedItemId(child.id)}
                                style={{
                                  color:
                                    selectedItemId === child.id &&
                                    selectedColor,
                                }}
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
                      href={item.path || "#"}
                      className={`text-sm py-1 ${
                        item.active
                          ? `${headerClasses.text} font-semibold`
                          : `${headerClasses.textSecondary} ${headerClasses.hover}`
                      }`}
                      onClick={() => setSelectedItemId(item.id)}
                      style={{
                        color: selectedItemId === item.id && selectedColor,
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                }),
              )}
            </nav>
          </div>

          {/* Right side: Search and User controls */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search - Hidden on small mobile */}
            <div className="relative hidden sm:block">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40`}
              />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2 border ${headerClasses.inputBorder} ${headerClasses.inputBg} ${headerClasses.inputText} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-40 md:w-64`}
              />
            </div>

            {/* Language - Hidden on mobile */}
            <button
              className={`hidden md:flex items-center gap-2 text-sm ${headerClasses.textSecondary} ${headerClasses.hover}`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden xl:inline">English</span>
            </button>

            {/* Notification */}
            <button
              className={`relative p-2 ${headerClasses.hoverBg} rounded-lg`}
            >
              <Bell className={`w-5 h-5 ${headerClasses.textSecondary}`} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Avatar */}
            <button
              className={`flex items-center gap-2 ${headerClasses.hoverBg} rounded-lg p-2`}
            >
              <div className="text-right hidden xl:block">
                <div className={`text-sm font-medium ${headerClasses.text}`}>
                  {user?.fullName}
                </div>
                <div className={`text-xs ${headerClasses.textSecondary}`}>
                  {user?.email}
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
  const SidebarHeader: React.FC = () => {
    const headerClasses: HeaderClasses = isDark
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
          useCustomBg: false,
          dropdown: "",
          dropdownHover: "",
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
          useCustomBg: false,
          dropdown: "",
          dropdownHover: "",
        };

    return (
      <header
        className={`${headerClasses.header}
    fixed top-0 z-50 border-b px-4 md:px-6 py-3 flex items-center justify-between transition-all duration-300
    w-full
    ${!isMobile && isSidebarOpen ? "lg:ml-64 lg:w-[calc(100%-16rem)]" : ""}
    ${!isMobile && !isSidebarOpen ? "lg:ml-20 lg:w-[calc(100%-5rem)]" : ""}
  `}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isMobile) {
                setIsMobileSidebarOpen(true);
              } else {
                setIsSidebarOpen(!isSidebarOpen);
              }
            }}
            className={`p-2 ${headerClasses.hoverBg} rounded-lg`}
          >
            <Menu
              className={`w-5 h-5 ${headerClasses.textSecondary} cursor-pointer`}
            />
          </button>

          {/* Logo - visible on mobile when sidebar is closed */}
          <div className="flex items-center gap-2 lg:hidden">
            <div
              className={`w-8 h-8 ${headerClasses.logo} rounded-lg flex items-center justify-center ${headerClasses.logoText} font-bold`}
            >
              A
            </div>
            <span className={`text-lg font-semibold ${headerClasses.text}`}>
              Agentix
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Hidden on small screens */}
          <div className="relative hidden sm:block">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${headerClasses.iconColor}`}
            />
            <input
              type="text"
              placeholder="Search..."
              className={`pl-10 pr-4 py-2 border ${headerClasses.inputBorder} ${headerClasses.inputBg} ${headerClasses.inputText} ${headerClasses.inputPlaceholder} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-40 md:w-64`}
            />
          </div>

          {/* Language - Hidden on mobile */}
          <button
            className={`hidden md:flex items-center gap-2 text-sm ${headerClasses.textSecondary} ${headerClasses.hover}`}
          >
            <Globe className={`w-4 h-4 ${headerClasses.iconColor}`} />
            <span>English</span>
          </button>

          {/* Notification */}
          <button
            className={`relative p-2 ${headerClasses.hoverBg} rounded-lg`}
          >
            <Bell className={`w-5 h-5 ${headerClasses.iconColor}`} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className={`flex items-center gap-2 ${headerClasses.hoverBg} rounded-lg p-2`}
            >
              <div
                className={`w-8 h-8 ${headerClasses.logo} rounded-full flex items-center justify-center ${headerClasses.logoText} text-sm font-medium`}
              >
                {getInitials(user?.fullName || "U")}
              </div>

              <div className="text-right hidden xl:block">
                <div className={`text-sm font-medium ${headerClasses.text}`}>
                  {user?.fullName}
                </div>
                <div className={`text-xs ${headerClasses.textSecondary}`}>
                  {user?.email}
                </div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-card rounded-lg shadow-lg border z-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-background rounded"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  };

  // Mobile Sidebar Overlay
  const MobileSidebarOverlay: React.FC = () => {
    if (!isMobileSidebarOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={() => setIsMobileSidebarOpen(false)}
      />
    );
  };

  // Sidebar Menu Component
  const Sidebar: React.FC = () => {
    // Sidebar styling - ONLY uses color block for sidebar layout
    const getSidebarClasses = (): SidebarClasses => {
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
    const isOpen = isMobile ? isMobileSidebarOpen : isSidebarOpen;
    const width = isOpen ? "w-64" : "w-20";

    return (
      <aside
        className={`${width} ${sidebarClasses.bg} border-r ${
          sidebarClasses.border
        } h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 z-50 ${
          isMobile && !isMobileSidebarOpen
            ? "-translate-x-full"
            : "translate-x-0"
        }`}
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
              isOpen ? "justify-between" : "justify-center"
            } px-3 py-4 mb-6`}
          >
            <div
              className={`flex items-center gap-2 ${isOpen ? "" : "flex-col"}`}
            >
              <div
                className={`w-8 h-8 ${sidebarClasses.logo} rounded-lg flex items-center justify-center ${sidebarClasses.logoText} font-bold`}
              >
                A
              </div>
              {isOpen && (
                <span
                  className={`text-xl font-semibold ${sidebarClasses.brandText}`}
                >
                  Agentix
                </span>
              )}
            </div>

            {/* Close button for mobile */}
            {isMobile && isOpen && (
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`p-2 ${sidebarClasses.menuHover} rounded-lg`}
              >
                <X className={`w-5 h-5 ${sidebarClasses.menuIcon}`} />
              </button>
            )}
          </div>

          {sidebarSections.map((section, index) => (
            <div key={index} className="mb-6">
              {isOpen && (
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
                            onClick={() => isOpen && toggleMenu(item.id)}
                            className={`w-full flex items-center ${
                              isOpen ? "justify-between" : "justify-center"
                            } px-3 py-2.5 rounded-lg ${
                              sidebarClasses.menuText
                            } ${sidebarClasses.menuHover}`}
                            title={!isOpen ? item.label : ""}
                          >
                            <div
                              className={`flex items-center gap-3 ${
                                isOpen ? "" : "justify-center"
                              }`}
                            >
                              <IconComponent
                                className={`w-5 h-5 ${sidebarClasses.menuIcon}`}
                              />
                              {isOpen && (
                                <span className="text-sm font-medium">
                                  {item.label}
                                </span>
                              )}
                            </div>
                            {isOpen && (
                              <ChevronDown
                                className={`w-4 h-4 ${
                                  sidebarClasses.chevron
                                } transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </button>
                          {isOpen && isExpanded && item.children && (
                            <div className="ml-11 mt-1 space-y-1">
                              {item.children.map((child) => {
                                const ChildIcon = child.icon;
                                return (
                                  <Link
                                    key={child.id}
                                    href={child.path}
                                    onClick={() => {
                                      setSelectedItemId(child.id);
                                      if (isMobile)
                                        setIsMobileSidebarOpen(false);
                                    }}
                                    style={{
                                      color:
                                        selectedItemId === child.id &&
                                        selectedColor,
                                    }}
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
                          href={item.path || "#"}
                          className={`flex items-center gap-3 ${
                            isOpen ? "" : "justify-center"
                          } px-3 py-2.5 rounded-lg ${
                            item.active
                              ? `${sidebarClasses.activeMenuBg} ${sidebarClasses.activeMenuText}`
                              : `${sidebarClasses.menuText} ${sidebarClasses.menuHover}`
                          }`}
                          title={!isOpen ? item.label : ""}
                          onClick={() => {
                            setSelectedItemId(item.id);
                            if (isMobile) setIsMobileSidebarOpen(false);
                          }}
                          style={{
                            color: selectedItemId === item.id && selectedColor,
                          }}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${
                              item.active
                                ? sidebarClasses.activeMenuIcon
                                : sidebarClasses.menuIcon
                            }`}
                          />
                          {isOpen && (
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
    <div className="bg-background">
      {/* Render appropriate header based on layout */}
      {menuLayout === "topnav" ? <TopNavHeader /> : <SidebarHeader />}

      {/* Mobile Sidebar Overlay */}
      <MobileSidebarOverlay />

      {/* Show Sidebar only for sidebar layout */}
      {menuLayout === "sidebar" && <Sidebar />}

      <main
        className={`p-4 md:p-6 ${
          menuLayout === "sidebar" && !isMobile
            ? isSidebarOpen
              ? "lg:ml-64"
              : "lg:ml-20"
            : ""
        } transition-all duration-300`}
      >
        {children}
      </main>
    </div>
  );
};

export default DualHeaderLayout;
