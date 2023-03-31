import { useSpring } from "@react-spring/web";
import {
  ConnectContainer,
  ContainerAnimated,
} from "components/HomePageConnection/HomePageConnection.style";
import {
  EnterPlatform,
  ListNFTContainer,
  NFTCard,
  TextCustom,
  ContainerStaking,
  HeaderStaking,
  LogoContainer,
  IconWrapper,
} from "./HomePageDisplayNFT.style";
import { WalletContextState } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import data from "../../data/PengSol_ranks.json";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import { WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import dataKing from "../../data/PengSol_king.json";
import {
  getMintsTokens,
  getMintsTokensBalance,
} from "components/helpers/getMintsToken";
import { getBestNFt } from "components/helpers/getBestNFT";
import { getSession, signIn, signOut } from "next-auth/react";
import { AuthContext } from "contexts/AuthContext";
import { BCS, TxnBuilderTypes } from "aptos";

type HomePageDisplayNFTProps = {
  wallet: WalletContextState;
};

export function HomePageDisplayNFT({
  wallet,
}: HomePageDisplayNFTProps): JSX.Element {
  const [session, setSession] = useState(null);

  const { setHasNft, setAptosWallet } = useContext(AuthContext);

  const [hasNFT, setHasNFT] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setSession(session);
    };
    fetchSession();
  }, []);

  const checkAptos = async () => {
    const status = await (window as any).aptos.isConnected();
    if (status) {
      const accountAddress = await (window as any).aptos.account();
      setAptosWallet(accountAddress);
    } else {
      setAptosWallet(null);
    }
  };

  const springStackingProps = useSpring({
    transform:
      !wallet.connected || !session ? "translateX(100%)" : "translateX(0%)",
  });
  const [nfts, setNfts] = useState<{
    rank: number;
    name: string;
    address: string;
    tier: string;
  }>({
    rank: 0,
    name: "",
    address: "",
    tier: "",
  });

  useEffect(() => {
    if (wallet) {
      const walletToQuery = wallet.publicKey;

      const fetchData = async () => {
        try {
          const conn = new Connection(
            "https://cool-dry-waterfall.solana-mainnet.discover.quiknode.pro/ef22659f31b8cdf97627b259a7ebae56e4168ded/",
            "confirmed"
          );

          // Get all mint tokens (NFTs) from your wallet
          const walletAddr = wallet.publicKey;

          let mintsBalance = await getMintsTokensBalance(
            walletAddr?.toString()
          );

          const checkBalance = mintsBalance.filter(
            (mint) => mint.tokenBalance > 0
          );

          // setHasNFT(checkBalance.length > 0);

          const bestNFT = getBestNFt(
            checkBalance.map((mint) => mint.mintAddress)
          );

          setHasNft(bestNFT.rank);

          setNfts(bestNFT);
         // checkAptos();
        } catch (error) {
          // console.log(error);
        }
      };
      fetchData();
    }
  }, [wallet, setNfts]);

  return (
    <ContainerAnimated style={springStackingProps}>
      <ConnectContainer>
        <ListNFTContainer>
          {
            // hasNFT &&
            // nfts &&
            dataKing.find((kingPeng) => kingPeng === nfts.name) ||
            nfts.rank >= 0 ||
            wallet.publicKey?.toString() ===
              "HZTL2GEEuB3PF2K5zXjnKQeb8D2UwGrfzpW3kfNTiPTu" ||
            wallet.publicKey?.toString() ===
              "2g6gZQbyrZ3yc1LitsG1MMzerRjgYKKCPf4TNPCnVBwj" ||
            wallet.publicKey?.toString() ===
              "8B4HYMuXFUEC4mdzEcp8NwA3kKF9kvXCCY9U2AeUf3hx" ||
            wallet.publicKey?.toString() ===
              "8BUdj3HRCx4pwCLGmyokF8okY8imFqs49qeXEHbCpHJC" ? (
              <>
                <HeaderStaking>
                  <div />
                  <LogoContainer>
                    <div
                      style={{
                        height: "72px",
                        width: "120px",
                        position: "relative",
                      }}
                    >
                      <Image
                        src="/img/logoPengSol.png"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </LogoContainer>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      position: "absolute",
                      right: "8px",
                      top: "8px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#112830",
                        height: "fit-content",
                        display: "flex",
                        gap: "4px",
                        padding: "8px 16px",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "16px",
                      }}
                    >
                      <IconWrapper>
                        <Image
                          src="/img/path-9-10@1x.png"
                          layout="fill"
                          objectFit="contain"
                        />
                      </IconWrapper>
                      <p
                        style={{
                          letterSpacing: "1px",
                          fontSize: "14px",
                          color: "#38e25d",
                          textAlign: "start",
                          margin: "0px",
                          padding: "0px",
                          fontWeight: "bold",
                        }}
                      >
                        Unlocked
                      </p>
                    </div>
                  </div>
                </HeaderStaking>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {dataKing.find((kingPeng) => kingPeng === nfts.name) ? (
                    <p
                      style={{
                        margin: "0px",
                        color: "#ffffff",
                        fontSize: "18px",
                      }}
                    >
                      Welcome to the platform your highness
                    </p>
                  ) : (
                    <p
                      style={{
                        margin: "0px",
                        color: "#ffffff",
                        fontSize: "18px",
                      }}
                    >
                      Congratulation, You have access to the platform
                    </p>
                  )}
                  {dataKing.find((kingPeng) => kingPeng === nfts.name)
                    ? null
                    : nfts.name != "" && (
                        <p
                          style={{
                            margin: "0px",
                            color: "#ffffff",
                            fontSize: "18px",
                          }}
                        >
                          Rank : {nfts.rank}
                        </p>
                      )}

                  {wallet.publicKey?.toString() ===
                    "HZTL2GEEuB3PF2K5zXjnKQeb8D2UwGrfzpW3kfNTiPTu" ||
                  wallet.publicKey?.toString() ===
                    "2g6gZQbyrZ3yc1LitsG1MMzerRjgYKKCPf4TNPCnVBwj" ||
                  wallet.publicKey?.toString() ===
                    "8B4HYMuXFUEC4mdzEcp8NwA3kKF9kvXCCY9U2AeUf3hx" ||
                  wallet.publicKey?.toString() ===
                    "8BUdj3HRCx4pwCLGmyokF8okY8imFqs49qeXEHbCpHJC"
                    ? null
                    : nfts.name != "" && (
                        <NFTCard>
                          <img
                            src={`https://pengsol.s3.us-east-2.amazonaws.com/Pengsol/assets/${nfts.name
                              .split(" ")[1]
                              .slice(1)}.png`}
                            alt="Picture of the author"
                            width={200}
                            height={200}
                          />
                        </NFTCard>
                      )}
                  <p
                    style={{
                      margin: "0px",
                      color: "#ffffff",
                      fontSize: "16px",
                    }}
                  >
                    {nfts.name}
                  </p>
                </div>
                <Link href="/platform">
                  <EnterPlatform>
                    <TextCustom
                      style={{ fontSize: "20px", fontWeight: "bold" }}
                    >
                      Enter the platform
                    </TextCustom>
                  </EnterPlatform>
                </Link>
              </>
            ) : (
              <>
                <div
                  style={{
                    height: "60px",
                    width: "100%",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src="/img/logoPengSol.png"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                {nfts.rank === 0 ? (
                  <p
                    style={{
                      margin: "0px",
                      color: "#ffffff",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    OOPS! It looks like you do not have any
                    <br /> PengSol NFT&apos;s in this Wallet!
                  </p>
                ) : (
                  <p
                    style={{
                      margin: "0px",
                      color: "#ffffff",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    OOPS! It looks like you do not have any Beta Enabled
                    <br /> PengSol NFT&apos;s in this Wallet!
                  </p>
                )}

                <p
                  style={{
                    margin: "4px 0px",
                    color: "#ffffff",
                    textAlign: "center",
                  }}
                >
                  Please disconnect and connect wallet containing your <br />{" "}
                  PengSol NFT&apos;s or purchase one using the link below.
                </p>

                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    padding: "30px 12px",
                    gap: "12px",
                  }}
                >
                  <button
                    style={{
                      backgroundColor: "#730484",
                      padding: "16px",
                      borderRadius: "16px",
                      border: "0px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Link href="https://magiceden.io/marketplace/pengsol">
                      <p style={{ margin: "0px", color: "#ffffff" }}>
                        Shop Now
                      </p>
                    </Link>
                  </button>
                  <WalletDisconnectButton />
                </div>
              </>
            )
          }
        </ListNFTContainer>
      </ConnectContainer>
    </ContainerAnimated>
  );
}
