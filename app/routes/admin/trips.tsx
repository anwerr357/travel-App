import React from 'react'
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Header, TripCard } from '~/components'
import { getAllTrips } from '~/appwrite/trips';
import { parseTripData } from '~/lib/utils';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '12');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        
        const { allTrips, total } = await getAllTrips(limit, offset);
        
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
            trips: formattedTrips,
            total,
            limit,
            offset
        };
    } catch (error) {
        console.error('Error loading trips:', error);
        return {
            trips: [],
            total: 0,
            limit: 12,
            offset: 0
        };
    }
};

const Trips = () => {
    const { trips, total } = useLoaderData<typeof loader>();

    return (
        <main className="all-users wrapper">
            <Header
                title="Trips"
                description="View and edit AI-generated travel plans"
                ctaText="Create trip"
                ctaUrl="/trips/create"
            />
            
            <section className="mt-8">
                {trips && trips.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-dark-100">
                                All Trips ({total})
                            </h2>
                        </div>
                        
                        <div className="trip-grid">
                            {trips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    id={trip.id}
                                    name={trip.name || 'Untitled Trip'}
                                    imageUrl={trip.imageUrls?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'}
                                    location={trip.itinerary?.[0]?.location || trip.country || 'Unknown'}
                                    tags={[trip.interests, trip.travelStyle].filter(Boolean) as string[]}
                                    price={trip.estimatedPrice || 'Price TBD'}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No trips found</h3>
                        <p className="text-gray-500 mb-6">Create your first trip to get started</p>
                        <a
                            href="/trips/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Create Trip
                        </a>
                    </div>
                )}
            </section>
        </main>
    )
}

export default Trips