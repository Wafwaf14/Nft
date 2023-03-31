import Head from "next/head";
import { Container } from "components/Platform/Platform.style";
import Image from "next/image";

import { Menu } from "components/Platform/Menu";
import {
    ContainerContent,
    HeaderContent,
    SearchContainer,
    SearchBar,
    IconWrapper,
    CollectionWrapper
} from "../components/Platform/ListCollections/ListCollections.style"
import { useEffect, useMemo, useState } from "react";
import Router, { useRouter } from "next/router";
import { Session } from "next-auth";
import { ContainerCard } from "../components/Platform/ListCollections/ContainerCards";
import { Grid } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import image from "./GSqS5JhR_400x400.jpg"
import { Header } from "components/Platform/Header";
import * as anchor from "@project-serum/anchor";
import { getCsrfToken, getSession, signIn, signOut } from "next-auth/react";

import { useAtom } from "jotai";
import { AlertAtom } from "components/MintButton/store";
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  createAccountsForMint,
  getCandyMachineState,
  getCollectionPDA,
  mintOneToken,
  SetupState,
} from "components/MintButton/candy-machine";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Commitment,
  Connection,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import { getAtaForMint, toDate } from "components/MintButton/utils";
import confetti from "canvas-confetti";
import { DEFAULT_TIMEOUT } from "components/MintButton/connection";
import Loader from "components/Platform/ListCollections/loader";
interface Bid {
    id: number;
    attributes: {
      Name: string;
      start_time: string;
      end_time: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      bid_price : string;
      buy_now_price : string;
      image: {
        data: {
            id: number;
            attributes: {
                formats: {
                    thumbnail: {
                        url: string;
                    }
                }
            }
        }
    }

    }
  }
  interface ApiData {
    data: Bid[];
  }
const rpcHost = process.env.NEXT_PUBLIC_REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(
  rpcHost ? rpcHost : anchor.web3.clusterApiUrl("devnet")
);

const cluster = process.env.NEXT_PUBLIC_REACT_APP_SOLANA_NETWORK.toString();
const decimals = process.env.NEXT_PUBLIC_REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS
  ? +process.env.NEXT_PUBLIC_REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS!.toString()
  : 9;
const splTokenName = process.env.NEXT_PUBLIC_REACT_APP_SPL_TOKEN_TO_MINT_NAME
  ? process.env.NEXT_PUBLIC_REACT_APP_SPL_TOKEN_TO_MINT_NAME.toString()
  : "TOKEN";

const getCandyMachineId = (
  candyIDString: string
): anchor.web3.PublicKey | undefined => {
  try {
    const candyMachineId = new anchor.web3.PublicKey(candyIDString);

    return candyMachineId;
  } catch (e) {
    // console.log("Failed to construct CandyMachineId", e);
    return undefined;
  }
};

