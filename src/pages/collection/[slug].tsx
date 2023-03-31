import styled from "styled-components";
import { animated, useSpring } from "@react-spring/web";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import Image from "next/image";
import Link from "next/link";
import { Container } from "components/Platform/Platform.style";
import { Header } from "components/Platform/Header";
import { Menu } from "components/Platform/Menu";
import data from "../../data/PengSol_ranks.json";
import dataKing from "../../data/PengSol_king.json";
import { getSession, signIn, signOut } from "next-auth/react";

import {
  Commitment,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import { MintButton } from "components/MintButton";
import {
  CandyMachineAccount,
  getCandyMachineState,
} from "components/MintButton/candy-machine";

import * as anchor from "@project-serum/anchor";
import { getMintsTokens } from "components/helpers/getMintsToken";
import { getBestNFt } from "components/helpers/getBestNFT";

import {
  Snackbar,
  Paper,
  LinearProgress,
  Chip,
  CircularProgress,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useAtom } from "jotai";
import { AlertAtom } from "components/MintButton/store";

import { CrossmintPayButton } from "@crossmint/client-sdk-react-ui";
import Summary from "components/Summary";
import {
  ComponentSoldOut,
  ContainerCollectionPage,
} from "components/Collection/Collection.style";
import Countdown, { zeroPad } from "react-countdown";
import { AuthContext } from "contexts/AuthContext";
import { AlertScheduleAtom } from "components/ScheduleButton/store";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { getOrCreateAssociatedTokenAccount } from "components/ScheduleButton/getOrCreateAssociatedTokenAccount";
import { createTransferInstruction } from "components/ScheduleButton/createTransferInstructions";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BCS, TxnBuilderTypes } from "aptos";
import { useWallet as useWalletAptos } from "@manahippo/aptos-wallet-adapter";

