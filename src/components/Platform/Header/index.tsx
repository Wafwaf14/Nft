import { HeaderElement, Button, IconWrapper } from "./Header.style";
import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { useEffect, useMemo, useState, useContext } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getMintsTokensBalance } from "components/helpers/getMintsToken";
import { LoginDiscord } from "components/HomePageConnection";
import { AuthContext } from "contexts/AuthContext";
import { BCS, TxnBuilderTypes } from "aptos";
import { useWallet as useWalletAptos } from "@manahippo/aptos-wallet-adapter";
import { Fade, Modal, Backdrop, Box } from "@mui/material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#202225",
  boxShadow: 24,
  p: 4,
  borderRadius: 5,
};

type HeaderProps = {
  isPlatformPage: boolean;
  showMenu: boolean;
  handleShowMenu: () => void;
};

export function Header({
  isPlatformPage,
  handleShowMenu,
  showMenu,
}: HeaderProps) {
  const wallet = useWallet();
  const { connected, account, connect, disconnect, wallets } = useWalletAptos();

  const { aptosWallet, setAptosWallet } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [balanceSOL, setBalanceSOL] = useState("0");
  const [balanceICET, setBalanceICET] = useState("0");

  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const rpcHost = process.env.NEXT_PUBLIC_REACT_APP_SOLANA_RPC_HOST!;

  const connection = new anchor.web3.Connection(
    rpcHost ? rpcHost : anchor.web3.clusterApiUrl("mainnet-beta")
  );

  useEffect(() => {
    (async () => {
      if (anchorWallet && anchorWallet.publicKey) {
        const balance = await connection.getBalance(anchorWallet!.publicKey);
        setBalanceSOL((balance / LAMPORTS_PER_SOL).toFixed(2));

        let mints = await getMintsTokensBalance(wallet.publicKey?.toString());

        const balanceICET =
          mints.find(
            ({ mintAddress }) =>
              mintAddress === "CWhHpZ1mk5wbvm5K97m65qPcem5zFUQRpXsdEoanF9CD"
          )?.tokenBalance ?? 0;

        setBalanceICET(balanceICET.toFixed(2));

        // console.log('>>> mints : ',mints)
      }
    })();
  }, [anchorWallet, connection]);

  const renderWalletConnectorGroup = () => {
    return wallets.map((wallet, index) => {
      const option = wallet.adapter;
      return (
        <button
          onClick={() => {
            connect(option.name);
            handleClose();
          }}
          id={option.name.split(" ").join("_")}
          key={option.name}
          className={`${
            option.name == "Petra"
              ? "bg-[#BC4D4D]"
              : option.name == "Martian"
              ? "bg-white"
              : option.name == "Pontem"
              ? "bg-[#03031C]"
              : option.name == "Rise Wallet"
              ? "bg-[#112032]"
              : "bg-[#209EF3]"
          } flex items-center text-white text-lg px-5 py-2 rounded-md transition hover:opacity-70 w-full mb-4`}
        >
          <div className="w-10 h-10 mr-6">
            {option.name == "Petra" ? (
              <svg
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1000 1000"
                fill="#fff"
              >
                <path
                  className="cls-1"
                  d="M473.73,933.7h0c-158.66,0-287.28-128.62-287.28-287.28V170.77S473.73,66.3,473.73,66.3V933.7Z"
                ></path>
                <path
                  className="cls-1"
                  d="M526.27,576.86h0c158.66,0,287.28-128.62,287.28-287.28v-118.81s-287.28-104.47-287.28-104.47v510.56Z"
                ></path>
              </svg>
            ) : option.name == "Martian" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 128 128"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M80.2694 0.983975C80.1937 1.04428 79.8766 1.5008 79.5647 1.99847C76.2297 7.31996 67.4912 19.0751 64.3321 22.4896C64.1639 22.6715 64.0891 22.5951 62.2608 20.3729C56.9659 13.9371 52.175 7.45276 48.8923 2.27904C47.8913 0.70134 48.1268 0.560121 40.0292 7.5928C29.4294 16.7987 29.6553 16.512 31.8956 17.9146C35.5059 20.1749 39.1754 22.7188 43.3503 25.8557C47.5959 29.0456 53.8117 34.0706 53.812 34.3131C53.8126 34.908 34.9001 53.8136 34.3037 53.8142C34.1177 53.8144 32.542 51.9635 29.612 48.3031C24.7196 42.1911 20.9021 36.8868 17.6788 31.7224C16.7517 30.2371 16.6651 30.1275 16.4756 30.2004C16.3567 30.2461 13.3121 33.5225 11.1898 35.8887C1.80746 46.3492 0.611407 47.9884 1.81158 48.7419C7.47372 52.2969 16.5261 58.994 21.9211 63.6192C22.7214 64.3054 22.8295 64.1259 20.4306 66.0952C13.7581 71.5727 7.05171 76.4957 1.45261 80.0265C1.13663 80.2258 0.866204 80.4516 0.851715 80.5283C0.779448 80.9109 11.0425 92.7255 15.7595 97.6899C16.6504 98.6276 16.5736 98.6535 17.5259 97.0935C21.0645 91.2967 26.5806 83.7721 32.7625 76.3091C34.5594 74.1399 33.7417 73.5863 44.3218 84.1366C54.8198 94.6049 54.2968 93.8607 52.3147 95.5101C44.923 101.661 37.7549 106.949 31.7345 110.691C30.8219 111.258 30.0518 111.783 30.0232 111.858C29.8361 112.347 47.4619 127.82 47.9793 127.621C48.0501 127.594 48.3824 127.137 48.718 126.607C51.869 121.624 55.8823 116.07 60.5322 110.258C62.2366 108.127 64.0702 105.905 64.1794 105.837C64.3073 105.758 64.3894 105.846 65.9391 107.72C71.0921 113.952 76.5439 121.319 79.5624 126.13C79.8637 126.61 80.0568 126.83 80.1765 126.83C80.8347 126.83 97.9268 111.767 97.7602 111.335C97.7311 111.259 97.1024 110.817 96.3633 110.353C90.3441 106.574 83.3376 101.416 76.3407 95.6112C74.3607 93.9688 74.4633 94.131 75.0205 93.5233C80.4861 87.563 93.5991 74.5505 94.1406 74.5498C94.23 74.5497 94.9874 75.3865 95.9602 76.5599C101.816 83.6237 107.005 90.649 110.524 96.2801C111.408 97.6934 111.493 97.7995 111.661 97.6973C112.092 97.4365 118.686 90.1412 122.107 86.1404C127.938 79.3213 127.66 80.3461 124.284 78.1086C118.634 74.3653 110.784 68.4675 106.443 64.7044C105.721 64.0788 105.632 64.2535 107.436 62.7526C113.78 57.475 120.467 52.5211 126.125 48.9065C127.658 47.9274 127.75 47.8395 127.549 47.5408C127.183 46.995 123.387 42.4737 120.788 39.4874C117.89 36.1567 112.34 30.0953 112.029 29.9223C111.826 29.8086 111.784 29.862 110.57 31.8067C107.509 36.7109 103.443 42.3807 98.9137 48.0627C96.6764 50.8693 94.2179 53.8423 94.1343 53.8424C93.5941 53.8429 74.5353 34.8185 74.5348 34.2781C74.5345 34.0467 81.455 28.4603 85.7013 25.2642C89.5559 22.3629 95.0215 18.6329 97.7047 17.0727C98.5493 16.5815 98.5613 16.4803 97.8528 15.8267C89.7249 8.32854 80.6576 0.674587 80.2694 0.983975ZM66.2178 25.0935C68.1378 27.3223 71.6061 31.2245 73.3439 33.1113C74.4979 34.3642 74.5737 34.1262 72.4326 35.9688C70.3383 37.7712 67.0505 40.6868 65.4253 42.1831C64.1008 43.4025 64.2835 43.3827 63.2289 42.4214C61.4919 40.8378 57.4231 37.2461 55.7775 35.8437C53.7361 34.104 53.7145 34.5717 55.9499 32.112C57.8251 30.0488 61.2408 26.1619 63.0683 24.0116C64.2857 22.5794 63.9537 22.4653 66.2178 25.0935ZM66.7383 45.6853C69.767 48.5013 79.5415 58.2339 82.2536 61.134C83.3687 62.3264 84.4638 63.4932 84.6871 63.7269L85.0931 64.1518L84.2872 65.0318C79.978 69.7372 71.8422 77.9285 66.5989 82.8408C65.3182 84.0406 64.2809 85.0503 64.2937 85.0845C64.3482 85.2313 69.6892 89.9901 72.5366 92.4291C74.6867 94.2706 74.6799 93.8456 72.5955 96.1387C70.5535 98.3851 67.6654 101.666 65.7838 103.877C64.3684 105.54 64.2997 105.612 64.1844 105.541C64.1448 105.516 63.2676 104.513 62.235 103.311C60.3318 101.095 56.8638 97.194 55.1117 95.2979C53.937 94.0267 53.9342 94.1655 55.1568 93.1267C57.969 90.7372 64.1811 85.1904 64.181 85.0692C64.181 85.0371 62.9682 83.8768 61.4862 82.491C60.0041 81.1052 56.5462 77.7346 53.8021 75.0009C49.2669 70.4829 47.6296 68.8028 44.3992 65.3526L43.3236 64.2037L44.4872 62.962C50.5155 56.5294 56.142 50.89 62.7815 44.6254C64.3631 43.1331 63.8439 42.994 66.7383 45.6853ZM35.925 55.9149C37.6123 57.8726 40.3992 61.013 42.1694 62.9515C43.4468 64.3502 43.3922 64.1439 42.6857 64.9035C41.0888 66.6203 36.8521 71.4186 35.092 73.5036C34.2624 74.4864 34.3351 74.4673 33.6859 73.8738C30.9239 71.3485 27.0409 67.9183 24.3665 65.6411C22.4809 64.0354 22.3996 64.4986 24.9513 62.3119C27.2718 60.3232 31.2039 56.8307 33.0203 55.145C34.4126 53.8529 34.0694 53.7618 35.925 55.9149ZM95.2792 54.9861C97.1224 56.6797 101.058 60.1599 103.368 62.1385C104.604 63.197 105.603 64.1126 105.588 64.173C105.572 64.2334 104.522 65.1747 103.254 66.2648C100.828 68.3507 98.0032 70.8544 95.6599 72.9965C93.9555 74.5545 94.3986 74.6572 92.2959 72.2177C90.397 70.0147 88.0772 67.403 86.266 65.4294C85.6526 64.7609 85.1616 64.1841 85.1747 64.1474C85.1879 64.1107 86.0382 63.1516 87.0641 62.0161C89.1241 59.7361 91.8966 56.5777 93.1991 55.0272C94.2135 53.8195 94.0139 53.8234 95.2792 54.9861Z"
                  fill="black"
                />
              </svg>
            ) : option.name == "Pontem" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="#fff"
              >
                <path
                  d="M16 0C7.17604 0 0 7.17457 0 15.9967C0 22.3376 3.70948 27.8318 9.07345 30.4181V30.4312H9.09971C11.1875 31.4355 13.5314 32 16 32C24.824 32 32 24.8254 32 16.0033C32 7.17456 24.824 0 16 0ZM16 1.31282C24.0952 1.31282 30.6869 7.90318 30.6869 15.9967C30.6869 18.3204 30.142 20.5259 29.1769 22.4821C27.0628 21.4581 24.9159 20.6966 22.7493 20.1781V7.92944C22.7493 7.50277 22.4144 7.16144 21.9943 7.16144H19.3024H12.5203H9.82848C9.41485 7.16144 9.07345 7.50277 9.07345 7.92944V20.2371C6.97251 20.7557 4.88469 21.504 2.82971 22.4886C1.85802 20.5259 1.31309 18.327 1.31309 15.9967C1.31309 7.90318 7.9048 1.31282 16 1.31282ZM3.67665 23.9655C5.4165 23.1056 7.22199 22.4427 9.08002 21.9832V28.9411C6.88059 27.7662 5.02257 26.0464 3.67665 23.9655ZM12.5203 30.2605V13.8699C12.5203 11.9729 14.0763 10.4041 15.9343 10.4041C17.7924 10.4041 19.3024 11.9401 19.3024 13.8306C19.3024 13.8437 19.2959 13.8568 19.2959 13.8699H19.3024V19.5742C17.7201 19.3904 16.1313 19.3313 14.5425 19.4166L13.2359 21.3136C15.2712 21.143 17.254 21.1561 19.2105 21.3793C19.2302 21.3793 19.2433 21.3793 19.263 21.3858C19.2762 21.3858 19.2893 21.3858 19.309 21.3924C19.6504 21.4318 20.8913 21.5893 22.0271 21.8716L19.309 22.7971V30.313C18.2454 30.5559 17.1424 30.6937 16.0131 30.6937C14.7985 30.6806 13.6364 30.5296 12.5203 30.2605ZM22.7427 29.033V22.016C24.5942 22.4821 26.4259 23.1647 28.2643 24.0574C26.8855 26.1514 24.9815 27.8712 22.7427 29.033Z"
                  fill="url(#paint0_linear_247_74)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_247_74"
                    x1="15.9997"
                    y1="32.6923"
                    x2="15.9997"
                    y2="-4.90647"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.0858" stop-color="#8D29C1" />
                    <stop offset="0.2383" stop-color="#942BBB" />
                    <stop offset="0.4667" stop-color="#A92FAC" />
                    <stop offset="0.7413" stop-color="#CA3793" />
                    <stop offset="1" stop-color="#F03F77" />
                  </linearGradient>
                </defs>
              </svg>
            ) : option.name == "Fewcha" ? (
              <svg
                height="26"
                viewBox="0 0 115 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mt-1"
              >
                <g clip-path="url(#clip0_40_1820)">
                  <path
                    d="M18.3001 12.9945H6.10352C6.10352 9.64399 8.84582 6.89062 12.2074 6.89062C15.5689 6.89062 18.3112 9.63293 18.3112 12.9945H18.3001Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M12.1966 0.797852C5.4625 0.797852 0 6.26035 0 12.9945C0 19.7286 5.4625 25.1911 12.1966 25.1911C18.9308 25.1911 24.3933 19.7286 24.3933 12.9945C24.3933 6.26035 18.9418 0.797852 12.1966 0.797852ZM12.1966 22.1503C7.16538 22.1503 3.04087 18.0368 3.04087 12.9945C3.04087 7.95218 7.16538 3.84977 12.1966 3.84977C17.2279 3.84977 21.3524 7.96324 21.3524 13.0055C21.3524 18.0479 17.2389 22.1613 12.1966 22.1613V22.1503Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M35.9371 9.67701H39.166V12.6958H35.9371V22.1169H32.277V12.6958H30.5078V9.67701H32.277V9.12413C32.277 7.44336 32.7304 6.13855 33.6482 5.22076C34.566 4.30297 35.8155 3.84961 37.3968 3.84961C38.2482 3.84961 38.9227 3.97124 39.4424 4.24769V7.38807C39.0443 7.17797 38.5578 7.05634 38.0381 7.05634C37.4631 7.05634 36.9434 7.21115 36.5453 7.54288C36.1472 7.85249 35.9371 8.39432 35.9371 9.1573V9.67701Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M52.2811 19.1649C51.7614 20.2044 50.9984 21.0005 50.0253 21.5755C49.0523 22.1505 47.858 22.4601 46.52 22.4601C45.547 22.4601 44.6623 22.3053 43.833 21.9736C43.0369 21.664 42.3402 21.2106 41.7542 20.6356C41.1792 20.0606 40.7148 19.3529 40.383 18.5568C40.0513 17.7606 39.8965 16.876 39.8965 15.9029C39.8965 14.9298 40.0513 14.1005 40.383 13.2822C40.7148 12.4861 41.1792 11.7895 41.7542 11.2034C42.3292 10.6284 43.0037 10.164 43.7998 9.83224C44.596 9.50051 45.4474 9.3457 46.3652 9.3457C47.283 9.3457 48.1676 9.50051 48.9527 9.83224C49.7489 10.164 50.4123 10.6284 50.9652 11.2034C51.5181 11.7784 51.9383 12.4861 52.2811 13.3044C52.5907 14.1226 52.7345 15.0072 52.7345 15.9914V16.5443C52.7345 16.6991 52.7345 16.8207 52.7013 16.9092H43.5455C43.5787 17.2741 43.6672 17.6058 43.8551 17.9154C44.0431 18.225 44.2532 18.4904 44.5297 18.7116C44.8061 18.9217 45.1047 19.1096 45.4806 19.2313C45.8123 19.3529 46.1773 19.4193 46.5753 19.4193C47.272 19.4193 47.8248 19.2976 48.2229 19.0212C48.621 18.7447 48.9859 18.3798 49.2623 17.9265L52.3696 19.176H52.2811V19.1649ZM49.1075 14.5318C49.0191 13.8572 48.7426 13.3154 48.2229 12.8842C47.7032 12.4529 47.095 12.2428 46.3321 12.2428C45.9672 12.2428 45.6354 12.3092 45.2926 12.4308C44.983 12.5524 44.6845 12.7404 44.4412 12.9505C44.1979 13.1606 43.9878 13.4039 43.833 13.6803C43.6782 13.9568 43.5898 14.2332 43.5234 14.5318H49.1075Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M66.3141 22.1498L63.7266 14.52L61.1391 22.1498H58.054L53.6641 9.67676H57.4126L59.8232 17.207L62.3886 9.67676H65.1088L67.6742 17.207L70.14 9.67676H73.8001L69.377 22.1498H66.3251H66.3141Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M74.7389 15.9029C74.7389 14.952 74.8937 14.1005 75.2254 13.2822C75.5571 12.4861 76.0216 11.7895 76.5966 11.2034C77.1716 10.6284 77.8793 10.164 78.6975 9.83224C79.5158 9.50051 80.4004 9.3457 81.3846 9.3457C81.9374 9.3457 82.4571 9.41205 82.999 9.53368C83.5519 9.65532 84.0384 9.86541 84.4918 10.1087V13.5587C83.6403 12.9505 82.7225 12.6409 81.7716 12.6409C81.285 12.6409 80.8206 12.7294 80.4336 12.8842C80.0355 13.039 79.6706 13.2822 79.361 13.5587C79.0514 13.8351 78.8081 14.2 78.6644 14.5981C78.4764 14.9962 78.4211 15.4164 78.4211 15.914C78.4211 16.4116 78.5096 16.8318 78.6644 17.2298C78.8192 17.6279 79.0624 17.9596 79.361 18.2693C79.6706 18.5457 80.0355 18.789 80.4336 18.9438C80.8317 19.0986 81.285 19.187 81.7716 19.187C82.2581 19.187 82.7447 19.0986 83.2091 18.9106C83.6624 18.7226 84.1269 18.5125 84.4918 18.214V21.6861C83.9721 21.9625 83.4523 22.1726 82.9105 22.2943C82.3576 22.4159 81.8158 22.4822 81.2961 22.4822C80.3451 22.4822 79.4605 22.3274 78.6422 21.9957C77.8461 21.6861 77.1495 21.2327 76.5413 20.6577C75.9663 20.0827 75.5019 19.4082 75.1701 18.5789C74.8384 17.7606 74.6836 16.876 74.6836 15.8919L74.7499 15.925L74.7389 15.9029Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M90.8066 22.1503H87.1133V4.49121H90.8066V11.2585C91.2046 10.6503 91.6912 10.1859 92.2993 9.85419C92.9075 9.52246 93.6373 9.33448 94.4998 9.33448C95.9373 9.33448 97.0652 9.78785 97.8503 10.7056C98.6465 11.6234 99.0666 12.8729 99.0666 14.4321V22.1172H95.3734V15.2503C95.3734 14.4542 95.1854 13.8128 94.7984 13.3595C94.4003 12.9061 93.8474 12.685 93.1508 12.685C92.4541 12.685 91.8349 12.9282 91.4147 13.4479C90.9835 13.9677 90.7734 14.6422 90.7734 15.4936V22.1172L90.8066 22.1503Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M115 9.67712V22.1502H111.406V20.4694C110.975 21.1108 110.4 21.5973 109.67 21.929C108.974 22.2608 108.177 22.4488 107.348 22.4488C106.519 22.4488 105.734 22.2608 105.004 21.929C104.307 21.5973 103.666 21.1329 103.146 20.5579C102.627 19.9829 102.195 19.2752 101.897 18.479C101.587 17.6829 101.443 16.8314 101.443 15.8915C101.443 14.9516 101.598 14.1223 101.897 13.3262C102.206 12.53 102.627 11.8334 103.146 11.2473C103.666 10.6723 104.307 10.2079 105.004 9.87616C105.701 9.54443 106.497 9.35645 107.348 9.35645C108.2 9.35645 108.929 9.51125 109.67 9.84298C110.367 10.1526 110.953 10.6391 111.406 11.2805V9.66606H115V9.67712ZM105.115 15.9026C105.115 16.356 105.203 16.7872 105.358 17.1521C105.546 17.5502 105.756 17.8819 106.032 18.1584C106.309 18.4348 106.64 18.6781 107.039 18.855C107.437 19.043 107.835 19.0983 108.288 19.0983C108.741 19.0983 109.173 19.0098 109.538 18.855C109.936 18.7002 110.267 18.4569 110.544 18.1584C110.82 17.8488 111.064 17.517 111.218 17.1521C111.406 16.754 111.462 16.3338 111.462 15.9026C111.462 15.4713 111.373 15.018 111.218 14.6531C111.064 14.255 110.82 13.9233 110.544 13.6468C110.267 13.3372 109.936 13.1271 109.538 12.9502C109.14 12.7622 108.741 12.7069 108.288 12.7069C107.835 12.7069 107.403 12.7954 107.039 12.9502C106.64 13.105 106.309 13.3483 106.032 13.6468C105.756 13.9564 105.513 14.2882 105.358 14.6531C105.203 15.0512 105.115 15.4713 105.115 15.9026Z"
                    fill="#ffffff"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_40_1820">
                    <rect
                      width="115"
                      height="24.4043"
                      fill="white"
                      transform="translate(0 0.797852)"
                    />
                  </clipPath>
                </defs>
              </svg>
            ) : (
              <svg
                fill="none"
                height="24"
                viewBox="0 0 91 30"
                width="91"
                xmlns="http://www.w3.org/2000/svg"
                className="mt-2"
              >
                <clipPath id="a">
                  <path d="m0 0h90.9091v30h-90.9091z"></path>
                </clipPath>
                <g clip-path="url(#a)" fill="#fff">
                  <path d="m13.6333 2.45508c-7.53005 0-13.6333 6.16695-13.6333 13.77252 0 7.6055 6.10325 13.7724 13.6333 13.7724 7.53 0 13.6332-6.1669 13.6332-13.7724 0-7.60557-6.1032-13.77252-13.6332-13.77252zm7.7315 13.09212c-.065.3757-.4206.6804-.7925.6804h-6.939l-.8115 4.6532c-.0649.3757-.4206.6803-.7925.6803h-6.26549c-.37191 0-.62074-.3046-.55448-.6803l.69377-3.9729c.06491-.3757.42059-.6803.79249-.6803h6.93901l.8114-4.6533c.0649-.3757.4206-.6803.7925-.6803h6.2656c.3719 0 .6207.3046.5544.6803z"></path>
                  <path d="m44.2699 6.86108c-2.4221 0-4.337.97819-5.7435 2.93593l-.2083-2.6217h-3.7014v18.42019h3.9449v-8.6329c0-.862.0919-1.6722.2772-2.429.1839-.7569.4896-1.4154.9169-1.9742.426-.5587.9805-1.0082 1.6607-1.3457.6803-.3374 1.5282-.5191 2.5438-.5423.2529 0 .5126-.0055.7776-.0178.2651-.0109.5369-.0178.8128-.0178v-3.70504c-.1839-.02323-.3868-.04099-.6045-.05192-.2204-.01093-.4449-.01776-.6748-.01776z"></path>
                  <path d="m52.2974 7.17529h-3.9449v18.42021h3.9449z"></path>
                  <path d="m69.4242 16.3846c-.5544-.3839-1.2293-.6927-2.0244-.9263-.7952-.2322-1.6905-.4549-2.6804-.6639-.3692-.0697-.8128-.1572-1.3321-.2623-.5193-.1052-1.0089-.2446-1.4701-.4195-.4611-.1748-.8587-.4016-1.1928-.6817-.3353-.2801-.5017-.664-.5017-1.153 0-.4427.1082-.8047.3286-1.0834.2191-.2801.4964-.4946.8304-.6462.334-.1517.6924-.25 1.0724-.2965.3814-.0464.7438-.0697 1.09-.0697.8764.0478 1.631.2268 2.2666.5424.6343.3142 1.0089.8443 1.1238 1.5902h3.7015c-.115-1.7705-.8128-3.12169-2.0935-4.05479-1.2807-.93174-2.9238-1.39761-4.9307-1.39761-.8304 0-1.6729.08744-2.5263.26231-.8533.17487-1.6255.4891-2.3179.94403-.6911.45494-1.2577 1.04377-1.6959 1.76511-.4382.72275-.6573 1.64215-.6573 2.76105 0 1.0479.2421 1.9113.7263 2.5862.4841.6763 1.1008 1.1831 1.8514 1.5206.7492.3374 1.5565.612 2.4221.821.8655.2091 1.6783.3839 2.4396.5246.4842.1162.9453.2268 1.3835.332s.8128.25 1.1238.4372c.3111.1872.5586.414.7438.6817.184.2678.2773.5998.2773.996 0 .4194-.1217.7637-.3638 1.0314-.2421.2678-.5369.4837-.8831.6462-.3462.164-.7208.2678-1.1238.3143-.403.0464-.7438.0696-1.0197.0696-.3692 0-.7736-.0355-1.2104-.1052-.4382-.0696-.8601-.198-1.2631-.3838-.403-.1859-.756-.4304-1.0549-.7337-.3002-.3019-.4963-.6872-.5882-1.153h-3.9787c.1149 1.0478.4206 1.9399.9169 2.6736.495.7336 1.1184 1.3224 1.8676 1.7651.7492.4426 1.5742.7568 2.4735.944.8993.1858 1.8108.2801 2.7331.2801.9224 0 1.8163-.0929 2.6818-.2801.8642-.1858 1.6377-.4945 2.318-.9263.6802-.4317 1.2333-1.0082 1.6607-1.7309.426-.7214.6396-1.608.6396-2.6559 0-.9782-.1555-1.7705-.4679-2.3771-.311-.6052-.7438-1.1012-1.2969-1.4851z"></path>
                  <path d="m90.909 15.9489c0-1.2815-.1731-2.47-.5193-3.5657-.3462-1.0943-.8709-2.0506-1.5742-2.86626-.7045-.81561-1.5741-1.46181-2.6127-1.93998-1.0373-.47679-2.272-.71588-3.7015-.71588-1.4294 0-2.5722.23909-3.6324.71588-1.0617.47817-1.9664 1.13667-2.7156 1.9755-.7492.83884-1.3213 1.83474-1.7135 2.98784-.3921 1.1531-.5882 2.4291-.5882 3.828 0 1.399.1785 2.7433.5368 3.8978.3571 1.153.9048 2.149 1.6432 2.9892.7384.8388 1.6539 1.4795 2.7507 1.9222 1.0954.4426 2.3707.664 3.8232.664.9453 0 1.8392-.0998 2.6817-.2965.8425-.1981 1.6134-.5123 2.318-.944.7032-.4304 1.3145-.9837 1.8338-1.6599.5193-.6749.8939-1.4796 1.1238-2.4114h-4.049c-.3232.746-.8303 1.2706-1.5214 1.5725-.6924.3033-1.4538.455-2.2842.455-.7843 0-1.47-.1285-2.0583-.3839-.5883-.2569-1.0846-.5998-1.4876-1.0315-.4043-.4304-.7208-.9372-.952-1.5206-.23-.582-.3692-1.2118-.4152-1.888h13.0098c.069-.582.1041-1.1763.1041-1.7829zm-13.0788-1.2227c.069-.6052.2191-1.1763.4504-1.7132.2299-.5355.5369-1.0014.9169-1.3976.3814-.3962.8479-.7104 1.4024-.944.5531-.2323 1.1995-.3498 1.9379-.3498 1.3145 0 2.387.3839 3.2173 1.1531.8304.7691 1.2686 1.8525 1.3159 3.2515h-9.2381z"></path>
                  <path d="m50.3243 0c-1.343 0-2.4303 1.09978-2.4303 2.45503s1.0873 2.45503 2.4303 2.45503c1.3429 0 2.4302-1.09978 2.4302-2.45503s-1.0873-2.45503-2.4302-2.45503z"></path>
                </g>
              </svg>
            )}
          </div>
          <span
            className={`font-bold ${
              option.name == "Petra"
                ? "text-white"
                : option.name == "Martian"
                ? "text-black"
                : "text-white"
            } text-xl`}
          >
            {option.name == "Fewcha" || option.name == "Rise Wallet"
              ? ""
              : option.name}
          </span>
        </button>
      );
    });
  };

  return (
    <HeaderElement>
      <div
        style={{
          display: "flex",
          gap: "12px",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          onClick={handleShowMenu}
          className="flex sm:hidden cursor-pointer ml-4 bg-[#1C1A33] p-3 aspect-square h-full rounded-lg"
        >
          <svg
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 122.88 96.91"
            xmlSpace="preserve"
          >
            <g>
              <path
                fill="white"
                fillRule="evenodd"
                d="M122.88,0v20.05H33.2V0H122.88L122.88,0z M21.13,76.86v20.05H0V76.86H21.13L21.13,76.86z M21.13,38.43v20.05H0 V38.43H21.13L21.13,38.43z M21.13,0v20.05H0V0H21.13L21.13,0z M122.88,76.86v20.05H33.2V76.86H122.88L122.88,76.86z M122.88,38.43 v20.05H33.2V38.43H122.88L122.88,38.43z"
              />
            </g>
          </svg>
        </div>

        {/* {isPlatformPage ? null : (
          <Link href="/platform">
            <div className="w-6 h-6">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                style={{ cursor: "pointer" }}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 13l-4 -4l4 -4m-4 4h11a4 4 0 0 1 0 8h-1" />
              </svg>
            </div>
          </Link>
        )} */}

        <div
          style={{
            backgroundColor: "#112830",
            height: "70%",
            display: "flex",
            gap: "4px",
            padding: "0px 18px",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "8px",
            marginLeft: "20px",
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
              paddingLeft: "8px",
              fontWeight: "bold",
            }}
          >
            Unlocked
          </p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-3 h-full">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginRight: "12px",
          }}
        >
          <div
            style={{
              height: "24px",
              width: "24px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                backgroundColor: "#4169e1",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: "9px",
                  color: "#fff",
                  textAlign: "center",
                }}
              >
                0
              </p>
            </div>
            <svg width="24" height="24" viewBox="0 0 28 28">
              <path
                id="bell_1_BackgroundMask"
                data-name="bell 1 (Background/Mask)"
                d="M0,0H28V28H0Z"
                fill="none"
              />
              <path
                id="Vector"
                d="M21,13.647V9.333a9.333,9.333,0,1,0-18.667,0v4.314L.2,16.853a1.168,1.168,0,0,0,.971,1.814h21a1.168,1.168,0,0,0,.971-1.814h0Z"
                transform="translate(2.334 2.333)"
                fill="#464366"
              />
              <path
                id="Vector-2"
                data-name="Vector"
                d="M7.372,2.524A4.657,4.657,0,0,0,9.03,0H0A4.657,4.657,0,0,0,1.658,2.524,4.657,4.657,0,0,0,4.515,3.5h0A4.657,4.657,0,0,0,7.372,2.524Z"
                transform="translate(9.485 22.167)"
                fill="#464366"
              />
            </svg>
          </div>
          {/* <div
            style={{
              height: "24px",
              width: "24px",
              position: "relative",
              marginLeft: "12px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                backgroundColor: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  color: "#000",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                !
              </p>
            </div>
            <svg width="24" height="24" viewBox="0 0 28 28">
              <path
                id="office_1_BackgroundMask"
                data-name="office 1 (Background/Mask)"
                d="M0,0H28V28H0Z"
                fill="none"
              />
              <path
                id="Vector"
                d="M10.442.793A1.182,1.182,0,0,0,9.333,0H3.5A3.51,3.51,0,0,0,0,3.5V5.833H7.688l3.325-3.325Z"
                transform="translate(2.333 3.5)"
                fill="#464366"
              />
              <path
                id="Vector-2"
                data-name="Vector"
                d="M13.323,0,8.995,4.328a1.2,1.2,0,0,1-.828.338H0V14a3.51,3.51,0,0,0,3.5,3.5H19.833a3.51,3.51,0,0,0,3.5-3.5V3.5a3.51,3.51,0,0,0-3.5-3.5h-6.51Z"
                transform="translate(2.333 7)"
                fill="#464366"
              />
            </svg>
          </div> */}
        </div>
        <div
          style={{
            padding: "12px",
            borderRadius: "16px",
            backgroundColor: "#1c1a33",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              height: "24px",
              width: "24px",
              borderRadius: "50%",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src="/img/solicon.avif" layout="fill" objectFit="cover" />
          </div>
          <p
            style={{
              letterSpacing: "1px",
              fontSize: "12px",
              color: "#ffffff",
              textAlign: "start",
              margin: "0px",
              padding: "0px",
              fontWeight: "bold",
            }}
          >
            {balanceSOL}
          </p>
        </div>
        <div
          style={{
            padding: "12px",
            borderRadius: "16px",
            backgroundColor: "#1c1a33",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              height: "24px",
              width: "24px",
              borderRadius: "50%",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src="/img/iceTicon.avif" layout="fill" objectFit="cover" />
          </div>
          <p
            style={{
              letterSpacing: "1px",
              fontSize: "12px",
              color: "#ffffff",
              textAlign: "start",
              margin: "0px",
              padding: "0px",
              fontWeight: "bold",
            }}
          >
            {balanceICET}
          </p>{" "}
        </div>
        <div
          className="hover:cursor-pointer"
          style={{
            backgroundColor: "#1c1a33",
            padding: "10px 22px",
            margin: "0px 4px",
            borderRadius: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: "24px",
              width: "24px",
              borderRadius: "50%",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
            }}
          >
            <Image
              src="/img/american_flag.png"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <p>English</p>
          <div
            style={{
              height: "6px",
              width: "10px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "12px",
            }}
          >
            <Image src="/img/arrow-20@1x.png" layout="fill" objectFit="fill" />
          </div>
        </div>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={open}>
            <Box sx={style}>
              <p className="font-bold text-2xl w-full pb-4">
                Connect your wallet
              </p>
              {renderWalletConnectorGroup()}
            </Box>
          </Fade>
        </Modal>
        <div className=" text-black tracking-wider my-12 text-center">
          {connected && account?.address ? (
            <button
              onClick={async () => {
                disconnect();
              }}
              className={`bg-[#171717] 
                hover:opacity-70 px-5 rounded-md ml-4 justify-around items-center flex flex-row relative py-2 mr-2`}
            >
              <Image
                src="/img/aptos.png"
                height={24}
                width={24}
                objectFit="contain"
                className="aspect-square"
              />
              <p className="text-white ml-3 text-ellipsis overflow-hidden">
                {account?.address.toString().substring(0, 10)}...
              </p>
            </button>
          ) : (
            <button
              onClick={async () => {
                // const result = await (window as any).aptos.connect();
                // setAptosWallet(result);

                handleOpen();
              }}
              className={`bg-[#171717] 
                hover:opacity-70 px-5 rounded-md ml-4 justify-around items-center flex flex-row relative py-2 mr-2`}
            >
              <Image
                src="/img/aptos.png"
                height={24}
                width={24}
                objectFit="contain"
                className="aspect-square"
              />
              <p className="text-white ml-3 text-ellipsis overflow-hidden">
                Connect
              </p>
            </button>
          )}
        </div>
        <div
          style={{
            width: "1px",
            margin: "0px 4px",
            marginLeft: "6px",
            height: "60%",
            backgroundColor: "#464366",
          }}
        />
        <WalletMultiButton />
        {/* <LoginDiscord /> */}
      </div>
      <div
        onClick={() => setShowMobileMenu((s) => !s)}
        className="flex md:hidden px-3"
      >
        <svg
          width="16px"
          height="16px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            className="transition-all"
            fill="none"
            stroke="white"
            strokeWidth="2"
            points="7.086 3.174 17.086 13.174 7.086 23.174"
            transform={`scale(1 -1) rotate(${showMobileMenu ? "" : "-"}90 0 0)`}
            style={{ transformOrigin: "center" }}
          />
        </svg>
      </div>

      {/* Mobile Navbar */}
      {showMobileMenu && (
        <div className="md:hidden flex flex-col gap-2 absolute z-50 right-0 top-16 p-4 rounded-b-md shadow-lg bg-[#15132B]">
          <WalletMultiButton />
          <LoginDiscord />
          <div className="flex flex-row justify-center gap-2">
            <div>
              <svg width="24" height="24" viewBox="0 0 28 28">
                <path
                  id="bell_1_BackgroundMask"
                  data-name="bell 1 (Background/Mask)"
                  d="M0,0H28V28H0Z"
                  fill="none"
                />
                <path
                  id="Vector"
                  d="M21,13.647V9.333a9.333,9.333,0,1,0-18.667,0v4.314L.2,16.853a1.168,1.168,0,0,0,.971,1.814h21a1.168,1.168,0,0,0,.971-1.814h0Z"
                  transform="translate(2.334 2.333)"
                  fill="#464366"
                />
                <path
                  id="Vector-2"
                  data-name="Vector"
                  d="M7.372,2.524A4.657,4.657,0,0,0,9.03,0H0A4.657,4.657,0,0,0,1.658,2.524,4.657,4.657,0,0,0,4.515,3.5h0A4.657,4.657,0,0,0,7.372,2.524Z"
                  transform="translate(9.485 22.167)"
                  fill="#464366"
                />
              </svg>
            </div>
            <div>
              <svg width="24" height="24" viewBox="0 0 28 28">
                <path
                  id="office_1_BackgroundMask"
                  data-name="office 1 (Background/Mask)"
                  d="M0,0H28V28H0Z"
                  fill="none"
                />
                <path
                  id="Vector"
                  d="M10.442.793A1.182,1.182,0,0,0,9.333,0H3.5A3.51,3.51,0,0,0,0,3.5V5.833H7.688l3.325-3.325Z"
                  transform="translate(2.333 3.5)"
                  fill="#464366"
                />
                <path
                  id="Vector-2"
                  data-name="Vector"
                  d="M13.323,0,8.995,4.328a1.2,1.2,0,0,1-.828.338H0V14a3.51,3.51,0,0,0,3.5,3.5H19.833a3.51,3.51,0,0,0,3.5-3.5V3.5a3.51,3.51,0,0,0-3.5-3.5h-6.51Z"
                  transform="translate(2.333 7)"
                  fill="#464366"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-row p-2 gap-2">
            <div
              style={{
                padding: "12px",
                borderRadius: "16px",
                backgroundColor: "#1c1a33",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  height: "24px",
                  width: "24px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  src="/img/solicon.avif"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <p
                style={{
                  letterSpacing: "1px",
                  fontSize: "12px",
                  color: "#ffffff",
                  textAlign: "start",
                  margin: "0px",
                  padding: "0px",
                  fontWeight: "bold",
                }}
              >
                {balanceSOL}
              </p>
            </div>
            <div
              style={{
                padding: "12px",
                borderRadius: "16px",
                backgroundColor: "#1c1a33",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  height: "24px",
                  width: "24px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  src="/img/iceTicon.avif"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <p
                style={{
                  letterSpacing: "1px",
                  fontSize: "12px",
                  color: "#ffffff",
                  textAlign: "start",
                  margin: "0px",
                  padding: "0px",
                  fontWeight: "bold",
                }}
              >
                {balanceICET}
              </p>
            </div>
          </div>
        </div>
      )}
    </HeaderElement>
  );
}
