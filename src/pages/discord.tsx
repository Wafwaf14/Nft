import Head from "next/head";
import { Container } from "components/Platform/Platform.style";
import { getProvider } from '@project-serum/anchor';
import { useCallback, useContext } from "react";
import { HashConnect } from 'hashconnect';

import {web3 } from '@project-serum/anchor';
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import styled from "styled-components";
import { useAutoConnect } from '../contexts/AutoConnectProvider';
import { TextField } from '@material-ui/core';
import { AuthContext } from "contexts/AuthContext";
import { Client, Ed25519PublicKey } from '@hashgraph/sdk';
import {
  
  getMintsTokensBalance,
} from "components/helpers/getMintsToken";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { makeStyles } from '@material-ui/core/styles';

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { RemindMeButton } from "components/Platform/ListCollections/CollectionCard.style";
import { AlertScheduleAtom } from "components/ScheduleButton/store";
import Image from "next/image";
import { getBestNFt } from "components/helpers/getBestNFT";
import * as bs58 from "bs58";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createTransferInstruction } from "@solana/spl-token";
import { getOrCreateAssociatedTokenAccount }  from "components/ScheduleButton/getOrCreateAssociatedTokenAccount";

import { ParsedAccountData, sendAndConfirmTransaction, TransactionSignature } from "@solana/web3.js";
import secret from '../data/wallet.json';
import { getMintsTokens } from "components/helpers/getMintsToken";
import dataKing from "../data/PengSol_king.json";
import hyperData from '../data/hyper.json';
import image from '../data/hedera.jpg';

import {  transferChecked} from '@solana/spl-token';

import { Menu } from "components/Platform/Menu";
import {
    ContainerContent,
    HeaderContent,
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
//import image from "./GSqS5JhR_400x400.jpg"
import { Header } from "components/Platform/Header";
import * as anchor from "@project-serum/anchor";
import { getCsrfToken, getSession, signIn, signOut } from "next-auth/react";
import { useWallet as useWalletAptos } from "@manahippo/aptos-wallet-adapter";

import { useAtom } from "jotai";
import { AlertAtom } from "components/MintButton/store";
import { PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar } from "@hashgraph/sdk";
import dotenv from "dotenv";


import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  createAccountsForMint,
  getCandyMachineState,
  getCollectionPDA,
  mintOneToken,
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
   width: 500px;
   max-width: 400px;
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
 const SearchContainer = styled.div`
  padding: 12px 20px;
  border: 0px;
  color: #ffffff;
  background-color: #15132b;
  height: 45px;
  width: 300px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;
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
  const [nftRank, setNftRank] = useState(null)

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
  const [accountId, setAccountId] = useState(null);

  
    const connectToHedera = async () => {
      
      const operatorPrivateKey = process.env.OPERATOR_KEY;
      const operatorAccount = process.env.OPERATOR_ID;
  
      if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error('Environment variables OPERATOR_KEY and OPERATOR_ID must be present');
      }
  
      const client = Client.forTestnet();
      client.setOperator(operatorAccount, operatorPrivateKey);
  
      const id = await client.getAccountId();
  
      setAccountId(id);
    };
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
  

  const useStyles = makeStyles((theme) => ({
    placeholder: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'white',
      textAlign: 'center',
      pointerEvents: 'none',
      transition: '0.2s ease all',
      '&.active': {
        transform: 'translate(-50%, -20%)',
      },
    },
  }));
  
  useEffect(() => {
    async function fetchData() {

    if (wallet
      .publicKey) {

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
const [totalMinted, setTotalMinted] = useState(1);

if (loading) {
    return <Loader />;
}
const getTotalMinted = () => {
  fetch(
    `https://pengapi.herokuapp.com/api/presale-txns?[filters][address][$eq]=${wallet.publicKey?.toString()}&[filters][presale][id]=9`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      let total = totalMinted;
      res.data?.map((item: any) => {
        total = total + item?.attributes?.total;
      });
      setTotalMinted(total);
      console.log('total minted : ', total)
    });
    
};
useEffect(() => {
  if (wallet.connected) {
    getTotalMinted();
    console.log('total :', totalMinted)
  }
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
          console.log('bestnftrank:', bestNFT.rank)
          setNftRank(bestNFT.rank)
          console.log('bestnftrankdddd:', nftRank)

          
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
            console.log('bestnftrank:', bestNFT.rank)
          }
          
        } catch (error) {
          // console.log(error);
        }
      };
      fetchData();
    }
  }, [wallet, nftRank]);

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
const [icePrice, setIcePrice] = useState(1000);

