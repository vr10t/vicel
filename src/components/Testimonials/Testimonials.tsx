
import React from "react";
import Review from "./Testimonial";


export default function Reviews() {
  return (
    <div className="">
      <section className="bg-gray-100">
        <div className="px-4 py-16 mx-auto max-w-screen-2xl sm:px-6 lg:px-8">
          <div className="items-end justify-between sm:flex">
            <div className="max-w-xl">
              <p className="text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
                Read trusted reviews from our customers
              </p>
            </div>

            <a
              className="inline-flex no-underline items-center flex-shrink-0 mt-8 btn lg"
              href="/">
              Read all reviews
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 ml-3 z-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-3">
            <Review
            title="Great company"
              author="Jennifer Hill"
              review="Such an easy company to deal with and they are all such nice people. We are a choir with need to be transported to venues. They go out of their way to accommodate us and we will certainly be using them for our transport needs in the future!"
            />

            <Review
            title="Friendly people"
              author="Pragna Dilip Trivedi"
              review="Malcolm drove 15 ladies for a yoga retreat in Scotland & everyone enjoyed the safe & smooth ride we all had. I would recommend the company , they are very friendly & easy to deal with 👌👌"
            />

            <Review
            title="Amazing service"
              author="Jignasa Odedra "
              review="Great services, we hired minibus for 3 nights to Scotland. I would highly recommend it. specially the Malcom, who drove to us, fantastic, friendly, easy going."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
