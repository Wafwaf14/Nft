// Next, React
import { FC } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet } from '@solana/wallet-adapter-react';

import { HomePageConnection } from 'components/HomePageConnection';
import { ContainerApp } from 'components/HomePageConnection/HomePageConnection.style';
import  {HomePageDisplayNFT}  from 'components/HomePageDisplayNFT';

export const HomeView: FC = ({ }) => {
  const wallet = useWallet();

  return (
<ContainerApp>
      <HomePageConnection wallet={wallet}/>
      <HomePageDisplayNFT wallet={wallet}/>
 </ContainerApp>
  );
}
