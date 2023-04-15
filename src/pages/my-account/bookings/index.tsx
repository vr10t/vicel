/* eslint-disable object-shorthand */
import { useRouter } from 'next/router';
import React, { ReactNode, SetStateAction, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { FaAngleRight } from '@react-icons/all-files/fa/FaAngleRight';
import { Spinner } from 'flowbite-react';
import calendar from 'dayjs/plugin/calendar';
import Layout from '../../../components/Layout';
import Sidebar from '../../../components/Account/Sidebar';
import Bookings from '../../../components/Account/Bookings';
import userStore from '../../../store/user';
import { supabase } from '../../../utils/supabaseClient';

export interface Booking {
  last_name: string;
  email: string;
  first_name: string;
  status: string;
  id: string;
  date: string;
  time: string;
  location: string;
  destination: string;
  total: string;
  upcoming?: boolean;
  created_at: string;
  secret: string;
}
export default function MyAccount() {
  
  return (
    <Layout title={`My Bookings `}>
      <Sidebar />
      <div className='flex'>
        
        <Bookings />
      </div>
    </Layout>
  );
}
