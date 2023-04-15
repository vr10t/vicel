import React from 'react';
import { FaMapMarkerAlt } from '@react-icons/all-files/fa/FaMapMarkerAlt';
import { BsCalendarFill } from '@react-icons/all-files/bs/BsCalendarFill';
import { FaCheck } from '@react-icons/all-files/fa/FaCheck';
import { FaTaxi } from '@react-icons/all-files/fa/FaTaxi';
import { BsFillPersonFill } from '@react-icons/all-files/bs/BsFillPersonFill';
import { bookingStore, secureStore } from '../../store/bookingStore';

export default function ProgressIcons() {
  const { location, destination, date, time, service, payment } =
    bookingStore();
  const { first_name, last_name, phone, email } = secureStore();
  const completed = 'mx-auto py-2 text-blue-600 ';
  const uncompleted = 'mx-auto py-2 text-gray-500 ';
  return (
    <div className='flex absolute left-0 bottom-5 px-4 w-screen text-4xl bg-gray-100 max-w-screen'>
      <div className={location && destination ? completed : uncompleted}>
        {location && destination ? (
          <FaCheck className='float-right text-sm' />
        ) : (
          ''
        )}
        <FaMapMarkerAlt className='px-1' />
      </div>
      <div className={date ? completed : uncompleted}>
        {date  ? <FaCheck className='float-right text-sm' /> : ''}
        <BsCalendarFill className='px-1' />
      </div>
      <div className={service ? completed : uncompleted}>
        {service ? <FaCheck className='float-right text-sm' /> : ''}
        <FaTaxi className='px-1' />
      </div>
      <div
        className={
          first_name && last_name && email && phone ? completed : uncompleted
        }
      >
        {first_name && last_name && email && phone ? (
          <FaCheck className='float-right text-sm' />
        ) : (
          ''
        )}
        <BsFillPersonFill className='px-1' />
      </div>
    </div>
  );
}
