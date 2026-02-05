const routes = [
  {
    path: '/login',
    component: () => import('src/pages/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/DashboardPage.vue') }
    ]
  },
  {
    path: '/patient-records',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/PatientRecordsPage.vue') }
    ]
  },
  {
    path: '/add-patient',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/AddPatientPage.vue') }
    ]
  },
  {
    path: '/patient-details/:glNum?',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/PatientDetailsPage.vue') }
    ]
  },
  {
    path: '/budget-table',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/BudgetTablePage.vue') }
    ]
  },
  {
    path: '/create-yearly-budget',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/CreateYearlyBudgetPage.vue') }
    ]
  },
  {
    path: '/add-supplementary-bonus',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/AddSupplementaryBonusPage.vue') }
    ]
  },

  // ✅ NEW ROUTE FOR TRANSFER BUDGET PAGE
  {
    path: '/transfer-supplemental-budget',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/TransferBudgetPage.vue') }
    ]
  },

  {
    path: '/settings',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/SettingsPage.vue') }
    ]
  },

    {
    path: '/reports',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('src/pages/ReportsPage.vue') }
    ]
  },
  
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorPage.vue')
  }
]

export default routes
