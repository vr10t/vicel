/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Features from "./Features";

// import tailwindcss from 'tailwindcss'
export default function Welcome() {
  return (
    <div
      id="about"
      className="max-w-screen bg-gray-100 mt-80 sm:mt-0 md:mt-72 lg:mt-32">
      {/* <div className="h-20 bg-gray-50"></div> */}
      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0">
            <Image
              width={600}
              height={400}
              className="object-cover object-center rounded"
              alt="hero"
              src="/front-page/british_airways .jpg"
            />
          </div>
          <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
            <h2 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              Make your next flight a breeze.
            </h2>
            <p className="mb-8 leading-relaxed">
              Book your next trip with us and make your flight as smooth as
              possible. We will pick you up from your home and take you to the
              airport. We will also monitor your flight and if it is delayed, we
              will update you and wait for you at the airport. We cover all
              major airports in the UK as well as Hemel Hempstead, Chesham,
              Tring, Berkhamstead, Bovingdon, Watford, Luton, St Albans,
              Redbourne, Harpenden, Kings Langley, Abbots Langley and Markyate.
            </p>
          </div>
        </div>
      </section>

      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h3 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              The most trusted car hire service in the UK
            </h3>
            <p className="mb-8 leading-relaxed">
              Our customers trust us to deliver a fast service and reliable
              service at affordable prices. All our customers are treated with
              respect and dignity. We also provide a variety of vehicles to
              choose from and we are more than happy to help you choose the best
              taxi to pick you up from your place of work, home, a hotel,
              airport or the city centre. Whatever your budget, we can help.{" "}
            </p>
          </div>
          <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
            <Image
              className="object-cover object-center rounded"
              alt="man talking on the phone inside a car"
              width={600}
              height={400}
              src="/front-page/1.jpg"
            />
          </div>
        </div>
      </section>

      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0">
            <Image
              width={600}
              height={400}
              className="object-cover object-center rounded"
              alt="hero"
              src="/front-page/payment.jpg"
            />
          </div>
          <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
            <h4 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              Book with peace of mind.
            </h4>
            <p className="mb-8 leading-relaxed">
              Our taxi drivers have all passed a rigorous background check and
              are ready for you to hire their vehicle. We make sure that our
              fleet is equipped with the latest technology and safety standards
              and the drivers know what to do when they encounter problems.
            </p>
          </div>
        </div>
      </section>

      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h5 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              We cover all your needs.
            </h5>
            <p className="mb-8 leading-relaxed">
              {" "}
              There are no hidden charges and our services are completely
              competitive. If you have any questions about any of the services
              we offer, don&apos;t hesitate to give us a call or request a
              quote. Whatever your requirements, we will be happy help and
              answer your questions.
            </p>
          </div>
          <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
            <Image
              width={576}
              height={384}
              className="object-cover object-center rounded"
              alt="hero"
              src="/front-page/3.jpg"
            />
          </div>
        </div>
      </section>

      <section className="text-gray-600 body-font">
        <div className="container px-5 py-24 mx-auto flex flex-wrap items-center">
          <div className="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
            <h6 className="title-font font-medium text-3xl text-gray-900">
              Need a ride? Reserve a taxi right now!
            </h6>
            <p className="leading-relaxed mt-4">
              {" "}
              Book your taxi with our online booking system and get you ready in
              no time.
            </p>
          </div>
          <div className="lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0">
            <Link href="/#">
              <a className="flex-shrink-0 btn lg">Book now</a>
            </Link>
          </div>
        </div>
      </section>

      <Features />
    </div>
  );
}
