import styles from '@/styles/Home.module.css'
import Navbar from './components/Navbar/Navbar'
import { useJsApiLoader, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api'
import { useRef, useState } from 'react'

export default function Home() {

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const origin = useRef();
  const dest = useRef();

  // Setting options for the google map API 
  const center = {lat:20.5937, lng:78.9629}
  const options = {
    zoomControl:false,
    streetViewControl:false,
    mapTypeControl:false,
    fullscreenControl:false
  }
  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    libraries: ['places']
  })


  // Function to calculate distance, duration and find route 
  async function calculateRoute(originRef, destRef){
    if(originRef.current.value === "" || destRef.current.value === ""){
      return ""
    }
  
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService({
      origin: originRef.current.value,
      destination: destRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
  }


  return (
    <>
    {(!isLoaded)?<p>Loading</p>:
      <>
        <Navbar />
        <p className={styles.introLine}>Let's calculate <b>distance</b> from Google maps</p>
        <div className={styles.mainDiv}>

          {/* Origin and Destination Container  */}
          <div>
            <p className={`${styles.originLabel} ${styles.inputLabel}`}>Origin</p>
            <Autocomplete>
              <input type="text" name="origin" id="origin" className={`${styles.input} ${styles.originInput}`} ref={origin}/>
            </Autocomplete>

            <p className={`${styles.destLabel} ${styles.inputLabel}`}>Destination</p>
            <Autocomplete>
              <input type="text" name="origin" id="origin" className={`${styles.input} ${styles.destInput}`} ref={dest} />
            </Autocomplete>
          </div>

          {/* Map Container  */}
          <div className={styles.mapDiv}>
            <GoogleMap center={center} zoom={4.8} mapContainerClassName='map-container' options={options}>
              <Marker position={center}/>
            </GoogleMap>
          </div>   
        </div>
    </>
    }
    </>

  )
}


