import React, { useEffect, useState } from 'react'
import Search from './components/search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTredningMovies, updateSearchCount } from './appWrite';

// Debouncing the search input


const API_KEY = import.meta.env.VITE_TMDB_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const API_BASE_URL = 'https://api.themoviedb.org/3';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage]=useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([])

  // Debounce the search term
  // This will only run when the debounceSearchTerm changes
  useDebounce(()=> setDebounceSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const endpoint =query? 
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`:
      `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS); // Use API_OPTIONS here
      if(!response.ok){
        throw Error('Error Fetching Movies')
      }
      const data = await response.json();
      if(data.Response === 'False'){
        setErrorMessage(data.Error || 'Error Fetching Movies')
        setMovieList([])
        return;
      }
      setMovieList(data.results || [])

      if(query){
        updateSearchCount(query, data.results[0])
      }
    } catch(error){
      console.log(error)
      setErrorMessage('Error, Fetching Movies... Try Again Later..')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrendingMovies = async()=>{
    try{
      const movies = await getTredningMovies()
      setTrendingMovies(movies)
    }catch(error){
      console.log(`Error Fetching Trending Movies: ${error}`)
    }
  }


  useEffect(()=>{
    fetchMovies(debounceSearchTerm);
  },[debounceSearchTerm])

  useEffect(()=>{
    loadTrendingMovies();
  },[])
 
  return (
  <main >
    <div className='pattern'/>
    <div className='wrapper'>
      <header>
      <img src='./hero.png' alt='hero banner'/>
      <h1>Find <span className='text-gradient'>Movies</span> you'll Enjoy without the Hassle</h1>
      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
      </header>
    {trendingMovies.length > 0 && (
      <section className='trending mt-10'>
        <h2>Trending Movies</h2>
        <ul>
          {trendingMovies.map((movie, index)=>(
            <li key={movie.$id}>
            <p>{index + 1}</p>
            <img src={movie.poster_url} alt={movie.title}/>
            </li>
          ))}
        </ul>
      </section>
    )}
    <section className='all-movies mt-10'>
      <h2>All Movies</h2>
      {isLoading? (
        <p className='text-white'><Spinner /></p>
      ): errorMessage?  (<p className='text-red-600'>{errorMessage}</p>):
        (
          <ul>
            {movieList.map((movie)=>(
              <MovieCard key={movie.id} movie={movie}/>
            ))}
          </ul>
        )
      }
    </section>
    </div>
  </main>

  )
}

export default App