import { useState } from 'react'
import { Outlet, redirect } from 'react-router'
import { NavItems, MobileSidebar } from '@components'
import { account } from '~/appwrite';
import { getExistingUser, storeUserData } from '~/appwrite/auth';
import { cn } from '~/lib/utils';


export async function clientLoader() {
    try {
        const user = await account.get();

        if(!user.$id) return redirect('/sign-in');

        const existingUser = await getExistingUser(user.$id);

        if(existingUser?.status === 'user') {
            return redirect('/sign-in');
        }

        return existingUser?.$id ? existingUser : await storeUserData();
    } catch (e) {
        console.log('Error in clientLoader', e)
        return redirect('/sign-in')
    }
}

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className='admin-layout relative'>
            <MobileSidebar />

            <aside
                className={cn(
                    'hidden lg:block shrink-0 h-full overflow-x-hidden overflow-y-auto border-r border-light-400 bg-white transition-[width] duration-300',
                    collapsed ? 'w-0' : 'w-[270px]'
                )}
            >
                <div className='w-[270px] h-full'>
                    <NavItems />
                </div>
            </aside>

            <button
                type='button'
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!collapsed}
                className='hidden lg:flex items-center justify-center absolute top-4 z-20 size-9 rounded-lg border border-light-400 bg-white shadow-sm cursor-pointer transition-[left] duration-300'
                style={{ left: collapsed ? 12 : 282 }}
            >
                <img
                    src='/assets/icons/arrow-left.svg'
                    alt=''
                    className={cn('size-4 transition-transform duration-300', { 'rotate-180': collapsed })}
                />
            </button>

            <aside className='children'>
                <Outlet />
            </aside>
        </div>
    )
}

export default AdminLayout