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
import { getUserRoleData, filterMenuByPermissions } from "@/services/commonServie";

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
  const [mounted, setMounted] = useState(false);
  const [userRights, setUserRights] = useState<any[]>([]);
  const [filteredSidebarSections, setFilteredSidebarSections] = useState<SidebarSection[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user role data and permissions
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        setIsLoadingPermissions(true);
        const roleData = await getUserRoleData();
        
        if (roleData && roleData.data && roleData.data.rights) {
          setUserRights(roleData.data.rights);
        } else {
          console.warn("No role data or rights found");
          setUserRights([]);
        }
      } catch (error) {
        console.error("Error fetching user permissions:", error);
        setUserRights([]);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchUserPermissions();
  }, []);

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

  // Filter sidebar sections based on user permissions
  useEffect(() => {
    if (userRights.length > 0) {
      const filtered = sidebarSections.map((section) => ({
        ...section,
        items: filterMenuByPermissions(section.items, userRights),
      })).filter((section) => section.items.length > 0); // Remove empty sections

      setFilteredSidebarSections(filtered);
    } else {
      // If no rights found, show empty sidebar or default items
      setFilteredSidebarSections([]);
    }
  }, [userRights]);

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

  // Mobile Sidebar Overlay
  const MobileSidebarOverlay = () => {
    if (!isMobile || !isMobileSidebarOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsMobileSidebarOpen(false)}
      />
    );
  };

  // Top Navigation Header
  const TopNavHeader = () => {
    const getHeaderClasses = (): HeaderClasses => {
      if (selectedColor && colorBlock && !isDark) {
        return {
          header: "bg-primary border-b border-primary",
          text: "text-primary-foreground",
          textSecondary: "text-primary-foreground/70",
          hover: "hover:bg-white/20",
          inputBg: "bg-white/10",
          inputBorder: "border-white/20",
          inputText: "text-primary-foreground",
          hoverBg: "hover:bg-white/10",
          dropdown: "bg-primary",
          dropdownHover: "hover:bg-white/10",
          useCustomBg: true,
          customBg: selectedColor,
        };
      } else if (isDark) {
        return {
          header: "bg-card border-b border-border",
          text: "text-foreground",
          textSecondary: "text-foreground/70",
          hover: "hover:bg-background/10",
          inputBg: "bg-background/50",
          inputBorder: "border-border",
          inputText: "text-foreground",
          hoverBg: "hover:bg-background/10",
          dropdown: "bg-card",
          dropdownHover: "hover:bg-background/10",
          useCustomBg: false,
        };
      } else {
        return {
          header: "bg-card border-b border-border",
          text: "text-foreground",
          textSecondary: "text-foreground/70",
          hover: "hover:bg-background",
          inputBg: "bg-background",
          inputBorder: "border-border",
          inputText: "text-foreground",
          hoverBg: "hover:bg-background",
          dropdown: "bg-card",
          dropdownHover: "hover:bg-background",
          useCustomBg: false,
        };
      }
    };

    const headerClasses = getHeaderClasses();

    return (
      <header
        className={`${headerClasses.header} ${headerClasses.text} sticky top-0 z-40`}
        style={
          headerClasses.useCustomBg
            ? { background: headerClasses.customBg }
            : {}
        }
      >
        {/* Top Section */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMenuLayout("sidebar")}
              className={`p-2 rounded-lg ${headerClasses.hover}`}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold`}
              >
                A
              </div>
              <span className="text-xl font-semibold">Agentix</span>
            </div>

            <div className="relative ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2 rounded-lg ${headerClasses.inputBg} border ${headerClasses.inputBorder} focus:outline-none focus:ring-2 focus:ring-primary w-64`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className={`p-2 rounded-lg ${headerClasses.hover}`}>
              <Globe className="w-5 h-5" />
            </button>
            <button className={`p-2 rounded-lg ${headerClasses.hover}`}>
              <Bell className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${headerClasses.hoverBg}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {getInitials(user?.firstName)}
                </div>
                <ChevronDown className="w-4 h-4 opacity-60" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-background flex items-center gap-2 text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-6 pb-3">
          <nav className="flex gap-6">
            {filteredSidebarSections.map((section) =>
              section.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.path || "#"}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${headerClasses.hover
                      } ${item.active ? "bg-primary/10" : ""}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              }),
            )}
          </nav>
        </div>
      </header>
    );
  };

  // Sidebar Header
  const SidebarHeader = () => {
    const getHeaderClasses = (): HeaderClasses => {
      if (selectedColor && colorBlock && !isDark) {
        return {
          header: "bg-primary border-b border-primary",
          text: "text-primary-foreground",
          textSecondary: "text-primary-foreground/70",
          hover: "hover:bg-white/20",
          inputBg: "bg-white/10",
          inputBorder: "border-white/20",
          inputText: "text-primary-foreground",
          hoverBg: "hover:bg-white/10",
          dropdown: "bg-primary",
          dropdownHover: "hover:bg-white/10",
          useCustomBg: true,
          customBg: selectedColor,
        };
      } else if (isDark) {
        return {
          header: "bg-card border-b border-border",
          text: "text-foreground",
          textSecondary: "text-foreground/70",
          hover: "hover:bg-background/10",
          inputBg: "bg-background/50",
          inputBorder: "border-border",
          inputText: "text-foreground",
          hoverBg: "hover:bg-background/10",
          dropdown: "bg-card",
          dropdownHover: "hover:bg-background/10",
          useCustomBg: false,
        };
      } else {
        return {
          header: "bg-card border-b border-border",
          text: "text-foreground",
          textSecondary: "text-foreground/70",
          hover: "hover:bg-background",
          inputBg: "bg-background",
          inputBorder: "border-border",
          inputText: "text-foreground",
          hoverBg: "hover:bg-background",
          dropdown: "bg-card",
          dropdownHover: "hover:bg-background",
          useCustomBg: false,
        };
      }
    };

    const headerClasses = getHeaderClasses();

    return (
      <header
        className={`${headerClasses.header} ${headerClasses.text} sticky top-0 z-40`}
        style={
          headerClasses.useCustomBg
            ? { background: headerClasses.customBg }
            : {}
        }
      >
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold`}
                >
                  A
                </div>
                <span className="text-xl font-semibold">Agentix</span>
              </div>
            )}

            <button
              onClick={() => {
                if (isMobile) {
                  setIsMobileSidebarOpen(!isMobileSidebarOpen);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
              className={`p-2 rounded-lg ${headerClasses.hover}`}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2 rounded-lg ${headerClasses.inputBg} border ${headerClasses.inputBorder} focus:outline-none focus:ring-2 focus:ring-primary w-64`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className={`p-2 rounded-lg ${headerClasses.hover}`}>
              <Globe className="w-5 h-5" />
            </button>
            <button className={`p-2 rounded-lg ${headerClasses.hover}`}>
              <Bell className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${headerClasses.hoverBg}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {getInitials(user?.firstName)}
                </div>
                <ChevronDown className="w-4 h-4 opacity-60" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-background flex items-center gap-2 text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  };

  // Sidebar Component
  const Sidebar = () => {
    const getSidebarClasses = (): SidebarClasses => {
      if (selectedColor && colorBlock && !isDark) {
        return {
          useCustomBg: true,
          customBg: selectedColor,
          bg: "",
          border: "border-white/10",
          logo: "bg-white/20",
          logoText: "text-white",
          brandText: "text-white",
          sectionTitle: "text-white/60",
          menuText: "text-white/90",
          menuIcon: "text-white/70",
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
        className={`${width} ${sidebarClasses.bg} border-r ${sidebarClasses.border
          } h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 z-50 ${isMobile && !isMobileSidebarOpen
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
            className={`flex items-center ${isOpen ? "justify-between" : "justify-center"
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

          {isLoadingPermissions ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-foreground/50">Loading menu...</div>
            </div>
          ) : filteredSidebarSections.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-foreground/50">No menu items available</div>
            </div>
          ) : (
            filteredSidebarSections.map((section, index) => (
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
                              className={`w-full flex items-center ${isOpen ? "justify-between" : "justify-center"
                                } px-3 py-2.5 rounded-lg ${sidebarClasses.menuText
                                } ${sidebarClasses.menuHover}`}
                              title={!isOpen ? item.label : ""}
                            >
                              <div
                                className={`flex items-center gap-3 ${isOpen ? "" : "justify-center"
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
                                  className={`w-4 h-4 ${sidebarClasses.chevron
                                    } transition-transform ${isExpanded ? "rotate-180" : ""
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
                            className={`flex items-center gap-3 ${isOpen ? "" : "justify-center"
                              } px-3 py-2.5 rounded-lg ${item.active
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
                              className={`w-5 h-5 ${item.active
                                ? sidebarClasses.activeMenuIcon
                                : sidebarClasses.menuIcon
                                }`}
                            />
                            {isOpen && (
                              <span
                                className={`text-sm ${item.active ? "font-semibold" : "font-medium"
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
            ))
          )}
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
        className={`p-4 md:p-6 ${menuLayout === "sidebar" && !isMobile
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