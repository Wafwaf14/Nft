import { a, useSpring } from "@react-spring/web";
import { useState } from "react";
import { BackCardSchedule } from "./BackCardSchedule";
import { CollectionCard } from "./CollectionCard";

import styles from "./styles.module.css";

export function ContainerCard(props): JSX.Element {
  const {
    clc,
    dateNow,
    wallet,
    isScheduled,
    addScheduled,
    isSoldOut,
    isPresale,
    aptos,
    isPublic,
  } = props;

  const [flipped, setFlip] = useState(false);
  const { transform, opacity } = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });

  const flipCard = () => {
    setFlip((state) => !state);
  };

  return (
    <div style={{ position: "relative" }}>
      <a.div
        style={{ opacity: opacity.to((o) => 1 - o), transform }}
        className="w-full"
      >
        <CollectionCard
          key={clc.slug}
          clc={clc}
          dateNow={dateNow}
          wallet={wallet}
          flipCard={flipCard}
          flipped={flipped}
          isScheduled={isScheduled}
          isSoldOut={isSoldOut}
          isPresale={isPresale}
          aptos={aptos}
          isPublic={isPublic}
        />
      </a.div>
      <a.div
        style={{
          opacity,
          transform,
          rotateY: "180deg",
          position: "absolute",
          top: "0px",
          zIndex: flipped ? "10" : "-1",
        }}
        className="w-full"
      >
        <BackCardSchedule
          wallet={wallet}
          flipCard={flipCard}
          clc={clc}
          flipped={flipped}
          addScheduled={addScheduled}
        />
      </a.div>
    </div>
  );
}
