import { Header, StatsCard, TripCard } from '@components'
import { dashboardStats } from '~/constants';
import { account } from '~/appwrite/client';
import { getExistingUser, getUser, storeUserData } from '~/appwrite/auth';
import { getAllTrips } from '~/appwrite/trips';
import { parseTripData } from '~/lib/utils';
import { redirect } from 'react-router';
import type { Route } from './+types/Dashboard';
import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        // Get user data and recent trips for dashboard
        const user = await getUser();
        const { allTrips, total } = await getAllTrips(4, 0);
        
        const formattedTrips = allTrips.map(({ $id, tripDetails, imageUrls, $createdAt }) => {
            const parsedTrip = parseTripData(tripDetails);
            return {
                id: $id,
                ...parsedTrip,
                imageUrls: imageUrls && imageUrls.length > 0 ? imageUrls : (parsedTrip?.imageUrls || []),
                createdAt: $createdAt
            };
        });

        return {
            user,
            recentTrips: formattedTrips,
            totalTripsCount: total
        };
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        return {
            user: null,
            recentTrips: [],
            totalTripsCount: 0
        };
    }
};

const { totalUsers, usersJoined, totalTrips, tripsCreated, userRole } = dashboardStats;

const Dashboard = ({ loaderData }: Route.ComponentProps) => {
  const { user, recentTrips, totalTripsCount } = loaderData as { 
    user: User | null; 
    recentTrips: any[]; 
    totalTripsCount: number; 
  };
  return (

    <main className='dashboard wrapper'>
      <Header
        title={`Welcome ${user?.name ?? 'Guest'}`}
        description="Track activity, trends and popular destinations in real time"
      >
      </Header>
      <section className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            headerTitle="Total Users"
            total={totalUsers}
            currentMonthCount={usersJoined.currentMonth}
            lastMonthCount={usersJoined.lastMonth}

          />
          <StatsCard
            headerTitle="Total Trips"
            total={totalTripsCount}
            currentMonthCount={tripsCreated.currentMonth}
            lastMonthCount={tripsCreated.lastMonth}

          />
          <StatsCard
            headerTitle="Total Role"
            total={userRole.total}
            currentMonthCount={userRole.currentMonth}
            lastMonthCount={userRole.lastMonth}

          />
        </div>
      </section>

      <section className='flex flex-col gap-6'>
        <section className='container'>
          <h1 className='text-xl font-semibold text-dark-100'>
            Created Trips
          </h1>
          <div className='trip-grid'>
            {recentTrips.length > 0 ? (
              recentTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  id={trip.id}
                  name={trip.name || 'Untitled Trip'}
                  imageUrl={trip.imageUrls?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'}
                  location={trip.itinerary?.[0]?.location || trip.country || 'Unknown'}
                  tags={[trip.interests, trip.travelStyle].filter(Boolean) as string[]}
                  price={trip.estimatedPrice || 'Price TBD'}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 mb-4">No trips created yet</p>
                <a
                  href="/trips/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Create Your First Trip
                </a>
              </div>
            )}
          </div>
        </section>

      </section>
    </main>
  )
}

export default Dashboard