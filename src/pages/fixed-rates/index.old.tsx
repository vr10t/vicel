import { Text, Table, Button, Spacer, Loading } from "@nextui-org/react";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { formatAmountForDisplay } from "../../utils/stripe-helpers";
import { trpc } from "../../utils/trpc";

export default function FixedRates() {
  const columns = [
    { key: "city", label: "" },
    { key: "standard", label: "Standard" },
    { key: "peopleCarrier", label: "People Carrier" },
    { key: "mpv", label: "MPV" },
    { key: "book", label: "" },
  ];
  type Row = {
    key: string;
    name: string;
    standard: number | undefined;
    peopleCarrier: number | undefined;
    mpv: number | undefined;
  };
  const { data: prices, isLoading } = trpc.useQuery(["price.fixed"], {
    refetchOnWindowFocus: false,
  });
  const airports = prices?.map((airport, index) => ({
    key: airport.id,
    airport: airport.name,
    cities: [
      {
        key: "hemel",
        name: "Hemel Hempstead",
        standard: airport.hemelS,
        peopleCarrier: airport.hemelP,
        mpv: airport.hemelM,
      },
      {
        key: "luton",
        name: "Luton",
        standard: airport.lutonS,
        peopleCarrier: airport.lutonP,
        mpv: airport.lutonM,
      },
      {
        key: "watford",
        name: "Watford",
        standard: airport.watfordS,
        peopleCarrier: airport.watfordP,
        mpv: airport.watfordM,
      },
      {
        key: "albans",
        name: "St Albans",
        standard: airport.albansS,
        peopleCarrier: airport.albansP,
        mpv: airport.albansM,
      },
      {
        key: "kings",
        name: "King's Langley",
        standard: airport.kingsS,
        peopleCarrier: airport.kingsP,
        mpv: airport.kingsM,
      },
      {
        key: "abbots",
        name: "Abbots Langley",
        standard: airport.abbotsS,
        peopleCarrier: airport.abbotsP,
        mpv: airport.abbotsM,
      },
      {
        key: "redbourn",
        name: "Redbourn",
        standard: airport.redbournS,
        peopleCarrier: airport.redbournP,
        mpv: airport.redbournM,
      },
      {
        key: "bovingdon",
        name: "Bovingdon",
        standard: airport.bovingdonS,
        peopleCarrier: airport.bovingdonP,
        mpv: airport.bovingdonM,
      },
      {
        key: "tring",
        name: "Tring",
        standard: airport.tringS,
        peopleCarrier: airport.tringP,
        mpv: airport.tringM,
      },
      {
        key: "berkhamsted",
        name: "Berkhamsted",
        standard: airport.berkhamstedS,
        peopleCarrier: airport.berkhamstedP,
        mpv: airport.berkhamstedM,
      },
    ] as Row[],
  }));

  const router = useRouter();

  return (
    <Layout
      title="Fixed Rates"
      description="Looking for a reliable and cost-effective way to travel? Our Fixed Rates page has you covered! We offer fixed prices for popular routes, including airport transfers. With our fixed rates, you'll know exactly what to expect when you book a ride with us. No hidden fees, no surprises – just convenient and affordable travel. Browse our selection of fixed-price packages and book your ride today!"
    >
      <div className="p-4">
        <Text h1 size="$3xl">
          Welcome to our Fixed Rates page!
        </Text>
        <Text size="$xl">
          Our fixed-price packages offer a convenient and cost-effective
          solution for all your travel needs, including airport transfers and
          round-trip journeys, with no hidden fees or surprises.
        </Text>
        <Spacer />
        {isLoading ? (
          <div className="flex justify-center w-full">
            <Loading />
          </div>
        ) : (
          airports?.map((airport, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="mb-10">
              <div className="flex justify-center w-full mb-2">
                <Text h2 className="" size="$2xl">
                  {airport.airport
                    ?.replace("Airport", "")
                    .replace(
                      "London",
                      airport.airport.includes("LCY") ? "London" : ""
                    )
                    .replace(/\(.*\)/, "")
                    .trim()}
                </Text>
              </div>
              <Table
                bordered
                lined
                hoverable
                shadow={false}
                css={{
                  height: "auto",
                  minWidth: "100%",
                }}
              >
                <Table.Header columns={columns}>
                  {(column) => (
                    <Table.Column key={column.key}>{column.label}</Table.Column>
                  )}
                </Table.Header>
                <Table.Body items={airport.cities}>
                  {(city) => (
                    <Table.Row key={city.key}>
                      {(columnKey: React.Key) => {
                        switch (columnKey) {
                          case "city":
                            return <Table.Cell>{city.name}</Table.Cell>;
                          case "book":
                            return (
                              <Table.Cell>
                                <Button
                                  className="hidden sm:flex"
                                  auto
                                  ghost
                                  onClick={() =>
                                    router.push(
                                      `/fixed-rates/${
                                        city.name
                                      }-to-${airport.airport
                                        ?.replace("Airport", "")
                                        .replace("London", "")
                                        .replace(/\(.*\)/, "")
                                        .trim()}`
                                    )
                                  }
                                >
                                  Book Now &rarr;
                                </Button>
                                <Button
                                  className="sm:hidden"
                                  auto
                                  ghost
                                  onClick={() =>
                                    router.push(
                                      `/fixed-rates/${
                                        city.name
                                      }-to-${airport.airport
                                        ?.replace("Airport", "")
                                        .replace("London", "")
                                        .replace(/\(.*\)/, "")
                                        .trim()}`
                                    )
                                  }
                                >
                                  <Text color="primary" size="$lg">
                                    &rarr;
                                  </Text>
                                </Button>
                              </Table.Cell>
                            );
                          default:
                            return (
                              <Table.Cell>
                                {formatAmountForDisplay(city[columnKey], "GBP")}
                              </Table.Cell>
                            );
                        }
                      }}
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          ))
        )}

        <Spacer />
      </div>
    </Layout>
  );
}
