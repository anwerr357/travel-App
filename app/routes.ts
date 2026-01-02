import { type RouteConfig, layout, route } from "@react-router/dev/routes";

export default [
    layout('routes/admin/admin-layout.tsx',[
        route('Dashboard', 'routes/admin/Dashboard.tsx'),
    ])
] satisfies RouteConfig;
