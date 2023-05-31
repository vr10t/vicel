import { Loader } from "@googlemaps/js-api-loader";
import { env } from "../server/env.mjs";


export  function handleGetDistance(location, destination,callback,date) {
   
  let service
  
   const loader = new Loader({
        apiKey: env.NEXT_PUBLIC_GOOGLE_API_KEY,
        version: "weekly",
        libraries: ["places"],
      });
    
      loader
        .load()
        .then((google) => {
          service = new google.maps.DistanceMatrixService();
          console.log(service);
          
            service.getDistanceMatrix(
              {
                origins: [location],
                destinations: [destination],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.IMPERIAL,
                avoidTolls: true,
                drivingOptions: {
                  departureTime: date,
                  trafficModel: google.maps.TrafficModel.PESSIMISTIC,
                },
                
              },
              callback
            ) ;
            
         
        })
        
        .catch((e) => {
          console.error(e);
        });
    
    
    

    
  }
  export async function reverseGeocode(lat, long) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${env.NEXT_PUBLIC_GOOGLE_API_KEY}`
      );
      const data = await res.json();
      return (data.results[0].formatted_address);
    } catch (err) {
      alert(err.message);
    }
    return {error: "error"};
  }