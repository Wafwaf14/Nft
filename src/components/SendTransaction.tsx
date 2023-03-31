import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import { FC, useCallback, useState } from "react";
import { notify } from "../utils/notifications";

interface SendTransactionProps {
  projectId: string;
  price: number;
  total: number;
  updateStatus: () => void;
}

export const SendTransaction: FC<SendTransactionProps> = ({
  projectId,
  price,
  total,
  updateStatus,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [loading, setLoading] = useState(false);

  const onClick = useCallback(async () => {
    setLoading(true);
    if (!publicKey) {
      notify({ type: "error", message: `Wallet not connected!` });
      console.log("error", `Send Transaction: Wallet not connected!`);
      return;
    }

    console.log("total", total);

    let signature: TransactionSignature = "";
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(
            "Bv3BCTYqcP2gBNSaL5fKpS369r36eFujyc84K2TuEcoq"
          ),
          lamports: Math.ceil(price / 0.000000001) * total,
          // lamports: 1_000_000_000,
        })
      );

      signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction(signature, "confirmed");
      notify({
        type: "success",
        message: "Transaction successful!",
        txid: signature,
      });
      const pushData = async () => {
        await fetch("/api/premints/" + projectId, {
          method: "PUT",
          headers: {
            Authorization: `Bearer d1d01779c1656b21bf8c25d84a4a1de58a4592589c785a86d30f165b8a8d1cb4edbac67d671e139034ab6bd4d1f7537eedc68cfa666911b07245751a9aebc184eb53201a472305c8bc95769aec511df22c45d4fa9eca60fc70ca968f67a020ad31818012d442e12daa90119a9c62cc5f1c6814368bf80aa7fdb5eba66e781eb1`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            data: {
              sol_tx: signature,
              wallet: publicKey.toString(),
              price: price * total,
              total: total,
              status: "Done",
            },
          }),
        })
          .then((res) =>
            res.json().then((data) => ({ status: res.status, body: data }))
          )
          .then((response) => {
            if (response.status == 200) {
              updateStatus();
            } else {
              console.log("error");
            }
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
          });
      };

      pushData();
    } catch (error: any) {
      setLoading(false);
      notify({
        type: "error",
        message: `Transaction failed!`,
        description: error?.message,
        txid: signature,
      });
      console.log("error", `Transaction failed! ${error?.message}`, signature);
      return;
    }
  }, [publicKey, notify, connection, sendTransaction, total]);

  return (
    <div>
      <button
        className="group w-60 m-2 btn bg-green-600 hover:bg-green-700"
        onClick={onClick}
        disabled={!publicKey || loading}
      >
        {loading ? (
          <div className="">Loading</div>
        ) : (
          <div className="hidden group-disabled:block ">
            Wallet not connected
          </div>
        )}
        <span className="block group-disabled:hidden">
          Pre-mint {price} SOL
        </span>
      </button>
    </div>
  );
};
