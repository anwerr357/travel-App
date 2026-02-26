import { Link, NavLink, useLoaderData, useNavigate } from 'react-router'
import { logoutUser } from '~/appwrite/auth';
import { sidebarItems } from '~/constants'
const NavItems = ({ handleClick }: { handleClick?: () => void }) => {
    const user = useLoaderData();
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logoutUser();
        navigate('/sign-in');
    }
    return (
        <section className='nav-items'>
            <Link to='/' className='link-logo'>
                <img src="/assets/icons/logo.svg" alt="logo" className='size-[30]' />
                <h1>Tourvisto</h1>
            </Link>
            <div className='container'>
                <nav>
                    {sidebarItems.map(({ id, href, icon, label }) => (
                        <NavLink key={id} to={href} onClick={handleClick}>
                            {({ isActive }: { isActive: boolean }) => (
                                <div className={`nav-item ${isActive ? 'active' : ''}`}>
                                    <img src={icon} alt={label} />
                                    <h1>{label}</h1>
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>
                <footer className='nav-footer'>
                    <img src={user?.ImageUrl || '/assets/icons/user.svg'} alt={user.name} referrerPolicy='no-referrer' />
                    <article>
                        <h2>{user?.name}</h2>
                        <p>{user?.email}</p>
                    </article>
                    <button
                        onClick={() => {
                            handleLogout();
                        }}
                        className='cursor-pointer'

                    >
                        <img src="/assets/icons/logout.svg" alt="logout" className='size-6' />
                    </button>
                </footer>
            </div>
        </section>
    )
}
export default NavItems