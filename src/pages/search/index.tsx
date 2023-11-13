import { $post } from "$/utils";
import noDataFound from "$assets/Illustrations/3D/no-results.png";
import { FancySelectString, FlightDetails, Nav, StatCard, TravelersAndClass } from "$components";
import data from "$data/FlyHub/Response/AirSearch.json";
import { SpinnerIcon } from "$icons";
import { Search } from "$interface";
import { useTripType } from "$store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { cn } from "shadcn/lib/utils";

function includes(v1: string, v2: string) {
  return v1.toLowerCase().includes(v1.toLowerCase());
}

export default function Search() {
  const router = useRouter();
  const [selectedAirline, setSelectedAirline] = useState("All");
  const { getCurrentStore, getStat, tripType } = useTripType();

  const { mutate, isPending } = useMutation<Search, Error, ReturnType<typeof getCurrentStore>>({
    mutationKey: ["airSearchRequest"],
    mutationFn: (arg: any) => $post("private/AirSearch", arg),
  });

  function searchAction() {
    const storeValue = getCurrentStore();
    if (!storeValue) return router.push("/");
    mutate(storeValue);
  }

  useEffect(() => {
    // searchAction();
  }, []);

  const filterAirline = useMemo(
    () =>
      Array.from(
        new Set(data?.Results?.map((val) => val.segments?.map((airline) => airline.Airline.AirlineName)).flat())
      ),
    []
  );

  const flights = useMemo(() => {
    if (!data || !Array.isArray(data?.Results)) return [];
    if (selectedAirline === "All") return data.Results;

    return data.Results.filter(
      (flight) => flight.segments.findIndex((v) => includes(v.Airline.AirlineName, selectedAirline)) !== -1
    );
  }, [data, selectedAirline]);

  const stat = getStat();

  const isReturnDateExist = "back" in stat && stat.back;

  return (
    <>
      <Nav />
      <div className="container flex min-h-[calc(100dvh-3.75rem)] flex-col gap-y-4 bg-gradient-to-t from-slate-600 to-slate-900 text-white">
        <div
          className={cn(
            "no-scrollbar grid grid-cols-[repeat(5,minmax(200px,1fr))] gap-2 overflow-y-scroll pt-2 [scroll-snap-type:x_mandatory] [&_*]:[scroll-snap-align:start]",
            {
              "grid-cols-[repeat(6,minmax(200px,1fr))]": isReturnDateExist,
            }
          )}
        >
          <StatCard extra="h-fit" title={"Trip type"} value={tripType} />

          <div className={cn("col-span-3 space-y-2", { "col-span-4": isReturnDateExist })}>
            {"cities" in stat ? (
              stat.cities.map((city) => (
                <div className="flex min-w-max gap-2">
                  <StatCard title="From" value={city.from?.name as string} />
                  <StatCard title="To" value={city.to?.name as string} />
                  <StatCard
                    title="Departure"
                    value={
                      city.departure?.toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) as string
                    }
                  />
                </div>
              ))
            ) : (
              <div className="flex h-full min-w-max gap-2">
                <StatCard title="From" value={stat.from?.name as string} />
                <StatCard title="To" value={stat.to?.name as string} />
                <StatCard
                  title="Departure"
                  value={
                    stat.departure?.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }) as string
                  }
                />
                {isReturnDateExist && (
                  <StatCard
                    title="Return"
                    value={
                      stat.back?.toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) as string
                    }
                  />
                )}
              </div>
            )}
          </div>

          <TravelersAndClass travelerAndClasses={stat.travelerAndClasses} onValueChange={() => {}} statOnly />
        </div>

        {isPending ? (
          <div className="flex h-full flex-grow items-center justify-center text-6xl text-slate-300">
            <SpinnerIcon />
          </div>
        ) : (
          <Fragment>
            {flights?.length > 0 && (
              <FancySelectString
                options={["All", ...filterAirline]}
                onSelect={setSelectedAirline}
                selected={selectedAirline}
              />
            )}

            {flights?.length === 0 ? (
              <img src={noDataFound.src} alt="Not Found" className="mx-auto aspect-square w-96" />
            ) : (
              flights?.map((flight) => (
                <FlightDetails key={flight.ResultID} searchId={data?.SearchId} flightDetails={flight} />
              ))
            )}
          </Fragment>
        )}
      </div>
    </>
  );
}
