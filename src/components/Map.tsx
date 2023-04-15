import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { throttle, debounce } from 'throttle-debounce';
import { Loader } from '@googlemaps/js-api-loader';

const center = { lat: 51.8822, lng: -0.4165 };
type Props = {
  width: number;
  height: number;
  origin: string;
  destination: string;
  shouldFetchDirections: boolean;
  bounds: google.maps.LatLngBounds;
};

function Map(props: Props) {
  const { width, height, origin, destination, shouldFetchDirections, bounds } = props;
  const containerStyle = {
    width,
    height,
  };
  const [mounted, setMounted] = useState(false);
  const [google, setGoogle] = useState<typeof globalThis.google>();
  const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
    version: 'weekly',
    libraries: ['places'],
  });
  const [response, setResponse] = React.useState(null);
  const [map, setMap] = React.useState(null);
  const count = React.useRef(0);
  useEffect(() => {
    loader.load().then((res) => {
      setMounted(true);
      setGoogle(res);
    });
  }, []);
  const onLoad = React.useCallback((_map:any) => {
    
    _map.fitBounds(bounds);
    setMap(_map);
    // draw the bounds for debugging
    const bnds = new globalThis.google.maps.Rectangle({
      // eslint-disable-next-line object-shorthand
      bounds: bounds,
      editable: true,
      draggable: true,
    });
    bnds.setMap(_map);

  }, []);

  const onUnmount = React.useCallback((_map:any) => {
    setMap(null);
  }, []);
  function callback(res:any) {


    if (res !== null) {
      if (res.status === 'OK' && count.current === 0) {
        count.current+=1;
        setResponse(response);
      }
    }
  }
  const directionsCallback = React.useCallback(
    debounce(3000, callback, { atBegin: true }),
    []
  );
  return (
    <>
    <div />
      {mounted && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Child components, such as markers, info windows, etc. */}
          <>
            {destination !== '' && origin !== '' && shouldFetchDirections && (
              <DirectionsService
                // required
               
                options={{
                  travelMode:google!.maps.TravelMode.DRIVING,
                  destination,
                  origin,
                }}
                // required
                callback={directionsCallback}
                // optional
               
              />
            )}

            {response !== null && (
              <DirectionsRenderer
                // required
                options={{
                  directions: response,
                }}
                // optional
                
              />
            )}
          </>
        </GoogleMap>
      )}
    </>
  );
}

export default React.memo(Map);
