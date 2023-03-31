import React, { useEffect, useState } from "react";
const ProgressBar = (props) => {
  let { size, progress, indicatorColor = `#5ECFFF` } = props;
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
  let indicatorWidth =
    windowDimensions.width > 1022 && windowDimensions.width < 1370 ? 7 : 10;
  let trackWidth = 2;
  const center = size / 2,
    radius =
      center - (trackWidth > indicatorWidth ? trackWidth : indicatorWidth),
    dashArray = 2 * Math.PI * radius,
    dashOffset = dashArray * ((100 - progress) / 100);
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
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <svg
        style={{ width: size, height: size }}
        className="transform rotate-[130deg]"
      >
        <circle
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke={"#1C1E3A"}
          strokeWidth={trackWidth}
        />
        <circle
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke={indicatorColor}
          strokeWidth={indicatorWidth}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap={"round"}
        />
      </svg>
    </div>
  );
};

export default ProgressBar;