const Bidpage = () => {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const handleShowMenu = () => {
    setShowMenu(true);
  };
  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  // CANDY MACHINE CONFIGURATION

  function throwConfetti(): void {
    confetti({
      particleCount: 400,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  const [candyMachineId, setCandyMachineId] = useState<anchor.web3.PublicKey>();

  const [balance, setBalance] = useState<number>();
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
  const [isActive, setIsActive] = useState(false); // true when countdown completes or whitelisted
  const [solanaExplorerLink, setSolanaExplorerLink] = useState<string>("");
  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [payWithSplToken, setPayWithSplToken] = useState(false);
  const [price, setPrice] = useState(0);
  const [priceLabel, setPriceLabel] = useState<string>("SOL");
  const [whitelistPrice, setWhitelistPrice] = useState(0);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);
  const [isBurnToken, setIsBurnToken] = useState(false);
  const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [isPresale, setIsPresale] = useState(false);
  const [isWLOnly, setIsWLOnly] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [remainingTimes, setRemainingTimes] = useState([]);


  const [alertState, setAlertState] = useAtom(AlertAtom);

  const [needTxnSplit, setNeedTxnSplit] = useState(true);
  const [setupTxn, setSetupTxn] = useState<SetupState>();
  let searchInArray = (searchQuery, array, objectKey = null) => {
    const result = array.filter((d) => {
      let data = objectKey ? d[objectKey] : d;

      return data.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return result;
  };

  const [loading, setLoading] = useState(false);

  const wallet = useWallet();

  const solFeesEstimation = 0.012; // approx of account creation fees
  const [collections, setCollections] = useState<
  {
    id : number;
    Name: string;
    start_time: string;
    end_time: string;
    createdAt: string;
    updateAt: string;
    publishedAt: string;
  }[]
>([]);

const [allCollections, setAllCollections] = useState<
  {
    id : number;
    Name: string;
    start_time: string;
    end_time: string;
    createdAt: string;
    updateAt: string;
    publishedAt: string;
  }[]
>([]);
useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://pengapi.herokuapp.com/api/bids?populate=image');
        const data: ApiData = await response.json();
        setBids(data.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

const resultSearch = searchInArray(search, allCollections, "name");
const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
useEffect(() => {
  if (search.length === 0) {
    setCollections(allCollections);
  } else {
    // console.log(">>> research : ", resultSearch);

    setCollections(resultSearch);
  }
  // console.log(">>> collections : ", collections);
}, [search]);
const [liveProducts, setLiveProducts] = useState<
  {
    id : number;
    Name: string;
    start_time: string;
    end_time: string;
    createdAt: string;
    updateAt: string;
    publishedAt: string;
  }[]
>([]);
const [upcomingProducts, setUpcomingProducts] = useState<
  {
    id : number;
    Name: string;
    start_time: string;
    end_time: string;
    createdAt: string;
    updateAt: string;
    publishedAt: string;
  }[]
>([]);
const [soldoutProducts, setSoldoutProducts] = useState<
  {
    id : number;
    Name: string;
    start_time: string;
    end_time: string;
    createdAt: string;
    updateAt: string;
    publishedAt: string;
  }[]
>([]);
const [token, setToken] = useState(null);
const [remainingTime, setRemainingTime] = useState(null);

const [session, setSession] = useState<Session>();

let intervalId = null;
useEffect(() => {
    const intervalsId = bids.map((bid, index) => {
        const endTime = new Date(bid.attributes.end_time).getTime();
        let intervalId = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;
            if (distance < 0) {
                clearInterval(intervalId);
                setRemainingTimes((prevState) => {
                    const newRemainingTimes = [...prevState];
                    newRemainingTimes[index] = "The event has ended!";
                    return newRemainingTimes;
                });
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setRemainingTimes((prevState) => {
                    const newRemainingTimes = [...prevState];
                    newRemainingTimes[index] = `Time remaining: ${days}d ${hours}h ${minutes}m ${seconds}s`;
                    return newRemainingTimes;
                });
            }
        }, 1000);
        return intervalId;
    });
    return () => intervalsId.forEach((intervalId) => clearInterval(intervalId));
}, [bids]);
  
useEffect(() => {
    const fetchToken = async () => {
      const csrfToken = await fetch("/api/get-token-example")
        .then((response) => response.json())
        .then(({ jwt }) => jwt);
      setToken(csrfToken);
    };
    fetchToken();
    
  }, []);
const checkState = (item: any) => {
    const date = new Date(item.start_time);
    const compareDates = item.start_time ? new Date() > date : false;
    const state = item.soldout
      ? "sold_out"
      : compareDates
      ? "live"
      : "upcoming";
    return state;
  };
  const [bidValue, setBidValue] = useState(0);
const [submitting, setSubmitting] = useState(false);
const handleBid = async (bidValue: number, bidId: number) => {
  if (!bidValue) {
    return alert("Please enter a bid value");
  }

  try {
    const { data: bidTxns } = await fetch(
      `https://pengapi.herokuapp.com/api/bid-txns?bid_id=${bidId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());

    // check if bidValue is bigger than bid_price
    const bidTxn = bidTxns.find((txn) => txn.attributes.bid < bidValue);
    if (!bidTxn) {
      return alert("Bid value should be bigger than bid_price");
    }

    const { data } = await fetch(`https://pengapi.herokuapp.com/api/bids`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bid_id: bidId,
        bid_value: bidValue,
        address: bidTxn.attributes.address,
        transaction: bidTxn.attributes.transaction,
        status: 'Done', // post "Done" instead of the value from the API response
        createdAt: bidTxn.attributes.createdAt,
        updatedAt: bidTxn.attributes.updatedAt,
        publishedAt: bidTxn.attributes.publishedAt,
      }),
    }).then((res) => res.json());
    // Handle the success response
  } catch (error) {
    // Handle the error
  }
};
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
          "https://pengapi.herokuapp.com/api/bids" + data.id,
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
                (data: {
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
                  data.attributes?.project?.data?.id &&
                    ids.push(data.attributes.project.data.id);
                }
              );
            getAllProjects(ids);
          });
      });
  };
  useEffect(() => {
    if (token) {
      // getSoldOutProjects();
      getScheduledProjects();
    }
  }, [token]);