const [remainingTime, setRemainingTime] = useState(null);
const [nftName, setNftName] = useState('');
const [NftImage, setNftImage] = useState('');
const [_mint, Set_mint] = useState('');
const [bestNFT, setbestNFT] = useState(null);

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

  const handleAdd = () => {
    console.log('test : best : ',bestNFT)
    if(nftRank< 158){
    
      if (icePrice + 500 <= 5000 && totalMinted < 50) {
  
        setIcePrice(icePrice + 500);
        setTotalMinted(totalMinted +1 )
      }
    } else {
    if (icePrice + 1000 <= 10000 && totalMinted < 50) {
  
      setIcePrice(icePrice + 1000);
      setTotalMinted(totalMinted +1 )
    }
  }
  }
  
  
  const handleSub = () => {


    if(nftRank< 158){
      if (icePrice - 500 >= 500) {
  
        setIcePrice(icePrice - 500);
        setTotalMinted(totalMinted -1 )
      }
    } else {
    if (icePrice - 1000 >= 1000) {
      setIcePrice(icePrice - 1000);
      setTotalMinted(totalMinted -1 )

    }
  }
  }
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
    
       // const receiver_wallet = new PublicKey("DqQNvupoUEmiwf13u8h4zAXAqd8cEfFKYK6o8AARnQNd");
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


const classes = useStyles();

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
      // router.push("/");
      }
      setSession(session);
    };
    fetchSession();
  }, []);
  const [info, setInfo] = useState('');
