import {
  CollectionCardElement,
  CollectionTextContent,
  RemindMeButton,
  MintButton,
  ContainerFooterCard,
} from "./CollectionCard.style";
import Link from "next/link";
import { dateDecompose } from "../helpers/dataHelpers";
import { ScheduleButton } from "components/ScheduleButton";
import { Disposable } from "@metaplex-foundation/js";
import { useContext, useEffect, useMemo, useState } from "react";
import { getCandyMachineState } from "components/MintButton/candy-machine";

import * as anchor from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { AuthContext } from "contexts/AuthContext";
import { useAtom } from "jotai";
import { AlertScheduleAtom } from "components/ScheduleButton/store";
import { useRouter } from "next/router";
import Loader from "./loader";
import Image from "next/image";
import { useWallet as useWalletAptos } from "@manahippo/aptos-wallet-adapter";

const rpcHost = process.env.NEXT_PUBLIC_REACT_APP_SOLANA_RPC_HOST!;

export function CollectionCard(props) {
  const {
    clc,
    dateNow,
    wallet,
    flipCard,
    isScheduled,
    isSoldOut,
    isPresale,
    aptos,
    isPublic,
  } = props;

  const router = useRouter();

  const walletAptos = useWalletAptos();

  const { hasNft, aptosWallet } = useContext(AuthContext);

  const [alertStateSchedule, setAlertStateSchedule] =
    useAtom(AlertScheduleAtom);

  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState("");
  const [hasAccess, setHasAccess] = useState(false);

  const checkPresale = () => {
    setChecking(true);
    if (hasNft > 158 || hasNft == 0) {
      fetch(
        `https://pengapi.herokuapp.com/api/wallets?[filters][address][$eq]=${wallet.publicKey?.toString()}&populate[presale][populate][0]=project`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
          },
        }
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.data.length > 0) {
            const check = res.data.filter((item: any) => {
              return (
                item.attributes?.presale?.data?.attributes?.project?.data?.id ==
                clc.id
              );
            });
            console.log("check", check);
            if (check.length > 0) {
              setHasAccess(true);
              setTimeout(() => {
                setChecking(false);
                setResult("Wallet is allowed");
              }, 1500);
            } else {
              setHasAccess(false);
              setTimeout(() => {
                setChecking(false);
                setResult("Wallet not allowed");
              }, 1500);
            }
          } else {
            setHasAccess(false);
            setTimeout(() => {
              setChecking(false);
              setResult("Wallet not allowed");
            }, 1500);
          }
        });
    } else {
      setHasAccess(true);
      setTimeout(() => {
        setChecking(false);
        setResult("Wallet is allowed");
      }, 1500);
    }
  };

  const { month, day, year, hours, minutes } = dateDecompose(
    clc.launchDatetime
  );
  const [isEnded, setIsEnded] = useState(false);
  const date = new Date(clc.launchDatetime);

  const compareDates = clc.launchDatetime ? dateNow > date : false;
  const ctaMint = isSoldOut ? "Sold Out" : compareDates ? "Live" : "View";
  const backgroundButtonMint = isSoldOut
    ? "#f05053"
    : compareDates
    ? "#008822"
    : "#730484";

  const showScheduleButton = compareDates ? false : true;
  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const candyMachineId =
    clc.name === "Hiraeth"
      ? "7vdDCeMYkJ7NDAvPT9Hj86PD1MjuuexLiWVgVp3fgHH6"
      : clc.candy_machine_id;
  useEffect(() => {
    if (candyMachineId) {
      const getEndedMint = async () => {
        const connection = new Connection(rpcHost, "confirmed");

        const cndy = await getCandyMachineState(
          anchorWallet,
          candyMachineId,
          connection
        )
          .then((res) => {
            if (res.state.isSoldOut) {
              setIsEnded(true);
            }
          })
          .catch((e) => {
            console.log("e", e);
          });
      };
      getEndedMint();
    }
  }, [candyMachineId]);

  return (
    <CollectionCardElement key={clc.name} className="w-full">
      <div className="h-full w-full aspect-square">
        {!checking ? (
          <img
            src={clc.image}
            alt={clc.name}
            className="aspect-square object-cover"
          />
        ) : false ? (
          <div
            className={`aspect-square object-cover ${
              hasAccess ? "bg-green-500" : "bg-red-500"
            } flex justify-center items-center`}
          >
            <p className="text-center text-xl px-4 text-white">{result}</p>
          </div>
        ) : (
          <div className="aspect-square object-cover bg-[#15132b] flex justify-center items-center">
            <Loader />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 z-50 relative rounded-full overflow-hidden">
            {isPresale &&
              (aptos ? (
                <Image src={"/img/aptos.png"} layout="fill" />
              ) : (
                <Image src={"/img/solana_logo.png"} layout="fill" />
              ))}
          </div>
        </div>
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
            {clc.name}
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
            {clc.launchDatetime && month ? (
              <>
                {month} {day}th, {year}
                <br />
                {hours} : {minutes} (UTC)
              </>
            ) : (
              "TBA"
            )}
          </p>
        </div>
        <ContainerFooterCard>
          {isSoldOut ? (
            <button
              disabled
              className="w-full bg-[#d0312d] py-[6px] rounded-md"
            >
              Sold out
            </button>
          ) : !isPresale && hasNft > 0 ? (
            <MintButton style={{ backgroundColor: backgroundButtonMint }}>
              <Link href={`/collection/${clc.slug}`}>
                <p
                  style={{
                    margin: "0px",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                  }}
                >
                  {ctaMint}
                </p>
              </Link>
            </MintButton>
          ) : isPresale ? (
            <button
              onClick={() => {
                if (!checking && result) {
                  hasAccess &&
                    router.push({
                      pathname: `/collection/${clc.slug}`,
                      query: { aptos: aptos, presale: true },
                    });
                } else {
                  if (aptos) {
                    if (walletAptos.connected && walletAptos.account) {
                      !isPublic
                        ? checkPresale()
                        : router.push({
                            pathname: `/collection/${clc.slug}`,
                            query: {
                              aptos: aptos,
                              presale: true,
                              public: true,
                            },
                          });
                    } else {
                      setAlertStateSchedule({
                        open: true,
                        message: "Please connect your wallet",
                        severity: "error",
                      });
                    }
                  } else {
                    !isPublic
                      ? checkPresale()
                      : router.push({
                          pathname: `/collection/${clc.slug}`,
                          query: { aptos: aptos, presale: true, public: true },
                        });
                  }
                }
              }}
              className={`w-full ${
                checking
                  ? "bg-indigo-700"
                  : result
                  ? hasAccess
                    ? "bg-green-600"
                    : "bg-red-700"
                  : "bg-indigo-700"
              } py-2 rounded-md hover:opacity-70 ${checking && "opacity-60"}`}
            >
              {!checking && result ? (
                <p
                  style={{
                    margin: "0px",
                    color: "#ffffff",
                    fontSize: "14px",
                    letterSpacing: "1px",
                  }}
                >
                  {result}
                </p>
              ) : (
                <p
                  style={{
                    margin: "0px",
                    color: "#ffffff",
                    fontSize: "14px",
                    letterSpacing: "1px",
                  }}
                >
                  {!checking ? "Check Presale" : "Checking..."}
                </p>
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                window.open("https://magiceden.io/marketplace/pengsol");
              }}
              className={`w-full bg-red-700 py-2 rounded-md ${
                checking && "opacity-60"
              }`}
            >
              <p
                style={{
                  margin: "0px",
                  color: "#ffffff",
                  fontSize: "14px",
                  letterSpacing: "1px",
                }}
              >
                You are not a holder
              </p>
            </button>
          )}
          {showScheduleButton && clc.schedule && !isPresale && hasNft > 0 ? (
            <>
              {/* <ScheduleButton isLive={compareDates} /> */}
              <button
                disabled={isScheduled}
                className={`${
                  isScheduled ? "bg-green-700" : "border border-white"
                } text-white px-4 rounded-lg w-full`}
                onClick={() => {
                  flipCard();
                }}
              >
                {isScheduled ? "Scheduled" : "Schedule"}
              </button>
            </>
          ) : null}
        </ContainerFooterCard>
      </CollectionTextContent>
    </CollectionCardElement>
  );
}
