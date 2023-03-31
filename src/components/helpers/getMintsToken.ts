import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, GetProgramAccountsFilter } from "@solana/web3.js";

export function getMintsTokens(walletToQuery?: string | null) {
  const rpcEndpoint =
    "https://evocative-few-hexagon.solana-mainnet.discover.quiknode.pro/fefbb9b62dc0293830fa23ead4a295286cdde6fd/";
  const solanaConnection = new Connection(rpcEndpoint);

  async function getTokenAccounts(
    wallet: string,
    solanaConnection: Connection
  ) {
    const filters: GetProgramAccountsFilter[] = [
      {
        dataSize: 165, //size of account (bytes)
      },
      {
        memcmp: {
          offset: 32, //location of our query in the account (bytes)
          bytes: wallet, //our search criteria, a base58 encoded string
        },
      },
    ];
    const accounts = await solanaConnection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID, //new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      { filters: filters }
    );
    // // console.log(`Found ${accounts.length} token account(s) for wallet ${wallet}.`);
    return accounts.map((account, i) => {
      //Parse the account data
      const parsedAccountInfo: any = account.account.data;
      const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
      const tokenBalance: number =
        parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
      //Log results
      return mintAddress;
    });
  }
  if (walletToQuery) {
    return getTokenAccounts(walletToQuery, solanaConnection);
  } else {
    // console.log('>>> Yout wallet publickey is null ')
    return null;
  }
}

export function getMintsTokensBalance(walletToQuery?: string | null) {
  const rpcEndpoint =
    "https://evocative-few-hexagon.solana-mainnet.discover.quiknode.pro/fefbb9b62dc0293830fa23ead4a295286cdde6fd/";
  const solanaConnection = new Connection(rpcEndpoint);

  async function getTokenAccounts(
    wallet: string,
    solanaConnection: Connection
  ) {
    const filters: GetProgramAccountsFilter[] = [
      {
        dataSize: 165, //size of account (bytes)
      },
      {
        memcmp: {
          offset: 32, //location of our query in the account (bytes)
          bytes: wallet, //our search criteria, a base58 encoded string
        },
      },
    ];
    const accounts = await solanaConnection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID, //new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      { filters: filters }
    );
    // console.log(`Found ${accounts.length} token account(s) for wallet ${wallet}.`);
    return accounts.map((account, i) => {
      //Parse the account data
      const parsedAccountInfo: any = account.account.data;

      const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
      const tokenBalance: number =
        parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
      //Log results

      return { mintAddress, tokenBalance };
    });
  }
  if (walletToQuery) {
    return getTokenAccounts(walletToQuery, solanaConnection);
  } else {
    // console.log('>>> Yout wallet publickey is null ')
    return null;
  }
}
