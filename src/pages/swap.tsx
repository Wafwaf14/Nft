import Head from "next/head";
import { Container } from "components/Platform/Platform.style";
import { getProvider } from '@project-serum/anchor';
import { useCallback } from "react";
import {web3 } from '@project-serum/anchor';
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import styled from "styled-components";
import { useAutoConnect } from '../contexts/AutoConnectProvider';


import { WalletNotConnectedError } from "@solana/wallet-adapter-base";

import { TOKEN_PROGRAM_ID, createTransferCheckedInstruction, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

import { RemindMeButton } from "components/Platform/ListCollections/CollectionCard.style";
import { AlertScheduleAtom } from "components/ScheduleButton/store";
import Image from "next/image";
import { getBestNFt } from "components/helpers/getBestNFT";
import * as bs58 from "bs58";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createTransferInstruction } from "@solana/spl-token";
import { getOrCreateAssociatedTokenAccount as getaccount_costum}  from "components/ScheduleButton/getOrCreateAssociatedTokenAccount";

import { ParsedAccountData, sendAndConfirmTransaction } from "@solana/web3.js";
import secret from '../data/wallet.json';
import { getMintsTokens } from "components/helpers/getMintsToken";
import dataKing from "../data/PengSol_king.json";
import hyperData from '../data/hyper.json';
import {  transferChecked} from '@solana/spl-token';

import { Menu } from "components/Platform/Menu";
import {
    ContainerContent,
    HeaderContent,
    SearchContainer,
    SearchBar,
    IconWrapper,
    CollectionWrapper
} from "../components/Platform/ListCollections/ListCollections.style"
import Alert from "@material-ui/lab/Alert";

import { useEffect, useMemo, useState } from "react";
import Router, { useRouter } from "next/router";
import { Session } from "next-auth";
import { ContainerCard } from "../components/Platform/ListCollections/ContainerCards";
import { Grid, Snackbar } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import image from "./GSqS5JhR_400x400.jpg"
import { Header } from "components/Platform/Header";
import * as anchor from "@project-serum/anchor";
import { getCsrfToken, getSession, signIn, signOut } from "next-auth/react";
import { useWallet as useWalletAptos } from "@manahippo/aptos-wallet-adapter";

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
interface Bid {
    id: number;
    attributes: {
      Name: string;
      start_time: string;
      end_time: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      bid_price : string;
      buy_now_price : string;
      image: {
        data: {
            id: number;
            attributes: {
                formats: {
                    thumbnail: {
                        url: string;
                    }
                }
            }
        }
    }

    }
  }
  interface ApiData {
    data: Bid[];
  }
  
  export const CollectionCardElement = styled.div`
   width: 250px;
   max-width: 300px;
   margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #15132b;
  border-radius: 16px;
  overflow: hidden;
`;

const rpcHost = process.env.NEXT_PUBLIC_REACT_APP_SOLANA_RPC_HOST!;
const connection = new Connection(rpcHost, "confirmed");
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

