import Head from "next/head";
import { Container } from "components/Platform/Platform.style";
import { Menu } from "components/Platform/Menu";
import { useEffect, useMemo, useState } from "react";
import { Header } from "components/Platform/Header";
import { ContainerContent } from "components/Platform/ListCollections/ListCollections.style";
import * as anchor from "@project-serum/anchor";
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

const Dashboard = () => {
  const [showMenu, setShowMenu] = useState(false);
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

  const [alertState, setAlertState] = useAtom(AlertAtom);

  const [needTxnSplit, setNeedTxnSplit] = useState(true);
  const [setupTxn, setSetupTxn] = useState<SetupState>();

  const [loading, setLoading] = useState(false);

  const wallet = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();

  const solFeesEstimation = 0.012; // approx of account creation fees

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
            <div className="w-full flex sm:flex-row flex-col justify-end">
              <input
                className="h-12 sm:w-1/3 w-full bg-[#1C1A33] rounded-lg px-6 placeholder:text-[#454365] mr-6"
                placeholder="Enter Candy Machine address"
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={() => searchCandy(search)}
                className="h-12 sm:w-1/6 w-full sm:mt-0 mt-4 bg-[#1C1A33] rounded-lg transition hover:opacity-60"
              >
                Search
              </button>
            </div>
            <div className="flex h-full w-full mt-6 justify-center items-start">
              {loading ? (
                <div className="h-full w-full flex justify-center items-center mb-12">
                  <Loader />
                </div>
              ) : candyMachine ? (
                <div className="w-full px-6 pr-8 py-6">
                  <div className="flex justify-between w-full pb-6 gap-8">
                    <div className="flex flex-col w-full grow px-6 py-4 rounded-lg bg-[#1C1A33]">
                      <p className="text-xl mb-2 text-gray-300">Mint Price</p>
                      <p className="text-5xl font-bold">
                        {price}{" "}
                        <span className="font-normal text-3xl">SOL</span>
                      </p>
                    </div>
                    <div className="flex flex-col w-full grow px-6 py-4 rounded-lg bg-[#1C1A33]">
                      <p className="text-xl mb-2 text-gray-300">Mint Stats</p>
                      <div className="flex mt-1">
                        <p className="mr-4">Items Available</p>
                        <p className="text-2xl font-bold">{itemsAvailable}</p>
                      </div>
                      <div className="flex mt-2">
                        <p className="mr-4">Items Redeemed</p>
                        <p className="text-2xl font-bold">
                          {itemsRedeemed} / {itemsAvailable}
                        </p>
                      </div>
                      <div className="flex mt-2">
                        <p className="mr-4">Items Remaining</p>
                        <p className="text-2xl font-bold">
                          {itemsRemaining} / {itemsAvailable}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col w-full grow px-6 py-4 rounded-lg bg-[#1C1A33]">
                      <p className="text-xl mb-2 text-gray-300">Go Live Date</p>
                      <p className="text-3xl font-bold">
                        {new Date(
                          candyMachine.state.goLiveDate.toNumber() * 1000
                        ).toDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => {}}
                      className="h-12 sm:w-1/6 w-full sm:mt-0 mt-4 bg-[#4169E0] font-bold rounded-lg transition hover:opacity-60 mr-8"
                    >
                      Mint
                    </button>
                    <button
                      onClick={() => {}}
                      className="h-12 sm:w-1/6 w-full sm:mt-0 mt-4 bg-[#4169E0] font-bold rounded-lg transition hover:opacity-60"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full w-full flex justify-center items-center">
                  <p className="text-3xl mb-8 font-bold font-mono uppercase">
                    failed to get info about this collection
                  </p>
                </div>
              )}
            </div>
          </ContainerContent>
        </div>
      </Container>
    </div>
  );
};
export default Dashboard;
