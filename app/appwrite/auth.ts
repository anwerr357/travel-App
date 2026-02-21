import { ID, Query } from "appwrite";
import { data, redirect } from "react-router";
import { account, appwriteConfig, database, OAuthProvider } from "~/appwrite";

export const loginWithGoogle = async () => {
    try {
        return await account.createOAuth2Session(
            OAuthProvider.Google,
            'http://localhost:5173/dashboard',
            'http://localhost:5173/sign-in'
        );
    }
    catch (e) {
        console.error("Logging with google: ", e);
        throw e;
    }
}
export const getUser = async () => {
    try {
        const user = await account.get();
        if (!user) return redirect('/sign-in');
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseID,
            appwriteConfig.userCollectionId,
            [
                Query.equal('accountId', user.$id),
                Query.select(['name', 'email', 'imageUrl', 'joinedAt', 'accountId'])
            ]
        );
        return documents[0] || null;
    }
    catch (e) {
        console.error('Error getting user:', e);
        return redirect('/sign-in');
    }
}

export const getGooglePicture = async () => {
    try {
        const user = await account.get();
        if (!user) return null;
        
        // Get OAuth2 token from current session
        const session = await account.getSession('current');
        const accessToken = session.providerAccessToken;
        
        if (!accessToken) {
            console.log('No OAuth2 access token available');
            return null;
        }
        
        // Make request to Google People API to get profile photo
        const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=photos', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Google API error: ${response.status}`);
        }
        
        const data = await response.json();
        const photos = data.photos;
        
        if (photos && photos.length > 0) {
            return photos[0].url;
        }
        
        return null;
    }
    catch (e) {
        console.error('Error getting Google picture:', e);
        return null;
    }
}
export const logoutUser = async () => {
    try {
        await account.deleteSession('current');
        return redirect('/sign-in');
    }
    catch (e) {
        console.error('Error logging out:', e);
        throw e;
    }
}

export const storeUserData = async (userData: { name: string; email: string; imageUrl: string; accountId: string }) => {
    try {
        const document = await database.createDocument(
            appwriteConfig.databaseID,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                ...userData,
                joinedAt: new Date().toISOString()
            }
        );
        return document;
    }
    catch (e) {
        console.error('Error storing user data:', e);
        throw e;
    }
}
export const getExistingUser = async (accountId: string) => {
    try {
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseID,
            appwriteConfig.userCollectionId,
            [
                Query.equal('accountId', accountId)
            ]
        );
        return documents[0] || null;
    }
    catch (e) {
        console.error('Error getting existing user:', e);
        return null;
    }
}