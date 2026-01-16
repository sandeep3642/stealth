import CommonTable from "../../components/CommonTable";
import ThemeCustomizer from "../../components/ThemeCustomizer";
import { useTheme } from "../../context/ThemeContext";

const Accounts = () => {
  const { isDark } = useTheme();
  const columns = [
    {
      key: "no",
      label: "NO",
      visible: true,
    },
    {
      key: "code",
      label: "CODE",
      type: "link",
      visible: true,
    },
    {
      key: "instance",
      label: "INSTANCE",
      type: "multi-line",
      visible: true,
    },
    {
      key: "contact",
      label: "CONTACT",
      type: "multi-line",
      visible: true,
    },
    {
      key: "location",
      label: "LOCATION",
      type: "icon-text",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      visible: true,
    },
    {
      key: "status",
      label: "STATUS",
      type: "badge",
      visible: true,
    },
  ];

  const data = [
    {
      id: 1,
      no: 1,
      code: "ACC-001",
      instance: {
        main: "Alpha Logistics",
        sub: "DISTRIBUTOR",
      },
      contact: {
        main: "John Alpha",
        sub: "contact@alpha.com",
      },
      location: "New York, NY",
      status: "Active",
    },
    {
      id: 2,
      no: 2,
      code: "ACC-002",
      instance: {
        main: "Beta Fleet Services",
        sub: "ENTERPRISE",
      },
      contact: {
        main: "Sarah Beta",
        sub: "admin@beta.com",
      },
      location: "Chicago, IL",
      status: "Active",
    },
    {
      id: 3,
      no: 3,
      code: "ACC-003",
      instance: {
        main: "Gamma Transport",
        sub: "RESELLER",
      },
      contact: {
        main: "Mike Gamma",
        sub: "info@gamma.com",
      },
      location: "Houston, TX",
      status: "Suspended",
    },
    {
      id: 4,
      no: 4,
      code: "ACC-004",
      instance: {
        main: "Delta Quick Cabs",
        sub: "DEALER",
      },
      contact: {
        main: "David Delta",
        sub: "support@delta.com",
      },
      location: "Phoenix, AZ",
      status: "Under Review",
    },
  ];

  const handleEdit = (row) => {
    console.log("Edit:", row);
    alert(`Editing ${row.instance.main}`);
  };

  const handleDelete = (row) => {
    console.log("Delete:", row);
    alert(`Deleting ${row.instance.main}`);
  };

  return (
    <div className={isDark ? "dark" : ""}>
      <CommonTable
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showActions={true}
        searchPlaceholder="Search across all fields..."
        rowsPerPageOptions={[10, 25, 50, 100]}
        defaultRowsPerPage={10}
      />
      <ThemeCustomizer />
    </div>
  );
};

export default Accounts;
