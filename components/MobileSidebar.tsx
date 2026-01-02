import type { SidebarComponent } from '@syncfusion/ej2-react-navigations'
import React from 'react'
import { Link } from 'react-router'

const MobileSidebar = () => {
  let sidebar: SidebarComponent
    return (
    <div className='mobile-sidebar wrapper'>
        <header>
            <Link to='/' className='link-logo'>
                <img src="assets/icons/logo.svg" alt="logo" className='size-[30px]' />
                <h1>Tourvisto Mobile</h1>
            </Link>
        </header>
    </div>  
  )
}

export default MobileSidebar