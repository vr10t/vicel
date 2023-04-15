import React from "react";
import Question from "./Question";

export default function FAQ() {
  return (
    <div id="FAQ" className="bg-gray-100">
      <div className="px-4 py-8 mx-auto h-max max-w-screen-2xl sm:px-6 lg:px-8 ">
        <div className="items-end justify-between sm:flex">
          <div className="max-w-xl">
            <p className="text-3xl font-bold tracking-tight text-gray-900 leading-8 sm:text-4xl">
              Frequently Asked Questions
            </p>{" "}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Question
          q="How do I cancel a booking?"
          a="You can cancel a booking on our website by clicking on your upcoming journey and selecting ‘cancel’ or follow the link on your booking confirmation email and this will allow you to cancel the booking."
        />
        <Question
          q="What is your cancelation policy?"
          a="You are able to cancel your booking free of charge up to 24 hours before your journey. If you cancel your booking within 24 hours of your journey, you will be charged the full amount of the booking."
        />
        <Question
          q="Where will my driver meet me at the airport?"
          a="Your driver will meet you at Arrivals with a Vicel name board. You will receive exact instructions of the meeting point in your email confirmation when you make the booking. We use your flight number to track your flight and ensure your driver is waiting for you when you land. We monitor delays and update the time we send your driver accordingly."
        />
        <Question
          q="What if my flight is delayed?"
          a="We monitor your flight and update the time the driver will meet you accordingly."
        />
        <Question
          q="What if my flight is cancelled?"
          a="Because you provide your flight number when you make the booking, we will know if your flight is cancelled. We will contact you to arrange an alternative pick up time. If you do not hear from us, please contact us."
        />
        <Question
          q="What if I can’t find my driver?"
          a="The driver will be in contact with you to make sure you are able to find them. If you are still unable to find them, please contact us and we will help you."
        />

        <Question
          q="What if I need to change my booking?"
          a="If you need to change your booking, please contact us and we will update the time the driver will meet you."
        />
        <Question
          q="Do I need to pay for parking at the airport?"
          a="Yes, you will be charged separately for parking."
        />
        <Question
          q="How much luggage can I take?"
          a="The number of bags you can take depends on the vehicle you have booked. Please check the vehicle details when making your booking. If you are unsure if your luggage will fit, please contact us."
        />
      </div>
    </div>
  );
}
