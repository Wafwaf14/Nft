import { Connection } from "@solana/web3.js";
import { getBestNFt } from "components/helpers/getBestNFT";
import { getMintsTokens } from "components/helpers/getMintsToken";
import { ScheduleButton } from "components/ScheduleButton";
import { useEffect, useState } from "react";
import {
  CollectionCardElement,
  CollectionTextContent,
  ContainerFooterCard,
  FlipButton,
} from "./CollectionCard.style";
import dataKing from "../../../data/PengSol_king.json";
import { dateDecompose } from "../helpers/dataHelpers";

export function BackCardSchedule(props): JSX.Element {
  const { wallet, flipCard, clc, flipped, addScheduled } = props;

  const dateNow = new Date();

  //const { month, day, year, hours, minutes } = dateDecompose(
  //  clc.attributes.start_time
 // );
  //const date = new Date(clc.attributes.start_time);
  const [isEnded, setIsEnded] = useState(false);

  //const compareDates = clc.attribues.start_time ? dateNow > date : false;

  const isActive = flipped;

  const [nfts, setNfts] = useState<{
    rank: number;
    name: string;
    address: string;
    tier: string;
  }>({
    rank: 0,
    name: "",
    address: "",
    tier: "",
  });

  useEffect(() => {
    if (wallet) {
      const walletToQuery = wallet.publicKey;

      const fetchData = async () => {
        try {
          const conn = new Connection(
            "https://cool-dry-waterfall.solana-mainnet.discover.quiknode.pro/ef22659f31b8cdf97627b259a7ebae56e4168ded/",
            "confirmed"
          );

          // Get all mint tokens (NFTs) from your wallet
          const walletAddr = wallet.publicKey;
          let mints = await getMintsTokens(walletAddr?.toString());

          const bestNFT = getBestNFt(mints);

          setNfts(bestNFT);
        } catch (error) {
          // console.log(error);
        }
      };
      fetchData();
    }
  }, [wallet, setNfts]);

  return (
    <CollectionCardElement className="w-full h-full flexs flex-col">
      <div style={{ backgroundColor: "#000", display: "flex", width: "100%" }}>
        <img src='GSqS5JhR_400x400.jpg' alt={clc.attributes.Name} height={190} />
      </div>

      <CollectionTextContent>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            alignItems: "center",
          }}
        >
          <p
            style={{
              letterSpacing: "1px",
              fontSize: "14px",
              color: "#ffffff",
              margin: "0px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {clc.attributes.Name}
          </p>
          <p
            style={{
              letterSpacing: "1px",
              fontSize: "14px",
              color: "#59507c",
              margin: "0px",
              textAlign: "center",
            }}
          >
           
          </p>
        </div>
        <ContainerFooterCard>
        

          <div className="flex flex-row w-full gap-4">
            <FlipButton
              className="flex justify-center gap-[8px]"
              onClick={() => {
                flipCard();
              }}
            >
              {/* <div className="w-6 h-6">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                style={{ cursor: "pointer" }}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 13l-4 -4l4 -4m-4 4h11a4 4 0 0 1 0 8h-1" />
              </svg>
            </div> */}
              Back
            </FlipButton>
            
            {/* <button
              className="flex w-full  rounded-lg justify-center items-center bg-green-600"
              onClick={() => {}}
            >
              <div className="w-6 h-6">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                style={{ cursor: "pointer" }}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 13l-4 -4l4 -4m-4 4h11a4 4 0 0 1 0 8h-1" />
              </svg>
            </div>
              Add
            </button> */}
          </div>
        </ContainerFooterCard>
      </CollectionTextContent>
    </CollectionCardElement>
  );
}
