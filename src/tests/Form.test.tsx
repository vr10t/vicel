import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import React from "react";
import Form from "../components/Booking/Form";
import "@testing-library/jest-dom/extend-expect";
import { renderWithTRPC } from "./testUtils";
import Layout from "../components/Layout";
import { Loader } from "../../__mocks__/googleMapsLoader";

jest.mock("../utils/supabaseClient", () => {
  const mockSupabaseClient = jest.requireActual(
    "../../__mocks__/supabaseClient"
  );
  return {
    supabase: mockSupabaseClient.supabase,
    getServiceSupabase: mockSupabaseClient.getServiceSupabase,
  };
});

jest.mock("@googlemaps/js-api-loader", () => {
  const mockLoader = jest.requireActual("../../__mocks__/googleMapsLoader");
  return { Loader: mockLoader.Loader };
});

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: "",
      asPath: "",
    };
  },
}));

describe("Form", () => {
  beforeEach(() => {
    renderWithTRPC(
      <Layout>
        <Form />
      </Layout>
    );
  });

  test("should render the form", () => {
    expect(screen.getByText("Pick me up from:")).toBeInTheDocument();
  });
  test("should render input fields and buttons", () => {
    expect(screen.getByPlaceholderText("Enter your location")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("Please select an airport")).toHaveLength(2)
    expect(screen.getByText("Passengers")).toBeInTheDocument();
    expect(screen.getByText("Pickup Date")).toBeInTheDocument();
    expect(screen.getByText("Pickup Time")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  test("should not submit the form when the input field is empty", async () => {
    fireEvent.click(screen.getByText("Search"));
    await waitFor(() => {
      expect(screen.getByText("Pickup date is required")).toBeInTheDocument();
    });
  });
  test("should load Google Maps API with the correct configuration", () => {
      expect(Loader).toHaveBeenCalledWith({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
        version: "weekly",
        libraries: ["places"],
      });
  });
});
