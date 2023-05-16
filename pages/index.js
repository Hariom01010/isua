import styles from '@/styles/Home.module.css'
import Navbar from './components/Navbar/Navbar'
import Image from 'next/image'
import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsRenderer } from '@react-google-maps/api'
import { useRef, useState } from 'react'
import { BsPlusCircle } from "react-icons/bs"


export default function Home() {
  
  const originIcon = "/Origin Icon.png";
  const destinationIcon = "/Destination Icon.png";
  const stopIcon = "/Stop Icon.png";
  
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [stop, setStopNo] = useState(0);
  const [loadedDistance, setLoadedDistance] = useState(false)
  const [routeError, setError] = useState("")
  const [wayPts, setWayPts]=useState([])

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
      try{
      setDirectionsResponse(null)
      setError("")
      const directionsService = new google.maps.DirectionsService()
      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destRef.current.value,
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints:wayPts
      })

      let totalDistance = 0;
      let totalDuration = 0;

      for (let i = 0; i < results.routes[0].legs.length; i++) {
        totalDistance += results.routes[0].legs[i].distance.value;
        totalDuration += results.routes[0].legs[i].duration.value;
      }

      setDirectionsResponse(results)
      setDistance(formatDistance(totalDistance))
      setDuration(formatDuration(totalDuration))
      setLoadedDistance(true)

      const directionsRenderer = new google.maps.DirectionsRenderer();
      directionsRenderer.setMap(null);

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

  // Helper function to format distance in a user-friendly format
  function formatDistance(distance) {
    return (distance / 1000).toFixed(2) + " km";
  }
  
  // Helper function to format duration in a user-friendly format
  function formatDuration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours} h ${minutes} min`;
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
          <p className={styles.introLine}>Let&apos;s calculate <b>distance</b> from Google maps</p>
          <p className={styles.error}>{routeError}</p>

          <div className={styles.routeMainContainer}>
            <div className={styles.routeDiv}>
              <div className={styles.routeCalcDiv}>

                {/* Origin, Stop and Destination Container  */}
                <div>

                  {/* Origin Container  */}
                  <div className ={styles.routeSetDiv}>
                    <p>Origin</p>
                    <Autocomplete>
                      <div>
                        <input type="text" name="origin" id="origin" ref={originRef} />
                        <Image src="/Origin Icon.png" width={12} height={12} className={styles.originIcon}/>
                      </div>
                    </Autocomplete>
                  </div>

                  {/* Stop  Container*/}
                  <div className ={styles.routeSetDiv}>
                    <div>
                      {stop == 0?"":<p>Stop</p>}
                      {Array.from({ length: stop }, (_, index) => (
                        <StopInput index={index} key={index} wayPts={wayPts} setWayPts={setWayPts}/>
                      ))}
                      <div className={styles.addStopBtn}>
                        {stop==0?<button onClick={()=>handleStopBtnClick()}><BsPlusCircle size={15}/> <span>Add a Stop</span></button>:<button onClick={()=>handleStopBtnClick()}><BsPlusCircle size={15}/> <span>Add another Stop</span></button>}
                      </div>
                    </div>
                  </div>

                  {/* Destination Container  */}
                  <div className ={styles.routeSetDiv}>
                    <p>Destination</p>
                    <Autocomplete>
                      <div>
                        <input type="text" name="origin" id="origin" ref={destRef} />
                        <Image src="/Destination Icon.png" width={15} height={20} className={styles.destIcon}/>
                      </div>
                    </Autocomplete>
                  </div>  
                </div>

                <div className = {styles.calcBtnDiv}>
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
              {directionsResponse && 
              <DirectionsRenderer
                directions={directionsResponse}
                options={{
                  suppressMarkers: true, // Disable default markers
                }}
                onLoad={directionsRenderer => {
                  const originMarker = new window.google.maps.Marker({
                  position: directionsRenderer.directions.routes[0].legs[0].start_location,
                  icon: originIcon,
                  map: directionsRenderer.getMap(),
                  });

                  const destinationMarker = new window.google.maps.Marker({
                    position: directionsRenderer.directions.routes[0].legs[0].end_location,
                    icon: destinationIcon,
                    map: directionsRenderer.getMap(),
                  });

                  // Additional stop markers
                  wayPts.forEach(wayPt => {
                      const stopMarker = new window.google.maps.Marker({
                      position: wayPt.location,
                      icon: stopIcon,
                      map: directionsRenderer.getMap(),
                  });
                  });
                }}
              />
              }
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
    console.log("Before Input:", props.wayPts)
    const updatedWayPts = [...props.wayPts]; // Create a copy of the wayPts array
    updatedWayPts[index] = { location: value }; // Update the value at the specified index
    console.log(updatedWayPts)
    props.setWayPts(updatedWayPts);
    console.log("After Input:", props.wayPts)
    
  }

  return(
    <Autocomplete onPlaceChanged={()=>{handleChange(index,event, ref)}}>
      <div>
        <input type="text" name={`stop${index}`} id={`stop${index}`} ref={ref}/>
        <Image src="/Stop Icon.png" width={15} height={15} className={styles.stopIcon}/>
      </div>
    </Autocomplete>
  )
}