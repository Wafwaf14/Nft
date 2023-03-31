import React, { useEffect, useState } from "react";
import ProgressBar from "../ProgressBar";
import dynamic from "next/dynamic";

const Summary = ({
  discordFollowers,
  twitterFollowers,
  security,
}: {
  discordFollowers: number;
  twitterFollowers: number;
  security: number;
}) => {
  const hasWindow = typeof window !== "undefined";

  function getWindowDimensions() {
    const width = hasWindow ? window.innerWidth : null;
    const height = hasWindow ? window.innerHeight : null;
    return {
      width,
      height,
    };
  }

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  // For progressBar
  let twitterProgresss = (twitterFollowers / 50000) * 100;
  let discordProgress = (discordFollowers / 50000) * 100;
  let securityProgress = (security / 10) * 100;
  useEffect(() => {
    if (hasWindow) {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [hasWindow]);
  return (
    <main className="w-full h-full rounded-xl p-6 sm:p-0">
      <div className="mb-4">
        <p className="text-2xl sm:text-base lg:text-lg font-bold mb-1 font-Cairo">
          Project Summary
        </p>
        <p className="text-lg sm:text-sm text-gray-500 font-OpenSans">
          Numbers
        </p>
      </div>
      <div className="relative flex justify-center items-center w-full h-56 lg:h-44 mb-6">
        {/* Twitter Progress Component */}
        <ProgressBar
          progress={twitterProgresss}
          size={
            windowDimensions.width > 1022 && windowDimensions.width < 1370
              ? 150
              : 200
          }
        />
        {/* Discord Progress Component */}
        <ProgressBar
          size={
            windowDimensions.width > 1022 && windowDimensions.width < 1370
              ? 120
              : 170
          }
          progress={discordProgress}
          indicatorColor="#FFFF"
        />
        {/* Security Progress Component */}
        <ProgressBar
          size={
            windowDimensions.width > 1022 && windowDimensions.width < 1370
              ? 90
              : 140
          }
          progress={securityProgress}
          indicatorColor="#FFAB2D"
        />
      </div>
      {/* Quantity elements */}
      <div className="w-full p-3 sm:p-0 sm:px-1">
        <div className="flex justify-between mb-2 items-center">
          <p className="text-base flex items-center">
            <span
              className={`w-4 h-4 sm:w-3 sm:h-3 bg-[#5ECFFF] rounded-full mr-4`}
            ></span>
            <span className="tracking-wide md:text-base">Twitter</span>
          </p>
          <p key={twitterFollowers} className="text-xl lg:text-lg font-Cairo">
            {twitterFollowers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </p>
        </div>
        <div className="flex justify-between mb-2 ">
          <p className="text-sm flex items-center">
            <span
              className={`w-4 h-4 sm:w-3 sm:h-3 bg-[#FFFF] rounded-full mr-4`}
            ></span>
            <span className=" tracking-wide md:text-base">Discord</span>
          </p>
          <p
            key={discordFollowers}
            className="text-xl  lg:text-lg font-bold font-Cairo"
          >
            {discordFollowers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm flex items-center">
            <span
              className={`w-4 h-4 sm:w-3 sm:h-3 bg-[#FFAB2D] rounded-full mr-4`}
            ></span>
            <span className=" tracking-wide md:text-base">Security</span>
          </p>
          <p
            key={security}
            className="text-xl  lg:text-lg font-bold font-Cairo"
          >
            {security}/10
          </p>
        </div>
      </div>
    </main>
  );
};

export default dynamic(() => Promise.resolve(Summary), { ssr: false });
