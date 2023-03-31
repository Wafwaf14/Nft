import { Header } from "components/Platform/Header";
import { ContainerContent } from "components/Platform/ListCollections/ListCollections.style";
import { Menu } from "components/Platform/Menu";
import { Container } from "components/Platform/Platform.style";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getSession } from "next-auth/react";

const Settings: NextPage = (props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const handleShowMenu = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const fetchToken = async () => {
    const csrfToken = await fetch("/api/get-token-example")
      .then((response) => response.json())
      .then(({ jwt }) => jwt);
    setToken(csrfToken);
  };

  const fetchSession = async () => {
    const session = await getSession();
    setUser(session.user);
  };

  useEffect(() => {
    fetchToken();
    fetchSession();
  }, []);

  useEffect(() => {
    token &&
      fetch("/api/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((request) => request.json())
        .then(({ id }) => {
          fetch("/api/premints?populate=user&&[filters][user][id][$eq]=" + id, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => response.json())
            .then(({ data }) => {
              setTransactions(data);
            });
        });
  }, [user, token]);

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
            <div className="flex flex-col sm:flex-row justify-between w-full gap-6">
              <div className="flex flex-col gap-4 bg-[#16162a] rounded-lg p-8 w-full">
                <div className="flex flex-col sm:flex-row w-full">
                  <div
                    className={`
                  "h-1/2 w-1/2 aspect-square relative rounded-xl overflow-hidden`}
                  >
                    <Image
                      src={user ? user.image : "/img/logo.webp"}
                      layout="fill"
                      objectFit="contain"
                      className="aspect-square"
                    />
                  </div>
                  <div className="flex flex-col sm:pl-12 py-2 text-xl justify-center">
                    <p className="font-bold text-3xl mb-4">
                      {user ? user.name : ""}
                    </p>
                  </div>
                </div>
                {/* <WalletMultiButton
                  className="bg-[#730484] justify-center mt-2 w-full"
                  startIcon={
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
                        fill="#fff"
                      />
                      <path
                        id="Vector-2"
                        data-name="Vector"
                        d="M13.323,0,8.995,4.328a1.2,1.2,0,0,1-.828.338H0V14a3.51,3.51,0,0,0,3.5,3.5H19.833a3.51,3.51,0,0,0,3.5-3.5V3.5a3.51,3.51,0,0,0-3.5-3.5h-6.51Z"
                        transform="translate(2.333 7)"
                        fill="#fff"
                      />
                    </svg>
                  }
                /> */}
              </div>
              <div className="flex flex-col gap-4 bg-[#16162a] rounded-lg p-8 w-full "></div>
            </div>
            <div className="flex flex-col  bg-[#16162a] rounded-lg p-8 pt-6 w-full mt-6">
              <p className="text-xl pb-6 font-bold">Transaction history</p>
              <div className="overflow-x-auto relative rounded-md">
                <table className="w-full text-sm text-left text-gray-500 ">
                  <thead className="text-xs text-white uppercase bg-[#730484] ">
                    <tr>
                      <th scope="col" className="py-3 pl-6"></th>
                      <th scope="col" className="py-3 pr-6">
                        Name
                      </th>
                      <th scope="col" className="py-3 px-6">
                        Transaction id
                      </th>
                      <th scope="col" className="py-3 px-6">
                        time
                      </th>
                      <th scope="col" className="py-3 px-6">
                        status
                      </th>
                    </tr>
                  </thead>
                  {transactions &&
                    transactions.map((item) => {
                      return (
                        <tbody>
                          <tr className=" border-t bg-gray-800 border-gray-700 text-white">
                            <td className="py-4 pl-6">
                              <Image
                                src={"/img/logo.webp"}
                                layout="fixed"
                                objectFit="contain"
                                width={40}
                                height={40}
                              />
                            </td>
                            <td className="py-4 pr-6">
                              {item.attributes.user.data.attributes.username}
                            </td>
                            <td className="py-4 px-6">
                              {item.attributes.transaction}
                            </td>
                            <td className="py-4 px-6">
                              {new Date(
                                item.attributes.createdAt
                              ).toUTCString()}
                            </td>
                            <td className={`py-4 px-6 `}>
                              {item.attributes.status}
                            </td>
                          </tr>
                        </tbody>
                      );
                    })}
                </table>
              </div>
            </div>
          </ContainerContent>
        </div>
      </Container>
    </div>
  );
};

export default Settings;
