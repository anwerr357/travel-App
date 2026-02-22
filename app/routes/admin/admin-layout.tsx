import React from 'react'
import { Outlet, redirect } from 'react-router'
import { SidebarComponent } from '@syncfusion/ej2-react-navigations'
import { NavItems, MobileSidebar } from '@components'
import { account } from '~/appwrite';
import { getExistingUser, storeUserData } from '~/appwrite/auth';

export async function clientLoader() {
    try {
        const user = await account.get();

        if(!user.$id) return redirect('/sign-in');
        const existingUser = await getExistingUser(user.$id);
        if(existingUser?.user === 'user'){
            return redirect('/');
        }

        return existingUser?.$id ? existingUser : await storeUserData();
    } catch (e) {
        console.log('Error in Client loader', e);
        return redirect('/');
    }
}
const AdminLayout = () => {
    return (
        <div className='admin-layout'>
            <MobileSidebar />
            <aside className='w-[270px] hidden lg:block shrink-0'>
                <SidebarComponent width={270} enableGestures={true}>
                    <NavItems />
                </SidebarComponent>
            </aside>
            <aside className='children'>
                <Outlet />
            </aside>
        </div>
    )
}

export default AdminLayout