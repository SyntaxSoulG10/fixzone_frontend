/**
 * =========================================================
 *  Frontend Unit Tests – Super Admin Dashboard
 *  Section: 7.2.x  Super Admin Dashboard Management
 *  Framework: Jest + @testing-library/react
 *  TC-FE-01 through TC-FE-30 (utility/logic layer)
 * =========================================================
 *
 *  IMPORTANT: These tests target pure utility functions and
 *  business-logic helpers extracted from the Super Admin
 *  dashboard pages so they can be tested WITHOUT a running
 *  Next.js app or real HTTP back-end.
 *
 *  Run with:
 *    npm test -- --testPathPattern=superAdmin
 * =========================================================
 */

// ─── Helper functions mirrored from users/page.tsx ────────
const ROLE_NAME_MAP = {
  ROLE_SUPER_ADMIN: "Super Admin",
  ROLE_COMPANY_OWNER: "Company Owner",
  OWNER: "Company Owner",
  CUSTOMER: "Customer",
  MANAGER: "Service Manager",
  ROLE_SERVICE_MANAGER: "Service Manager",
  ROLE_CUSTOMER: "Customer",
};

function mapBackendRoleToDisplay(backendRole) {
  const upper = backendRole.toUpperCase();
  return (
    ROLE_NAME_MAP[upper] ||
    backendRole.replace("ROLE_", "").replace("_", " ")
  );
}

// ─── Helper functions mirrored from super-admin/page.tsx ──
function getGraphData(analytics, view) {
  if (!analytics) return { total: 0, labels: [], values: [], amounts: [] };
  const source =
    view === "weekly" ? analytics.weeklyRevenue : analytics.monthlyRevenue;
  return {
    total: source.reduce((acc, curr) => acc + curr.amount, 0),
    labels: source.map((d) => d.label),
    values: source.map((d) => d.percentage),
    amounts: source.map((d) => d.amount),
  };
}

function formatRevenueLabel(totalPlatformRevenue) {
  if (totalPlatformRevenue >= 1_000_000)
    return `Rs ${(totalPlatformRevenue / 1_000_000).toFixed(1)}M`;
  return `Rs ${(totalPlatformRevenue / 1_000).toFixed(0)}K`;
}

function buildSummaryMetrics(analytics) {
  if (!analytics) return [];
  return [
    {
      label: "Total Revenue",
      value: formatRevenueLabel(analytics.totalPlatformRevenue),
      change: `${analytics.revenueChange} growth`,
    },
    {
      label: "Total Stations",
      value: analytics.totalServiceCenters.toString(),
      change: `${analytics.pendingRegistrations} pending`,
    },
    {
      label: "Active Subs",
      value: analytics.activeSubscriptions.toString(),
      change: `${analytics.subscriptionChange} growth`,
    },
  ];
}

// ─── Helper functions mirrored from service-centers/page.tsx ──
function mapStationStatus(backendStatus) {
  const map = {
    APPROVED: "Active",
    PENDING: "Pending",
    REJECTED: "Rejected",
    SUSPENDED: "Suspended",
  };
  return map[backendStatus] || "Suspended";
}

function filterStations(stations, query) {
  const q = query.toLowerCase();
  return stations.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.owner.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
  );
}

function getPaginatedData(filteredData, currentPage, pageSize) {
  return filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
}

function getTotalPages(filteredLength, pageSize) {
  return Math.ceil(filteredLength / pageSize);
}

// ─── Helper functions for users/page.tsx ──
function filterUsers(users, query, sidebarTab) {
  const q = query.toLowerCase();
  return users.filter((u) => {
    const matches =
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return sidebarTab === "All"
      ? matches
      : matches && u.role.toLowerCase().includes(sidebarTab.toLowerCase());
  });
}

function transformUserFromBackend(backendUser) {
  return {
    id: backendUser.userId,
    name: backendUser.fullName || "Unknown User",
    email: backendUser.email,
    role: mapBackendRoleToDisplay(backendUser.role),
    status: backendUser.status === "Suspended" ? "Suspended" : "Active",
    joinedDate: backendUser.createdAt
      ? new Date(backendUser.createdAt).toLocaleDateString()
      : "N/A",
  };
}

