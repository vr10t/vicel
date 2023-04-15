import { Text } from "@nextui-org/react";
import React from "react";
import Layout from "../components/Layout";

export default function AboutUs() {
  return (
    <Layout
      title="About Us"
      description="Vicel is an airport transfer company based in Hemel Hempstead, Hertfordshire. We provide a reliable, professional and affordable service to and from all major airports in the UK."
    >
      <div className="flex flex-col p-6 gap-2 ">
        <Text h1 size="$4xl">
          About Us
        </Text>
        <Text size="$lg">
          Welcome to Vicel, your premier airport taxi service based in Hemel
          Hempstead, UK. We are committed to providing fast, reliable, and
          affordable transportation to and from the airport for our valued
          customers.
        </Text>
        <Text size="$lg">
          Our team of professional drivers is fully trained and licensed, with
          years of experience navigating the roads and highways of the UK. We
          take pride in offering a safe, comfortable, and stress-free travel
          experience for our passengers. Whether you're flying for business or
          pleasure, we've got you covered.
        </Text>
        <Text size="$lg">
          At Vicel, we understand that convenience and flexibility are important
          to our customers. That's why we offer a variety of vehicle options to
          suit your needs, including sedans, SUVs, and minivans. Our rates are
          transparent and competitive, and we never charge any hidden fees or
          surcharges. We are also available 24/7 to serve you whenever you need
          us.
        </Text>
        <Text size="$lg">
          We are proud to be a locally owned and operated business, and we are
          dedicated to building long-term relationships with our customers. We
          believe in treating every passenger with the respect and
          professionalism they deserve, and we strive to exceed your
          expectations with every ride.
        </Text>
        <Text size="$lg">
          Book a ride with us today and discover the difference. We look forward
          to serving you and becoming your go-to taxi service for all your
          airport transportation needs.
        </Text>
      </div>
    </Layout>
  );
}