export async function getStaticPaths() {
  const res = await fetch(
    "https://pengapi.herokuapp.com/api/projects?pagination[pageSize]=100",
    {
      headers: {
        Authorization: `Bearer ${process.env.BEARER_AUTH}`,
      },
    }
  );
  const data = await res.json();

  const paths = data.data.map((collection) => ({
    params: { slug: collection.attributes.slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const collection = await fetch(
    `https://pengapi.herokuapp.com/api/projects?filters[slug][$eq]=${params.slug}&pagination[pageSize]=100`,

    {
      headers: {
        Authorization: `Bearer ${process.env.BEARER_AUTH}`,
      },
    }
  )
    .then((response) => response.json())
    .then(({ data }) => {
      return data[0];
    })
    .catch((error) => {
      console.error(error);
    });

  const collectionFollowers = await fetch(
    `https://pengapi.herokuapp.com/api/project-states?filters[slug][$eq]=${params.slug}&pagination[pageSize]=100`,
    {
      headers: {
        Authorization: `Bearer ${process.env.BEARER_AUTH}`,
      },
    }
  )
    .then((response) => {
      // console.log('>>> response : ',response)
      return response.json();
    })
    .then(({ data }) => {
      return data[0];
    })
    .catch((error) => {
      console.error(error);
    });

  return {
    props: {
      collection,
      collectionFollowers,
    },
    revalidate: 300,
  };
}

const rpcHost = process.env.NEXT_PUBLIC_REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(
  rpcHost ? rpcHost : anchor.web3.clusterApiUrl("devnet")
);

const Button = styled.button`
  background-color: transparent;
  border: 1px solid #ffffff;
  border-radius: 8px;
  padding: 4px 8px;
  cursor: pointer;
  height: 100%;
`;

const ContainerContent = styled.div`
  height: 100%;
  width: 100%;
  grid-area: main;
  overflow: auto;
  display: flex;
  padding: 16px;
  flex-wrap: wrap;
  gap: 24px;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const SubMenu = styled.button`
  padding: 4px 8px;
  background: transparent;
  border: 0px;
  cursor: pointer;
  :disabled {
    cursor: not-allowed;
    pointer-events: all !important;
  }
  width: 100%;
`;

function ProjectMintBlock({
  id,
  price,
  name,
  mintDate,
  description,
  projectImage,
  doxxed,
  candyMachineId,
  aptos,
  isPresale,
  isPublic,
}) {
  const { hasNft } = useContext(AuthContext);

  const date = new Date(mintDate);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [isScheduled, setIsScheduled] = useState(false);

  const getScheduledProjects = () => {
    fetch("/api/get-token-example")
      .then((response) => response.json())
      .then(({ jwt }) => {
        fetch("/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        })
          .then((request) => request.json())
          .then((data) => {
            fetch(
              "/api/premints?populate=project&&[filters][user][id][$eq]=" +
                data.id,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${jwt}`,
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
                      item?.attributes?.project?.data &&
                        ids.push(item.attributes.project.data.id);
                    }
                  );
                setIsScheduled(ids.includes(id));
              });
          });
      });
  };

  useEffect(() => {
    getScheduledProjects();
  }, []);

  const day = date.getUTCDate();
  const month = monthNames[date.getUTCMonth()];

  const year = date.getUTCFullYear();

  const hours = date.getUTCHours();

  const minutes = date.getUTCMinutes();

  const dateNow = new Date();

  const compareDates = dateNow > date;
  const ctaMint = !mintDate ? "Schedule" : compareDates ? "Mint Now" : "Mint";
  const backgroundButtonMint = !mintDate
    ? "#730484"
    : compareDates
    ? "#008822"
    : "#730484";

  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = date.getTime() - now;

  // Time calculations for days, hours, minutes and seconds

  var countDowndays = Math.floor(distance / (1000 * 60 * 60 * 24));
  var countDownhours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  var countDownminutes = Math.floor(
    (distance % (1000 * 60 * 60)) / (1000 * 60)
  );
  const [priceCandy, setPriceCandy] = useState(price);

  var countDownseconds = Math.floor((distance % (1000 * 60)) / 1000);

  const mintStatus = !mintDate
    ? "Mint TBA"
    : compareDates
    ? `Mint Live ${priceCandy} SOL`
    : `Live in ${countDowndays}d ${countDownhours}h ${countDownminutes}m`;
  const mintStatusColor = !mintDate
    ? "#ffffff"
    : compareDates
    ? "#008822"
    : "#ffffff";

  const [clicked, setClicked] = useState(false);

  const wallet = useWallet();

  const walletAptos = useWalletAptos();

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

  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const refreshCandyMachineState = async (
    commitment: Commitment = "confirmed"
  ) => {
    if (!anchorWallet) {
      return;
    }

    const connection = new Connection(rpcHost, commitment);

    if (candyMachineId) {
      await getCandyMachineState(anchorWallet, candyMachineId, connection)
        .then((cndy) => {
          setCandyMachine(cndy);
          setItemsAvailable(cndy.state.itemsAvailable);
          setItemsRemaining(cndy.state.itemsRemaining);
          setItemsRedeemed(cndy.state.itemsRedeemed);

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
            setIsEnded(true);
          }

          if (cndy.state.price) {
            setPriceCandy(cndy.state.price.toNumber() / 1_000_000_000);
            // console.log("price", cndy.state.price.toNumber() / 1_000_000_000);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  useEffect(() => {
    if (!candyMachine && candyMachineId) {
      refreshCandyMachineState();
    }
  }, [
    anchorWallet,
    candyMachineId,
    connection,
    isEnded,
    refreshCandyMachineState,
    candyMachine,
  ]);

  const [ref01W, setref01W] = useState(500);
  const ref01 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setref01W(ref01.current?.clientWidth);
    });

    return window.removeEventListener("resize", () => {});
  }, []);

  const [alertStateSchedule, setAlertStateSchedule] =
    useAtom(AlertScheduleAtom);

  const conn = useConnection();

  const [loadingTransaction, setLoadingTransaction] = useState(false);
  const [loadingTransactionFee, setLoadingTransactionFee] = useState(false);

  const [selected, setSelected] = useState(null);

  const [presale, setPresale] = useState(null);
  const [roles, setRoles] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);

  const [totalMinted, setTotalMinted] = useState(0);

  const sendAptosTransaction = async (price: number, total: number) => {
    setLoadingTransaction(true);
    setAlertStateSchedule({
      open: true,
      message: "Processing transaction...",
      severity: "info",
      hideDuration: 4000,
    });
    let fee = !presale?.attributes?.fees ? 0 : price * 0.01;
    const transaction = {
      arguments: [
        "0x359f3d38453ff3470abf461a3a5f365ddce2c6e8b0058e26eaf674dc02d9a450",
        Math.ceil((price + fee) / 0.0000001) * total,
      ],
      function: "0x1::coin::transfer",
      type: "entry_function_payload",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
    };

    await (window as any).aptos
      .signAndSubmitTransaction(transaction)
      .then((res) => {
        const pushData = async () => {
          await fetch("https://pengapi.herokuapp.com/api/presale-txns", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              data: {
                transaction: res.signature.signature,
                wallet: presale.id,
                address: wallet.publicKey,
                price: (price + fee) * total,
                total: total,
                status: "Done",
                presale: projectInfo.id,
              },
            }),
          })
            .then((res) =>
              res.json().then((data) => ({ status: res.status, body: data }))
            )
            .then((response) => {
              if (response.status == 200) {
                setLoadingTransaction(false);
                setTotalMinted(totalMinted + total);
                setAlertStateSchedule({
                  open: true,
                  message: "Congratulations! You have successfully minted!",
                  severity: "success",
                });
              } else {
                setAlertStateSchedule({
                  open: true,
                  message: "Transaction failed! Please try again!",
                  severity: "error",
                });
              }
              setLoadingTransaction(false);
            })
            .catch((error) => {
              setAlertStateSchedule({
                open: true,
                message: "Transaction failed! Please try again!",
                severity: "error",
              });
              setLoadingTransaction(false);
            });
        };

        pushData();
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

  const removeFees = () => {
    let newPresale = presale;
    newPresale.attributes.fees = false;
    setPresale(newPresale);
  };

  const onClick = useCallback(
    async (price: number, total: number) => {
      if (aptos == "true") {
        sendAptosTransaction(price, total);
      } else {
        console.log("check aptos");
        setLoadingTransaction(true);
        if (!wallet.publicKey) {
          console.log("error", `Send Transaction: Wallet not connected!`);
          return;
        }

        setAlertStateSchedule({
          open: true,
          message: "Processing transaction...",
          severity: "info",
          hideDuration: 4000,
        });

        let signature: TransactionSignature = "";
        let fee = !presale?.attributes?.fees ? 0 : price * 0.01;
        try {
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: wallet.publicKey,
              toPubkey: new PublicKey(
                "Bv3BCTYqcP2gBNSaL5fKpS369r36eFujyc84K2TuEcoq"
              ),
              lamports: Math.ceil((price + fee) / 0.000000001) * total,
              // lamports: 1_000_000_000,
            })
          );
          signature = await wallet.sendTransaction(
            transaction,
            connection
          );

          await connection.confirmTransaction(signature, "confirmed");
           
          const pushData = async () => {
            await fetch("https://pengapi.herokuapp.com/api/presale-txns", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                data: {
                  transaction: signature,
                  wallet: presale.id,
                  address: wallet.publicKey,
                  price: (price + fee) * total,
                  total: total,
                  status: "Done",
                  presale: projectInfo.id,
                },
              }),
            })
              .then((res) =>
                res.json().then((data) => ({ status: res.status, body: data }))
              )
              .then((response) => {
                if (response.status == 200) {
                  setLoadingTransaction(false);
                  setTotalMinted(totalMinted + total);
                  setAlertStateSchedule({
                    open: true,
                    message: "Congratulations! You have successfully minted!",
                    severity: "success",
                  });
                } else {
                  setAlertStateSchedule({
                    open: true,
                    message: "Transaction failed! Please try again!",
                    severity: "error",
                  });
                }
                setLoadingTransaction(false);
              })
              .catch((error) => {
                setAlertStateSchedule({
                  open: true,
                  message: "Transaction failed! Please try again!",
                  severity: "error",
                });
                setLoadingTransaction(false);
              });
          };

          pushData();
        } catch (error: any) {
          setLoadingTransaction(false);
          setAlertStateSchedule({
            open: true,
            message: "Transaction failed! Please try again!",
            severity: "error",
          });

          return;
        }
      }
    },
    [wallet, conn, presale, totalMinted, projectInfo]
  );

  const onClickFee = useCallback(
    async (toPubkey: string, price: number) => {
      setLoadingTransactionFee(true);
      if (!toPubkey || !price) return;
      // console.log("Processing transaction...");

      setAlertStateSchedule({
        open: true,
        message: "Processing transaction...",
        severity: "info",
        hideDuration: 4000,
      });

      try {
        if (!wallet.publicKey || !wallet.signTransaction)
          throw new WalletNotConnectedError();
        const toPublicKey = new PublicKey(toPubkey);
        const mint = new PublicKey(
          "CWhHpZ1mk5wbvm5K97m65qPcem5zFUQRpXsdEoanF9CD"
        );
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          wallet.publicKey,
          mint,
          wallet.publicKey,
          wallet.signTransaction
        );

        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          wallet.publicKey,
          mint,
          toPublicKey,
          wallet.signTransaction
        );

        const transaction = new Transaction().add(
          createTransferInstruction(
            fromTokenAccount.address, // source
            toTokenAccount.address, // dest
            wallet.publicKey,
            price * LAMPORTS_PER_SOL,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const blockHash = await connection.getRecentBlockhash();
        transaction.feePayer = await wallet.publicKey;
        transaction.recentBlockhash = await blockHash.blockhash;
        const signed = await wallet.signTransaction(transaction);

        await connection.sendRawTransaction(signed.serialize());

        const pushData = async () => {
          await fetch(
            `https://pengapi.herokuapp.com/api/wallets/${presale.id}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                data: {
                  fees: false,
                },
              }),
            }
          )
            .then((res) =>
              res.json().then((data) => ({ status: res.status, body: data }))
            )
            .then((response) => {
              if (response.status == 200) {
                setLoadingTransactionFee(false);
                removeFees();
                setAlertStateSchedule({
                  open: true,
                  message:
                    "Congratulations! You have successfully removed fees!",
                  severity: "success",
                });
              } else {
                console.log(response);
              }
              setLoadingTransactionFee(false);
            })
            .catch((error) => {
              console.log(error);
              setLoadingTransactionFee(false);
            });
        };

        pushData();
      } catch (error: any) {
        setLoadingTransactionFee(false);
        setAlertStateSchedule({
          open: true,
          message: "Transaction failed! Please try again!",
          severity: "error",
        });

        return;
      }
    },
    [wallet, conn, presale, totalMinted, projectInfo]
  );

  const mint = (price: number, count: number) => {
    fetch("https://pengapi.herokuapp.com/api/presales?populate=project", {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
      },
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((response) => {
        if (response.status == 200) {
          const data = response.body.data?.filter(
            (project: any) => project?.attributes?.project?.data?.id == id
          )[0]?.attributes;
          data?.live && onClick(price, count);
        } else {
          console.log("error");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const removeFee = (price: number, count: number) => {
    fetch("https://pengapi.herokuapp.com/api/presales?populate=project", {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
      },
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((response) => {
        if (response.status == 200) {
          const data = response.body.data?.filter(
            (project: any) => project?.attributes?.project?.data?.id == id
          )[0]?.attributes;
          data?.live &&
            onClickFee("BgApxYgsv6bVeoXKqiJQHxihK5ZMoZ6SB5HWvEeqwYqr", 10);
        } else {
          console.log("error");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getTotalMinted = () => {
    fetch(
      `https://pengapi.herokuapp.com/api/presale-txns?[filters][address]=${wallet.publicKey?.toString()}&[presale][id]=${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        let total = totalMinted;
        res.data?.map((item: any) => {
          total = total + item?.attributes?.total;
        });
        setTotalMinted(total);
      });
  };

  const [publicRole, setPublicRole] = useState(null);

  useEffect(() => {
    if (isPresale) {
      getTotalMinted();
      if (1) {
        fetch(
          `https://pengapi.herokuapp.com/api/wallets?[filters][address][$eq]=4Sg2ZsgU2GAo4KLB6tzfeeyD9aavVAMNEvFsH4QUrDPB&populate[presale][populate][0]=project`,
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
                  item.attributes?.presale?.data?.attributes?.project?.data
                    ?.id == id
                );
              });
              setPresale(check[0]);
              const data = check[0].attributes?.presale?.data?.attributes;
              const info =
                check[0].attributes?.presale?.data?.attributes?.project?.data
                  ?.attributes;
              setProjectInfo({
                name: info.name,
                description: info.description,
                image: info.img_url,
                max: info.premint_max_user,
              });
              setRoles([
                {
                  id: 1,
                  role: data.role_1,
                  price: data.role_1_price,
                  start: data.role_1_start && new Date(data.role_1_start),
                  max: data.role_1_max,
                  status: data.role_1_status,
                  count: 1,
                },
                {
                  id: 2,
                  role: data.role_2,
                  price: data.role_2_price,
                  start: data.role_2_start && new Date(data.role_2_start),
                  max: data.role_2_max,
                  status: data.role_2_status,
                  count: 1,
                },
                {
                  id: 3,
                  role: data.role_3,
                  price: data.role_3_price,
                  start: data.role_3_start && new Date(data.role_3_start),
                  max: data.role_3_max,
                  status: data.role_3_status,
                  count: 1,
                },
              ]);
            }
          });
      } else {
        fetch(
          `https://pengapi.herokuapp.com/api/presales?[filters][public_presale][$eq]=true`,
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
                return item.attributes?.name == name;
              });
              if (check.length > 0) {
                setPublicRole({
                  id: check[0].id,
                  role: check[0].attributes?.role_1,
                  price: check[0].attributes?.role_1_price,
                  start:
                    check[0].attributes?.role_1_start &&
                    new Date(check[0].attributes?.role_1_start),
                  max: check[0].attributes?.role_1_max,
                  status: check[0].attributes?.role_1_status,
                  count: 1,
                });
              }
            }
          });
      }
    }
  }, []);

  const addCount = (id: number) => {
    const newProject = roles.map((item) => {
      if (item.id == id && item.count < item.max - totalMinted) {
        return {
          ...item,
          count: item.count + 1,
        };
      }
      return item;
    });
    setRoles(newProject);
  };

  const minusCount = (id: number) => {
    const newProject = roles.map((item) => {
      if (item.id == id && item.count > 1) {
        return {
          ...item,
          count: item.count - 1,
        };
      }
      return item;
    });
    setRoles(newProject);
  };

  return (
    // <div className="w-[500px] bg-[#16162a] rounded-2xl p-4 flex flex-col gap-6">
    <div className="bg-[#16162a] rounded-xl col-span-12 lg:col-span-6 flex flex-col gap-0 h-fit ">
      <div className="w-full p-6 pb-8">
        <div
          className={`w-full flex ${
            ref01W > 360 ? "flex-row items-center" : "flex-col items-center"
          } justify-between mb-4`}
        >
          <div className="flex flex-col gap-2 sm:mb-0 mb-3">
            <p className="text-2xl font-bold text-white ">{name}</p>
          </div>

          <div className="bg-[#2D2D3F] flex gap-1 p-1 justify-center items-center rounded-lg h-fit]">
            <p className="tracking-widest text-sm text-[#fff] text-start px-2 py-1  ">
              No WL status available
            </p>
          </div>
        </div>
        <div
          ref={ref01}
          className={`flex ${
            ref01W > 460 ? "flex-row " : "flex-col"
          } xs:flex-col gap-3`}
        >
          <div
            className={`${
              ref01W < 460 ? "mx-auto mt-3" : ""
            }  h-40 w-40 min-w-[160px] min-h-[160px] relative rounded-xl overflow-hidden ${
              selected ? "" : "my-auto"
            } ${projectImage ? "bg-transparent" : "bg-white"}`}
          >
            <Image
              src={projectImage}
              layout="fill"
              objectFit="contain"
              className="aspect-square"
            />
          </div>

          <div className="flex flex-col w-full justify-between h-50 gap-2 ml-2">
            <div className="w-full flex place-content-between">
              <div className="w-full">
                <div className="flex flex-col gap-2 pt-2 mb-1 w-full">
                  {/* <div className="flex flex-row justify-between w-full">
                    <p
                      className={`m-0 mr-3 text-xl text-[${mintStatusColor}] `}
                    >
                      <span className="text-4xl text-white">
                        <Countdown date={new Date(mintDate)} />
                      </span>
                    </p>
                  </div> */}
                  {mintDate ? (
                    <>
                      <div className="flex gap-[6px]">
                        <div className="flex items-center w-full">
                          <div>
                            <div className="relative h-[6px] w-4">
                              <Image
                                src="/img/calendar_1.png"
                                layout="fill"
                                objectFit="contain"
                              />
                            </div>
                            <div className="relative h-3 w-4">
                              <Image
                                src="/img/calendar_2.png"
                                layout="fill"
                                objectFit="contain"
                              />
                            </div>
                          </div>
                          <p className="m-0 ml-3 text-white text-sm ">
                            {month} {day}th, {year}
                          </p>
                        </div>
                        <div
                          className="flex justify-end align-center ml-2 w-full"
                          style={{
                            border: doxxed ? " #20e3b2" : " #f04f53",
                            borderRadius: "6px",
                          }}
                        >
                          <span
                            className={`text-white text-sm ${
                              doxxed ? "bg-green-600" : "bg-[#d0312d]"
                            } px-3 py-1 rounded-md`}
                            style={{
                              color: "#ffffff",
                            }}
                          >
                            {doxxed ? "Doxxed" : "Not Doxxed"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-[6px] items-center justify-between">
                        <div className="flex">
                          <div className="relative h-4 w-4">
                            <Image
                              src="/img/clock.png"
                              layout="fill"
                              objectFit="contain"
                            />
                          </div>
                          <p className="m-0 ml-3 text-white text-sm">
                            {hours} : {minutes < 10 ? minutes + "0 " : minutes}
                            {"  "}( UTC )
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="m-0 text-[#a5a599] text-xs font-bold">TBA</p>
                  )}
                </div>
              </div>
            </div>
            {!isPresale ? (
              <>
                {itemsAvailable !== 0 ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <p className="m-0 text-green-400 text-sm ">
                        Total minted
                      </p>
                      <p className="m-0 text-green-400 text-sm ">
                        {((itemsRedeemed / itemsAvailable) * 100).toFixed(2)}% (
                        {itemsRedeemed}/{itemsAvailable})
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        backgroundColor: "#252538",
                        overflow: "hidden",
                        borderRadius: "4px",
                        height: "24px",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "rgb(56, 226, 93)",
                          width: `${(itemsRedeemed / itemsAvailable) * 100}%`,
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>
                ) : null}
                <div className="flex justify-between items-center gap-3 flex-col sm:flex-row">
                  {isEnded ? (
                    <ComponentSoldOut
                      style={{
                        color: "#fff",
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        padding: "4px",
                      }}
                    >
                      Sold Out
                    </ComponentSoldOut>
                  ) : (
                    <>
                      {new Date(mintDate).getTime() -
                        (isScheduled ? 1000 * 60 * 30 : 0) -
                        new Date().getTime() >
                      0 ? (
                        <div className="flex w-full text-lg text-white px-1 rounded-md">
                          <Countdown
                            date={
                              new Date(mintDate).getTime() -
                              (isScheduled ? 1000 * 60 * 30 : 0)
                            }
                            renderer={({ days, hours, minutes, seconds }) => (
                              <div className="flex flex-row items-baseline">
                                <div className="text-3xl py-2 px-1 w-10 rounded-md text-white  mr-1 flex flex-col items-center justify-center">
                                  <p>{zeroPad(days)}</p>
                                  <p className="text-xs text-gray-400">days</p>
                                </div>
                                :
                                <div className="text-3xl py-2 px-1 w-10 rounded-md text-white  mx-1 flex flex-col items-center justify-center">
                                  <p>{zeroPad(hours)}</p>
                                  <p className="text-xs text-gray-400">hours</p>
                                </div>
                                :
                                <div className="text-3xl py-2 px-1 w-10 rounded-md text-white  mx-1 flex flex-col items-center justify-center">
                                  <p>{zeroPad(minutes)}</p>
                                  <p className="text-xs text-gray-400">min</p>
                                </div>
                                :
                                <div className="text-3xl py-2 px-1 w-10 rounded-md text-white  ml-1 flex flex-col items-center justify-center">
                                  <p>{zeroPad(seconds)}</p>
                                  <p className="text-xs text-gray-400">sec</p>
                                </div>
                              </div>
                            )}
                          />
                        </div>
                      ) : (
                        <MintButton
                          backgroundButtonMint={backgroundButtonMint}
                          candyMachineID={candyMachineId}
                        />
                      )}

                      <CrossmintPayButton
                        collectionTitle={name}
                        collectionDescription={description}
                        collectionPhoto={projectImage}
                        clientId="7e94eb71-06c0-447f-9272-677416fee1d5"
                        style={{
                          width: "100%",
                          fontSize: "12px",
                          padding: "10px",
                        }}
                      />
                    </>
                  )}
                </div>
              </>
            ) : isPublic && publicRole ? (
              <div>
                <div
                  onClick={() => {
                    new Date().getTime() - publicRole.start.getTime() > 0 &&
                      setSelected(
                        publicRole.id == selected ? null : publicRole.id
                      );
                  }}
                  className={`w-full mt-4 flex flex-col gap-3 ${
                    selected == publicRole.id
                      ? "border border-white bg-[#242337]"
                      : ""
                  } transition bg-[#151429] hover:bg-[#242337] hover:cursor-pointer px-6 py-4 rounded-lg shadow-md`}
                >
                  <div className="w-full text-sm flex flex-row justify-between text-gray-300">
                    <p className="">{publicRole.start.toDateString()}</p>
                    <p className="">{publicRole.status && "Complete"}</p>
                  </div>
                  <div className="w-full flex flex-row justify-between text-white text-xl">
                    <p className="">{publicRole.role}</p>
                    <p className="">
                      {publicRole.price} {aptos == "true" ? " aptos" : "SOL"}
                    </p>
                  </div>
                  <div className="w-full flex sm:flex-row flex-col text-sm justify-between sm:items-center items-start text-gray-300 mb-1">
                    {new Date().getTime() - publicRole.start.getTime() > 0 ? (
                      totalMinted == publicRole.max && (
                        <p className="">Finished !</p>
                      )
                    ) : (
                      <Countdown
                        date={publicRole.start}
                        renderer={({ days, hours, minutes, seconds }) => (
                          <div className="flex flex-row ">
                            <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mr-1 flex flex-col items-center justify-center bg-[#454463]">
                              <p>{zeroPad(days)}</p>
                              <p className="text-xs text-gray-300">days</p>
                            </div>

                            <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mx-1 flex flex-col items-center justify-center bg-[#454463]">
                              <p>{zeroPad(hours)}</p>
                              <p className="text-xs text-gray-300">hrs</p>
                            </div>

                            <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mx-1 flex flex-col items-center justify-center bg-[#454463]">
                              <p>{zeroPad(minutes)}</p>
                              <p className="text-xs text-gray-300">mins</p>
                            </div>

                            <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  ml-1 flex flex-col items-center justify-center bg-[#454463]">
                              <p>{zeroPad(seconds)}</p>
                              <p className="text-xs text-gray-300">secs</p>
                            </div>
                          </div>
                        )}
                      />
                    )}
                    {new Date().getTime() - publicRole.start.getTime() > 0 && (
                      <p className="sm:mt-0 mt-4">
                        {/* {Math.ceil((totalMinted / publicRole.max) * 100)} %
                        minted */}
                      </p>
                    )}
                  </div>
                </div>
                {selected == publicRole.id && (
                  <div
                    className={`w-full mt-4 flex flex-col gap-3 transition bg-[#151429] px-6 py-5 rounded-lg shadow-md`}
                  >
                    {/* <div className="w-full text-sm flex flex-row justify-between text-green-500">
                      <p className="">Total Minted</p>
                      <p className="">{`( ${totalMinted} / ${publicRole.max} )`}</p>
                    </div>
                    <div className="w-full h-8 flex  text-white bg-[#242337] rounded-md relative">
                      <div
                        style={{
                          width: `${Math.ceil(
                            (totalMinted / publicRole.max) * 100
                          )}%`,
                        }}
                        className=" h-full bg-gradient-to-r from-[#228C28] to-[#299617] rounded-md"
                      ></div>
                      <h2 className="text-white text-sm absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2">
                        {Math.ceil((totalMinted / publicRole.max) * 100)} %
                      </h2>
                    </div> */}
                    {/* <div className="w-full flex sm:flex-row flex-col-reverse text-white gap-4 mt-2">
                      <div className="h-full border border-[#04246D] rounded-md flex flex-col">
                        <button
                          onClick={() => {
                            console.log("test >>>>")
                            console.log("publicRole.count")
                           
                            if (
                              publicRole.count <
                              publicRole.max - totalMinted
                            ) {
                              setPublicRole({
                                ...publicRole,
                                count: publicRole.count + 1,
                              });
                            }
                          }}
                          className="text-2xl hover:bg-[#242337] rounded-full h-8 w-8 flex justify-center items-center py-2"
                        >
                          <p>+</p>
                        </button>
                        <h2 className="text-center">{publicRole.count}</h2>
                        <button
                          onClick={() => {
                            if (publicRole.count > 1) {
                              console.log("test >>>>1")
                              console.log("publicRole.count")
                              setPublicRole({
                                ...publicRole,
                                count: publicRole.count - 1,
                              });
                            }
                          }}
                          className="text-2xl hover:bg-[#242337] rounded-full h-8 w-8 flex justify-center items-center py-2"
                        >
                          <p>-</p>
                        </button>
                      </div>
                      <div className="flex flex-col w-full">
                        <button
                          onClick={() => {
                            console.log("test3 >>>>")
                            console.log("publicRole.count")
                            if (
                              
                              publicRole.count + totalMinted <=
                              publicRole.max
                            ) {
                              console.log("test4 >>>>")
                              console.log("publicRole.count")
                              mint(publicRole.price, publicRole.count);
                            }
                          }}
                          disabled={loadingTransaction}
                          className={`sm:w-full w-full h-12 mb-3 ${
                            loadingTransaction
                              ? "opacity-50"
                              : "hover:opacity-90"
                          } bg-gradient-to-r from-[#04246D] to-[#052F91] rounded-md flex justify-center items-center `}
                        >
                          {loadingTransaction ? (
                            <h2 className="text-white font-bold">LOADING</h2>
                          ) : (
                            <h2 className="text-white font-bold">MINT</h2>
                          )}
                        </button>
                        {false && (
                          <button
                            onClick={() => {
                              removeFee(publicRole.price, publicRole.count);
                            }}
                            disabled={loadingTransactionFee}
                            className={`sm:w-full w-full h-12 ${
                              loadingTransactionFee
                                ? "opacity-50"
                                : "hover:opacity-70"
                            } shadow-sm bg-gradient-to-r from-[#111116] to-[#19191E] rounded-md flex justify-evenly items-center text-sm`}
                          >
                            <div className="relative w-1/4 h-3/6 aspect-square flex items-start overflow-hidden">
                              <Image
                                src={"/img/logoPengSol.png"}
                                layout="fill"
                                objectFit="contain"
                              />
                            </div>
                            {loadingTransactionFee ? (
                              <h2 className="text-white">LOADING</h2>
                            ) : (
                              <h2 className="text-white">Remove Fees</h2>
                            )}
                          </button>
                        )}
                      </div>
                    </div> */}
                  </div>
                )}
              </div>
            ) : (
              roles &&
              roles.map(
                (item: {
                  id: number;
                  role: string;
                  price: number;
                  start: Date;
                  max: number;
                  status: boolean;
                  count: number;
                }) => {
                  return (
                    item.status &&
                    item.role && (
                      <div key={item.id}>
                        <div
                          onClick={() => {
                            new Date().getTime() - item.start.getTime() > 0 &&
                              setSelected(item.id == selected ? null : item.id);
                          }}
                          className={`w-full mt-4 flex flex-col gap-3 ${
                            selected == item.id
                              ? "border border-white bg-[#242337]"
                              : ""
                          } transition bg-[#151429] hover:bg-[#242337] hover:cursor-pointer px-6 py-4 rounded-lg shadow-md`}
                        >
                          <div className="w-full text-sm flex flex-row justify-between text-gray-300">
                            <p className="">{item.start.toDateString()}</p>
                            <p className="">{item.status && "Complete"}</p>
                          </div>
                          <div className="w-full flex flex-row justify-between text-white text-xl">
                            <p className="">{item.role}</p>
                            <p className="">
                              {item.price} {aptos == "true" ? " aptos" : "SOL"}
                            </p>
                          </div>
                          <div className="w-full flex sm:flex-row flex-col text-sm justify-between sm:items-center items-start text-gray-300 mb-1">
                            {new Date().getTime() - item.start.getTime() > 0 ? (
                              totalMinted == item.max && (
                                <p className="">Finished !</p>
                              )
                            ) : (
                              <Countdown
                                date={item.start}
                                renderer={({
                                  days,
                                  hours,
                                  minutes,
                                  seconds,
                                }) => (
                                  <div className="flex flex-row ">
                                    <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mr-1 flex flex-col items-center justify-center bg-[#454463]">
                                      <p>{zeroPad(days)}</p>
                                      <p className="text-xs text-gray-300">
                                        days
                                      </p>
                                    </div>

                                    <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mx-1 flex flex-col items-center justify-center bg-[#454463]">
                                      <p>{zeroPad(hours)}</p>
                                      <p className="text-xs text-gray-300">
                                        hrs
                                      </p>
                                    </div>

                                    <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mx-1 flex flex-col items-center justify-center bg-[#454463]">
                                      <p>{zeroPad(minutes)}</p>
                                      <p className="text-xs text-gray-300">
                                        mins
                                      </p>
                                    </div>

                                    <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  ml-1 flex flex-col items-center justify-center bg-[#454463]">
                                      <p>{zeroPad(seconds)}</p>
                                      <p className="text-xs text-gray-300">
                                        secs
                                      </p>
                                    </div>
                                  </div>
                                )}
                              />
                            )}
                            {new Date().getTime() - item.start.getTime() >
                              0 && (
                              <p className="sm:mt-0 mt-4">
                                {/* {Math.ceil((totalMinted / item.max) * 100)} %
                                mintedss */}
                              </p>
                            )}
                          </div>
                        </div>
                        {selected == item.id && (
                          <div
                            className={`w-full mt-4 flex flex-col gap-3 transition bg-[#151429] px-6 py-5 rounded-lg shadow-md`}
                          >
                            {/* <div className="w-full text-sm flex flex-row justify-between text-green-500">
                              <p className="">Total Minted</p>
                              <p className="">{`( ${totalMinted} / ${item.max} )`}</p>
                            </div>
                            <div className="w-full h-8 flex  text-white bg-[#242337] rounded-md relative">
                              <div
                                style={{
                                  width: `${Math.ceil(
                                    (totalMinted / item.max) * 100
                                  )}%`,
                                }}
                                className=" h-full bg-gradient-to-r from-[#228C28] to-[#299617] rounded-md"
                              ></div>
                              <h2 className="text-white text-sm absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2">
                                {Math.ceil((totalMinted / item.max) * 100)} %
                              </h2>
                            </div> */}
                            <div className="w-full flex sm:flex-row flex-col-reverse text-white gap-4 mt-2">
                              <div className="h-full border border-[#04246D] rounded-md flex flex-col">
                                <button
                                  onClick={() => addCount(item.id)}
                                  className="text-2xl hover:bg-[#242337] rounded-full h-8 w-8 flex justify-center items-center py-2"
                                >
                                  <p>+</p>
                                </button>
                                <h2 className="text-center">{item.count}</h2>
                                <button
                                  onClick={() => minusCount(item.id)}
                                  className="text-2xl hover:bg-[#242337] rounded-full h-8 w-8 flex justify-center items-center py-2"
                                >
                                  <p>-</p>
                                </button>
                              </div>
                              <div className="flex flex-col w-full">
                                <button
                                  onClick={() => {
                                    if (item.count + totalMinted <= item.max) {
                                      mint(item.price, item.count);
                                    }
                                  }}
                                  disabled={loadingTransaction}
                                  className={`sm:w-full w-full h-12 mb-3 ${
                                    loadingTransaction
                                      ? "opacity-50"
                                      : "hover:opacity-90"
                                  } bg-gradient-to-r from-[#04246D] to-[#052F91] rounded-md flex justify-center items-center `}
                                >
                                  {loadingTransaction ? (
                                    <h2 className="text-white font-bold">
                                      LOADING
                                    </h2>
                                  ) : (
                                    <h2 className="text-white font-bold">
                                      PRE-MINT
                                    </h2>
                                  )}
                                </button>
                                {presale.attributes?.fees && (
                                  <button
                                    onClick={() => {
                                      removeFee(item.price, item.count);
                                    }}
                                    disabled={loadingTransactionFee}
                                    className={`sm:w-full w-full h-12 ${
                                      loadingTransactionFee
                                        ? "opacity-50"
                                        : "hover:opacity-70"
                                    } shadow-sm bg-gradient-to-r from-[#111116] to-[#19191E] rounded-md flex justify-evenly items-center text-sm`}
                                  >
                                    <div className="relative w-1/4 h-3/6 aspect-square flex items-start overflow-hidden">
                                      <Image
                                        src={"/img/logoPengSol.png"}
                                        layout="fill"
                                        objectFit="contain"
                                      />
                                    </div>
                                    {loadingTransactionFee ? (
                                      <h2 className="text-white">LOADING</h2>
                                    ) : (
                                      <h2 className="text-white">
                                        Remove Fees
                                      </h2>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  );
                }
              )
            )}
          </div>
        </div>
      </div>
      <div>
        {/* <svg
          id="wave"
          style={{ transform: "rotate(0deg)", transition: " 0.3s" }}
          viewBox="0 0 1440 110"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sw-gradient-0" x1="0" x2="0" y1="1" y2="0">
              <stop stop-color="rgb(28, 26, 51)" offset="0%"></stop>
              <stop stop-color="rgb(28, 26, 51)" offset="100%"></stop>
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 0px)", opacity: 1 }}
            fill="url(#sw-gradient-0)"
            d="M0,0L26.7,5.5C53.3,11,107,22,160,34.8C213.3,48,267,62,320,71.5C373.3,81,427,84,480,82.5C533.3,81,587,73,640,60.5C693.3,48,747,29,800,20.2C853.3,11,907,11,960,11C1013.3,11,1067,11,1120,23.8C1173.3,37,1227,62,1280,75.2C1333.3,88,1387,88,1440,80.7C1493.3,73,1547,59,1600,45.8C1653.3,33,1707,22,1760,25.7C1813.3,29,1867,48,1920,58.7C1973.3,70,2027,73,2080,67.8C2133.3,62,2187,48,2240,38.5C2293.3,29,2347,26,2400,22C2453.3,18,2507,15,2560,12.8C2613.3,11,2667,11,2720,11C2773.3,11,2827,11,2880,25.7C2933.3,40,2987,70,3040,73.3C3093.3,77,3147,55,3200,51.3C3253.3,48,3307,62,3360,64.2C3413.3,66,3467,55,3520,45.8C3573.3,37,3627,29,3680,34.8C3733.3,40,3787,59,3813,67.8L3840,77L3840,110L3813.3,110C3786.7,110,3733,110,3680,110C3626.7,110,3573,110,3520,110C3466.7,110,3413,110,3360,110C3306.7,110,3253,110,3200,110C3146.7,110,3093,110,3040,110C2986.7,110,2933,110,2880,110C2826.7,110,2773,110,2720,110C2666.7,110,2613,110,2560,110C2506.7,110,2453,110,2400,110C2346.7,110,2293,110,2240,110C2186.7,110,2133,110,2080,110C2026.7,110,1973,110,1920,110C1866.7,110,1813,110,1760,110C1706.7,110,1653,110,1600,110C1546.7,110,1493,110,1440,110C1386.7,110,1333,110,1280,110C1226.7,110,1173,110,1120,110C1066.7,110,1013,110,960,110C906.7,110,853,110,800,110C746.7,110,693,110,640,110C586.7,110,533,110,480,110C426.7,110,373,110,320,110C266.7,110,213,110,160,110C106.7,110,53,110,27,110L0,110Z"
          ></path>
        </svg> */}
        <div
          className="w-full p-6  rounded-b-2xl border-t-[1px] border-gray-400"
          style={{ background: "rgb(28, 26, 51)", color: "#fff" }}
        >
          <p className="text-xl font-bold text-[#f7f7f7] mb-2">Project Info</p>
          <p className=" text-white">
            {description.split("\\n").map((line) => (
              <>
                {line}
                <br />
              </>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}

const Chart = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  background: red;
  border-radius: 50%;
  transform: var(--center) translate(33px, 0);
`;

function ProjectSummary({
  twitterFollowers,
  discordFollowers,
  security,
  twitterURL,
  discordURL,
  projectSiteLink,
  name,
}) {
  return (
    <div className=" bg-transparent rounded-2xl col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col gap-6">
      <div className="w-full bg-[#16162a] rounded-xl flex flex-col p-4 sm:p-5 sm:py-6 sm:pt-4 gap-6">
        <Summary
          key={twitterFollowers}
          twitterFollowers={twitterFollowers}
          discordFollowers={discordFollowers}
          security={security}
        />
      </div>
      <div className="w-[full] bg-[#16162a] rounded-xl flex flex-col p-5 pt-4 ">
        <div className="flex flex-col gap-3">
          <p className="font-bold text-white text-lg">Socials</p>
          <p className="text-gray-500 text-sm mb-1">
            !be careful with external links!
          </p>
          <a target="_blank" href={twitterURL} rel="noopener noreferrer">
            <div className="flex gap-3 items-center w-full rounded-xl bg-[#1e1c3a]">
              <div className="bg-white h-[30px] w-[30px] rounded-xl relative  justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/img/group-28-1@1x.png"
                    height={18}
                    width={18}
                    objectFit="contain"
                  />
                </div>
              </div>
              <p className=" text-white m-0 text-xs">/{name}</p>
            </div>
          </a>
          <a target="_blank" href={discordURL} rel="noopener noreferrer">
            <div className="w-full flex items-center rounded-xl bg-[#1e1c3a] gap-3">
              <div className="bg-white h-[30px] w-[30px] rounded-xl relative ">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/img/group-30-1@1x.png"
                    height={18}
                    width={18}
                    objectFit="contain"
                  />
                </div>
              </div>
              <p className=" text-white m-0 text-xs">/{name}</p>
            </div>
          </a>
          {/* <Link href={projectSiteLink}>
            <div className="w-full flex items-center rounded-xl bg-[#1e1c3a] gap-3">
              <div className="bg-white h-[30px] w-[30px] rounded-xl relative p-1">
                <div className="relative w-full h-full">
                  <Image
                    src="/img/group-32-1@1x.png"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <p className="font-bold text-white m-0 text-xs">
                {projectSiteLink}
              </p>
            </div>
          </Link> */}
        </div>
      </div>
    </div>
  );
}

const getDateStructure = (mintDate: string) => {
  const date = new Date(mintDate);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getUTCDate();
  const month = monthNames[date.getUTCMonth()];

  const year = date.getUTCFullYear();

  const hours = date.getUTCHours();

  const minutes = date.getUTCMinutes();

  return { day, month, year, hours, minutes };
};

function UpcomingProjects({ name, token }: { name: string; token: string }) {
  const [collections, setCollections] = useState<
    {
      name: string;
      image: string;
      launchDatetime: string;
      slug: string;
      candy_machine_id: string;
    }[]
  >([]);

  useEffect(() => {
    fetch("/api/projects?pagination[pageSize]=100", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then(({ data }) => {
        setCollections(
          data
            ? data
                .reverse()
                .filter(
                  (collection: {
                    attributes: {
                      status: boolean;
                      name: string;
                      mintDate: string;
                    };
                  }) => {
                    const date = new Date(collection.attributes.mintDate);
                    const dateNow = new Date();
                    return (
                      collection.attributes.status &&
                      collection.attributes.name !== name &&
                      dateNow < date
                    );
                  }
                )
                .map(
                  (collection: {
                    attributes: {
                      name: string;
                      mintDate: string;
                      slug: string;
                      img_url: string;
                      candy_machine_id: string;
                    };
                  }) => ({
                    name: collection.attributes.name,
                    image: collection.attributes.img_url,
                    launchDatetime: collection.attributes.mintDate,
                    slug: collection.attributes.slug,
                    candy_machine_id: collection.attributes.candy_machine_id,
                  })
                )
            : []
        );
      });
  }, [token]);

  return (
    // <div className="w-[250px] bg-[#16162a] rounded-2xl flex flex-col gap-6 p-4">
    <div className="bg-[#16162a] rounded-2xl flex flex-col gap-6 p-4 col-span-12 sm:col-span-6 lg:col-span-3 h-fit">
      <div className="flex flex-col gap-2">
        <p className="m-0 font-bold text-white text-xl">Upcoming Projects</p>
      </div>
      <div className="flex flex-col gap-3">
        {collections.map((project) => {
          const { day, month, year, hours, minutes } = getDateStructure(
            project.launchDatetime
          );
          return (
            <Link href={`/collection/${project.slug}`}>
              <div className="flex items-center justify-between">
                <div
                  className={`h-9 w-9 ${
                    project.image ? "bg-transparent" : "bg-white"
                  } rounded-lg relative overflow-hidden`}
                >
                  <Image
                    src={project.image}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="flex flex-col justify-center items-center">
                  <p className="m-0 font-bold text-white">{project.name}</p>
                  {project.launchDatetime ? (
                    <p className="m-0 text-[#a5a599] text-xs">
                      {month} {day} {year}
                    </p>
                  ) : (
                    <p className="m-0 text-[#a5a599] text-xs">TBA</p>
                  )}
                </div>
                <p className="m-0 font-bold text-[#720484] text-xl">+</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Collection({ collection, collectionFollowers }) {
  const { hasNft } = useContext(AuthContext);

  const collectionID = collection?.id;

  const nftDescription = collection?.attributes.description;

  const mintDate = new Date(collection?.attributes.mintDate);

  const name = collection?.attributes.name;

  const supply = collection?.attributes.supply;

  const twitterFollowers =
    collectionFollowers?.attributes.twitter_followers ?? "0";

  const discordFollowers =
    collectionFollowers?.attributes.discord_followers ?? "0";

  const twitterURL = collection?.attributes.twitter ?? "";
  const discordURL = collection?.attributes.discord ?? "";

  const projectImage = collection?.attributes.img_url ?? "";
  const projectSiteLink = "";

  const price = collection?.attributes.price;

  const security = collectionFollowers?.attributes.security ?? 0;

  const doxxed = collection?.attributes.doxed;

  const wallet = useWallet();

  const router = useRouter();

  const [session, setSession] = useState(null);

  const [token, setToken] = useState("");

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
      // console.log('>>> session : ',session)
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

          if (mints && hasNft) {
            const bestNFT = getBestNFt(mints);
            const BestfoundInKing = dataKing.find(
              (kingPeng) => kingPeng === bestNFT.name
            );
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
          }
        } catch (error) {
          // console.log(error);
        }
      };
      fetchData();
    }
  }, [wallet]);

  const [alertState, setAlertState] = useAtom(AlertAtom);

  const [showMenu, setShowMenu] = useState(false);

  const handleShowMenu = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  // console.log('>>> collection.name : ',name)

  const candyMachineId =
    name === "Hiraeth"
      ? "7vdDCeMYkJ7NDAvPT9Hj86PD1MjuuexLiWVgVp3fgHH6"
      : collection?.attributes.candy_machine_id;

  // console.log('>>> cnady : ', candyMachineId)

  return (
    <Container>
      <Menu showMenu={showMenu} handleCloseMenu={handleCloseMenu} />
      <div className="flex flex-col flex-1 w-full">
        <Header
          isPlatformPage={false}
          handleShowMenu={handleShowMenu}
          showMenu={showMenu}
        />
        {/* <ContainerContent className="mx-auto max-w-6xl flex flex-row flex-wrap gap-6 justify-center"> */}
        <ContainerCollectionPage className="mx-auto grid grid-cols-12 gap-6 w-full h-full overflow-auto p-6">
          <ProjectMintBlock
            id={collectionID}
            price={price}
            name={name}
            mintDate={mintDate}
            description={nftDescription}
            projectImage={projectImage}
            doxxed={doxxed}
            candyMachineId={candyMachineId}
            aptos={router.query.aptos}
            isPresale={router.query.presale}
            isPublic={router.query.public}
          />
          <ProjectSummary
            twitterFollowers={twitterFollowers}
            discordFollowers={discordFollowers}
            security={security}
            twitterURL={twitterURL}
            discordURL={discordURL}
            projectSiteLink={projectSiteLink}
            name={name}
          />
          <UpcomingProjects key={name} name={name} token={token} />
        </ContainerCollectionPage>
        {/* </ContainerContent> */}
      </div>

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
