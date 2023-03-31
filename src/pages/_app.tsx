import { AppProps } from "next/app";
import Head from "next/head";
import { FC } from "react";
import { ContextProvider } from "../contexts/ContextProvider";
import { AppBar } from "../components/AppBar";
import { ContentContainer } from "../components/ContentContainer";
import { Footer } from "../components/Footer";
import Notifications from "../components/Notification";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "contexts/AuthContext";
import {
  MartianWalletAdapter,
  AptosWalletAdapter,
  FewchaWalletAdapter,
  WalletProvider,
  PontemWalletAdapter,
  RiseWalletAdapter,
} from "@manahippo/aptos-wallet-adapter";

require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");
require("../components/MintButton/MintButton.css");

const wallets = [
  new MartianWalletAdapter(),
  new AptosWalletAdapter(),
  new FewchaWalletAdapter(),
  new PontemWalletAdapter(),
  new RiseWalletAdapter(),
];

const App: FC<AppProps> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <WalletProvider
      wallets={wallets}
      onError={(error: Error) => {
        console.log("wallet errors: ", error);
      }}
    >
      <AuthProvider>
        <ContextProvider>
          <SessionProvider session={session}>
            <Component {...pageProps} />
          </SessionProvider>
        </ContextProvider>
      </AuthProvider>
    </WalletProvider>
  );
};

export default App;