// ─────────────────────────────────────────────────────────────────
//  TEST SUITES
// ─────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════
//  SECTION 1 – Role Name Mapping
// ═══════════════════════════════════════
describe("1. Role Name Mapping (mapBackendRoleToDisplay)", () => {
  test("TC-FE-01: maps ROLE_SUPER_ADMIN → 'Super Admin'", () => {
    expect(mapBackendRoleToDisplay("ROLE_SUPER_ADMIN")).toBe("Super Admin");
  });

  test("TC-FE-02: maps ROLE_COMPANY_OWNER → 'Company Owner'", () => {
    expect(mapBackendRoleToDisplay("ROLE_COMPANY_OWNER")).toBe("Company Owner");
  });

  test("TC-FE-03: maps CUSTOMER → 'Customer'", () => {
    expect(mapBackendRoleToDisplay("CUSTOMER")).toBe("Customer");
  });

  test("TC-FE-04: maps MANAGER → 'Service Manager'", () => {
    expect(mapBackendRoleToDisplay("MANAGER")).toBe("Service Manager");
  });

  test("TC-FE-05: maps ROLE_SERVICE_MANAGER → 'Service Manager'", () => {
    expect(mapBackendRoleToDisplay("ROLE_SERVICE_MANAGER")).toBe(
      "Service Manager"
    );
  });

  test("TC-FE-06: handles unknown role by stripping ROLE_ prefix", () => {
    const result = mapBackendRoleToDisplay("ROLE_UNKNOWN_ROLE");
    expect(result).toBe("UNKNOWN ROLE");
  });

  test("TC-FE-07: is case-insensitive (lower-case input)", () => {
    expect(mapBackendRoleToDisplay("role_super_admin")).toBe("Super Admin");
  });
});

// ═══════════════════════════════════════
//  SECTION 2 – User Transformation
// ═══════════════════════════════════════
describe("2. User Transformation (transformUserFromBackend)", () => {
  const backendUser = {
    userId: "abc-123",
    fullName: "Ayesha Kapoor",
    email: "ayesha@fixzone.com",
    role: "CUSTOMER",
    status: "Active",
    createdAt: "2024-01-15T10:00:00Z",
  };

  test("TC-FE-08: correctly maps userId to id", () => {
    const user = transformUserFromBackend(backendUser);
    expect(user.id).toBe("abc-123");
  });

  test("TC-FE-09: correctly maps fullName to name", () => {
    const user = transformUserFromBackend(backendUser);
    expect(user.name).toBe("Ayesha Kapoor");
  });

  test("TC-FE-10: correctly maps role via role-map", () => {
    const user = transformUserFromBackend(backendUser);
    expect(user.role).toBe("Customer");
  });

  test("TC-FE-11: defaults name to 'Unknown User' when fullName is null", () => {
    const user = transformUserFromBackend({ ...backendUser, fullName: null });
    expect(user.name).toBe("Unknown User");
  });

  test("TC-FE-12: status 'Suspended' is preserved correctly", () => {
    const user = transformUserFromBackend({
      ...backendUser,
      status: "Suspended",
    });
    expect(user.status).toBe("Suspended");
  });

  test("TC-FE-13: status other than 'Suspended' maps to 'Active'", () => {
    const user = transformUserFromBackend({ ...backendUser, status: "Active" });
    expect(user.status).toBe("Active");
  });

  test("TC-FE-14: joinedDate defaults to 'N/A' when createdAt is null", () => {
    const user = transformUserFromBackend({
      ...backendUser,
      createdAt: null,
    });
    expect(user.joinedDate).toBe("N/A");
  });
});

