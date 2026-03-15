import { Query } from "appwrite";
import { appwriteConfig, tablesDB } from "~/appwrite";

// Safe parsing helper functions
function safeParseTripDetail(tripDetail: any): any {
    if (!tripDetail) return null;
    if (typeof tripDetail === 'string') {
        try {
            return JSON.parse(tripDetail);
        } catch (error) {
            console.warn('Failed to parse tripDetail:', error);
            return null;
        }
    }
    return tripDetail; // Already parsed object
}

function safeParseImageUrls(imageUrls: any): string[] {
    if (!imageUrls) return [];
    if (Array.isArray(imageUrls)) return imageUrls; // Already an array
    if (typeof imageUrls === 'string') {
        try {
            const parsed = JSON.parse(imageUrls);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.warn('Failed to parse imageUrls:', error);
            return [];
        }
    }
    return [];
}

export const getTripById = async (tripId: string) => {
    try {
        const trip = await tablesDB.getRow({
            databaseId: appwriteConfig.databaseID,
            tableId: appwriteConfig.tripTableId,
            rowId: tripId
        });
        
        return {
            ...trip,
            tripDetails: safeParseTripDetail(trip.tripDetail),
            imageUrls: safeParseImageUrls(trip.imageUrls)
        };
    } catch (error) {
        console.error('Error fetching trip:', error);
        throw error;
    }
};

export const getAllTrips = async (limit: number = 10, offset: number = 0) => {
    try {
        const { rows: trips, total } = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseID,
            tableId: appwriteConfig.tripTableId,
            queries: [
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc('createdAt')
            ]
        });

        const allTrips = trips.map((trip) => ({
            ...trip,
            tripDetails: safeParseTripDetail(trip.tripDetail),
            imageUrls: safeParseImageUrls(trip.imageUrls)
        }));

        return {
            allTrips,
            total
        };
    } catch (error) {
        console.error('Error fetching trips:', error);
        throw error;
    }
};

export const getTripsByUserId = async (userId: string, limit: number = 10) => {
    try {
        const { rows: trips } = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseID,
            tableId: appwriteConfig.tripTableId,
            queries: [
                Query.equal('userId', userId),
                Query.limit(limit),
                Query.orderDesc('createdAt')
            ]
        });

        return trips.map((trip) => ({
            ...trip,
            tripDetails: safeParseTripDetail(trip.tripDetail),
            imageUrls: safeParseImageUrls(trip.imageUrls)
        }));
    } catch (error) {
        console.error('Error fetching user trips:', error);
        throw error;
    }
};