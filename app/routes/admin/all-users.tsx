import { Header } from "../../../components";
import { ColumnsDirective, ColumnDirective, GridComponent } from "@syncfusion/ej2-react-grids";
import { cn, formatDate } from "~/lib/utils";
import { getAllUsers } from "~/appwrite/auth";
import type { Route } from "./+types/all-users"

export const loader = async () => {
    try {
        const result = await getAllUsers(10, 0);
        console.log('Loader result:', result);

        if (!result) {
            return { users: [], total: 0 };
        }

        const { users, total } = result;
        return { users: users || [], total: total || 0 };
    } catch (error) {
        console.error('Loader error:', error);
        return { users: [], total: 0 };
    }
}

const AllUsers = ({ loaderData }: Route.ComponentProps) => {
    const { users } = loaderData;

    console.log('Component users:', users);

    // Ensure users is always an array and normalize the objects
    const safeUsers = Array.isArray(users)
        ? users.map(user => ({ ...user })) // Spread to create normal objects
        : [];

    return (
        <main className="all-users wrapper">
            <Header
                title="Manage Users"
                description="Filter, sort, and access detailed user profiles"
            />

            <GridComponent dataSource={safeUsers} gridLines="None">
                <ColumnsDirective>
                    <ColumnDirective
                        field="name"
                        headerText="Name"
                        width="200"
                        textAlign="Left"
                        template={(props: UserData) => (
                            <div className="flex items-center gap-1.5 px-4">
                                <img src={props.ImageUrl} alt="user" className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer" />
                                <span>{props.name}</span>
                            </div>
                        )}
                    />
                    <ColumnDirective
                        field="email"
                        headerText="Email Address"
                        width="200"
                        textAlign="Left"
                    />
                    <ColumnDirective
                        field="joinedAt"
                        headerText="Date Joined"
                        width="140"
                        textAlign="Left"
                        template={({ joinedAt }: { joinedAt: string }) => formatDate(joinedAt)}
                    />
                    <ColumnDirective
                        field="status"
                        headerText="Type"
                        width="100"
                        textAlign="Left"
                        template={({ status }: UserData) => (
                            <article className={cn('status-column', status === 'user' ? 'bg-success-50' : 'bg-light-300')}>
                                <div className={cn('size-1.5 rounded-full', status === 'user' ? 'bg-success-500' : 'bg-gray-500')} />
                                <h3 className={cn('font-inter text-xs font-medium', status === 'user' ? 'text-success-700' : 'text-gray-500')}>
                                    {status}
                                </h3>
                            </article>
                        )}
                    />
                </ColumnsDirective>
            </GridComponent>
        </main>
    )
}
export default AllUsers