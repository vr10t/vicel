import "@testing-library/jest-dom/extend-expect";
import { renderWithTRPC } from "./testUtils";
import  Summary  from "../pages/booking/summary";
import { waitFor } from "@testing-library/react";
import { formatAmountForDisplay } from "../utils/stripe-helpers";

jest.mock("../store/bookingStore.ts", () => ({
  secureStore: jest.fn(() => ({
    first_name: "John",
    last_name: "Doe",
    email: "johndoe@gmail.com",
    phone: "123456789",
    total_trip_price: 3242,
    setTotalTripPrice: jest.fn(),
    user_id: "1",
  })),
  bookingStore: jest.fn(() => ({
  })),
}));

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/booking/summary",
      pathname: "",
      query: "",
      asPath: "",
    };
  },
}));
jest.mock("../utils/supabaseClient", () => {
const mockSupabaseClient = jest.requireActual(
    "../../__mocks__/supabaseClient"
);
return {
    supabase: mockSupabaseClient.supabase,
    getServiceSupabase: mockSupabaseClient.getServiceSupabase,
};
});

// jest.mock("react-hot-toast", () => {
//   const { Toaster } = jest.requireActual("react-hot-toast");
//   const toast = jest.fn();
  
// return { toast, Toaster };
// });

describe("Summary", () => {
    it("should render the summary page", () => {
        const { getByText } = renderWithTRPC(<Summary />)
        expect(getByText("Book Now")).toBeInTheDocument();
    });

    it("should successfully book a trip", async () => {
        const { getByText } = renderWithTRPC(<Summary />)
        const button = getByText("Book Now");
        expect(button).toBeInTheDocument();
        expect(button).toBeEnabled();
        // button.click();
        expect(getByText("John Doe")).toBeInTheDocument();
        expect(getByText("johndoe@gmail.com")).toBeInTheDocument();
        expect(getByText("123456789")).toBeInTheDocument();
    })
});
