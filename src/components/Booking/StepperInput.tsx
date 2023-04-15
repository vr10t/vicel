import React, { useEffect } from "react";
import { bookingStore } from "../../store/bookingStore";

export default function StepperInput() {
  const min = 1;
  const max = 8;

  const { passengers, setPassengers } = bookingStore();
  function handleIncrement() {
    if (typeof passengers === "string") setPassengers(parseInt(passengers, 10));
    if (passengers < max) {
      setPassengers(passengers + 1);
    }
  }
  function handleDecrement() {
    if (typeof passengers === "string") setPassengers(parseInt(passengers, 10));
    if (passengers > min) {
      setPassengers(passengers - 1);
    }
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    const num = parseInt(value, 10);

    if (num > 0 && num <= max) {
      setPassengers(num);
    }
    if (num < min) {
      setPassengers(min);
    }
    if (num > max) {
      setPassengers(max);
    }
  }
  useEffect(() => {
    if (passengers > max) {
      setPassengers(max);
    }
    if (passengers < min) {
      setPassengers(min);
    }
  }, [passengers]);
  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-5/6 my-2">
      {/* <label htmlFor="custom-input-number" className="w-full text-sm font-semibold text-gray-700">Counter Input
  </label> */}
      <div className="relative flex items-center justify-start w-full h-auto rounded-lg gap-4 ">
        <button
          type="button"
          onClick={handleDecrement}
          className="w-8 h-8 font-bold border-0 rounded-full shadow outline-none cursor-pointer ring-1 duration-200 text-blue-700 ring-blue-700 bg-gray-50 hover:scale-110 hover:text-gray-50 hover:bg-blue-700 hover:ring-blue-600"
        >
          <span className="m-auto text-xl ">&minus;</span>
        </button>
        <input
          min={min}
          max={max}
          value={passengers}
          onChange={handleChange}
          className="flex items-center w-12 h-8 text-lg text-center text-gray-700 border-0 shadow-md outline-none rounded-md focus:ring-2 focus:outline-none focus:ring-blue-700 hover:ring-blue-700 bg-gray-50 hover:bg-gray-50 ring-1 ring-blue-700 text-md hover:text-blue-600 focus:text-blue-700 md:text-base cursor-default"
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="w-8 h-8 font-black border-0 rounded-full shadow outline-none cursor-pointer ring-1 duration-200 text-blue-700 ring-blue-700 bg-gray-50 hover:scale-110 hover:text-gray-50 hover:bg-blue-700 hover:ring-blue-600"
        >
          <span className="m-auto text-xl ">+</span>
        </button>
      </div>
    </form>
  );
}