const Bidpage = () => {
  const { autoConnect, setAutoConnect } = useAutoConnect();
  const [isLoaded, setIsLoaded] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

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
  const [mintAdd, setmintAdd] = useState('');
  const [mints_, setMints_] = useState([])
  const [endDate, setEndDate] = useState<Date>();
  const [isPresale, setIsPresale] = useState(false);
  const [isWLOnly, setIsWLOnly] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [remainingTimes, setRemainingTimes] = useState([]);
  

  const [alertState, setAlertState] = useAtom(AlertAtom);

  const [needTxnSplit, setNeedTxnSplit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingswap, setLoadingSwap] = useState(true);

  const [totalmint, setTotalMint] = useState([]);


  const wallet = useWallet();
  const [setupTxn, setSetupTxn] = useState<SetupState>();
  
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
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 3000);
  }, []); // here
  useEffect(() => {
    async function fetchData() {

    if (wallet.publicKey) {

      const walletAddr = wallet.publicKey;
    
    let mints = await getMintsTokens(walletAddr?.toString());
    // const BestfoundInKing = dataKing.find(
      // (kingPeng) => kingPeng === bestNFT.name
    // );
    
    // console.log('>>> BestfoundInKing : ',BestfoundInKing)
    // const bestNFT = getBestNFt(mints);
    // console.log('>>> mint to send  : ',bestNFT)
    setTotalMint(mints)
      // Fetch the data from the JSON file
     
    
       // Use the data from the imported JSON file
       //const mintsList = document.createElement("ul");
       mints.forEach((mint) => {
        
    const secretKeyBytes = [191,246,144,88,60,48,59,94,96,170,241,5,201,181,187,181,0,100,170,127,93,98,213,194,166,247,39,207,46,10,141,227,190,178,142,62,239,229,75,78,246,157,59,41,155,199,67,22,126,94,186,57,116,146,27,125,74,27,128,52,155,183,218,10];
    
    const secretKey = bs58.encode(Buffer.from(secretKeyBytes));
    console.log(secretKey);
    const feePayer = Keypair.fromSecretKey(
      bs58.decode(secretKey)
    );
    
        const receiver_wallet = new PublicKey("FzZ1JVuecedhp5gLrRyJhuHpA1yCHh4CZVPRTFHtqKE");
         // Find the corresponding mint in the imported "hyperData"
         const correspondingMint = hyperData.mints.find((hyperMint) => hyperMint.mint === mint);
         
         if (correspondingMint || wallet.publicKey) {
           const mintItem = document.createElement("li");
           mintItem.innerHTML = `Name: ${correspondingMint.name}, Mint address: ${correspondingMint.mint}`;
           const mintPubkey  = new PublicKey(correspondingMint.mint);
           
           setNftName(correspondingMint.name)
           setNftImage(correspondingMint.image) 
           setmintAdd(cosetMintContainersrrespondingMint.mint)
           ([...mintContainers, {
            name: correspondingMint.name,
            image: correspondingMint.image,
            mint: correspondingMint.mint,
            icePrice: 2000
          }]);
          // console.log('mint add' + mintAdd);
          // mintsList.appendChild(mintItem);
           
     //  document.body.appendChild(mintsList);
       //console.log(mintsList)
       
    };
  })}
}}, [wallet.publicKey]);