// ═══════════════════════════════════════
//  SECTION 3 – User Filtering
// ═══════════════════════════════════════
describe("3. User Filtering (filterUsers)", () => {
  const users = [
    { name: "Ayesha Kapoor", email: "ayesha@fixzone.com", role: "Customer" },
    { name: "Bilal Ahmed", email: "bilal@fixzone.com", role: "Company Owner" },
    {
      name: "Chamari Silva",
      email: "chamari@fixzone.com",
      role: "Service Manager",
    },
  ];

  test("TC-FE-15: returns all users when tab is 'All' and query is empty", () => {
    expect(filterUsers(users, "", "All")).toHaveLength(3);
  });

  test("TC-FE-16: filters by name search query", () => {
    const result = filterUsers(users, "bilal", "All");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Bilal Ahmed");
  });

  test("TC-FE-17: filters by email search query", () => {
    const result = filterUsers(users, "chamari@", "All");
    expect(result).toHaveLength(1);
  });

  test("TC-FE-18: filters by tab 'Customer' shows only customers", () => {
    const result = filterUsers(users, "", "Customer");
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("Customer");
  });

  test("TC-FE-19: returns empty array when no match found", () => {
    const result = filterUsers(users, "zzzzz", "All");
    expect(result).toHaveLength(0);
  });

  test("TC-FE-20: tab filter 'Manager' returns only managers", () => {
    const result = filterUsers(users, "", "Manager");
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("Service Manager");
  });
});

// ═══════════════════════════════════════
//  SECTION 4 – Graph Data Computation
// ═══════════════════════════════════════
describe("4. Graph Data Computation (getGraphData)", () => {
  const mockAnalytics = {
    weeklyRevenue: [
      { label: "Mon", amount: 1000, percentage: 50 },
      { label: "Tue", amount: 2000, percentage: 100 },
    ],
    monthlyRevenue: [
      { label: "Jan", amount: 5000, percentage: 60 },
      { label: "Feb", amount: 8000, percentage: 100 },
    ],
  };

  test("TC-FE-21: returns zero total when analytics is null", () => {
    const data = getGraphData(null, "weekly");
    expect(data.total).toBe(0);
    expect(data.labels).toHaveLength(0);
  });

  test("TC-FE-22: weekly view sums amounts correctly", () => {
    const data = getGraphData(mockAnalytics, "weekly");
    expect(data.total).toBe(3000);
  });

  test("TC-FE-23: monthly view sums amounts correctly", () => {
    const data = getGraphData(mockAnalytics, "monthly");
    expect(data.total).toBe(13000);
  });

  test("TC-FE-24: weekly labels are mapped correctly", () => {
    const data = getGraphData(mockAnalytics, "weekly");
    expect(data.labels).toEqual(["Mon", "Tue"]);
  });

  test("TC-FE-25: weekly values (percentages) are mapped correctly", () => {
    const data = getGraphData(mockAnalytics, "weekly");
    expect(data.values).toEqual([50, 100]);
  });
});

// ═══════════════════════════════════════
//  SECTION 5 – Summary Metrics Building
// ═══════════════════════════════════════
describe("5. Summary Metrics (buildSummaryMetrics)", () => {
  const mockAnalytics = {
    totalPlatformRevenue: 1500000,
    revenueChange: "+15.3%",
    totalServiceCenters: 12,
    pendingRegistrations: 3,
    activeSubscriptions: 8,
    subscriptionChange: "+5.7%",
  };

  test("TC-FE-26: returns empty array when analytics is null", () => {
    expect(buildSummaryMetrics(null)).toHaveLength(0);
  });

  test("TC-FE-27: formats revenue above 1M with M suffix", () => {
    const metrics = buildSummaryMetrics(mockAnalytics);
    expect(metrics[0].value).toBe("Rs 1.5M");
  });

  test("TC-FE-28: returns exactly 3 summary metrics", () => {
    const metrics = buildSummaryMetrics(mockAnalytics);
    expect(metrics).toHaveLength(3);
  });

  test("TC-FE-29: second metric shows total stations value", () => {
    const metrics = buildSummaryMetrics(mockAnalytics);
    expect(metrics[1].value).toBe("12");
  });

  test("TC-FE-30: third metric shows active subscriptions value", () => {
    const metrics = buildSummaryMetrics(mockAnalytics);
    expect(metrics[2].value).toBe("8");
  });
});

