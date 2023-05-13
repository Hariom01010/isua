import styles from '@/styles/Home.module.css'
import Navbar from './components/Navbar/Navbar'
import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsRenderer } from '@react-google-maps/api'
import { useRef, useState } from 'react'
import { BsPlusCircle } from "react-icons/bs"

export default function Home() {

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [stop, setStopNo] = useState(0);

  const originRef = useRef();
  const destRef = useRef();

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
  async function calculateRoute(){
    console.log(originRef.current.value)
    if(originRef.current.value === "" || destRef.current.value === ""){
      return 
    }
  
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
      waypoints:[{
        location:"Ghaziabad",
        location:"Gujarat"
      }]
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
  }


  function handleStopBtnClick(){
    setStopNo(stop+1)
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
              <input type="text" name="origin" id="origin" className={`${styles.input} ${styles.originInput}`} ref={originRef}/>
            </Autocomplete>

            {/* To add a stop  */}
            {stop == 0?"":<p style={{position: "relative", left: "159px", top: "-170px"}}>Stop</p>}
            {Array.from({ length: stop }, (_, index) => (
              <Autocomplete>
                <input type="text" name={`stop${index}`} id={`stop${index}`} className={`${styles.input} ${styles.stopInput}`} style={{position: "relative", left: "159px", top: `${10*index}px`}} />
              </Autocomplete>
            ))}
            <button className={styles.addStop} onClick={handleStopBtnClick}><BsPlusCircle /> Add a Stop</button>

            <p className={`${styles.destLabel} ${styles.inputLabel}`}>Destination</p>
            <Autocomplete>
              <input type="text" name="origin" id="origin" className={`${styles.input} ${styles.destInput}`} ref={destRef} />
            </Autocomplete>

            <button className={styles.calculateBtn} onClick={calculateRoute}>Calculate</button>
          </div>

          {/* Map Container  */}
          <div className={styles.mapDiv}>
            <GoogleMap center={center} zoom={15} mapContainerClassName='map-container' options={options}>
              <Marker position={center}/>
              {directionsResponse && < DirectionsRenderer directions={directionsResponse}/>}
            </GoogleMap>
          </div>   
        </div>
    </>
    }
    </>

  )
}


