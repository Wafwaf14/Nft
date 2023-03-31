import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Router, { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { CollectionCard } from "./CollectionCard";
import {
  CollectionWrapper,
  ContainerContent,
  HeaderContent,
  IconWrapper,
  SearchBar,
  SearchContainer,
} from "./ListCollections.style";

import dataKing from "../../../data/PengSol_king.json";
import { getBestNFt } from "components/helpers/getBestNFT";
import { getMintsTokens } from "components/helpers/getMintsToken";
import Link from "next/link";
import { getCsrfToken, getSession, signIn, signOut } from "next-auth/react";
import { ContainerCard } from "./ContainerCard";
import { Session } from "next-auth";
import { getToken } from "next-auth/jwt";
import Loader from "./loader";
import { AuthContext } from "contexts/AuthContext";
import { BCS, TxnBuilderTypes } from "aptos";
import { CircularProgress } from "@material-ui/core";
import { useAtom } from "jotai";
import { AlertScheduleAtom } from "components/ScheduleButton/store";
import { useWallet as useWalletAptos } from "@manahippo/aptos-wallet-adapter";

export function ListCollections(): JSX.Element {
  const router = useRouter();
  const wallet = useWallet();

  const walletAptos = useWalletAptos();

  const [aptosStatus, setAptosStatus] = useState(null);

  const [alertStateSchedule, setAlertStateSchedule] =
    useAtom(AlertScheduleAtom);

  const { hasNft, aptosWallet, setAptosWallet } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);

  const [selectedNetwork, setSelectedNetwork] = useState("aptos");

  const [collections, setCollections] = useState<
    {
      id: number;
      name: string;
      image: string;
      launchDatetime: string;
      slug: string;
      candy_machine_id: string;
      soldout: boolean;
      aptos: boolean;
    }[]
  >([]);

  const [allCollections, setAllCollections] = useState<
    {
      id: number;
      name: string;
      image: string;
      launchDatetime: string;
      slug: string;
      candy_machine_id: string;
      soldout: boolean;
      aptos: boolean;
    }[]
  >([]);

  const [liveProjects, setLiveProjects] = useState<
    {
      id: number;
      name: string;
      image: string;
      launchDatetime: string;
      slug: string;
      candy_machine_id: string;
      soldout: boolean;
    }[]
  >([]);
  const [upcomingProjects, setUpcomingProjects] = useState<
    {
      id: number;
      name: string;
      image: string;
      launchDatetime: string;
      slug: string;
      candy_machine_id: string;
      soldout: boolean;
    }[]
  >([]);
  const [soldoutProjects, setSoldoutProjects] = useState<
    {
      id: number;
      name: string;
      image: string;
      launchDatetime: string;
      slug: string;
      candy_machine_id: string;
      soldout: boolean;
    }[]
  >([]);
  const [presaleProjects, setPresaleProjects] = useState<
    {
      id: number;
      name: string;
      image: string;
      launchDatetime: string;
      slug: string;
      candy_machine_id: string;
      soldout: boolean;
      aptos: boolean;
      presale_public: boolean;
    }[]
  >([]);

  const [scheduledProjects, setScheduledProjects] = useState<number[]>([]);
  const [soldOutProjects, setSoldOutProjects] = useState<number[]>([]);

  const checkState = (item: any) => {
    const date = new Date(item.launchDatetime);
    const compareDates = item.launchDatetime ? new Date() > date : false;
    const state = item.soldout
      ? "sold_out"
      : compareDates
      ? "live"
      : "upcoming";
    return state;
  };

  const [search, setSearch] = useState("");

  const [session, setSession] = useState<Session>();

  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const csrfToken = await fetch("/api/get-token-example")
        .then((response) => response.json())
        .then(({ jwt }) => jwt);
      setToken(csrfToken);
    };
    fetchToken();

    const fetchSession = async () => {
      const session = await getSession();
      if (!session) {
        router.push("/");
      }
      setSession(session);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (wallet && !wallet.connected) {
      router.push("/");
    }

    if (wallet && wallet.connected) {
      const fetchData = async () => {
        try {
          // Get all mint tokens (NFTs) from your wallet
          const walletAddr = wallet.publicKey;

          let mints = await getMintsTokens(walletAddr?.toString());

          const bestNFT = getBestNFt(mints);

          const BestfoundInKing = dataKing.find(
            (kingPeng) => kingPeng === bestNFT.name
          );

           console.log('>>> BestfoundInKing : ',BestfoundInKing)
           console.log('>>> bestNFT : ',bestNFT)
          console.log('>>> mints : ',mints)
           console.log('>>> walletAddr?.toString() :',walletAddr?.toString())
          if (
            !BestfoundInKing &&
            bestNFT.rank === 0 &&
            walletAddr?.toString() !==
              "HZTL2GEEuB3PF2K5zXjnKQeb8D2UwGrfzpW3kfNTiPTu" &&
            walletAddr?.toString() !==
              "2g6gZQbyrZ3yc1LitsG1MMzerRjgYKKCPf4TNPCnVBwj" &&
            walletAddr?.toString() !==
              "8B4HYMuXFUEC4mdzEcp8NwA3kKF9kvXCCY9U2AeUf3hx"
          ) {
            router.push("/");
          }
        } catch (error) {
          // console.log(error);
        }
      };
      // fetchData();
    }
  }, [wallet]);

  // const getSoldOutProjects = () => {
  //   fetch("/api/soldouts?populate[projects][fields][0]=id", {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   })
  //     .then((request) => request.json())
  //     .then(({ data }) => {
  //       let ids: number[] = [];
  //       data.length > 0 &&
  //         data[0].attributes.projects.data.map((item: any) => {
  //           ids.push(item.id);
  //         });
  //       setSoldOutProjects(ids);
  //     });
  // };

  const getScheduledProjects = () => {
    fetch("/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((request) => request.json())
      .then((data) => {
        fetch(
          "/api/premints?populate=project&&[filters][user][id][$eq]=" + data.id,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
          .then((response) => response.json())
          .then(({ data }) => {
            let ids: number[] = [];

            data &&
              data.map(
                (item: {
                  attributes: {
                    status: string;
                    project: {
                      data: {
                        id: number;
                        attributes: {};
                      };
                    };
                  };
                }) => {
                  item.attributes?.project?.data?.id &&
                    ids.push(item.attributes.project.data.id);
                }
              );
            setScheduledProjects(ids);
            getAllProjects(ids);
          });
      });
  };

  const isScheduled = (id: number) => {
    return scheduledProjects?.includes(id);
  };

  const isSoldOut = (id: number) => {
    return soldOutProjects?.includes(id);
  };

  const addScheduled = (id: number) => {
    setScheduledProjects([...scheduledProjects, id]);
  };

  const getAllProjects = (ids: number[]) => {
    fetch("/api/projects?sort[0]=mintDate%3Adesc&pagination[pageSize]=100", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then(({ data }) => {
        if (data) {
          data
            .filter(
              (collection: { attributes: { status: boolean } }) =>
                collection.attributes.status
            )
            .map(
              (collection: {
                id: number;
                attributes: {
                  name: string;
                  mintDate: string;
                  slug: string;
                  img_url: string;
                  candy_machine_id: string;
                  schedule: any;
                  sold_out: boolean;
                  presale: boolean;
                  aptos: boolean;
                  presale_public: boolean;
                };
              }) => {
                const item = {
                  id: collection.id,
                  name: collection.attributes.name,
                  image: collection.attributes.img_url,
                  launchDatetime: collection.attributes.mintDate,
                  slug: collection.attributes.slug,
                  candy_machine_id: collection.attributes.candy_machine_id,
                  schedule: collection.attributes.schedule,
                  soldout: collection.attributes.sold_out,
                  presale: collection.attributes.presale,
                  aptos: collection.attributes.aptos,
                  presale_public: collection.attributes.presale_public,
                };
                const state = checkState(item);
                if (state !== "sold_out" && item.presale) {
                  setPresaleProjects((presaleProjects) => [
                    ...presaleProjects,
                    item,
                  ]);
                } else if (state === "live" && !item.presale) {
                  setLiveProjects((liveProjects) => [...liveProjects, item]);
                } else if (state === "upcoming" && !item.presale) {
                  ids.includes(item.id)
                    ? setLiveProjects((liveProjects) => [...liveProjects, item])
                    : setUpcomingProjects((upcomingProjects) => [
                        ...upcomingProjects,
                        item,
                      ]);
                } else if (state === "sold_out" && !item.presale) {
                  setSoldoutProjects((soldoutProjects) => [
                    ...soldoutProjects,
                    item,
                  ]);
                }
              }
            );
          setAllCollections(
            data
              .reverse()
              .filter(
                (collection: { attributes: { status: boolean } }) =>
                  collection.attributes.status
              )
              .map(
                (collection: {
                  id: number;
                  attributes: {
                    name: string;
                    mintDate: string;
                    slug: string;
                    img_url: string;
                    candy_machine_id: string;
                    schedule: any;
                  };
                }) => ({
                  id: collection.id,
                  name: collection.attributes.name,
                  image: collection.attributes.img_url,
                  launchDatetime: collection.attributes.mintDate,
                  slug: collection.attributes.slug,
                  candy_machine_id: collection.attributes.candy_machine_id,
                  schedule: collection.attributes.schedule,
                })
              )
          );
          setCollections(
            data
              .reverse()
              .filter(
                (collection: { attributes: { status: boolean } }) =>
                  collection.attributes.status
              )
              .map(
                (collection: {
                  id: number;
                  attributes: {
                    name: string;
                    mintDate: string;
                    slug: string;
                    img_url: string;
                    candy_machine_id: string;
                    schedule: any;
                    soldout: boolean;
                    aptos: boolean;
                  };
                }) => ({
                  id: collection.id,
                  name: collection.attributes.name,
                  image: collection.attributes.img_url,
                  launchDatetime: collection.attributes.mintDate,
                  slug: collection.attributes.slug,
                  candy_machine_id: collection.attributes.candy_machine_id,
                  schedule: collection.attributes.schedule,
                  soldout: collection.attributes.soldout,
                  aptos: collection.attributes.aptos,
                })
              )
          );
        }
        setLoading(false);
      });
  };

  /* <button
                          onClick={() => {
                            sendTransaction();
                          }}
                          disabled={loadingTransaction}
                          className={`w-full ${
                            loadingTransaction
                              ? "opacity-50"
                              : "hover:opacity-70"
                          } font-medium bg-[#2ed8a7]
                             sm:py-2 pt-4 px-6 rounded-lg`}
                        >
                          {loadingTransaction ? (
                            <CircularProgress
                              size={20}
                              style={{ color: "#000" }}
                            />
                          ) : (
                            "Send Transaction"
                          )}
                        </button> */

  useEffect(() => {
    if (token) {
      // getSoldOutProjects();
      getScheduledProjects();
    }
  }, [token]);

  let searchInArray = (searchQuery, array, objectKey = null) => {
    const result = array.filter((d) => {
      let data = objectKey ? d[objectKey] : d;

      return data.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return result;
  };

  const resultSearch = searchInArray(search, allCollections, "name");
  const dateNow = new Date();

  useEffect(() => {
    if (search.length === 0) {
      setCollections(allCollections);
    } else {
      // console.log(">>> research : ", resultSearch);

      setCollections(resultSearch);
    }
    // console.log(">>> collections : ", collections);
  }, [search]);

  const [loadingTransaction, setLoadingTransaction] = useState(false);

  const sendTransaction = async () => {
    setLoadingTransaction(true);
    setAlertStateSchedule({
      open: true,
      message: "Processing transaction...",
      severity: "info",
      hideDuration: 4000,
    });
    const transaction = {
      arguments: [
        "0xa047328b2ccf5ccce6e2135b6fc61903c907e00480c50b1b82da335d2bb785c0",
        100_000_000,
      ],
      function: "0x1::coin::transfer",
      type: "entry_function_payload",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
    };
    await (window as any).aptos
      .signAndSubmitTransaction(transaction)
      .then((res) => {
        setLoadingTransaction(false);
        setAlertStateSchedule({
          open: true,
          message: "You have send 1 APT successfully !",
          severity: "success",
        });
      })
      .catch((e) => {
        setLoadingTransaction(false);
        setAlertStateSchedule({
          open: true,
          message: "Transaction failed! Please try again!",
          severity: "error",
        });
      });
  };

  console.log(">>> presaleProjects : ", presaleProjects);

  return (
    <ContainerContent id="ListCollection">
      <div className=" flex flex-col-reverse sm:flex-row justify-end items-center pt-4 px-8 mx-auto w-full">
        <p className="font-medium text-white text-lg  m-0 pt-4 sm:py-2 text-left bg-[#15132b] px-6 rounded-xl mr-4">
          {allCollections.length} Projects
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <SearchContainer>
            <div
              style={{
                height: "18px",
                width: "18px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src="/img/path-1@1x.png"
                layout="fill"
                objectFit="contain"
              />
            </div>

            <SearchBar
              placeholder="Search here"
              onChange={(event) => {
                setSearch(event.target.value);
              }}
            />
          </SearchContainer>
          <div className="flex flex-row gap-4">
            {/* <IconWrapper>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px",
                  padding: "0px 13px",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    height: "5px",
                    width: "100%",
                    backgroundColor: "#464366",
                    borderRadius: "2px 2px 0px 0px",
                  }}
                />
                <div
                  style={{
                    height: "6px",
                    width: "100%",
                    backgroundColor: "#464366",
                  }}
                />
                <div
                  style={{
                    height: "5px",
                    width: "100%",
                    backgroundColor: "#464366",
                    borderRadius: "0px 0px 2px 2px",
                  }}
                />
              </div>
            </IconWrapper> */}
            {/* <IconWrapper className="ml-0">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "8px 8px",
                  gridColumnGap: "1px",
                  gridRowGap: "1px",
                }}
              >
                <div
                  style={{
                    height: "8px",
                    width: "8px",
                    backgroundColor: "#671186",
                    borderRadius: "2px",
                  }}
                />
                <div
                  style={{
                    height: "8px",
                    width: "8px",
                    backgroundColor: "#671186",
                    borderRadius: "2px",
                  }}
                />
                <div
                  style={{
                    height: "8px",
                    width: "8px",
                    backgroundColor: "#671186",
                    borderRadius: "2px",
                  }}
                />
                <div
                  style={{
                    height: "8px",
                    width: "8px",
                    backgroundColor: "#671186",
                    borderRadius: "2px",
                  }}
                />
              </div>
            </IconWrapper> */}
            <Link href="/onBoarding">
              <IconWrapper>
                <svg width="32" height="32" fill="#671186" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>
              </IconWrapper>
            </Link>
          </div>
        </div>
      </div>

      {!loading ? (
        <>
          {true && (
            <div>
              {presaleProjects.length > 0 && (
                <div className="flex flex-row items-center w-11/12 ml-8  border-b border-gray-500">
                  <p className="font-bold text-white text-2xl tracking-wider m-0 pt-2 sm:pb-4 text-left  ">
                    Presale
                  </p>
                </div>
              )}

              <div
                key={allCollections.length}
                className="grid xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-8 py-8 px-8 "
              >
                {presaleProjects.map((clc) => (
                  <ContainerCard
                    key={clc.slug}
                    clc={clc}
                    isPresale={true}
                    dateNow={dateNow}
                    wallet={wallet}
                    aptos={clc.aptos}
                    isPublic={clc.presale_public}
                    isScheduled={isScheduled(clc.id)}
                    isSoldOut={isSoldOut(clc.id)}
                    addScheduled={() => addScheduled(clc.id)}
                  />
                ))}
              </div>
            </div>
          )}
          <div>
            {liveProjects.length > 0 && (
              <p className="font-bold text-white text-2xl tracking-wider m-0 pt-2 sm:pb-4 text-left ml-8  border-b border-gray-500 w-11/12">
                Live projects
              </p>
            )}

            <div
              key={allCollections.length}
              className="grid xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-8 py-8 px-8 "
            >
              {liveProjects.map((clc) => (
                <ContainerCard
                  key={clc.slug}
                  clc={clc}
                  dateNow={dateNow}
                  wallet={wallet}
                  isPresale={false}
                  isScheduled={isScheduled(clc.id)}
                  isSoldOut={isSoldOut(clc.id)}
                  addScheduled={() => addScheduled(clc.id)}
                />
              ))}
            </div>
          </div>
          <div>
            {upcomingProjects.length > 0 && (
              <p className="font-bold text-white text-2xl tracking-wider m-0 pt-2 sm:pb-4 text-left ml-8  border-b border-gray-500 w-11/12">
                Upcoming projects
              </p>
            )}

            <div
              key={allCollections.length}
              className="grid xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-8 py-8 px-8 "
            >
              {upcomingProjects
                .sort(function (a, b) {
                  return (
                    new Date(b.launchDatetime).valueOf() -
                    new Date(a.launchDatetime).valueOf()
                  );
                })
                .map((clc) => (
                  <ContainerCard
                    key={clc.slug}
                    clc={clc}
                    dateNow={dateNow}
                    wallet={wallet}
                    isPresale={false}
                    isScheduled={isScheduled(clc.id)}
                    isSoldOut={isSoldOut(clc.id)}
                    addScheduled={() => {
                      addScheduled(clc.id);
                      const newLive = liveProjects;
                      newLive.push(clc);
                      const newUpcoming = upcomingProjects.filter(
                        (item) => item.id !== clc.id
                      );
                      setLiveProjects(newLive);
                      setUpcomingProjects(newUpcoming);
                    }}
                  />
                ))}
            </div>
          </div>
          <div>
            {soldoutProjects.length > 0 && (
              <p className="font-bold text-white text-2xl tracking-wider m-0 pt-2 sm:pb-4 text-left ml-8  border-b border-gray-500 w-11/12">
                Soldout projects
              </p>
            )}

            <div
              key={allCollections.length}
              className="grid xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-8 py-8 px-8 "
            >
              {soldoutProjects.map((clc) => (
                <ContainerCard
                  key={clc.slug}
                  clc={clc}
                  dateNow={dateNow}
                  wallet={wallet}
                  isScheduled={isScheduled(clc.id)}
                  isSoldOut={clc.soldout}
                  addScheduled={() => addScheduled(clc.id)}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="w-full flex h-5/6 justify-center items-center">
          <Loader />
        </div>
      )}
    </ContainerContent>
  );
}
