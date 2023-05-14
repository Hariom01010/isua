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
  const [loadedDistance, setLoadedDistance] = useState(false)
  const [routeError, setError] = useState("")

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
      if(originRef.current.value === "" || destRef.current.value === ""){
        return 
      }
      try{
      setError("")
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
      setLoadedDistance(true)
    }catch(error){
      console.log(error.code)
      if(error.code == "ZERO_RESULTS"){
        setError("No route could be found between the origin and destination.")
      }
      if(error.code=="NOT_FOUND"){
        setError("One of the locations is invalid")
      }
    }
  }

  
  // Function to keep track the number of stops 
  function handleStopBtnClick(){
    setStopNo(stop+1)
    console.log(originRef.current.value)
  }

  return (
    <>
    {(!isLoaded)?<p>Loading</p>:
      <>
        <Navbar />
        <div className={styles.mainDiv}>
          <p className={styles.introLine}>Let's calculate <b>distance</b> from Google maps</p>
          <p className={styles.error}>{routeError}</p>

          <div className={styles.routeMainContainer}>
            <div className={styles.routeDiv}>
              <div className={styles.routeCalcDiv}>

                {/* Origin, Stop and Destination Container  */}
                <div className>

                  {/* Origin Container  */}
                  <div className ={styles.routeSetDiv}>
                    <p>Origin</p>
                    <Autocomplete>
                      <input type="text" name="origin" id="origin" className ref={originRef}/>
                    </Autocomplete>
                  </div>

                  {/* Stop  Container*/}
                  <div className ={styles.routeSetDiv}>
                    <div>
                      {stop == 0?"":<p>Stop</p>}
                      {Array.from({ length: stop }, (_, index) => (
                        <StopInput index={index} />
                      ))}
                      <div className={styles.addStopBtn}>
                        {stop==0?<button className onClick={()=>handleStopBtnClick()}><BsPlusCircle size={15}/> <span>Add a Stop</span></button>:<button className onClick={()=>handleStopBtnClick()}><BsPlusCircle size={15}/> <span>Add another Stop</span></button>}
                      </div>
                    </div>
                  </div>

                  {/* Destination Container  */}
                  <div className ={styles.routeSetDiv}>
                    <p>Destination</p>
                    <Autocomplete>
                      <input type="text" name="origin" id="origin" className ref={destRef} />
                    </Autocomplete>
                  </div>  
                </div>

                <div className>
                  <button className={styles.calcBtn} onClick={calculateRoute}>Calculate</button>
                </div>

              </div>

              {loadedDistance?(
              <div className= {styles.resultDiv}>
                <div className={styles.distanceDiv}>
                  <h2>Distance</h2>
                  <h3>{distance}</h3>
                  </div>

                  <div className={styles.distanceDurationDiv}>
                    <p>The distance between <b>{originRef.current.value}</b> and <b>{destRef.current.value}</b> via the selected route is <b>{distance}</b></p>
                    <p>The time between <b>{originRef.current.value}</b> and <b>{destRef.current.value}</b> via the selected route is <b>{duration}</b></p>
                  </div>
                </div>
              ):""}
            </div>
            
          
          {/* Map Container  */}
          <div className={styles.mapDiv}>
            <GoogleMap center={center} zoom={10} mapContainerClassName='map-container' options={options}>
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
      <input type="text" name={`stop${index}`} id={`stop${index}`} className ref={ref}/>
    </Autocomplete>
  )
}