import "@testing-library/jest-dom/extend-expect";
import { calculate } from "../server/router/price";

jest.mock("../utils/supabaseClient", () => {
const mockSupabaseClient = jest.requireActual(
    "../../__mocks__/supabaseClient"
);
return {
    supabase: mockSupabaseClient.supabase,
    getServiceSupabase: mockSupabaseClient.getServiceSupabase,
};
});

describe("trpc.price", () => {

    it("should return a price", async () => {
        const prices = {
        stdDayRate: 10,
        stdNightRate: 10,
        pcDayRate: 10,
        pcNightRate: 10,
        mbDayRate: 10,
        mbNightRate: 10,
        }
        const price = calculate("10", "Standard", "2021-08-01", "12:00", prices);
        expect(price.total).toEqual(120);
    });
    it("should update the coefficient correctly", async () => {
        const prices = {
        stdDayRate: 10,
        stdNightRate: 10,
        pcDayRate: 10,
        pcNightRate: 10,
        mbDayRate: 10,
        mbNightRate: 10,
        }
        const price1 = calculate("9", "Standard", "2021-08-01", "23:00", prices);
        const price2 = calculate("14", "Standard", "2021-08-01", "23:00", prices);
        const price3 = calculate("19", "Standard", "2021-08-01", "23:00", prices);
        const price4 = calculate("24", "Standard", "2021-08-01", "23:00", prices);
        const price5 = calculate("29", "Standard", "2021-08-01", "23:00", prices);
        const price6 = calculate("49", "Standard", "2021-08-01", "23:00", prices);
        const price7 = calculate("74", "Standard", "2021-08-01", "23:00", prices);
        const price8 = calculate("89", "Standard", "2021-08-01", "23:00", prices);
        const price9 = calculate("99", "Standard", "2021-08-01", "23:00", prices);

        expect(price1.coefficient).toEqual(1.2);
        expect(price2.coefficient).toEqual(1.12);
        expect(price3.coefficient).toEqual(1.1);
        expect(price4.coefficient).toEqual(0.98);
        expect(price5.coefficient).toEqual(0.92);
        expect(price6.coefficient).toEqual(0.8);
        expect(price7.coefficient).toEqual(0.78);
        expect(price8.coefficient).toEqual(0.77);
        expect(price9.coefficient).toEqual(0.74);

    });

    it("should update the rate correctly", () => {
        const prices = {
        stdDayRate: 10,
        stdNightRate: 20,
        pcDayRate: 30,
        pcNightRate: 40,
        mbDayRate: 50,
        mbNightRate: 60,
        }
        const day = "12:00";
        const night = "23:00";
        const std = "Standard";
        const pc = "PC";
        const mpv = "MPV";

        const price1 = calculate("1", std, "2021-08-01", day, prices);
        const price2 = calculate("1", std, "2021-08-01", night, prices);
        const price3 = calculate("1", pc, "2021-08-01", day, prices);
        const price4 = calculate("1", pc, "2021-08-01", night, prices);
        const price5 = calculate("1", mpv, "2021-08-01", day, prices);
        const price6 = calculate("1", mpv, "2021-08-01", night, prices);

        const coefficient = 1.2;

        expect(price1.rate).toEqual(prices.stdDayRate * coefficient);
        expect(price2.rate).toEqual(prices.stdNightRate * coefficient);
        expect(price3.rate).toEqual(prices.pcDayRate * coefficient);
        expect(price4.rate).toEqual(prices.pcNightRate * coefficient);
        expect(price5.rate).toEqual(prices.mbDayRate * coefficient);
        expect(price6.rate).toEqual(prices.mbNightRate * coefficient);

    });

    });