import { Header } from "components/Platform/Header";
import { ContainerContent } from "components/Platform/ListCollections/ListCollections.style";
import { Menu } from "components/Platform/Menu";
import { Container } from "components/Platform/Platform.style";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { CrossmintPayButton } from "@crossmint/client-sdk-react-ui";
import { MintButton } from "components/MintButton";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Session } from "next-auth";
import { SendTransaction } from "components/SendTransaction";
import { SignMessage } from "components/SignMessage";
import { javascript } from "webpack";
import Loader from "components/Platform/ListCollections/loader";

const Scheduling: NextPage = (props) => {
  const [showMenu, setShowMenu] = useState(false);

  const router = useRouter();
  const [session, setSession] = useState<Session>();

  const [loading, setLoading] = useState(true);

  const handleShowMenu = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const [token, setToken] = useState("");
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

  const [premintProjects, setPremintProjects] = useState([]);
  const [mintProjects, setMintProjects] = useState([]);

  const getScheduledProjects = async () => {
    fetch("/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((request) => request.json())
      .then(({ id }) => {
        fetch(
          "api/premints?populate=project&&sort[0]=createdAt%3Adesc&&[filters][user][id][$eq]=" +
            id,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
          .then((response) => response.json())
          .then(({ data }) => {
            // setScheduledProjects(data ? data : []);
            data &&
              data.map((item: any) => {
                const itemm = item;
                itemm.count = 1;
                if (itemm.attributes) {
                  if (itemm.attributes.status == "Done") {
                    setMintProjects((mintProjects) => [...mintProjects, itemm]);
                  } else {
                    setPremintProjects((premintProjects) => [
                      ...premintProjects,
                      itemm,
                    ]);
                  }
                }
              });
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
          });
      });
  };

  useEffect(() => {
    token && getScheduledProjects();
  }, [token]);

  const updateStatus = (id: any) => {
    let newScheduledProjects = premintProjects;
    const index = premintProjects.findIndex((item) => item.id === id);
    newScheduledProjects[index].attributes.status = "Done";
    setPremintProjects((prevScheduledProjects) =>
      prevScheduledProjects.map((item) =>
        item.id == id ? newScheduledProjects[index] : item
      )
    );
  };

  const addCount = (id: any) => {
    let newScheduledProjects = premintProjects;
    const index = premintProjects.findIndex((item) => item.id === id);
    if (
      newScheduledProjects[index].count <
      (newScheduledProjects[index]?.attributes?.project?.data?.attributes
        ?.premint_max_user ?? 1)
    ) {
      newScheduledProjects[index].count = newScheduledProjects[index].count + 1;
    }
    setPremintProjects((prevScheduledProjects) =>
      prevScheduledProjects.map((item) =>
        item.id == id ? newScheduledProjects[index] : item
      )
    );
  };

  const removeCount = (id: any) => {
    let newScheduledProjects = premintProjects;
    const index = premintProjects.findIndex((item) => item.id === id);
    if (newScheduledProjects[index].count > 1) {
      newScheduledProjects[index].count = newScheduledProjects[index].count - 1;
      setPremintProjects((prevScheduledProjects) =>
        prevScheduledProjects.map((item) =>
          item.id == id ? newScheduledProjects[index] : item
        )
      );
    }
  };

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
            {!loading ? (
              <>
                <div className="w-full">
                  <p className="text-2xl font-bold my-4">Premint</p>
                  <div className="flex flex-col justify-between w-full gap-6">
                    {premintProjects.map((item, index) => {
                      return (
                        <div
                          key={index}
                          className="flex flex-col gap-4 bg-[#16162a] rounded-lg p-6 w-full"
                        >
                          <div className="flex flex-col sm:flex-row items-center">
                            <div className="flex flex-col sm:flex-row w-full sm:w-1/2 items-center">
                              <div
                                className={`flex-none w-full sm:w-40 aspect-square relative rounded-xl overflow-hidden`}
                              >
                                <Image
                                  src={
                                    item?.attributes?.project?.data?.attributes
                                      ?.img_url
                                      ? item.attributes.project.data.attributes
                                          .img_url
                                      : "/img/logo.webp"
                                  }
                                  layout="fill"
                                  className="aspect-square"
                                />
                              </div>
                              <div className="flex flex-col sm:pl-8 sm:py-4 py-6 text-xl justify-evenly h-full w-full">
                                <p className="text-2xl font-bold">
                                  {item?.attributes?.project?.data?.attributes
                                    ?.name
                                    ? item?.attributes?.project?.data
                                        ?.attributes?.name
                                    : ""}
                                </p>
                                <p className="text-base pt-2">
                                  {item?.attributes?.project?.data?.attributes
                                    ?.premint_price
                                    ? item.attributes.project.data.attributes
                                        .premint_price + " SOL"
                                    : "No price"}
                                </p>
                                <p className="text-base pt-2">
                                  {new Date(
                                    item?.attributes?.project?.data?.attributes?.publishedAt
                                  ).toUTCString()}
                                </p>
                              </div>
                            </div>
                            {item?.attributes?.status != "Done" ? (
                              !item?.attributes?.project?.data?.attributes
                                ?.premint_ended ? (
                                <div className="flex flex-col sm:flex-row items-center sm:w-3/5 w-full ">
                                  {/* <MintButton
                        backgroundButtonMint={"#730484"}
                        candyMachineID={
                          item?.attributes?.project?.data?.attributes
                            ?.candy_machine_id
                            ? item?.attributes?.project?.data?.attributes
                                ?.candy_machine_id
                            : ""
                        }
                      /> */}

                                  <div className="mx-3  py-1 flex flex-col items-center bg-[#252538] rounded-md">
                                    <button
                                      onClick={() => addCount(item?.id)}
                                      className="rotate-180"
                                    >
                                      <Image
                                        src={"/img/arrow_down.png"}
                                        height={6}
                                        width={12}
                                        className="aspect-square"
                                      />
                                    </button>
                                    <p className="text-sm px-3">
                                      {item?.count}
                                    </p>
                                    <button
                                      onClick={() => removeCount(item?.id)}
                                    >
                                      <Image
                                        src={"/img/arrow_down.png"}
                                        height={6}
                                        width={12}
                                        className="aspect-square"
                                      />
                                    </button>
                                  </div>
                                  <SendTransaction
                                    projectId={item?.id}
                                    price={
                                      item?.attributes?.project?.data
                                        ?.attributes?.premint_price
                                    }
                                    total={item?.count ? item?.count : 1}
                                    updateStatus={() => updateStatus(item?.id)}
                                  />
                                  <button
                                    disabled={
                                      // !item?.attributes?.project?.data?.attributes
                                      //   ?.status
                                      true
                                    }
                                    className="w-full bg-blue-900 mx-4 rounded-lg text-white shadow-sm  h-12 my-4"
                                  >
                                    <p>Buy with Ice</p>
                                  </button>
                                  <CrossmintPayButton
                                    collectionTitle={"test"}
                                    collectionDescription={"test"}
                                    collectionPhoto={"/img/4823@1x.png"}
                                    clientId="7e94eb71-06c0-447f-9272-677416fee1d5"
                                    style={{ width: "100%", fontSize: "12px" }}
                                    disabled
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row items-center sm:w-1/2 w-full ">
                                  <button
                                    disabled={true}
                                    className="w-full bg-red-700 mx-4 rounded-lg text-white shadow-sm  h-12 my-4"
                                  >
                                    <p>Pre-mint Ended</p>
                                  </button>
                                </div>
                              )
                            ) : (
                              <div className="flex flex-col sm:flex-row items-center sm:w-1/2 w-full ">
                                <button
                                  disabled={true}
                                  className="w-full bg-green-600 mx-4 rounded-lg text-white shadow-sm  h-12 my-4"
                                >
                                  <p>Pre-mint successful !</p>
                                </button>
                              </div>
                            )}
                            <div className="flex flex-col ml-auto justify-evenly gap-4"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="w-full">
                  {mintProjects.length > 0 && (
                    <p className="text-2xl my-4 font-bold">Minted</p>
                  )}
                  <div className="flex flex-col justify-between w-full gap-6">
                    {mintProjects.map((item, index) => {
                      return (
                        <div
                          key={index}
                          className="flex flex-col gap-4 bg-[#16162a] rounded-lg p-6 w-full"
                        >
                          <div className="flex flex-col sm:flex-row items-center">
                            <div className="flex flex-col sm:flex-row w-full sm:w-1/2 items-center">
                              <div
                                className={`flex-none w-full sm:w-40 aspect-square relative rounded-xl overflow-hidden`}
                              >
                                <Image
                                  src={
                                    item?.attributes?.project?.data?.attributes
                                      ?.img_url
                                      ? item.attributes.project.data.attributes
                                          .img_url
                                      : "/img/logo.webp"
                                  }
                                  layout="fill"
                                  className="aspect-square"
                                />
                              </div>
                              <div className="flex flex-col sm:pl-8 sm:py-4 py-6 text-xl justify-evenly h-full w-full">
                                <p className="text-2xl font-bold">
                                  {item?.attributes?.project?.data?.attributes
                                    ?.name
                                    ? item?.attributes?.project?.data
                                        ?.attributes?.name
                                    : ""}
                                </p>
                                <p className="text-base pt-2">
                                  {item?.attributes?.project?.data?.attributes
                                    ?.premint_price
                                    ? item.attributes.project.data.attributes
                                        .premint_price + " SOL"
                                    : "No price"}
                                </p>
                                <p className="text-base pt-2">
                                  {new Date(
                                    item?.attributes?.project?.data?.attributes?.publishedAt
                                  ).toUTCString()}
                                </p>
                              </div>
                            </div>

                            {item?.attributes?.status != "Done" ? (
                              !item?.attributes?.project?.data?.attributes
                                ?.premint_ended ? (
                                <div className="flex flex-col sm:flex-row items-center sm:w-1/2 w-full ">
                                  {/* <MintButton
                        backgroundButtonMint={"#730484"}
                        candyMachineID={
                          item?.attributes?.project?.data?.attributes
                            ?.candy_machine_id
                            ? item?.attributes?.project?.data?.attributes
                                ?.candy_machine_id
                            : ""
                        }
                      /> */}

                                  <SendTransaction
                                    projectId={item?.id}
                                    price={
                                      item?.attributes?.project?.data
                                        ?.attributes?.premint_price
                                    }
                                    total={1}
                                    updateStatus={() => updateStatus(item?.id)}
                                  />
                                  <button
                                    disabled={
                                      // !item?.attributes?.project?.data?.attributes
                                      //   ?.status
                                      true
                                    }
                                    className="w-full bg-blue-900 mx-4 rounded-lg text-white shadow-sm  h-12 my-4"
                                  >
                                    <p>Buy with Ice</p>
                                  </button>
                                  <CrossmintPayButton
                                    collectionTitle={"test"}
                                    collectionDescription={"test"}
                                    collectionPhoto={"/img/4823@1x.png"}
                                    clientId="7e94eb71-06c0-447f-9272-677416fee1d5"
                                    style={{ width: "100%", fontSize: "12px" }}
                                    disabled
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row items-center sm:w-1/2 w-full ">
                                  <button
                                    disabled={true}
                                    className="w-full bg-red-700 mx-4 rounded-lg text-white shadow-sm  h-12 my-4"
                                  >
                                    <p>Pre-mint Ended</p>
                                  </button>
                                </div>
                              )
                            ) : (
                              <div className="flex flex-col sm:flex-row items-center sm:w-1/2 w-full ">
                                <button
                                  disabled={true}
                                  className="w-full bg-green-600 mx-4 rounded-lg text-white shadow-sm  h-12 my-4"
                                >
                                  <p>Pre-mint successful !</p>
                                </button>
                              </div>
                            )}
                            <div className="flex flex-col ml-auto justify-evenly gap-4"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full flex h-5/6 justify-center items-center">
                <Loader />
              </div>
            )}
          </ContainerContent>
        </div>
      </Container>
    </div>
  );
};

export default Scheduling;