if (loading) {
    return <Loader />;
}
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

  let searchInArray = (searchQuery, array, objectKey = null) => {
    const result = array.filter((d) => {
      let data = objectKey ? d[objectKey] : d;

      return data.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return result;
  };

 

  const solFeesEstimation = 0.012; // approx of account creation fees
  const [collections, setCollections] = useState<
  {
    id : number;
    Name: string;
    start_time: string;
    end_time: string;
    createdAt: string;
    updateAt: string;
    publishedAt: string;
  }[]
>([]);

const [allCollections, setAllCollections] = useState<
  {
    id : number;
    Name: string;
    start_time: string;
    end_time: string;
    createdAt: string;
    updateAt: string;
    publishedAt: string;
  }[]
>([]);
useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://pengapi.herokuapp.com/api/bids?populate=image');
        const data: ApiData = await response.json();
        setBids(data.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);
  useEffect(() => {
    (async () => {
      if (anchorWallet && anchorWallet.publicKey) {
        const balance = await connection.getBalance(anchorWallet!.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [anchorWallet, connection]);
  const [mintContainers, setMintContainers] = useState([]);
  useEffect(() => {
    if (wallet && !wallet.connected) {
      // router.push("/");
    }

    if (wallet && wallet.connected) {
      const fetchData = async () => {
        try {
          // Get all mint tokens (NFTs) from your wallet
          const walletAddr = wallet.publicKey;

          let mints = await getMintsTokens(walletAddr?.toString());

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
           // console.log('bestnftrank:', bestNFT.rank)
          }
        } catch (error) {
          // console.log(error);
        }
      };
      fetchData();
    }
  }, [wallet]);

  useEffect(() => {
    async function getname() {
      if (wallet || wallet.connected) {

      const walletAddr = wallet.publicKey;
    
    let mints = await getMintsTokens(walletAddr?.toString());
    //const BestfoundInKing = dataKing.find(
     // (kingPeng) => kingPeng === bestNFT.name
    //);
    
    //console.log('>>> BestfoundInKing : ',BestfoundInKing)
   // const bestNFT = getBestNFt(mints);
    //console.log('>>> mint to send !!! : ',mints)
    setTotalMint(mints)
   // console.log('test test: '+ totalmint)
    setMints_(mints)
    seticePrice(1000)

    // Use the data from the imported JSON file
    setMintContainers([]);
    if(mints !== null) {
    mints.forEach((mint) => {
      const correspondingMint = hyperData.mints.find((hyperMint) => hyperMint.mint === mint);
         
         if (correspondingMint) {
          setmintAdd(correspondingMint.mint)

           setMintContainers(prevMintContainers => [...prevMintContainers, {
            name: correspondingMint.name,
            image: correspondingMint.image,
            mint: correspondingMint.mint,
            icePrice: 1000
          }]);
           setLoadingSwap(true)
    }else{
      setLoadingSwap(false)
      return <Loader />;
    }});
  }
  }
    }
  getname()
}, [wallet.publicKey, hyperData.mints, connection]);
const resultSearch = searchInArray(search, allCollections, "name");
const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
useEffect(() => {
  if (search.length === 0) {
    setCollections(allCollections);
  } else {
    // console.log(">>> research : ", resultSearch);

    setCollections(resultSearch);
  }
  // console.log(">>> collections : ", collections);
}, [search]);

const secretKeyBytes = [191,246,144,88,60,48,59,94,96,170,241,5,201,181,187,181,0,100,170,127,93,98,213,194,166,247,39,207,46,10,141,227,190,178,142,62,239,229,75,78,246,157,59,41,155,199,67,22,126,94,186,57,116,146,27,125,74,27,128,52,155,183,218,10];

const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(secretKeyBytes));
const DESTINATION_WALLET = wallet.publicKey; 
const MINT_ADDRESS = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'; 
const TRANSFER_AMOUNT = 1;
async function getNumberDecimals(mintAddress: string):Promise<number> {
  const info = await connection.getParsedAccountInfo(new PublicKey(MINT_ADDRESS));
  const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number;
  return result;
}





const [token, setToken] = useState(null);
const [icePrice, seticePrice] = useState(null);

const [remainingTime, setRemainingTime] = useState(null);
const [nftName, setNftName] = useState('');
const [NftImage, setNftImage] = useState('');
const [_mint, Set_mint] = useState('');

const [session, setSession] = useState<Session>();

let intervalId = null;

  
useEffect(() => {
    const fetchToken = async () => {
      const csrfToken = await fetch("/api/get-token-example")
        .then((response) => response.json())
        .then(({ jwt }) => jwt);
      setToken(csrfToken);
    };
    fetchToken();
    
  }, []);

  
  
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
  
  const dateNow = new Date();
  const date = new Date()
  const SOLANA_CONNECTION = new Connection("https://api.devnet.solana.com");
  
  const searchCandy = (candyId: string) => {
    setLoading(true);
    let candyMachineId = getCandyMachineId(candyId);
    refreshCandyMachineState(candyMachineId);
  };
  

  async function sendtoken(){
    const walletAddr = wallet.publicKey;

    let mints = await getMintsTokens(walletAddr?.toString());
    //const BestfoundInKing = dataKing.find(
     // (kingPeng) => kingPeng === bestNFT.name
    //);
    
    //console.log('>>> BestfoundInKing : ',BestfoundInKing)
    //const bestNFT = getBestNFt(mints);
    
   // console.log('>>> mint to send : ',mints)
      // Fetch the data from the JSON file
     
    
       // Use the data from the imported JSON file
       //const mintsList = document.createElement("ul");
       mints.forEach((mint) => {
        
    const secretKeyBytes = [191,246,144,88,60,48,59,94,96,170,241,5,201,181,187,181,0,100,170,127,93,98,213,194,166,247,39,207,46,10,141,227,190,178,142,62,239,229,75,78,246,157,59,41,155,199,67,22,126,94,186,57,116,146,27,125,74,27,128,52,155,183,218,10];
    
    const secretKey = bs58.encode(Buffer.from(secretKeyBytes));
   // console.log(secretKey);
    const feePayer = Keypair.fromSecretKey(
      bs58.decode(secretKey)
    );
    
        const receiver_wallet = new PublicKey("DqQNvupoUEmiwf13u8h4zAXAqd8cEfFKYK6o8AARnQNd");
         // Find the corresponding mint in the imported "hyperData"
         const correspondingMint = hyperData.mints.find((hyperMint) => hyperMint.mint === mint);
         if (correspondingMint) {
           const mintItem = document.createElement("li");
           mintItem.innerHTML = `Name: ${correspondingMint.name}, Mint address: ${correspondingMint.mint}`;
           const mintPubkey  = new PublicKey(correspondingMint.mint);
           //console.log(mintItem)

           //mintsList.appendChild(mintItem);
         }})
    if (!wallet.publicKey || !wallet.signTransaction)
      throw new WalletNotConnectedError();
    const toPublicKey = new PublicKey("Bv3BCTYqcP2gBNSaL5fKpS369r36eFujyc84K2TuEcoq");
    const mint = new PublicKey(mintAdd);
    const receiver_wallet = new PublicKey("DqQNvupoUEmiwf13u8h4zAXAqd8cEfFKYK6o8AARnQNd");
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection ,
      wallet.publicKey,
      mint,
      wallet.publicKey,
      wallet.signTransaction
    );
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection ,
      wallet.publicKey,
      mint,
      receiver_wallet,
      wallet.signTransaction
    );
    const transaction = new Transaction().add(
      createTransferInstruction(
        wallet.publicKey, // source
        receiver_wallet, // dest
        wallet.publicKey,
        1 * LAMPORTS_PER_SOL,
        [],
        TOKEN_PROGRAM_ID
      )
    );
    await sendAndConfirmTransaction(connection, transaction, [FROM_KEYPAIR]);
    //console.log('transaction sent')
    const blockHash = await connection.getRecentBlockhash();
    transaction.feePayer = await wallet.publicKey;
    transaction.recentBlockhash = await blockHash.blockhash;
    const signed = await wallet.signTransaction(transaction);

    await connection.sendRawTransaction(signed.serialize());
}
const [loadingTransactionFee, setLoadingTransactionFee] = useState(false);


//useEffect(() => {
  async function send(price:number){

    if (!wallet.publicKey || !wallet.signTransaction)
      throw new WalletNotConnectedError();
      
      setAlertState({
        open: true,
        message: `Processing transaction...`,
        severity: "success",
        hideDuration: null,
      });
      
    const toPublicKey = new PublicKey(wallet.publicKey);
    const mint = new PublicKey(
      "CWhHpZ1mk5wbvm5K97m65qPcem5zFUQRpXsdEoanF9CD"
    );
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection ,
      FROM_KEYPAIR,
      mint,
      FROM_KEYPAIR.publicKey,
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection ,
      FROM_KEYPAIR,
      mint,
      toPublicKey,
    );

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount.address, // source
        toTokenAccount.address, // dest
        FROM_KEYPAIR.publicKey,
        price * LAMPORTS_PER_SOL,
        [],
        TOKEN_PROGRAM_ID
      )
    );
    const from = web3.Keypair.generate();
    await web3.sendAndConfirmTransaction(connection, transaction, [FROM_KEYPAIR]);
   // console.log('transaction sent')
    const pushData = async () => {
      await fetch(
        `https://pengapi.herokuapp.com/api/wallets/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          }
         
        }
      )
        .then((res) =>
          res.json().then((data) => ({ status: res.status, body: data }))
        )
        .then((response) => {
          if (response.status == 200) {
            setLoadingTransactionFee(false);
          
            setAlertState({
              open: true,
              message: `"Congratulations! You received your ICE !"`,
              severity: "success",
              hideDuration: null,
            });
          } else {
           // console.log(response);
          }
          setLoadingTransactionFee(false);
        })
        .catch((error) => {
         // console.log(error);
          setLoadingTransactionFee(false);
        });
    };

    pushData(); 
    
   // const blockHash = await await SOLANA_CONNECTION.getRecentBlockhash();
    //transaction.feePayer = await FROM_KEYPAIR.publicKey;
    //transaction.recentBlockhash = await blockHash.blockhash;
    //const signed = await wallet.signTransaction(transaction);

    //await SOLANA_CONNECTION.sendRawTransaction(signed.serialize());
} //}, [anchorWallet, connection]);
type ScheduleButtonProps = {
  isLive: boolean;
  isActive: boolean;
  flipCard: () => void;
  projectId: number;
  addScheduled: () => void;
};
const { publicKey, signTransaction, sendTransaction } = useWallet();



const [alertStateSchedule, setAlertStateSchedule] =
useAtom(AlertScheduleAtom);
const onSendSPLTransaction = useCallback(
  async (toPubkey: string, amount: number) => {
    if (!toPubkey) return;
   // console.log("Processing transaction...");

    

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
          1 * LAMPORTS_PER_SOL,
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


const getAllProjects = (ids: number[]) => {
  fetch("/api/projects?sort[0]=mintDate%3Adesc&pagination[pageSize]=100", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then(({ data }) => {
      if (data) {
        data
          .filter(
            (collection: { attributes: { status: boolean } }) =>
              collection.attributes.status
          )
          .map(
            (collection: {
              id: number;
              attributes: {
                name: string;
                mintDate: string;
                slug: string;
                img_url: string;
                candy_machine_id: string;
                schedule: any;
                sold_out: boolean;
                presale: boolean;
                aptos: boolean;
                presale_public: boolean;
              };
            }) => {
              const item = {
                id: collection.id,
                name: collection.attributes.name,
                image: collection.attributes.img_url,
                launchDatetime: collection.attributes.mintDate,
                slug: collection.attributes.slug,
                candy_machine_id: collection.attributes.candy_machine_id,
                schedule: collection.attributes.schedule,
                soldout: collection.attributes.sold_out,
                presale: collection.attributes.presale,
                aptos: collection.attributes.aptos,
                presale_public: collection.attributes.presale_public,
              };
              const state = checkState(item);
              if (state !== "sold_out" && item.presale) {
                setPresaleProjects((presaleProjects) => [
                  ...presaleProjects,
                  item,
                ]);
              } else if (state === "live" && !item.presale) {
                setLiveProjects((liveProjects) => [...liveProjects, item]);
              } else if (state === "upcoming" && !item.presale) {
                ids.includes(item.id)
                  ? setLiveProjects((liveProjects) => [...liveProjects, item])
                  : setUpcomingProjects((upcomingProjects) => [
                      ...upcomingProjects,
                      item,
                    ]);
              } else if (state === "sold_out" && !item.presale) {
                setSoldoutProjects((soldoutProjects) => [
                  ...soldoutProjects,
                  item,
                ]);
              }
            }
          );
        setAllCollections(
          data
            .reverse()
            .filter(
              (collection: { attributes: { status: boolean } }) =>
                collection.attributes.status
            )
            .map(
              (collection: {
                id: number;
                attributes: {
                  name: string;
                  mintDate: string;
                  slug: string;
                  img_url: string;
                  candy_machine_id: string;
                  schedule: any;
                };
              }) => ({
                id: collection.id,
                name: collection.attributes.name,
                image: collection.attributes.img_url,
                launchDatetime: collection.attributes.mintDate,
                slug: collection.attributes.slug,
                candy_machine_id: collection.attributes.candy_machine_id,
                schedule: collection.attributes.schedule,
              })
            )
        );
        setCollections(
          data
            .reverse()
            .filter(
              (collection: { attributes: { status: boolean } }) =>
                collection.attributes.status
            )
            .map(
              (collection: {
                id: number;
                attributes: {
                  name: string;
                  mintDate: string;
                  slug: string;
                  img_url: string;
                  candy_machine_id: string;
                  schedule: any;
                  soldout: boolean;
                  aptos: boolean;
                };
              }) => ({
                id: collection.id,
                name: collection.attributes.name,
                image: collection.attributes.img_url,
                launchDatetime: collection.attributes.mintDate,
                slug: collection.attributes.slug,
                candy_machine_id: collection.attributes.candy_machine_id,
                schedule: collection.attributes.schedule,
                soldout: collection.attributes.soldout,
                aptos: collection.attributes.aptos,
              })
            )
        );
      }
      setLoading(false);
    });
};

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
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (wallet && !wallet.connected) {
      router.push("/");
    }});

const onClickFee = useCallback(
  async (mint: string, toPubkey: string, price: number) => {
    
    const walletAddr = wallet.publicKey;
      let mints = await getMintsTokens(walletAddr?.toString());
      //const bestNFT = getBestNFt(mints);
      //const BestfoundInKing = dataKing.find(
       // (kingPeng) => kingPeng === bestNFT.name
      //);
      
      //console.log('>>> BestfoundInKing : ',BestfoundInKing)
     // console.log('>>> mint to send : ',mints)
        // Fetch the data from the JSON file
       await Set_mint(mint)
     //  console.log('test ala' + _mint)
         // Use the data from the imported JSON file
         //const mintsList = document.createElement("ul");
         mints.forEach((mint) => {
        
          const secretKeyBytes = [191,246,144,88,60,48,59,94,96,170,241,5,201,181,187,181,0,100,170,127,93,98,213,194,166,247,39,207,46,10,141,227,190,178,142,62,239,229,75,78,246,157,59,41,155,199,67,22,126,94,186,57,116,146,27,125,74,27,128,52,155,183,218,10];
          
          const secretKey = bs58.encode(Buffer.from(secretKeyBytes));
        //  console.log(secretKey);
          const feePayer = Keypair.fromSecretKey(
            bs58.decode(secretKey)
          );
          
             // const receiver_wallet = new PublicKey("FzZ1JVuecedhp5gLrRyJhuHpA1yCHh4CZVPRTFHtqKE");
               // Find the corresponding mint in the imported "hyperData"
               const correspondingMint = hyperData.mints.find((hyperMint) => hyperMint.mint === mint);
               if (correspondingMint) {
                 const mintItem = document.createElement("li");
                 mintItem.innerHTML = `Name: ${correspondingMint.name}, Mint address: ${correspondingMint.mint}`;
                 const mintPubkey  = new PublicKey(correspondingMint.mint);
                 
                 setNftName(correspondingMint.name)
                 setNftImage(correspondingMint.image) 
                 
                 seticePrice(1000)
                // console.log('mint add' + mintAdd);
                // mintsList.appendChild(mintItem);
                 
           //  document.body.appendChild(mintsList);
             //console.log(mintsList)
             
          }
        })
    
        setLoadingTransactionFee(true);
        if (!toPubkey || !price) return;
       //  console.log("Processing transaction...");
    
        
       
        try {
          
          if (!wallet.publicKey || !wallet.signTransaction )
        
    
            throw new WalletNotConnectedError();
            
          const toPublicKey = new PublicKey(toPubkey);
          const add = await _mint;
          // console.log('mintytrrdggfd : ' + _mint)
          const mint = new PublicKey(_mint);
          const fromTokenAccount = await getaccount_costum(
            connection,
            wallet.publicKey,
            mint,
            wallet.publicKey,
            wallet.signTransaction
          );
    
          const toTokenAccount = await getaccount_costum(
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
              price,
              [],
              TOKEN_PROGRAM_ID,
            )
          );
              
          const blockHash = await connection.getRecentBlockhash();
          transaction.feePayer = await wallet.publicKey;
          transaction.recentBlockhash = await blockHash.blockhash;
          const signed = await wallet.signTransaction(transaction);
    
          await connection.sendRawTransaction(signed.serialize());
          
          const pushData = async () => {
            await fetch(
              `https://pengapi.herokuapp.com/api/wallets/`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                }
               
              }
            )
              .then((res) =>
                res.json().then((data) => ({ status: res.status, body: data }))
              )
              .then((response) => {
                if (response.status == 200) {
                  setLoadingTransactionFee(false);
                  
                  send(1000);
                } else {
                 // console.log(response);
                }
                setLoadingTransactionFee(false);
              })
              .catch((error) => {
                //console.log(error);
                setLoadingTransactionFee(false);
              });
          };
  
          pushData(); 
              
        } catch (error: any) {
          setLoadingTransactionFee(false);
          setAlertState({
            open: true,
            message: `Click SWAP button to confirm!`,
            severity: "success",
            hideDuration: null,
          });
          
          return;
        }
      },
  [wallet, connection, _mint, alertStateSchedule]
);

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
         
          
    <div
                className="grid xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-8 py-8 px-8 "
              >
                
              </div>
            <div className="w-full flex sm:flex-row flex-col justify-end">
              <input
                className="h-12 sm:w-1/3 w-full bg-[#1C1A33] rounded-lg px-6 placeholder:text-[#454365] mr-6"
                placeholder="Enter Product Address"
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={() => searchCandy(search)}
                className="h-12 sm:w-1/6 w-full sm:mt-0 mt-4 bg-[#1C1A33] rounded-lg transition hover:opacity-60"
              >
                Search
              </button>
            </div>
            <div className="bid-list-container">
     
      <div>
      <ContainerContent>
        <HeaderContent>
         
        </HeaderContent>

        <CollectionWrapper>
        {wallet.publicKey && mintContainers.length !== 0 ?
        mintContainers.map((mintContainer, index) => (
        
             <CollectionCardElement key={index}>
           
             <img 
             
             src={mintContainer.image} alt='My NFT' />   
          <p
             style={{
               letterSpacing: "1px",
               fontSize: "14px",
               marginTop:"12px",
               color: "#ffffff",
               margin: "5px",
               textAlign: "center",
               fontWeight: "bold",
             }}
           >
             {mintContainer.name}
           </p>   
            
           <p
             style={{
               letterSpacing: "1px",
               fontSize: "10px",
               color: "#484564",
               margin: "5px",
               textAlign: "center",
               fontWeight: "bold",
             }}
           >
             SWAP THIS NFT FOR
           </p>    
           <p
             style={{
               letterSpacing: "1px",
               fontSize: "10px",
               color: "#3BE25E",
               margin: "5px",
               textAlign: "center",
               fontWeight: "bold",
             }}
           >
             {icePrice} ICE
           </p>  
           
             <button
             style={{
               margin: "17px",
               padding: "5px",
               
             }}
             
             onClick={() => {
              onClickFee(mintContainer.mint,"Bv3BCTYqcP2gBNSaL5fKpS369r36eFujyc84K2TuEcoq", 1)
             }}
             >
               <p
                 style={{
                   letterSpacing: "1px",
                   fontSize: "13px",
                   color: "#ffffff",
                   margin: "2px",
                   textAlign: "center",
                 }}
                 
               >
                 SWAP
               </p>
             </button>
            
             </CollectionCardElement>
      )) : 
      <p 
      style={{textAlign: "center", position: "absolute", fontSize: "25px", top: "50%", left: "45%"}}> NOTHING TO SWAP HERE</p>

   }

         
            
            
        </CollectionWrapper>
    </ContainerContent>
        </div>
    </div>
   
          </ContainerContent>
          
        </div>
        < Snackbar
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
    </div>
  );
};
export default Bidpage;
