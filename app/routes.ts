import { type RouteConfig, layout, route } from "@react-router/dev/routes";
import { tripXAxis } from "./constants";

export default [

    route('sign-in', 'routes/root/sign-in.tsx'),
    route('api/create-trip', 'routes/api/create-trip.ts'),
    layout('routes/admin/admin-layout.tsx', [
        route('Dashboard', 'routes/admin/Dashboard.tsx'),
        route('trips/create', 'routes/admin/create-trip.tsx'),
        route('trips/:id', 'routes/admin/trip-detail.tsx'),
        route('trips', 'routes/admin/trips.tsx'),
        route('all-users', 'routes/admin/all-users.tsx'),

    ])
] satisfies RouteConfig;
