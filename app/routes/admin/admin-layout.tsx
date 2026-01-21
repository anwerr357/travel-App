import React from 'react'
import { Outlet } from 'react-router'
import { SidebarComponent } from '@syncfusion/ej2-react-navigations'
import { NavItems, MobileSidebar } from '@components'
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