function ProjectMintBlock({
  id,
  price,
  name,
  mintDate,
  description,
  projectImage,
  doxxed,
  candyMachineId,
  aptos,
  isPresale,
  isPublic,
}) {
  const { hasNft } = useContext(AuthContext);




  const date = new Date(mintDate);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [isScheduled, setIsScheduled] = useState(false);



 

  const day = date.getUTCDate();
  const month = monthNames[date.getUTCMonth()];

  const year = date.getUTCFullYear();

  const hours = date.getUTCHours();

  const minutes = date.getUTCMinutes();

  const dateNow = new Date();

  const compareDates = dateNow > date;
  const ctaMint = !mintDate ? "Schedule" : compareDates ? "Mint Now" : "Mint";
  const backgroundButtonMint = !mintDate
    ? "#730484"
    : compareDates
    ? "#008822"
    : "#730484";

  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = date.getTime() - now;

  // Time calculations for days, hours, minutes and seconds

  var countDowndays = Math.floor(distance / (1000 * 60 * 60 * 24));
  var countDownhours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  var countDownminutes = Math.floor(
    (distance % (1000 * 60 * 60)) / (1000 * 60)
  );
  const [priceCandy, setPriceCandy] = useState(price);

  var countDownseconds = Math.floor((distance % (1000 * 60)) / 1000);

  const mintStatus = !mintDate
    ? "Mint TBA"
    : compareDates
    ? `Mint Live ${priceCandy} SOL`
    : `Live in ${countDowndays}d ${countDownhours}h ${countDownminutes}m`;
  const mintStatusColor = !mintDate
    ? "#ffffff"
    : compareDates
    ? "#008822"
    : "#ffffff";

  const [clicked, setClicked] = useState(false);

  const wallet = useWallet();

  const walletAptos = useWalletAptos();

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

  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const refreshCandyMachineState = async (
    commitment: Commitment = "confirmed"
  ) => {
    if (!anchorWallet) {
      return;
    }

    const connection = new Connection(rpcHost, commitment);

    if (candyMachineId) {
      await getCandyMachineState(anchorWallet, candyMachineId, connection)
        .then((cndy) => {
          setCandyMachine(cndy);
          setItemsAvailable(cndy.state.itemsAvailable);
          setItemsRemaining(cndy.state.itemsRemaining);
          setItemsRedeemed(cndy.state.itemsRedeemed);

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
            setIsEnded(true);
          }

          if (cndy.state.price) {
            setPriceCandy(cndy.state.price.toNumber() / 1_000_000_000);
            // console.log("price", cndy.state.price.toNumber() / 1_000_000_000);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  useEffect(() => {
    if (!candyMachine && candyMachineId) {
      refreshCandyMachineState();
    }
  }, [
    anchorWallet,
    candyMachineId,
    connection,
    isEnded,
    refreshCandyMachineState,
    candyMachine,
  ]);

  const [ref01W, setref01W] = useState(500);
  const ref01 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setref01W(ref01.current?.clientWidth);
    });

    return window.removeEventListener("resize", () => {});
  }, []);

  const [alertStateSchedule, setAlertStateSchedule] =
    useAtom(AlertScheduleAtom);

  const conn = useConnection();

  const [loadingTransaction, setLoadingTransaction] = useState(false);
  const [loadingTransactionFee, setLoadingTransactionFee] = useState(false);

  const [selected, setSelected] = useState(null);

  const [presale, setPresale] = useState(null);
  const [roles, setRoles] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);


 

  

  

  
 

  const [publicRole, setPublicRole] = useState(null);
  const { setHasNft, setAptosWallet } = useContext(AuthContext);

  const [hasNFT, setHasNFT] = useState(false);
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
          setbestNFT(bestNFT.rank);
          setNftRank(bestNFT.rank) 
          console.log("best nft >>>> :",nftRank);
          
          console.log("best nft ddddddd :", nftRank);

         // checkAptos();
        } catch (error) {
          // console.log(error);
        }
      };
      fetchData();
    }
  }, [wallet, setNfts, nftRank]);
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
            BestfoundInKing &&
            bestNFT.rank === 0 
          ) {
            //  router.push("/");
          }
        } catch (error) {
          // console.log(error);
        }
      };
      fetchData();
    }
  }, [wallet]);

  const addCount = (id: number) => {
    const newProject = roles.map((item) => {
      if (item.id == id && item.count < item.max - totalMinted) {
        return {
          ...item,
          count: item.count + 1,
        };
      }
      return item;
    });
    setRoles(newProject);
  };

  const minusCount = (id: number) => {
    const newProject = roles.map((item) => {
      if (item.id == id && item.count > 1) {
        return {
          ...item,
          count: item.count - 1,
        };
      }
      return item;
    });
    setRoles(newProject);
  };
  useEffect(() => {
    if(nftRank <158  ){
      setIcePrice(500);
    } else {
      setIcePrice(1000);
    }
      
    }, [wallet, nftRank]);
  return (
    // <div className="w-[500px] bg-[#16162a] rounded-2xl p-4 flex flex-col gap-6">
    <div className="bg-[#16162a] rounded-xl col-span-12 lg:col-span-6 flex flex-col gap-0 h-fit ">
      <div className="w-full p-6 pb-8">
        <div
          className={`w-full flex ${
            ref01W > 360 ? "flex-row items-center" : "flex-col items-center"
          } justify-between mb-4`}
        >
          <div className="flex flex-col gap-2 sm:mb-0 mb-3">
            <p className="text-2xl font-bold text-white ">{name}</p>
          </div>

          <div className="bg-[#2D2D3F] flex gap-1 p-1 justify-center items-center rounded-lg h-fit]">
            <p className="tracking-widest text-sm text-[#fff] text-start px-2 py-1  ">
              No WL status available
            </p>
          </div>
        </div>
        <div
          ref={ref01}
          className={`flex ${
            ref01W > 460 ? "flex-row " : "flex-col"
          } xs:flex-col gap-3`}
        >
          <div
            className={`${
              ref01W < 460 ? "mx-auto mt-3" : ""
            }  h-40 w-40 min-w-[160px] min-h-[160px] relative rounded-xl overflow-hidden ${
              selected ? "" : "my-auto"
            } ${projectImage ? "bg-transparent" : "bg-white"}`}
          >
           
          </div>

          <div className="flex flex-col w-full justify-between h-50 gap-2 ml-2">
            <div className="w-full flex place-content-between">
              <div className="w-full">
                <div className="flex flex-col gap-2 pt-2 mb-1 w-full">
                  {/* <div className="flex flex-row justify-between w-full">
                    <p
                      className={`m-0 mr-3 text-xl text-[${mintStatusColor}] `}
                    >
                      <span className="text-4xl text-white">
                        <Countdown date={new Date(mintDate)} />
                      </span>
                    </p>
                  </div> */}
                  {mintDate ? (
                    <>
                      <div className="flex gap-[6px]">
                        <div className="flex items-center w-full">
                          <div>
                            <div className="relative h-[6px] w-4">
                              
                            </div>
                            <div className="relative h-3 w-4">
                              
                            </div>
                          </div>
                          <p className="m-0 ml-3 text-white text-sm ">
                            {month} {day}th, {year}
                          </p>
                        </div>
                        <div
                          className="flex justify-end align-center ml-2 w-full"
                          style={{
                            border: doxxed ? " #20e3b2" : " #f04f53",
                            borderRadius: "6px",
                          }}
                        >
                          <span
                            className={`text-white text-sm ${
                              doxxed ? "bg-green-600" : "bg-[#d0312d]"
                            } px-3 py-1 rounded-md`}
                            style={{
                              color: "#ffffff",
                            }}
                          >
                            {doxxed ? "Doxxed" : "Not Doxxed"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-[6px] items-center justify-between">
                        <div className="flex">
                          <div className="relative h-4 w-4">
                           
                          </div>
                          <p className="m-0 ml-3 text-white text-sm">
                            {hours} : {minutes < 10 ? minutes + "0 " : minutes}
                            {"  "}( UTC )
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="m-0 text-[#a5a599] text-xs font-bold">TBA</p>
                  )}
                </div>
              </div>
            </div>
            {!isPresale ? (
              <>
                {itemsAvailable !== 0 ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <p className="m-0 text-green-400 text-sm ">
                        Total minted
                      </p>
                      <p className="m-0 text-green-400 text-sm ">
                        {((itemsRedeemed / itemsAvailable) * 100).toFixed(2)}% (
                        {itemsRedeemed}/{itemsAvailable})
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        backgroundColor: "#252538",
                        overflow: "hidden",
                        borderRadius: "4px",
                        height: "24px",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "rgb(56, 226, 93)",
                          width: `${(itemsRedeemed / itemsAvailable) * 100}%`,
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>
                ) : null}
                <div className="flex justify-between items-center gap-3 flex-col sm:flex-row">
                  {isEnded ? (
                    <ComponentSoldOut
                      style={{
                        color: "#fff",
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        padding: "4px",
                      }}
                    >
                      Sold Out
                    </ComponentSoldOut>
                  ) : (
                    <>
                      {new Date(mintDate).getTime() -
                        (isScheduled ? 1000 * 60 * 30 : 0) -
                        new Date().getTime() >
                      0 ? (
                        <div className="flex w-full text-lg text-white px-1 rounded-md">
                          <Countdown
                            date={
                              new Date(mintDate).getTime() -
                              (isScheduled ? 1000 * 60 * 30 : 0)
                            }
                            renderer={({ days, hours, minutes, seconds }) => (
                              <div className="flex flex-row items-baseline">
                                <div className="text-3xl py-2 px-1 w-10 rounded-md text-white  mr-1 flex flex-col items-center justify-center">
                                  <p>{zeroPad(days)}</p>
                                  <p className="text-xs text-gray-400">days</p>
                                </div>
                                :
                                <div className="text-3xl py-2 px-1 w-10 rounded-md text-white  mx-1 flex flex-col items-center justify-center">
                                  <p>{zeroPad(hours)}</p>
                                  <p className="text-xs text-gray-400">hours</p>
                                </div>
                                :
                                <div className="text-3xl py-2 px-1 w-10 rounded-md text-white  mx-1 flex flex-col items-center justify-center">
                                  <p>{zeroPad(minutes)}</p>
                                  <p className="text-xs text-gray-400">min</p>
                                </div>
                                :
                                <div className="text-3xl py-2 px-1 w-10 rounded-md text-white  ml-1 flex flex-col items-center justify-center">
                                  <p>{zeroPad(seconds)}</p>
                                  <p className="text-xs text-gray-400">sec</p>
                                </div>
                              </div>
                            )}
                          />
                        </div>
                      ) : (
                        <MintButton
                          backgroundButtonMint={backgroundButtonMint}
                          candyMachineID={candyMachineId}
                        />
                      )}

                      <CrossmintPayButton
                        collectionTitle={name}
                        collectionDescription={description}
                        collectionPhoto={projectImage}
                        clientId="7e94eb71-06c0-447f-9272-677416fee1d5"
                        style={{
                          width: "100%",
                          fontSize: "12px",
                          padding: "10px",
                        }}
                      />
                    </>
                  )}
                </div>
              </>
            ) : isPublic && publicRole ? (
              <div>
                <div
                  onClick={() => {
                    new Date().getTime() - publicRole.start.getTime() > 0 &&
                      setSelected(
                        publicRole.id == selected ? null : publicRole.id
                      );
                  }}
                  className={`w-full mt-4 flex flex-col gap-3 ${
                    selected == publicRole.id
                      ? "border border-white bg-[#242337]"
                      : ""
                  } transition bg-[#151429] hover:bg-[#242337] hover:cursor-pointer px-6 py-4 rounded-lg shadow-md`}
                >
                  <div className="w-full text-sm flex flex-row justify-between text-gray-300">
                    <p className="">{publicRole.start.toDateString()}</p>
                    <p className="">{publicRole.status && "Complete"}</p>
                  </div>
                  <div className="w-full flex flex-row justify-between text-white text-xl">
                    <p className="">{publicRole.role}</p>
                    <p className="">
                      {publicRole.price} {aptos == "true" ? " aptos" : "SOL"}
                    </p>
                  </div>
                  <div className="w-full flex sm:flex-row flex-col text-sm justify-between sm:items-center items-start text-gray-300 mb-1">
                    {new Date().getTime() - publicRole.start.getTime() > 0 ? (
                      totalMinted == publicRole.max && (
                        <p className="">Finished !</p>
                      )
                    ) : (
                      <Countdown
                        date={publicRole.start}
                        renderer={({ days, hours, minutes, seconds }) => (
                          <div className="flex flex-row ">
                            <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mr-1 flex flex-col items-center justify-center bg-[#454463]">
                              <p>{zeroPad(days)}</p>
                              <p className="text-xs text-gray-300">days</p>
                            </div>

                            <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mx-1 flex flex-col items-center justify-center bg-[#454463]">
                              <p>{zeroPad(hours)}</p>
                              <p className="text-xs text-gray-300">hrs</p>
                            </div>

                            <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mx-1 flex flex-col items-center justify-center bg-[#454463]">
                              <p>{zeroPad(minutes)}</p>
                              <p className="text-xs text-gray-300">mins</p>
                            </div>

                            <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  ml-1 flex flex-col items-center justify-center bg-[#454463]">
                              <p>{zeroPad(seconds)}</p>
                              <p className="text-xs text-gray-300">secs</p>
                            </div>
                          </div>
                        )}
                      />
                    )}
                    {new Date().getTime() - publicRole.start.getTime() > 0 && (
                      <p className="sm:mt-0 mt-4">
                        {/* {Math.ceil((totalMinted / publicRole.max) * 100)} %
                        minted */}
                      </p>
                    )}
                  </div>
                </div>
                {selected == publicRole.id && (
                  <div
                    className={`w-full mt-4 flex flex-col gap-3 transition bg-[#151429] px-6 py-5 rounded-lg shadow-md`}
                  >
                    {/* <div className="w-full text-sm flex flex-row justify-between text-green-500">
                      <p className="">Total Minted</p>
                      <p className="">{`( ${totalMinted} / ${publicRole.max} )`}</p>
                    </div>
                    <div className="w-full h-8 flex  text-white bg-[#242337] rounded-md relative">
                      <div
                        style={{
                          width: `${Math.ceil(
                            (totalMinted / publicRole.max) * 100
                          )}%`,
                        }}
                        className=" h-full bg-gradient-to-r from-[#228C28] to-[#299617] rounded-md"
                      ></div>
                      <h2 className="text-white text-sm absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2">
                        {Math.ceil((totalMinted / publicRole.max) * 100)} %
                      </h2>
                    </div> */}
                    {/* <div className="w-full flex sm:flex-row flex-col-reverse text-white gap-4 mt-2">
                      <div className="h-full border border-[#04246D] rounded-md flex flex-col">
                        <button
                          onClick={() => {
                            console.log("test >>>>")
                            console.log("publicRole.count")
                           
                            if (
                              publicRole.count <
                              publicRole.max - totalMinted
                            ) {
                              setPublicRole({
                                ...publicRole,
                                count: publicRole.count + 1,
                              });
                            }
                          }}
                          className="text-2xl hover:bg-[#242337] rounded-full h-8 w-8 flex justify-center items-center py-2"
                        >
                          <p>+</p>
                        </button>
                        <h2 className="text-center">{publicRole.count}</h2>
                        <button
                          onClick={() => {
                            if (publicRole.count > 1) {
                              console.log("test >>>>1")
                              console.log("publicRole.count")
                              setPublicRole({
                                ...publicRole,
                                count: publicRole.count - 1,
                              });
                            }
                          }}
                          className="text-2xl hover:bg-[#242337] rounded-full h-8 w-8 flex justify-center items-center py-2"
                        >
                          <p>-</p>
                        </button>
                      </div>
                      <div className="flex flex-col w-full">
                        <button
                          onClick={() => {
                            console.log("test3 >>>>")
                            console.log("publicRole.count")
                            if (
                              
                              publicRole.count + totalMinted <=
                              publicRole.max
                            ) {
                              console.log("test4 >>>>")
                              console.log("publicRole.count")
                              mint(publicRole.price, publicRole.count);
                            }
                          }}
                          disabled={loadingTransaction}
                          className={`sm:w-full w-full h-12 mb-3 ${
                            loadingTransaction
                              ? "opacity-50"
                              : "hover:opacity-90"
                          } bg-gradient-to-r from-[#04246D] to-[#052F91] rounded-md flex justify-center items-center `}
                        >
                          {loadingTransaction ? (
                            <h2 className="text-white font-bold">LOADING</h2>
                          ) : (
                            <h2 className="text-white font-bold">MINT</h2>
                          )}
                        </button>
                        {false && (
                          <button
                            onClick={() => {
                              removeFee(publicRole.price, publicRole.count);
                            }}
                            disabled={loadingTransactionFee}
                            className={`sm:w-full w-full h-12 ${
                              loadingTransactionFee
                                ? "opacity-50"
                                : "hover:opacity-70"
                            } shadow-sm bg-gradient-to-r from-[#111116] to-[#19191E] rounded-md flex justify-evenly items-center text-sm`}
                          >
                            <div className="relative w-1/4 h-3/6 aspect-square flex items-start overflow-hidden">
                              <Image
                                src={"/img/logoPengSol.png"}
                                layout="fill"
                                objectFit="contain"
                              />
                            </div>
                            {loadingTransactionFee ? (
                              <h2 className="text-white">LOADING</h2>
                            ) : (
                              <h2 className="text-white">Remove Fees</h2>
                            )}
                          </button>
                        )}
                      </div>
                    </div> */}
                  </div>
                )}
              </div>
            ) : (
              roles &&
              roles.map(
                (item: {
                  id: number;
                  role: string;
                  price: number;
                  start: Date;
                  max: number;
                  status: boolean;
                  count: number;
                }) => {
                  return (
                    item.status &&
                    item.role && (
                      <div key={item.id}>
                        <div
                          onClick={() => {
                            new Date().getTime() - item.start.getTime() > 0 &&
                              setSelected(item.id == selected ? null : item.id);
                          }}
                          className={`w-full mt-4 flex flex-col gap-3 ${
                            selected == item.id
                              ? "border border-white bg-[#242337]"
                              : ""
                          } transition bg-[#151429] hover:bg-[#242337] hover:cursor-pointer px-6 py-4 rounded-lg shadow-md`}
                        >
                          <div className="w-full text-sm flex flex-row justify-between text-gray-300">
                            <p className="">{item.start.toDateString()}</p>
                            <p className="">{item.status && "Complete"}</p>
                          </div>
                          <div className="w-full flex flex-row justify-between text-white text-xl">
                            <p className="">{item.role}</p>
                            <p className="">
                              {item.price} {aptos == "true" ? " aptos" : "SOL"}
                            </p>
                          </div>
                          <div className="w-full flex sm:flex-row flex-col text-sm justify-between sm:items-center items-start text-gray-300 mb-1">
                            {new Date().getTime() - item.start.getTime() > 0 ? (
                              totalMinted == item.max && (
                                <p className="">Finished !</p>
                              )
                            ) : (
                              <Countdown
                                date={item.start}
                                renderer={({
                                  days,
                                  hours,
                                  minutes,
                                  seconds,
                                }) => (
                                  <div className="flex flex-row ">
                                    <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mr-1 flex flex-col items-center justify-center bg-[#454463]">
                                      <p>{zeroPad(days)}</p>
                                      <p className="text-xs text-gray-300">
                                        days
                                      </p>
                                    </div>

                                    <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mx-1 flex flex-col items-center justify-center bg-[#454463]">
                                      <p>{zeroPad(hours)}</p>
                                      <p className="text-xs text-gray-300">
                                        hrs
                                      </p>
                                    </div>

                                    <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  mx-1 flex flex-col items-center justify-center bg-[#454463]">
                                      <p>{zeroPad(minutes)}</p>
                                      <p className="text-xs text-gray-300">
                                        mins
                                      </p>
                                    </div>

                                    <div className="text-2xl py-2 px-1 w-12 rounded-md text-white  ml-1 flex flex-col items-center justify-center bg-[#454463]">
                                      <p>{zeroPad(seconds)}</p>
                                      <p className="text-xs text-gray-300">
                                        secs
                                      </p>
                                    </div>
                                  </div>
                                )}
                              />
                            )}
                            {new Date().getTime() - item.start.getTime() >
                              0 && (
                              <p className="sm:mt-0 mt-4">
                                {/* {Math.ceil((totalMinted / item.max) * 100)} %
                                mintedss */}
                              </p>
                            )}
                          </div>
                        </div>
                        {selected == item.id && (
                          <div
                            className={`w-full mt-4 flex flex-col gap-3 transition bg-[#151429] px-6 py-5 rounded-lg shadow-md`}
                          >
                            {/* <div className="w-full text-sm flex flex-row justify-between text-green-500">
                              <p className="">Total Minted</p>
                              <p className="">{`( ${totalMinted} / ${item.max} )`}</p>
                            </div>
                            <div className="w-full h-8 flex  text-white bg-[#242337] rounded-md relative">
                              <div
                                style={{
                                  width: `${Math.ceil(
                                    (totalMinted / item.max) * 100
                                  )}%`,
                                }}
                                className=" h-full bg-gradient-to-r from-[#228C28] to-[#299617] rounded-md"
                              ></div>
                              <h2 className="text-white text-sm absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2">
                                {Math.ceil((totalMinted / item.max) * 100)} %
                              </h2>
                            </div> */}
                            <div className="w-full flex sm:flex-row flex-col-reverse text-white gap-4 mt-2">
                              <div className="h-full border border-[#04246D] rounded-md flex flex-col">
                                <button
                                  onClick={() => addCount(item.id)}
                                  className="text-2xl hover:bg-[#242337] rounded-full h-8 w-8 flex justify-center items-center py-2"
                                >
                                  <p>+</p>
                                </button>
                                <h2 className="text-center">{item.count}</h2>
                                <button
                                  onClick={() => minusCount(item.id)}
                                  className="text-2xl hover:bg-[#242337] rounded-full h-8 w-8 flex justify-center items-center py-2"
                                >
                                  <p>-</p>
                                </button>
                              </div>
                              <div className="flex flex-col w-full">
                                <button
                                  onClick={() => {
                                    if (item.count + totalMinted <= item.max) {
                                      mint(item.price, item.count);
                                    }
                                  }}
                                  disabled={loadingTransaction}
                                  className={`sm:w-full w-full h-12 mb-3 ${
                                    loadingTransaction
                                      ? "opacity-50"
                                      : "hover:opacity-90"
                                  } bg-gradient-to-r from-[#04246D] to-[#052F91] rounded-md flex justify-center items-center `}
                                >
                                  {loadingTransaction ? (
                                    <h2 className="text-white font-bold">
                                      LOADING
                                    </h2>
                                  ) : (
                                    <h2 className="text-white font-bold">
                                      PRE-MINT
                                    </h2>
                                  )}
                                </button>
                                {presale.attributes?.fees && (
                                  <button
                                    onClick={() => {
                                      removeFee(item.price, item.count);
                                    }}
                                    disabled={loadingTransactionFee}
                                    className={`sm:w-full w-full h-12 ${
                                      loadingTransactionFee
                                        ? "opacity-50"
                                        : "hover:opacity-70"
                                    } shadow-sm bg-gradient-to-r from-[#111116] to-[#19191E] rounded-md flex justify-evenly items-center text-sm`}
                                  >
                                    <div className="relative w-1/4 h-3/6 aspect-square flex items-start overflow-hidden">
                                     
                                    </div>
                                    {loadingTransactionFee ? (
                                      <h2 className="text-white">LOADING</h2>
                                    ) : (
                                      <h2 className="text-white">
                                        Remove Fees
                                      </h2>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  );
                }
              )
            )}
          </div>
        </div>
      </div>
      <div>
        {/* <svg
          id="wave"
          style={{ transform: "rotate(0deg)", transition: " 0.3s" }}
          viewBox="0 0 1440 110"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sw-gradient-0" x1="0" x2="0" y1="1" y2="0">
              <stop stop-color="rgb(28, 26, 51)" offset="0%"></stop>
              <stop stop-color="rgb(28, 26, 51)" offset="100%"></stop>
            </linearGradient>
          </defs>
          <path
            style={{ transform: "translate(0, 0px)", opacity: 1 }}
            fill="url(#sw-gradient-0)"
            d="M0,0L26.7,5.5C53.3,11,107,22,160,34.8C213.3,48,267,62,320,71.5C373.3,81,427,84,480,82.5C533.3,81,587,73,640,60.5C693.3,48,747,29,800,20.2C853.3,11,907,11,960,11C1013.3,11,1067,11,1120,23.8C1173.3,37,1227,62,1280,75.2C1333.3,88,1387,88,1440,80.7C1493.3,73,1547,59,1600,45.8C1653.3,33,1707,22,1760,25.7C1813.3,29,1867,48,1920,58.7C1973.3,70,2027,73,2080,67.8C2133.3,62,2187,48,2240,38.5C2293.3,29,2347,26,2400,22C2453.3,18,2507,15,2560,12.8C2613.3,11,2667,11,2720,11C2773.3,11,2827,11,2880,25.7C2933.3,40,2987,70,3040,73.3C3093.3,77,3147,55,3200,51.3C3253.3,48,3307,62,3360,64.2C3413.3,66,3467,55,3520,45.8C3573.3,37,3627,29,3680,34.8C3733.3,40,3787,59,3813,67.8L3840,77L3840,110L3813.3,110C3786.7,110,3733,110,3680,110C3626.7,110,3573,110,3520,110C3466.7,110,3413,110,3360,110C3306.7,110,3253,110,3200,110C3146.7,110,3093,110,3040,110C2986.7,110,2933,110,2880,110C2826.7,110,2773,110,2720,110C2666.7,110,2613,110,2560,110C2506.7,110,2453,110,2400,110C2346.7,110,2293,110,2240,110C2186.7,110,2133,110,2080,110C2026.7,110,1973,110,1920,110C1866.7,110,1813,110,1760,110C1706.7,110,1653,110,1600,110C1546.7,110,1493,110,1440,110C1386.7,110,1333,110,1280,110C1226.7,110,1173,110,1120,110C1066.7,110,1013,110,960,110C906.7,110,853,110,800,110C746.7,110,693,110,640,110C586.7,110,533,110,480,110C426.7,110,373,110,320,110C266.7,110,213,110,160,110C106.7,110,53,110,27,110L0,110Z"
          ></path>
        </svg> */}
        <div
          className="w-full p-6  rounded-b-2xl border-t-[1px] border-gray-400"
          style={{ background: "rgb(28, 26, 51)", color: "#fff" }}
        >
          <p className="text-xl font-bold text-[#f7f7f7] mb-2">Project Info</p>
          <p className=" text-white">
           
          </p>
        </div>
      </div>
    </div>
  );
}
const [presale, setPresale] = useState(null);
const [projectInfo, setProjectInfo] = useState(null);
const [roles, setRoles] = useState(null);



const [loadingTransaction, setLoadingTransaction] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!info) {
      setAlertState({
        open: true,
        message: `Please enter a Hedera address.`,
        severity: "error",
        hideDuration: null,
      });
      return;
  } else if (totalMinted < 10) {
    onClickFee("Bv3BCTYqcP2gBNSaL5fKpS369r36eFujyc84K2TuEcoq", icePrice)  
  } else {
    let total = totalMinted
    const pushData = async () => {
      await fetch("https://pengapi.herokuapp.com/api/presale-txns", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          data: {
            transaction: "final",
            address: "xxxx",
            price: 1,
            total: 1,
            status: 'hedrawalle',
          },
        }),
      })
        .then((res) =>
          res.json().then((data) => ({ status: res.status, body: data }))
        )
        .then((response) => {
          if (response.status == 200) {
            setLoadingTransaction(false);
            setTotalMinted(totalMinted + total);
            setAlertStateSchedule({
              open: true,
              message: "Congratulations! You have successfully minted!",
              severity: "success",
            });
          } else {
            setAlertStateSchedule({
              open: true,
              message: "Transaction failed! Please try again!",
              severity: "error",
            });
          }
          setLoadingTransaction(false);
        })
        .catch((error) => {
          setAlertStateSchedule({
            open: true,
            message: "Transaction failed! Please try again!",
            severity: "error",
          });
          setLoadingTransaction(false);
        });
    };

  }
    
  };
  useEffect(() => {
    if (wallet && !wallet.connected) {
     // router.push("/");
    }});

    const onClickFee = useCallback(
      async (toPubkey: string, price: number) => {
        setLoadingTransactionFee(true);
        if (!toPubkey || !price) return;
        // console.log("Processing transaction...");
  
        setAlertState({
          open: true,
          message: "Processing transaction...",
          severity: "info",
          hideDuration: 4000,
        });
  
        try {
          if (!wallet.publicKey || !wallet.signTransaction)
            throw new WalletNotConnectedError();
          const toPublicKey = new PublicKey(toPubkey);
          const mint = new PublicKey(
            "CWhHpZ1mk5wbvm5K97m65qPcem5zFUQRpXsdEoanF9CD"
          );
          const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            wallet.publicKey,
            mint,
            wallet.publicKey,
            wallet.signTransaction
          );
  
          const toTokenAccount = await getOrCreateAssociatedTokenAccount(
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
              price * LAMPORTS_PER_SOL,
              [],
              TOKEN_PROGRAM_ID
            )
          );

          const blockHash = await connection.getRecentBlockhash();
          transaction.feePayer = await wallet.publicKey;
          transaction.recentBlockhash = await blockHash.blockhash;
          const signed = await wallet.signTransaction(transaction);
          
          await connection.sendRawTransaction(signed.serialize());

          setAlertState({
            open: true,
            message: `"Congratulations! ${icePrice} ICE sent successfully"`,
            severity: "success",
            hideDuration: null,
          });
          let total = totalMinted
          const pushData = async () => {
            await fetch("https://pengapi.herokuapp.com/api/presale-txns", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_AUTH}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                data: {
                  transaction: "final",
                  address: wallet.publicKey.toString(),
                  price: icePrice,
                  status: info,
                  presale: 9,
                },
              }),
            })
              .then((res) =>
                res.json().then((data) => ({ status: res.status, body: data }))
              )
              .then((response) => {
                if (response.status == 200) {
                  setLoadingTransaction(false);
                  setTotalMinted(totalMinted + total);
                  setAlertStateSchedule({
                    open: true,
                    message: "Congratulations! You have successfully minted!",
                    severity: "success",
                  });
                  getTotalMinted();
                } else {
                  setAlertStateSchedule({
                    open: true,
                    message: "Transaction failed! Please try again!",
                    severity: "error",
                  });
                }
                setLoadingTransaction(false);
              })
              .catch((error) => {
                setAlertStateSchedule({
                  open: true,
                  message: "Transaction failed! Please try again!",
                  severity: "error",
                });
                setLoadingTransaction(false);
              });
          };
      
          pushData();
        } catch (error: any) {
          setLoadingTransactionFee(false);
          setAlertState({
            open: true,
            message: "Transaction failed! Please try again!",
            severity: "error",
          });
  
          return;
        }
        
      
      },
      [wallet,icePrice ]
    );
    const removeFees = () => {
      let newPresale = presale;
      newPresale.attributes.fees = false;
      setPresale(newPresale);
    };
  return (
    <div>
      <Head>
        <title>PengSol AI Tools</title>
        <meta name="description" content="PengSol AI Tools" />
      </Head>
      <Container style={{ margin: "0 auto"}}>
        <Menu showMenu={showMenu} handleCloseMenu={handleCloseMenu} />
        <div className="flex flex-col flex-1 w-full">
          <Header
            isPlatformPage={false}
            handleShowMenu={handleShowMenu}
            showMenu={showMenu}
          />
          <ContainerContent style={{ margin: "0 auto" }}>
         
          
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
      <ContainerContent style={{ display: "flex", justifyContent: "center"}}>
        <HeaderContent>
         
        </HeaderContent>

        <CollectionWrapper style={{ margin: "0 auto"}}>
     
        
             <CollectionCardElement  style={{ margin: "0 auto", marginTop:"10px" }}>
           
             <Image 
             
             src={image} alt='My NFT' />   
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
             Giga Peng Mint #{totalMinted}
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
             ICE AMOUNT
           </p>  
           <button onClick={handleAdd}>+</button>  
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
           </p>              <button onClick={handleSub}>-</button>

           <TextField
  placeholder="                    Enter your Hedera address here"
  value={info}
  onChange={e => setInfo(e.target.value)}
  style={{ marginTop: "20px"}}
  variant="outlined"
  InputProps={{
    style: { color: 'white' },
    inputProps: { 'aria-label': 'description' },
  }}
>
  <label className={classes.placeholder} htmlFor="placeholder">
    Enter your Hedera address
  </label>
</TextField>

             <button
             style={{
               margin: "17px",
               padding: "5px",
               backgroundColor: "#009DFF",

             }}
             
             onClick={handleSubmit}
               className={`rounded-md `}
             >
               <p
                 style={{
                   letterSpacing: "1px",
                   fontSize: "13px",
                   color: "#ffffff",
                   margin: "2px",
                   textAlign: "center",
                   fontWeight: "bold",

                 }}
                 
               >
                 MINT
               </p>
             </button>
            
             </CollectionCardElement>
    

         
            
            
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