import React, { useEffect, useRef, useState } from "react";

import useOnclickOutside from "react-cool-onclickoutside";
import { bookingStore } from "../../store/bookingStore";

export const AirportSelect = React.forwardRef(
  (props: { which: string }, ref) => {
    const { which } = props;
    const { location, destination, setLocation, setDestination } =
      bookingStore();
    const airports = [
      {
        id: 7,
        name: "London Stansted Airport (STN)",
        lat: 51.884,
        lng: 0.234,
      },
      {
        id: 1,
        name: "London Luton Airport (LTN)",
        lat: 51.8747,
        lng: -0.3683,
      },
      {
        id: 2,
        name: "Heathrow Airport Terminal 1, (LHR)",
        lat: 51.47,
        lng: -0.4543,
      },
      {
        id: 3,
        name: "Heathrow Airport Terminal 2, (LHR)",
        lat: 51.47,
        lng: -0.4543,
      },
      {
        id: 4,
        name: "Heathrow Airport Terminal 3, (LHR)",
        lat: 51.47,
        lng: -0.4543,
      },
      {
        id: 5,
        name: "Heathrow Airport Terminal 4, (LHR)",
        lat: 51.47,
        lng: -0.4543,
      },
      {
        id: 6,
        name: "Heathrow Airport Terminal 5, (LHR)",
        lat: 51.47,
        lng: -0.4543,
      },

      {
        id: 8,
        name: "Gatwick North Terminal, (LGW)",
        lat: 51.1481,
        lng: -0.1903,
      },
      {
        id: 9,
        name: "Gatwick South Terminal, (LGW)",
        lat: 51.1481,
        lng: -0.1903,
      },
      {
        id: 10,
        name: "London City Airport, (LCY)",
      },
      // {
      //   id: 10,
      //   name: "Birmingham International Airport (BHX)",
      // },
    ];
    const [availableAirports, setAvailableAirports] = useState(airports);
    const [apSelected, setSelected] = useState(airports[0]);

    useEffect(() => {
      if (which === "location") {
        setAvailableAirports(
          airports.filter((ap) =>
            ap.name.toLowerCase().includes(location?.toLowerCase())
          )
        );
      }
      if (which === "destination") {
        setAvailableAirports(
          airports.filter((ap) =>
            ap.name.toLowerCase().includes(destination?.toLowerCase())
          )
        );
      }
    }, [apSelected, location, destination]);
    const [active, setActive] = useState(0);
    const [hidden, setHidden] = useState(true);
    const listRef = useOnclickOutside(() => {
      setHidden(true);
    });

    const min = 0;
    const max = availableAirports.length - 1;
    const value = which === "location" ? location : destination;
    return (
      <div className="w-full">
        <div className="flex flex-col">
          <button type="button">
            <input
              className="field"
              type="text"
              name={which}
              placeholder="Please select an airport"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  e.stopPropagation();
                  if (active < max) {
                    setActive(active + 1);
                  }
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  e.stopPropagation();
                  if (active > min) {
                    setActive(active - 1);
                  }
                }
                if (e.key === "Enter") {
                  if (which === "destination") {
                    setDestination(availableAirports[active].name);
                  }
                  if (which === "location") {
                    setLocation(availableAirports[active].name);
                  }
                  setHidden(true);
                }
              }}
              onChange={(e) => {
                setHidden(false);
                setActive(0);
                if (which === "destination") setDestination(e.target.value);
                if (which === "location") {
                  setLocation(e.target.value);
                }
              }}
              value={value}
            />
          </button>

          <div className="relative h-0 bg-red-500 w-">
            <div
              ref={listRef}
              className={`${
                hidden && "hidden"
              } absolute top-2 z-[99999] w-full  bg-white shadow-lg max-h-60 rounded-lg overflow-auto`}
            >
              {availableAirports.map((airport, index) => (
                <button
                  type="button"
                  key={airport.id}
                  className={`${
                    active === index && "bg-gray-100"
                  } hover:bg-gray-100  cursor-pointer text-black w-full   select-none relative py-2 pl-10 pr-4`}
                  onClick={() => {
                    setHidden(true);
                    if (which === "destination") setDestination(airport.name);
                    if (which === "location") setLocation(airport.name);
                  }}
                >
                  {airport.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
