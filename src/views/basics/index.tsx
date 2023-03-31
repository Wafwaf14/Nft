import { FC, useCallback, useEffect, useState } from "react";
import { SignMessage } from "../../components/SignMessage";
import { SendTransaction } from "../../components/SendTransaction";
import {
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { Wallet, web3 } from "@project-serum/anchor";

import * as anchor from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import * as splToken from "@solana/spl-token";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";

import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import {
  Connection,
  PublicKey,
  Commitment,
  Transaction,
} from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction } from "../../components/ScheduleButton/createAssociatedTokenAccountInstruction";
import { createTransferInstruction } from "../../components/ScheduleButton/createTransferInstructions";

export const BasicsView: FC = ({}) => {
  const { publicKey, sendTransaction, wallet, wallets, signTransaction } =
    useWallet();

  let connection = new Connection(
    "https://evocative-few-hexagon.solana-mainnet.discover.quiknode.pro/fefbb9b62dc0293830fa23ead4a295286cdde6fd/"
  );

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Basics
        </h1>
        {/* CONTENT GOES HERE */}
        <div className="text-center">
          <SignMessage />
          <SendTransaction />
          <button
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              color: "black",
            }}
            onClick={() => {}}
          >
            Pay with ICET
          </button>
        </div>
      </div>
    </div>
  );
};
