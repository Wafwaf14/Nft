import * as anchor from "@project-serum/anchor";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Commitment,
  Connection,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  createAccountsForMint,
  getCandyMachineState,
  getCollectionPDA,
  mintOneToken,
  SetupState,
} from "./candy-machine";
import { DEFAULT_TIMEOUT } from "./connection";
import { AlertState, getAtaForMint, toDate } from "./utils";
import { CircularProgress } from "@material-ui/core";
import { useAtom } from "jotai";
import { AlertAtom } from "./store";
import confetti from "canvas-confetti";
const network = process.env
  .NEXT_PUBLIC_REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;

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

type MintButtonProps = {
  backgroundButtonMint: string;
  candyMachineID: string;
};

export function MintButton({
  backgroundButtonMint,
  candyMachineID,
}: MintButtonProps): JSX.Element {
  function throwConfetti(): void {
    confetti({
      particleCount: 400,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  const candyMachineId = getCandyMachineId(candyMachineID);

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

  const wallet = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();

  const rpcUrl = rpcHost;
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

  // console.log('>>> candyMachine : ',candyMachine);
  const refreshCandyMachineState = async (
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
      } catch (e) {
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

  const onMint = async (
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = []
  ) => {
    try {
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        setIsMinting(true);
        let setupMint: SetupState | undefined;
        if (needTxnSplit && setupTxn === undefined) {
          setAlertState({
            open: true,
            message: "Please validate account setup transaction",
            severity: "info",
          });
          setupMint = await createAccountsForMint(
            candyMachine,
            wallet.publicKey
          );
          let status: any = { err: true };
          if (setupMint.transaction) {
            status = await awaitTransactionSignatureConfirmation(
              setupMint.transaction,
              DEFAULT_TIMEOUT,
              connection,
              true
            );
          }
          if (status && !status.err) {
            setSetupTxn(setupMint);
            setAlertState({
              open: true,
              message:
                "Setup transaction succeeded! You can now validate mint transaction",
              severity: "info",
            });
          } else {
            setAlertState({
              open: true,
              message: "Mint failed! Please try again!",
              severity: "error",
            });
            return;
          }
        }

        const setupState = setupMint ?? setupTxn;
        const mint = setupState?.mint ?? anchor.web3.Keypair.generate();
        let mintResult = await mintOneToken(
          candyMachine,
          wallet.publicKey,
          mint,
          beforeTransactions,
          afterTransactions,
          setupState
        );

        let status: any = { err: true };
        let metadataStatus = null;
        if (mintResult) {
          status = await awaitTransactionSignatureConfirmation(
            mintResult.mintTxId,
            DEFAULT_TIMEOUT,
            connection,
            true
          );

          metadataStatus =
            await candyMachine.program.provider.connection.getAccountInfo(
              mintResult.metadataKey,
              "processed"
            );
          // console.log("Metadata status: ", !!metadataStatus);
        }

        if (status && !status.err && metadataStatus) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });

          // update front-end amounts
          displaySuccess(mint.publicKey);
          refreshCandyMachineState("processed");
        } else if (status && !status.err) {
          setAlertState({
            open: true,
            message:
              "Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again.",
            severity: "error",
            hideDuration: 8000,
          });
          refreshCandyMachineState();
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
          refreshCandyMachineState();
        }
      }
    } catch (error: any) {
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (!error.message) {
          message = "Transaction Timeout! Please try again.";
        } else if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (anchorWallet && anchorWallet.publicKey) {
        const balance = await connection.getBalance(anchorWallet!.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [anchorWallet, connection]);

  useEffect(() => {
    if (!candyMachine && candyMachineId) {
      refreshCandyMachineState();
    }
  }, [
    anchorWallet,
    candyMachineId,
    connection,
    isEnded,
    isPresale,
    refreshCandyMachineState,
    candyMachine,
  ]);

  return (
    <>
      {/* <svg
        className="gooey-svg"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
      >
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="highContrastGraphic"
            />
            <feComposite
              in="SourceGraphic"
              in2="highContrastGraphic"
              operator="atop"
            />
          </filter>
        </defs>
      </svg> */}
      <button
        id="gooey-button"
        // style={{
        //   backgroundColor: backgroundButtonMint,
        //   borderRadius: "10px",
        //   border: "0px",
        //   padding: "8px",
        //   color: "#ffffff",
        //   fontWeight: "700",
        //   cursor: "pointer",
        //   width: "100%",
        // }}
        className="text-white py-2 px-4 rounded-lg shadow-sm"
        onClick={async () => {
          await onMint();
        }}
        disabled={!candyMachine}
        style={{
          backgroundColor: !candyMachine ? "#d0312d" : "#32C055",
          opacity: !candyMachine ? 0.6 : 1,
          color: "#fff",
        }}
      >
        {!candyMachine ? (
          "Project Not Live"
        ) : isMinting ? (
          <CircularProgress />
        ) : candyMachine?.state.isSoldOut || isSoldOut ? (
          "SOLD OUT"
        ) : isActive ? (
          "Mint Now"
        ) : isEnded ? (
          "ENDED"
        ) : candyMachine?.state.goLiveDate ? (
          "Mint Now"
        ) : (
          "UNAVAILABLE"
        )}
        {/* <span className="bubbles">
          <span
            className="bubble"
            style={{ backgroundColor: !candyMachine ? "#f05053" : "#00FF80" }}
          ></span>
          <span
            className="bubble"
            style={{ backgroundColor: !candyMachine ? "#f05053" : "#00FF80" }}
          ></span>
          <span
            className="bubble"
            style={{ backgroundColor: !candyMachine ? "#f05053" : "#00FF80" }}
          ></span>
          <span
            className="bubble"
            style={{ backgroundColor: !candyMachine ? "#f05053" : "#00FF80" }}
          ></span>
          <span
            className="bubble"
            style={{ backgroundColor: !candyMachine ? "#f05053" : "#00FF80" }}
          ></span>
          <span
            className="bubble"
            style={{ backgroundColor: !candyMachine ? "#f05053" : "#00FF80" }}
          ></span>
          <span
            className="bubble"
            style={{ backgroundColor: !candyMachine ? "#f05053" : "#00FF80" }}
          ></span>
          <span
            className="bubble"
            style={{ backgroundColor: !candyMachine ? "#f05053" : "#00FF80" }}
          ></span>
          <span
            className="bubble"
            style={{ backgroundColor: !candyMachine ? "#f05053" : "#00FF80" }}
          ></span>
          <span
            className="bubble"
            style={{ backgroundColor: !candyMachine ? "#f05053" : "#00FF80" }}
          ></span>
        </span> */}
      </button>
    </>
  );
}
