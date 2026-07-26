import type { LoaderFunctionArgs } from "react-router";
import { getAllTrips, getTripById } from "~/appwrite/trips";
import type { Route } from './+types/trip-detail';
import { cn, getFirstWord, parseTripData } from "~/lib/utils";
import { BudgetPanel, Header, InfoPanel, ItineraryDayCard, TripCard } from "../../../components";
import { ChipDirective, ChipListComponent, ChipsDirective } from "@syncfusion/ej2-react-buttons";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { id } = params;
    if(!id) throw new Error ('Trip ID is required');

    const [trip, trips] = await Promise.all([
        getTripById(id),
        getAllTrips(5, 0)
    ]);

    return {
        trip: {
            imageUrls: trip.imageUrls || [],
            details: parseTripData(trip.tripDetails),
            raw: trip.tripDetails
        },
        allTrips: trips.allTrips
            .filter(({ $id }) => $id !== id)
            .slice(0, 4)
            .map(({ $id, tripDetails, imageUrls }) => {
                const parsedTrip = parseTripData(tripDetails);
                return {
                    ...parsedTrip,
                    id: $id,
                    imageUrls: imageUrls && imageUrls.length > 0 ? imageUrls : (parsedTrip?.imageUrls || [])
                };
            })
    }
}

const TripDetail = ({ loaderData }: Route.ComponentProps) => {
    const imageUrls = loaderData.trip.imageUrls as string[];
    const tripData = loaderData.trip.details;
    const raw = loaderData.trip.raw as any;

    if (!tripData) {
        return (
            <main className="wrapper py-20">
                <Header title="Trip Details" description="View AI-generated travel plans" />
                <p className="mt-10 text-center text-gray-500">
                    This trip could not be read. Its saved data may be incomplete.
                </p>
            </main>
        );
    }

    const {
        name, duration, itinerary, travelStyle,
        groupType, budget, interests, estimatedPrice,
        description, bestTimeToVisit, weatherInfo, country
    } = tripData;

    const allTrips = loaderData.allTrips;

    const pillItems = [
        { text: travelStyle, bg: '!bg-pink-50 !text-pink-500' },
        { text: groupType, bg: '!bg-primary-50 !text-primary-500' },
        { text: budget, bg: '!bg-success-50 !text-success-700' },
        { text: interests, bg: '!bg-navy-50 !text-navy-500' },
    ].filter((pill) => pill.text);

    const dateRange = raw?.startDate && raw?.endDate ? `${raw.startDate} → ${raw.endDate}` : null;

    return (
        <main className="travel-detail wrapper">
            <Header title="Trip Details" description="View and edit AI-generated travel plans" />

            <section className="flex flex-col gap-8">
                <header className="flex flex-col gap-4">
                    <h1 className="p-40-semibold text-dark-100">{name}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                            <img src="/assets/icons/calendar.svg" alt="" className="w-4 h-4" />
                            <span className="text-sm text-gray-600">{`${duration} day plan`}</span>
                        </div>
                        {dateRange && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                                <span className="text-sm text-gray-600">{dateRange}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                            <img src="/assets/icons/location-mark.svg" alt="" className="w-4 h-4" />
                            <span className="text-sm text-gray-600">
                                {itinerary?.slice(0, 4).map((item) => item.location).filter(Boolean).join(', ') || country}
                            </span>
                        </div>
                    </div>
                </header>

                {imageUrls.length > 0 && (
                    <section className="gallery">
                        {imageUrls.map((url: string, i: number) => (
                            <img
                                src={url}
                                key={i}
                                alt=""
                                className={cn('w-full rounded-xl object-cover', i === 0
                                    ? 'md:col-span-2 md:row-span-2 h-[330px]'
                                    : 'md:row-span-1 h-[150px]')}
                            />
                        ))}
                    </section>
                )}

                {pillItems.length > 0 && (
                    <ChipListComponent id="travel-chip">
                        <ChipsDirective>
                            {pillItems.map((pill, i) => (
                                <ChipDirective
                                    key={i}
                                    text={getFirstWord(pill.text)}
                                    cssClass={`${pill.bg} !text-base !font-medium !px-4`}
                                />
                            ))}
                        </ChipsDirective>
                    </ChipListComponent>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <section className="rounded-2xl border border-light-400 bg-white p-6">
                            <h2 className="p-24-semibold text-dark-100">
                                {duration}-Day {country} {travelStyle} Trip
                            </h2>
                            <p className="mt-3 text-base leading-relaxed text-dark-400">{description}</p>
                        </section>

                        {itinerary?.map((dayPlan: DayPlan, index: number) => (
                            <ItineraryDayCard
                                key={index}
                                day={dayPlan.day}
                                location={dayPlan.location}
                                date={raw?.itinerary?.[index]?.date}
                                accommodation={raw?.itinerary?.[index]?.accommodation}
                                estimatedCost={raw?.itinerary?.[index]?.estimatedCost}
                                activities={dayPlan.activities}
                                tips={raw?.itinerary?.[index]?.tips}
                            />
                        ))}
                    </div>

                    <aside className="flex flex-col gap-6 lg:sticky lg:top-4 lg:self-start">
                        <BudgetPanel
                            total={raw?.estimatedCost ?? estimatedPrice}
                            duration={duration}
                            breakdown={raw?.budgetBreakdown}
                        />

                        <InfoPanel title="Best Time to Visit" items={bestTimeToVisit} />
                        <InfoPanel title="Weather" items={weatherInfo} />

                        {Array.isArray(raw?.places) && raw.places.length > 0 && (
                            <InfoPanel
                                title="Places on this route"
                                items={raw.places.map((place: PlannerPlace) => `${place.name} — ${place.region}`)}
                            />
                        )}
                    </aside>
                </div>
            </section>

            {allTrips.length > 0 && (
                <section className="flex flex-col gap-6">
                    <h2 className="p-24-semibold text-dark-100">Popular Trips</h2>
                    <div className="trip-grid">
                        {allTrips.map((trip) => (
                            <TripCard
                                key={trip.id}
                                id={trip.id}
                                name={trip.name || 'Untitled Trip'}
                                imageUrl={trip.imageUrls?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'}
                                location={trip.itinerary?.[0]?.location || trip.country || 'Unknown'}
                                tags={[trip.interests, trip.travelStyle].filter((tag): tag is string => Boolean(tag))}
                                price={trip.estimatedPrice || 'Price TBD'}
                            />
                        ))}
                    </div>
                </section>
            )}
        </main>
    )
}
export default TripDetail