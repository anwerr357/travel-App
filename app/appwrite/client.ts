
import {Client, Account, TablesDB, Storage} from "appwrite";
export const appwriteConfig= {
    endpointUrl: import.meta.env.VITE_APPWRITE_API_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    apiKey: import.meta.env.VITE_APPWRITE_API_KEY,
    databaseID: import.meta.env.VITE_APPWRITE_DB_ID,
    userTableId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
    tripTableId: import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION_ID,

}
const client = new Client().setEndpoint(appwriteConfig.endpointUrl).setProject(appwriteConfig.projectId);
export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export const storage = new Storage(client); 