import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [

    index('routes/root/home.tsx'),
    route('sign-in', 'routes/root/sign-in.tsx'),
    route('api/agents/destinations', 'routes/api/agents/destinations.ts'),
    route('api/agents/plan', 'routes/api/agents/plan.ts'),
    layout('routes/admin/admin-layout.tsx', [
        route('Dashboard', 'routes/admin/Dashboard.tsx'),
        route('trips/create', 'routes/admin/plan-trip.tsx'),
        route('trips/:id', 'routes/admin/trip-detail.tsx'),
        route('trips', 'routes/admin/trips.tsx'),
        route('all-users', 'routes/admin/all-users.tsx'),

    ])
] satisfies RouteConfig;
