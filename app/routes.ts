import { type RouteConfig, layout, route } from "@react-router/dev/routes";

export default [
    route('sign-in', 'routes/root/sign-in.tsx'),
    layout('routes/admin/admin-layout.tsx', [
        route('Dashboard', 'routes/admin/Dashboard.tsx'),
        route('trips/create', 'routes/admin/create-trip.tsx'),
        route('trips', 'routes/admin/trips.tsx'),
        route('all-users', 'routes/admin/all-users.tsx'),

    ])
] satisfies RouteConfig;