const getAllProjects = (ids: number[]) => {
    fetch("https://pengapi.herokuapp.com/api/bids", {
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
              (data: {
                id: number;
                attributes: {
                  Name: string;
                  start_time: string;
                  end_time: string;
                  createdAt: string;
                  updatedAt: string;
                  publishedAt: string;
                  buy_now_price : string;
                  bid_price : string;
                  image: {
                    data: {
                        id: number;
                        attributes: {
                            formats: {
                                thumbnail: {
                                    url: string;
                                }
                            }
                        }
                    }
                }
                  
                };
              }) => {
                const item = {
                  id: data.id,
                  Name: data.attributes.Name,
                  start_time: data.attributes.start_time,
                  end_time: data.attributes.end_time,
                  createdAt: data.attributes.createdAt,
                  updatedAt: data.attributes.updatedAt,
                  publishedAt: data.attributes.publishedAt,
                  buy_now_price : data.attributes.buy_now_price,
                  bid_price : data.attributes.bid_price,
                  image : data.attributes.image.data.attributes.formats.thumbnail.url,

                  
                };
                const state = checkState(item);
                
              }
            );
          setAllCollections(
            data
              .reverse()
              .filter(
                (data: { attributes: { status: boolean } }) =>
                  data.attributes.status
              )
              .map(
                (data: {
                    id: number;
                    attributes: {
                      Name: string;
                      start_time: string;
                      end_time: string;
                      createdAt: string;
                      updatedAt: string;
                      publishedAt: string;
                      buy_now_price : string;
                      bid_price : string;
                      image: {
                        data: {
                            id: number;
                            attributes: {
                                formats: {
                                    thumbnail: {
                                        url: string;
                                    }
                                }
                            }
                        }
                    }
                  };
                }) => ({
                    id: data.id,
                    Name: data.attributes.Name,
                    start_time: data.attributes.start_time,
                    end_time: data.attributes.end_time,
                    createdAt: data.attributes.createdAt,
                    updatedAt: data.attributes.updatedAt,
                    publishedAt: data.attributes.publishedAt,
                    buy_now_price : data.attributes.buy_now_price,
                    bid_price : data.attributes.bid_price,
                    image : data.attributes.image.data.attributes.formats.thumbnail.url,
                })
              )
          );
          setCollections(
            data
              .reverse()
              .filter(
                (data: { attributes: { status: boolean } }) =>
                  data.attributes.status
              )
              .map(
                (data: {
                    id: number;
                    attributes: {
                      Name: string;
                      start_time: string;
                      end_time: string;
                      createdAt: string;
                      updatedAt: string;
                      publishedAt: string;
                      buy_now_price : string;
                      bid_price : string;
                      image: {
                        data: {
                            id: number;
                            attributes: {
                                formats: {
                                    thumbnail: {
                                        url: string;
                                    }
                                }
                            }
                        }
                    }
                  };
                }) => ({
                    id: data.id,
                    Name: data.attributes.Name,
                    start_time: data.attributes.start_time,
                    end_time: data.attributes.end_time,
                    createdAt: data.attributes.createdAt,
                    updatedAt: data.attributes.updatedAt,
                    publishedAt: data.attributes.publishedAt,
                    buy_now_price : data.attributes.buy_now_price,
                    bid_price : data.attributes.bid_price,
                    image : data.attributes.image.data.attributes.formats.thumbnail.url,
                })
              )
          );
        }
        setLoading(false);
      });
  };
  const [presaleProjects, setPresaleProjects] = useState<
    {
      id: number;
      Name: string;
     // image: string;
      launchDatetime: string;
      slug: string;
      candy_machine_id: string;
      soldout: boolean;
      aptos: boolean;
      presale_public: boolean;
    }[]
  >([]);
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

  const refreshCandyMachineState = async (
    candyMachineId: anchor.web3.PublicKey,
    commitment: Commitment = "confirmed"
  ) => {
    if (!anchorWallet) {
      return;
    }

    const connection = new Connection(rpcHost, commitment);

    if (candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          candyMachineId,
          connection
        );

        setCandyMachine(cndy);
        setItemsAvailable(cndy.state.itemsAvailable);
        setItemsRemaining(cndy.state.itemsRemaining);
        setItemsRedeemed(cndy.state.itemsRedeemed);

        var divider = 1;
        if (decimals) {
          divider = +("1" + new Array(decimals).join("0").slice() + "0");
        }

        // detect if using spl-token to mint
        if (cndy.state.tokenMint) {
          setPayWithSplToken(true);
          // Customize your SPL-TOKEN Label HERE
          // TODO: get spl-token metadata name
          setPriceLabel(splTokenName);
          setPrice(cndy.state.price.toNumber() / divider);
          setWhitelistPrice(cndy.state.price.toNumber() / divider);
        } else {
          setPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
          setWhitelistPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
        }

        // fetch whitelist token balance
        if (cndy.state.whitelistMintSettings) {
          setWhitelistEnabled(true);
          setIsBurnToken(cndy.state.whitelistMintSettings.mode.burnEveryTime);
          setIsPresale(cndy.state.whitelistMintSettings.presale);
          setIsWLOnly(
            !isPresale &&
              cndy.state.whitelistMintSettings.discountPrice === null
          );

          if (
            cndy.state.whitelistMintSettings.discountPrice !== null &&
            cndy.state.whitelistMintSettings.discountPrice !== cndy.state.price
          ) {
            if (cndy.state.tokenMint) {
              setWhitelistPrice(
                cndy.state.whitelistMintSettings.discountPrice?.toNumber() /
                  divider
              );
            } else {
              setWhitelistPrice(
                cndy.state.whitelistMintSettings.discountPrice?.toNumber() /
                  LAMPORTS_PER_SOL
              );
            }
          }

          let balance = 0;
          try {
            const tokenBalance = await connection.getTokenAccountBalance(
              (
                await getAtaForMint(
                  cndy.state.whitelistMintSettings.mint,
                  anchorWallet.publicKey
                )
              )[0]
            );

            balance = tokenBalance?.value?.uiAmount || 0;
          } catch (e) {
            console.error(e);
            balance = 0;
          }
          if (commitment !== "processed") {
            setWhitelistTokenBalance(balance);
          }
          setIsActive(isPresale && !isEnded && balance > 0);
        } else {
          setWhitelistEnabled(false);
        }

        // end the mint when date is reached
        if (cndy?.state.endSettings?.endSettingType.date) {
          setEndDate(toDate(cndy.state.endSettings.number));
          if (
            cndy.state.endSettings.number.toNumber() <
            new Date().getTime() / 1000
          ) {
            setIsEnded(true);
            setIsActive(false);
          }
        }
        // end the mint when amount is reached
        if (cndy?.state.endSettings?.endSettingType.amount) {
          let limit = Math.min(
            cndy.state.endSettings.number.toNumber(),
            cndy.state.itemsAvailable
          );
          setItemsAvailable(limit);
          if (cndy.state.itemsRedeemed < limit) {
            setItemsRemaining(limit - cndy.state.itemsRedeemed);
          } else {
            setItemsRemaining(0);
            cndy.state.isSoldOut = true;
            setIsEnded(true);
          }
        } else {
          setItemsRemaining(cndy.state.itemsRemaining);
        }

        if (cndy.state.isSoldOut) {
          setIsActive(false);
        }

        const [collectionPDA] = await getCollectionPDA(candyMachineId);
        const collectionPDAAccount = await connection.getAccountInfo(
          collectionPDA
        );

        const txnEstimate =
          892 +
          (!!collectionPDAAccount && cndy.state.retainAuthority ? 182 : 0) +
          (cndy.state.tokenMint ? 66 : 0) +
          (cndy.state.whitelistMintSettings ? 34 : 0) +
          (cndy.state.whitelistMintSettings?.mode?.burnEveryTime ? 34 : 0) +
          (cndy.state.gatekeeper ? 33 : 0) +
          (cndy.state.gatekeeper?.expireOnUse ? 66 : 0);

        setNeedTxnSplit(txnEstimate > 1230);
        setLoading(false);
      } catch (e) {
        setCandyMachine(undefined);
        setLoading(false);
        if (e instanceof Error) {
          if (e.message === `Account does not exist ${candyMachineId}`) {
            setAlertState({
              open: true,
              message: `Could not fetch Collection id`,
              severity: "info",
              hideDuration: null,
            });
          } else if (e.message.startsWith("failed to get info about account")) {
            setAlertState({
              open: true,
              message: `Failed to get info about Collection`,
              severity: "info",
              hideDuration: null,
            });
          }
        } else {
          setAlertState({
            open: true,
            message: `${e}`,
            severity: "error",
            hideDuration: null,
          });
        }
        // console.log(e);
      }
    } else {
      setCandyMachine(null);
      setLoading(false);
      setAlertState({
        open: true,
        message: `This project will be live soon or it's sold out`,
        severity: "info",
        hideDuration: null,
      });
    }
  };

  function displaySuccess(mintPublicKey: any, qty: number = 1): void {
    let remaining = itemsRemaining - qty;
    setItemsRemaining(remaining);
    setIsSoldOut(remaining === 0);
    if (isBurnToken && whitelistTokenBalance && whitelistTokenBalance > 0) {
      let balance = whitelistTokenBalance - qty;
      setWhitelistTokenBalance(balance);
      setIsActive(isPresale && !isEnded && balance > 0);
    }
    setSetupTxn(undefined);
    setItemsRedeemed(itemsRedeemed + qty);
    if (!payWithSplToken && balance && balance > 0) {
      setBalance(
        balance -
          (whitelistEnabled ? whitelistPrice : price) * qty -
          solFeesEstimation
      );
    }
    setSolanaExplorerLink(
      cluster === "devnet" || cluster === "testnet"
        ? "https://solscan.io/token/" + mintPublicKey + "?cluster=" + cluster
        : "https://solscan.io/token/" + mintPublicKey
    );
    setIsMinting(false);
    throwConfetti();
  }

  // const onMint = async (
  //   beforeTransactions: Transaction[] = [],
  //   afterTransactions: Transaction[] = []
  // ) => {
  //   try {
  //     if (wallet.connected && candyMachine?.program && wallet.publicKey) {
  //       setIsMinting(true);
  //       let setupMint: SetupState | undefined;
  //       if (needTxnSplit && setupTxn === undefined) {
  //         setAlertState({
  //           open: true,
  //           message: "Please validate account setup transaction",
  //           severity: "info",
  //         });
  //         setupMint = await createAccountsForMint(
  //           candyMachine,
  //           wallet.publicKey
  //         );
  //         let status: any = { err: true };
  //         if (setupMint.transaction) {
  //           status = await awaitTransactionSignatureConfirmation(
  //             setupMint.transaction,
  //             DEFAULT_TIMEOUT,
  //             connection,
  //             true
  //           );
  //         }
  //         if (status && !status.err) {
  //           setSetupTxn(setupMint);
  //           setAlertState({
  //             open: true,
  //             message:
  //               "Setup transaction succeeded! You can now validate mint transaction",
  //             severity: "info",
  //           });
  //         } else {
  //           setAlertState({
  //             open: true,
  //             message: "Mint failed! Please try again!",
  //             severity: "error",
  //           });
  //           return;
  //         }
  //       }

  //       const setupState = setupMint ?? setupTxn;
  //       const mint = setupState?.mint ?? anchor.web3.Keypair.generate();
  //       let mintResult = await mintOneToken(
  //         candyMachine,
  //         wallet.publicKey,
  //         mint,
  //         beforeTransactions,
  //         afterTransactions,
  //         setupState
  //       );

  //       let status: any = { err: true };
  //       let metadataStatus = null;
  //       if (mintResult) {
  //         status = await awaitTransactionSignatureConfirmation(
  //           mintResult.mintTxId,
  //           DEFAULT_TIMEOUT,
  //           connection,
  //           true
  //         );

  //         metadataStatus =
  //           await candyMachine.program.provider.connection.getAccountInfo(
  //             mintResult.metadataKey,
  //             "processed"
  //           );
  //         // console.log("Metadata status: ", !!metadataStatus);
  //       }

  //       if (status && !status.err && metadataStatus) {
  //         setAlertState({
  //           open: true,
  //           message: "Congratulations! Mint succeeded!",
  //           severity: "success",
  //         });

  //         // update front-end amounts
  //         displaySuccess(mint.publicKey);
  //         refreshCandyMachineState("processed");
  //       } else if (status && !status.err) {
  //         setAlertState({
  //           open: true,
  //           message:
  //             "Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again.",
  //           severity: "error",
  //           hideDuration: 8000,
  //         });
  //         refreshCandyMachineState();
  //       } else {
  //         setAlertState({
  //           open: true,
  //           message: "Mint failed! Please try again!",
  //           severity: "error",
  //         });
  //         refreshCandyMachineState();
  //       }
  //     }
  //   } catch (error: any) {
  //     let message = error.msg || "Minting failed! Please try again!";
  //     if (!error.msg) {
  //       if (!error.message) {
  //         message = "Transaction Timeout! Please try again.";
  //       } else if (error.message.indexOf("0x138")) {
  //       } else if (error.message.indexOf("0x137")) {
  //         message = `SOLD OUT!`;
  //       } else if (error.message.indexOf("0x135")) {
  //         message = `Insufficient funds to mint. Please fund your wallet.`;
  //       }
  //     } else {
  //       if (error.code === 311) {
  //         message = `SOLD OUT!`;
  //       } else if (error.code === 312) {
  //         message = `Minting period hasn't started yet.`;
  //       }
  //     }

  //     setAlertState({
  //       open: true,
  //       message,
  //       severity: "error",
  //     });
  //   } finally {
  //     setIsMinting(false);
  //   }
  // };

  useEffect(() => {
    (async () => {
      if (anchorWallet && anchorWallet.publicKey) {
        const balance = await connection.getBalance(anchorWallet!.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [anchorWallet, connection]);

  // useEffect(() => {
  //   if (!candyMachine && candyMachineId) {
  //     refreshCandyMachineState();
  //   }
  // }, [
  //   anchorWallet,
  //   candyMachineId,
  //   connection,
  //   isEnded,
  //   isPresale,
  //   refreshCandyMachineState,
  //   candyMachine,
  // ]);
  
  const dateNow = new Date();
  const date = new Date()
  
  
  const searchCandy = (candyId: string) => {
    setLoading(true);
    let candyMachineId = getCandyMachineId(candyId);
    refreshCandyMachineState(candyMachineId);
  };

  return (
    <div>
      <Head>
        <title>PengSol AI Tools</title>
        <meta name="description" content="PengSol AI Tools" />
      </Head>
      <Container>
        <Menu showMenu={showMenu} handleCloseMenu={handleCloseMenu} />
        <div className="flex flex-col flex-1 w-full">
          <Header
            isPlatformPage={false}
            handleShowMenu={handleShowMenu}
            showMenu={showMenu}
          />
          <ContainerContent className="justify-start items-start w-full p-6">
          <div className=" flex flex-col-reverse sm:flex-row justify-end items-center pt-4 px-8 mx-auto w-full">
        <p className="font-medium text-white text-lg  m-0 pt-4 sm:py-2 text-left bg-[#15132b] px-6 rounded-xl mr-4">
          {bids.length} Products
        </p>     
    </div>
    <div
                className="grid xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-8 py-8 px-8 "
              >
                
              </div>
            <div className="w-full flex sm:flex-row flex-col justify-end">
              <input
                className="h-12 sm:w-1/3 w-full bg-[#1C1A33] rounded-lg px-6 placeholder:text-[#454365] mr-6"
                placeholder="Enter Product Address"
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={() => searchCandy(search)}
                className="h-12 sm:w-1/6 w-full sm:mt-0 mt-4 bg-[#1C1A33] rounded-lg transition hover:opacity-60"
              >
                Search
              </button>
            </div>
            <div className="bid-list-container">
     
      <div>
      <ContainerContent>
        <HeaderContent>
         
        </HeaderContent>
        <CollectionWrapper>
        {bids.map((bid, index) => {
        const startTime = new Date(bid.attributes.start_time);
        const imageUrl = bid.attributes.image.data.attributes.formats.thumbnail.url;        
        const endTime = new Date(bid.attributes.end_time);
        return (
          <div className="bid-card" key={bid.id}>
            <Image src={imageUrl} alt={bid.attributes.Name} width={300} height={300}  />
            <div className="bid-info">
              <h3>{bid.attributes.Name}</h3>
             
              <p>Bid Price: {bid.attributes.bid_price}</p><input type="number" onChange={(e) => setBidValue(Number(e.target.value))} value={bidValue} /><button onClick={() => handleBid(bidValue, bid.id)}>Bid</button>

              <p>Buy Now Price: {bid.attributes.buy_now_price}</p>
              <p>{remainingTimes[index]}</p>

            </div>
          </div>
        );
      })}
        </CollectionWrapper>
    </ContainerContent>
        </div>
    </div>
   
          </ContainerContent>
          
        </div>
      </Container>
    </div>
  );
};
export default Bidpage;
