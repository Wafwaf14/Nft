import { useSpring } from "@react-spring/web";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import {
  ConnectContainer,
  ContainerAnimated,
} from "./HomePageConnection.style";
import React, { useEffect, useState } from "react";

import { getSession, signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { ContainerClickGlowDiv } from "components/FormOnBoarding/FormOnBoarding.style";

type HomePageConnectionProps = {
  wallet: WalletContextState;
};

export function HomePageConnection({
  wallet,
}: HomePageConnectionProps): JSX.Element {
  const { data: sessionTest, status } = useSession();

  // console.log('>>> sessionTest : ',sessionTest);
  // console.log('>>> status : ',status);

  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      //    console.log('>>> session : ',session)
      setSession(session);
    };
    fetchSession();
  }, []);

  const springLoginProps = useSpring({
    transform:
      wallet.connected && session ? "translateX(-100%)" : "translateX(0%)",
  });

  return (
    <ContainerAnimated style={springLoginProps}>
      <ConnectContainer>
        <div
          style={{
            height: "150px",
            width: "250px",
            position: "relative",
          }}
        >
          <Image src="/img/logoPengSol.png" layout="fill" objectFit="contain" />
        </div>
        {session ? (
          <WalletMultiButton className="btn btn-ghost " />
        ) : (
          <LoginDiscord />
        )}
      </ConnectContainer>
    </ContainerAnimated>
  );
}

export function LoginDiscord(): JSX.Element {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setSession(session);
    };
    fetchSession();
  }, []);

  //  console.log('>>> session : ', session);

  const signInButtonNode = () => {
    if (session) {
      return false;
    }

    return (
      <div>
        <Link href="/api/auth/signin">
          <ContainerClickGlowDiv
            style={{
              width: "fit-content",
              padding: "4px 24px",
              height: "35px",
            }}
            onClick={(e) => {
              e.preventDefault();
              signIn("discord");
            }}
          >
            Login with Discord
          </ContainerClickGlowDiv>
        </Link>
      </div>
    );
  };

  const signOutButtonNode = () => {
    if (!session) {
      return false;
    }

    return (
      <div>
        <Link href="/api/auth/signout">
          <ContainerClickGlowDiv
            style={{
              width: "fit-content",
              padding: "4px 24px",
              height: "35px",
            }}
            onClick={(e) => {
              e.preventDefault();
              signOut();
            }}
          >
            Logout
          </ContainerClickGlowDiv>
        </Link>
      </div>
    );
  };

  if (!session) {
    return (
      <div className="hero">
        <div className="navbar">
          {signOutButtonNode()}
          {signInButtonNode()}
        </div>
      </div>
    );
  }

  return (
    <div className="hero">
      <Head>
        <title>Index Page</title>
      </Head>
      <div className="navbar">
        {signOutButtonNode()}
        {signInButtonNode()}
      </div>
    </div>
  );
}
