import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, Connection, Keypair,PublicKey } from "@solana/web3.js";
import type { NextPage } from "next";
import Head from "next/head";
import { Platform } from "../views";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { useEffect } from "react";
import { getToken } from "next-auth/jwt";



const PlatformPage: NextPage = (props) => {

  return (
    <div>
      <Head>
        <title>PengSol AI Tools</title>
        <meta
          name="description"
          content="PengSol AI Tools"
        />
        
      </Head>
      <Platform />

    </div>
  );
};

export default PlatformPage;