/* eslint-disable react/style-prop-object */
import { Tooltip } from "flowbite-react";
import { FaUsers } from "@react-icons/all-files/fa/FaUsers";
import { FaSuitcase } from "@react-icons/all-files/fa/FaSuitcase";
import { FaAngleDown } from "@react-icons/all-files/fa/FaAngleDown";
import React, { ReactNode, useState } from "react";

type Props = {
  htmlFor: string;
  selected: boolean;
  image: ReactNode;
  name: string;
  passengers: string;
  luggage: string;
  children: ReactNode;
};

export default function Service(props: Props) {
  const { htmlFor, selected, image, name, passengers, luggage, children } =
    props;
  const selectedServiceClass = "ring-2 ring-blue-700 ";
  return (
    <label
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
      role="option"
      aria-selected={selected}
      tabIndex={0}
      htmlFor={htmlFor}
      className={`${selected ? selectedServiceClass : ""} hover:bg-gray-50
                hover:ring-2 
                duration-200 
                flex 
                flex-col
                xxs:flex-row
                cursor-pointer
                gap-1 
                items-center 
                appearance-none 
                bg-gray-100 
                w-80 xxs:w-full sm:max-w-max
                lg:py-4 
                  
                lg:px-10 
                my-4  mx-auto 
                rounded-lg 
                active:ring-2 
                focus:ring-2  active:ring-blue-600 active:bg-gray-50
                xxs:h-44`}>
      <input id={htmlFor} type="radio" className="hidden" />
      <div className="sm:py-5 ">
        <div className="flex items-center w-32 h-20">{image}</div>
      </div>
      <div className="flex flex-col xxs:flex-row justify-center ">
        <div className="xxs:flex flex-col gap-1 w-full max-w-full max-h-full xxs:text-left">
          <p className="text-lg text-center xxs:block">{name}</p>
          {children}
        </div>

        <div className="flex xxs:flex-col gap-4 xxs:gap-0 justify-center items-end  xxs:pr-4 self-center ">
          <div
            aria-label="Passengers"
            className="flex flex-col items-center self-end">
            <Tooltip style="light" content="Passengers">
              <FaUsers aria-label="Passengers" className="text-blue-700" />
            </Tooltip>
            {passengers}
          </div>
          <div
            aria-label="Luggage"
            className="flex flex-col items-center self-end">
            <Tooltip style="light" content="Luggage">
              <FaSuitcase aria-label="Luggage" className="text-blue-700" />
            </Tooltip>
            {luggage}
          </div>
        </div>
      </div>
    </label>
  );
}
