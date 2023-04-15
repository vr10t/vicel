import React from 'react';
import {FaQuestion} from '@react-icons/all-files/fa/FaQuestion';

type Props = {
    q: string;
    a: string;
  };
export default function Question(props:Props) {
  
  const { q, a } = props;
    return (
        <details className="p-6 mx-2 border-l-4 border-blue-700 rounded-3xl shadow-sm bg-gray-50 group" open={false}>
    <summary className="flex items-center gap-4 cursor-pointer">
      <FaQuestion className='text-gray-500 text-xl' />
      <div className='flex justify-between items-center w-full'>
      <p className="text-lg font-medium hover:text-sky-600 text-gray-900">
        {q}
      </p>
      <span
        className="flex-shrink-0 ml-1.5 p-1.5 text-gray-600 bg-white shadow-sm ring-1 ring-gray-600 rounded-full sm:p-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0 w-5 h-5  transition duration-300 group-open:-rotate-45"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      </div>
    </summary>

    <p className="mt-4 leading-relaxed text-gray-700">
      {a}
    </p>
  </details>
    )
}