// ═══════════════════════════════════════
//  SECTION 6 – Service Station Utilities
// ═══════════════════════════════════════
describe("6. Service Station Utilities", () => {
  test("TC-FE-31: mapStationStatus maps APPROVED → Active", () => {
    expect(mapStationStatus("APPROVED")).toBe("Active");
  });

  test("TC-FE-32: mapStationStatus maps PENDING → Pending", () => {
    expect(mapStationStatus("PENDING")).toBe("Pending");
  });

  test("TC-FE-33: mapStationStatus maps REJECTED → Rejected", () => {
    expect(mapStationStatus("REJECTED")).toBe("Rejected");
  });

  test("TC-FE-34: mapStationStatus maps SUSPENDED → Suspended", () => {
    expect(mapStationStatus("SUSPENDED")).toBe("Suspended");
  });

  test("TC-FE-35: mapStationStatus defaults unknown to Suspended", () => {
    expect(mapStationStatus("UNKNOWN")).toBe("Suspended");
  });

  const stations = [
    { name: "AutoFix Colombo", owner: "Ravi Kumar", location: "Colombo 03" },
    { name: "SpeedService Kandy", owner: "Priya Nair", location: "Kandy" },
    { name: "QuickLube Galle", owner: "Mohamed Ali", location: "Galle" },
  ];

  test("TC-FE-36: filterStations returns all when query is empty", () => {
    expect(filterStations(stations, "")).toHaveLength(3);
  });

  test("TC-FE-37: filterStations filters by name", () => {
    const result = filterStations(stations, "kandy");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("SpeedService Kandy");
  });

  test("TC-FE-38: filterStations filters by owner name", () => {
    const result = filterStations(stations, "ravi");
    expect(result).toHaveLength(1);
    expect(result[0].owner).toBe("Ravi Kumar");
  });

  test("TC-FE-39: filterStations filters by location", () => {
    const result = filterStations(stations, "galle");
    expect(result).toHaveLength(1);
    expect(result[0].location).toBe("Galle");
  });
});

// ═══════════════════════════════════════
//  SECTION 7 – Pagination Utilities
// ═══════════════════════════════════════
describe("7. Pagination Utilities", () => {
  const items = Array.from({ length: 13 }, (_, i) => ({ id: i + 1 }));

  test("TC-FE-40: getTotalPages returns correct number of pages", () => {
    expect(getTotalPages(13, 5)).toBe(3);
  });

  test("TC-FE-41: getTotalPages handles exact division", () => {
    expect(getTotalPages(10, 5)).toBe(2);
  });

  test("TC-FE-42: getTotalPages returns 0 for empty list", () => {
    expect(getTotalPages(0, 5)).toBe(0);
  });

  test("TC-FE-43: getPaginatedData returns correct first page slice", () => {
    const page = getPaginatedData(items, 1, 5);
    expect(page).toHaveLength(5);
    expect(page[0].id).toBe(1);
  });

  test("TC-FE-44: getPaginatedData returns correct last page slice (partial)", () => {
    const page = getPaginatedData(items, 3, 5);
    expect(page).toHaveLength(3);
    expect(page[0].id).toBe(11);
  });

  test("TC-FE-45: getPaginatedData returns second page correctly", () => {
    const page = getPaginatedData(items, 2, 5);
    expect(page).toHaveLength(5);
    expect(page[0].id).toBe(6);
  });
});

// ═══════════════════════════════════════
//  SECTION 8 – Revenue Formatting
// ═══════════════════════════════════════
describe("8. Revenue Label Formatting (formatRevenueLabel)", () => {
  test("TC-FE-46: formats 1,500,000 as Rs 1.5M", () => {
    expect(formatRevenueLabel(1500000)).toBe("Rs 1.5M");
  });

  test("TC-FE-47: formats 500,000 as Rs 500K", () => {
    expect(formatRevenueLabel(500000)).toBe("Rs 500K");
  });

  test("TC-FE-48: formats 1,000 as Rs 1K", () => {
    expect(formatRevenueLabel(1000)).toBe("Rs 1K");
  });

  test("TC-FE-49: formats 2,000,000 as Rs 2.0M", () => {
    expect(formatRevenueLabel(2000000)).toBe("Rs 2.0M");
  });

  test("TC-FE-50: formats 750,000 as Rs 750K", () => {
    expect(formatRevenueLabel(750000)).toBe("Rs 750K");
  });
});
