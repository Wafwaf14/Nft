// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { getProvider, web3 } from '@project-serum/anchor';
import { Connection, Transaction } from '@solana/web3.js';

export const AirdropView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const [clicked, setClicked] = useState(false)
  useEffect(() => {
    if (wallet.publicKey) {
      // console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])


useEffect(()=>{
if (clicked){
    const sendTransactionButton = async () => {
        const from = web3.Keypair.generate();
        // const airdropSignature = await connection.requestAirdrop(
        //   from.publicKey,
        //   web3.LAMPORTS_PER_SOL*2, // 10000000 Lamports in 1 SOL
        // );
        // await connection.confirmTransaction(airdropSignature);
      
        // Generate a new random public key
        
      
        const provider = getProvider(); // see "Detecting the Provider"
        const network = "devnet";
        const connection = new Connection(network);
        const transaction = new Transaction();
        const  signature  = await provider.send(transaction);
        await connection.getSignatureStatus(signature);

       
        // console.log('SIGNATURE', signature)
        // console.log('>>> wallet ',getUserSOLBalance(wallet.publicKey,connection))
    }

    sendTransactionButton();
}
},[clicked])

  

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Scaffold Lite <span className='text-sm font-normal align-top text-slate-700'>v{pkg.version}</span>
        </h1>
        <h4 className="md:w-full text-center text-slate-300 my-2">
          <p>Simply the fastest way to get started.</p>
          Next.js, tailwind, wallet, web3.js, and more.
        </h4>
        <div className="max-w-md mx-auto mockup-code bg-primary p-6 my-2">
          <pre data-prefix=">">
            <code className="truncate">Start building on Solana  </code>
          </pre>
        </div>        
          <div className="text-center">
          <RequestAirdrop />
          <button onClick={()=>{
            setClicked(!clicked)
          }}>

            Receive sol from wallet
          </button>
          {/* {wallet.publicKey && <p>Public Key: {wallet.publicKey.toBase58()}</p>} */}
          {wallet && <p>SOL Balance: {(balance || 0).toLocaleString()}</p>}
        </div>
      </div>
    </div>
  );
};