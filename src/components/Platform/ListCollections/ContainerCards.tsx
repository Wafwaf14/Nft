import { a, useSpring } from "@react-spring/web";
import { useState } from "react";
import { BackCardSchedule } from "./BackCardSchedules";
import { CollectionCard } from "./CollectionCard";

import styles from "./styles.module.css";
interface Props {
  data: Array<{
      id: number;
      attributes: {
          Name: string;
          start_time: string;
          end_time: string;
          createdAt: string;
          updatedAt: string;
          publishedAt: string;
      }
  }>;
}

export function ContainerCard(props): JSX.Element {
    const {
        clc,
        dateNow,
       
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
              clc={clc}
              dateNow={dateNow}
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
              clc={clc}
            />
          </a.div>
        </div>
      );
    }
    