import styles from '@/styles/Home.module.css'
import Navbar from './components/Navbar/Navbar'
import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsRenderer } from '@react-google-maps/api'
import { useRef, useState } from 'react'
import { BsPlusCircle } from "react-icons/bs"

const wayPts=[]

export default function Home() {

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [stop, setStopNo] = useState(0);

  const originRef = useRef("");
  const destRef = useRef("");


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
    console.log(wayPts)
      if(originRef.current.value === "" || destRef.current.value === ""){
        return 
      }
      const directionsService = new google.maps.DirectionsService()
      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destRef.current.value,
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints:wayPts
      })
      setDirectionsResponse(results)
      setDistance(results.routes[0].legs[0].distance.text)
      setDuration(results.routes[0].legs[0].duration.text)
  }

  
  // Function to keep track the number of stops 
  function handleStopBtnClick(){
    setStopNo(stop+1)
  }

  return (
    <>
    {(!isLoaded)?<p>Loading</p>:
      <>
        <Navbar />
        <div>
        <p className={styles.introLine}>Let's calculate <b>distance</b> from Google maps</p>
        <div className={styles.mainDiv}>

        <div>
          <div className={styles.infoDiv}>
          {/* Origin and Destination Container  */}
            <div className={styles.originDestDiv}>

              {/* Origin Container  */}
              <div className={styles.originDiv}>
                <p className={`${styles.originLabel} ${styles.inputLabel}`}>Origin</p>
                <Autocomplete>
                  <input type="text" name="origin" id="origin" className={`${styles.input} ${styles.originInput}`} ref={originRef}/>
                </Autocomplete>
              </div>


              {/* Stop  Container*/}
              <div className={styles.stopDiv}>
                <div className={styles.stopDiv1}>
                  {stop == 0?"":<p>Stop</p>}
                  {Array.from({ length: stop }, (_, index) => (
                    <StopInput index={index} />
                  ))}
                  <button className={styles.addStop} onClick={()=>handleStopBtnClick()}><BsPlusCircle /> Add a Stop</button>
                </div>
              </div>


              {/* Destination Container  */}
              <div className={styles.destDiv}>
                <p className={`${styles.destLabel} ${styles.inputLabel}`}>Destination</p>
                <Autocomplete>
                  <input type="text" name="origin" id="origin" className={`${styles.input} ${styles.destInput}`} ref={destRef} />
                </Autocomplete>
              </div>  

            </div>

            <div className={styles.calcDiv}>
                  <button className={styles.calculateBtn} onClick={calculateRoute}>Calculate</button>
            </div>

        </div>
        {originRef.current.value===undefined || destRef.current.value===undefined?""
                :<div className={styles.distDurDiv}>
                    <div className={styles.distance}>
                      <h2>Distance</h2>
                      <h2>{distance}</h2>
                    </div>
                    <div className={styles.duration}>
                      <p>The distance between <b>{originRef.current.value}</b> and <b>{destRef.current.value}</b> via the selected route is <b>{distance}</b></p>
                      <p>The time between <b>{originRef.current.value}</b> and <b>{destRef.current.value}</b> via the selected route is <b>{duration}</b></p>
                    </div>
                  </div>
                  }
        
        </div>

          {/* Map Container  */}
          <div className={styles.mapDiv}>
            <GoogleMap center={center} zoom={15} mapContainerClassName='map-container' options={options}>
              <Marker position={center}/>
              {directionsResponse && < DirectionsRenderer directions={directionsResponse}/>}
            </GoogleMap>
          </div>   
        </div>
        </div>
    </>
    }
    </>

  )
}


function StopInput(props){
  const ref = useRef("")
  const index = props.index

  function  handleChange(index,event, ref){
    const value = ref.current.value
    
    wayPts[index] = {location: value}
  }

  return(
    <Autocomplete onPlaceChanged={()=>{handleChange(index,event, ref)}}>
      <input type="text" name={`stop${index}`} id={`stop${index}`} className={`${styles.input} ${styles.stopInput}`} ref={ref}/>
    </Autocomplete>
  )
}