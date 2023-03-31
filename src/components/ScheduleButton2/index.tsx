import { useCallback, useEffect, useState } from "react";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useWallet } from "@solana/wallet-adapter-react";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

import { createTransferInstruction } from "./createTransferInstructions";
import { getOrCreateAssociatedTokenAccount } from "./getOrCreateAssociatedTokenAccount";
import { RemindMeButton } from "components/Platform/ListCollections/CollectionCard.style";
import { useAtom } from "jotai";
import { AlertScheduleAtom } from "components/ScheduleButton/store";

type ScheduleButtonProps = {
  isLive: boolean;
  isActive: boolean;
  flipCard: () => void;
  projectId: number;
  addScheduled: () => void;
};
export function ScheduleButton({
  isLive,
  isActive,
  flipCard,
  projectId,
  addScheduled,
}: ScheduleButtonProps): JSX.Element {
  const { publicKey, sendTransaction, wallet, wallets, signTransaction } =
    useWallet();

  const [alertStateSchedule, setAlertStateSchedule] =
    useAtom(AlertScheduleAtom);

  const [token, setToken] = useState("");
  useEffect(() => {
    const fetchToken = async () => {
      const csrfToken = await fetch("/api/get-token-example")
        .then((response) => response.json())
        .then(({ jwt }) => jwt);
      setToken(csrfToken);
      //  console.log(">>> csrfToken : ", csrfToken);
    };
    fetchToken();
  }, []);

  let connection = new Connection(
    "https://evocative-few-hexagon.solana-mainnet.discover.quiknode.pro/fefbb9b62dc0293830fa23ead4a295286cdde6fd/"
  );

  // Docs: https://github.com/solana-labs/solana-program-library/pull/2539/files
  // https://github.com/solana-labs/wallet-adapter/issues/189
  // repo: https://github.com/solana-labs/example-token/blob/v1.1/src/client/token.js
  // creating a token for testing: https://learn.figment.io/tutorials/sol-mint-token
  const onSendSPLTransaction = useCallback(
    async (toPubkey: string, amount: number) => {
      if (!toPubkey || !amount) return;
      // console.log("Processing transaction...");

      setAlertStateSchedule({
        open: true,
        message: "Processing transaction...",
        severity: "info",
        hideDuration: 4000,
      });

      try {
        if (!publicKey || !signTransaction) throw new WalletNotConnectedError();
        const toPublicKey = new PublicKey(toPubkey);
        const mint = new PublicKey(
          "CWhHpZ1mk5wbvm5K97m65qPcem5zFUQRpXsdEoanF9CD"
        );
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          publicKey,
          mint,
          publicKey,
          signTransaction
        );

        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          publicKey,
          mint,
          toPublicKey,
          signTransaction
        );

        const transaction = new Transaction().add(
          createTransferInstruction(
            fromTokenAccount.address, // source
            toTokenAccount.address, // dest
            publicKey,
            amount * LAMPORTS_PER_SOL,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const blockHash = await connection.getRecentBlockhash();
        transaction.feePayer = await publicKey;
        transaction.recentBlockhash = await blockHash.blockhash;
        const signed = await signTransaction(transaction);

        await connection.sendRawTransaction(signed.serialize());

        // console.log(">>> Transaction sent");

        addScheduled();
        const pushData = async () => {
          const dataUser = await fetch("/api/users/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((request) => request.json())
            .then(({ id }) => id);

          const data = await fetch("/api/premints", {
            method: "POST",
            mode: "cors",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                project: projectId,
                status: "pending",
                transaction: transaction.recentBlockhash,
                user: dataUser,
                wallet: publicKey.toString(),
              },
            }),
          })
            .then((request) => request.json())
            .then((data) => {
              setAlertStateSchedule({
                open: true,
                message: "Congratulations! Your spot is reserved!",
                severity: "success",
              });
            });
        };

        pushData();
        flipCard();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // console.log(`Transaction failed: ${error.message}`);
        setAlertStateSchedule({
          open: true,
          message: "Transaction failed! Please try again!",
          severity: "error",
        });
      }
    },
    [publicKey, sendTransaction, connection]
  );

  return (
    <RemindMeButton
      onClick={() => {
        if (!isLive && isActive) {
          onSendSPLTransaction(
            "BgApxYgsv6bVeoXKqiJQHxihK5ZMoZ6SB5HWvEeqwYqr",
            200
          );
        }
      }}
    >
      Add
    </RemindMeButton>
  );
}
