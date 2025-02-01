import { Client, Databases, ID, Query } from "appwrite";

const DATABSE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;


const client = new Client()
.setEndpoint('https://cloud.appwrite.io/v1')
.setProject(PROJECT_ID)

const database = new Databases(client)

export const updateSearchCount = async(searchTerm, movie)=>{
    // 1. use Appwrite SDK to check if the search term exists in the database
    try{
        const response = await database.listDocuments(DATABSE_ID, COLLECTION_ID, [Query.equal('searchTerm', searchTerm)]);
        if(response.documents.length > 0){
            const doc = response.documents[0]
            await database.updateDocument(DATABSE_ID, COLLECTION_ID, doc.$id, {count: doc.count + 1})
        } else {
            await database.createDocument(DATABSE_ID, COLLECTION_ID,ID.unique(), {
                searchTerm,
                count: 1,
                movie_id : movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            })
        }
    } catch(error){
        console.log(error)
    }
    // 2. If it exists, update the count
    // 3. If it doesn't exist, create a new record with the search term and count of 1

}

export const getTredningMovies = async()=>{
    try{
        const response = await database.listDocuments(DATABSE_ID, COLLECTION_ID, [Query.orderDesc('count', 'DESC'), Query.limit(5)]);
        return response.documents;
    } catch(error){
        console.log(error)
        return []
    }
}