import { useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import {
  ContainerClickedDiv,
  ContainerClickGlowDiv,
  ContainerForm,
  ContainerInput,
  ContainerScreen,
  ContentMainForm,
  FooterForm,
  FormInput,
  HeaderForm,
  LabelInput,
} from "./FormOnBoarding.style";
import { HeaderSteps } from "./HeaderSteps";

import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import { getMintsTokens } from "components/helpers/getMintsToken";
import { getBestNFt } from "components/helpers/getBestNFT";
import dataKing from "../../data/PengSol_king.json";
import { useAtom } from "jotai";
import { AlertScheduleAtom } from "components/ScheduleButton/store";
import styled from "styled-components";
import { checkURL } from "components/helpers/checkURL";

const CustomPError = styled.p`
  font-size: 16px;
  color: #ff0000;
  margin: 0px;
`;

export function FormOnBoarding(): JSX.Element {
  const [requestProject, setRequestProject] = useState(true);

  const [collectionBasics, setCollectionBasics] = useState({
    name: "",
    description: "",
    collectionImgURL: "",
  });

  const [collectionBasicsErrors, setCollectionBasicsErrors] = useState({
    name: "",
    description: "",
    collectionImgURL: "",
  });

  const [collectionDetails, setCollectionDetails] = useState({
    price: 0,
    supply: 0,
    doxxed: false,
  });

  const [collectionSocialMedia, setCollectionSocialMedia] = useState({
    collectionTwitterAcc: "",
    collectionDiscord: "",
    discordContact: "",
    candyMachineID: "",
  });

  const [collectionSocialMediaErrors, setCollectionSocialMediaErrors] =
    useState({
      collectionTwitterAcc: "",
      discordContact: "",
    });

  const [alert, setAlert] = useState("");

  const [steps, setSteps] = useState(0);

  const springStepStart = useSpring({
    transform: steps === 0 ? "translateX(0%)" : "translateX(-100%)",
  });

  const springStepBasic = useSpring({
    transform:
      steps === 1
        ? "translateX(-100%)"
        : steps > 1
        ? "translateX(-200%)"
        : "translateX(0%)",
  });

  const springStepSocialMedia = useSpring({
    transform:
      steps === 2
        ? "translateX(-200%)"
        : steps > 2
        ? "translateX(-300%)"
        : steps === 1
        ? "translateX(-100%)"
        : "translateX(0%)",
  });

  const springStepCandyMachine = useSpring({
    transform:
      steps === 3
        ? "translateX(-300%)"
        : steps > 3
        ? "translateX(-400%)"
        : steps === 2
        ? "translateX(-200%)"
        : steps === 2
        ? "translateX(-100%)"
        : "translateX(0%)",
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      console.log(">>> block tab");
      function handleKey(e) {
        if (e.key === "Tab") {
          e.preventDefault();
          this.focus();
        }
      }

      const inputs = document.querySelectorAll("input");
      inputs.forEach((input) =>
        input.addEventListener("keydown", handleKey, true)
      );
    }
  }, []);

  const router = useRouter();
  const wallet = useWallet();

  const [alertStateSchedule, setAlertStateSchedule] =
    useAtom(AlertScheduleAtom);

  const [session, setSession] = useState(null);

  const [token, setToken] = useState("");

  useEffect(() => {
    // const fetchToken = async () => {
    //   const csrfToken = await fetch("/api/get-token-example")
    //     .then((response) => response.json())
    //     .then(({ jwt }) => jwt);
    //   setToken(csrfToken);
    // };
    //fetchToken()

    const fetchSession = async () => {
      const session = await getSession();
      if (!session) {
        //router.push("/");
      }
      setSession(session);
      // console.log('>>> session : ',session)
    };
    fetchSession();
  }, []);

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
            //  router.push("/");
          }
        } catch (error) {
          // console.log(error);
        }
      };
      fetchData();
    }
  }, [wallet]);

  return (
    <ContainerForm
      style={{
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div className="flex flex-col mb-20 rounded-lg p-8 w-1/2">
        <HeaderForm>
          <HeaderSteps step={steps} />
        </HeaderForm>
      </div>
      <div className="flex flex-col gap-10 bg-[#16162a]  rounded-lg p-8 w-1/2">
        {alert && <div className="bg-[#d76c6c] p-3 text-center">{alert} </div>}
        <ContentMainForm>
          <ContainerScreen style={springStepStart} className="mt-16">
            <ContainerClickGlowDiv
              onClick={() => {
                setRequestProject(true);
                setSteps(steps + 1);
              }}
            >
              Request a project{" "}
            </ContainerClickGlowDiv>
            <ContainerClickGlowDiv
              onClick={() => {
                setRequestProject(false);
                setSteps(steps + 1);
              }}
            >
              Project owner
            </ContainerClickGlowDiv>
          </ContainerScreen>
          <ContainerScreen style={springStepBasic}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <ContainerInput>
                <LabelInput>Collection Name*</LabelInput>

                <FormInput
                  placeholder="Collection Name"
                  value={collectionBasics.name}
                  onChange={(e) => {
                    setCollectionBasics({
                      ...collectionBasics,
                      name: e.target.value,
                    });
                  }}
                />
              </ContainerInput>
              <ContainerInput style={{ justifyContent: "start" }}>
                <CustomPError>{collectionBasicsErrors.name}</CustomPError>
              </ContainerInput>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <ContainerInput>
                <LabelInput>Description*</LabelInput>
                <FormInput
                  placeholder="Description"
                  value={collectionBasics.description}
                  onChange={(e) => {
                    setCollectionBasics({
                      ...collectionBasics,
                      description: e.target.value,
                    });
                  }}
                />
              </ContainerInput>
              <ContainerInput style={{ justifyContent: "start" }}>
                <CustomPError>
                  {collectionBasicsErrors.description}
                </CustomPError>
              </ContainerInput>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <ContainerInput>
                <LabelInput>Collection Image URL*</LabelInput>
                <FormInput
                  placeholder="Collection Image URL"
                  value={collectionBasics.collectionImgURL}
                  onChange={(e) => {
                    setCollectionBasics({
                      ...collectionBasics,
                      collectionImgURL: e.target.value,
                    });
                  }}
                />
              </ContainerInput>
              <ContainerInput style={{ justifyContent: "start" }}>
                <CustomPError>
                  {collectionBasicsErrors.collectionImgURL}
                </CustomPError>
              </ContainerInput>
            </div>
          </ContainerScreen>
          <ContainerScreen style={springStepSocialMedia}>
            <ContainerInput>
              <LabelInput>Price</LabelInput>
              <FormInput
                placeholder="Price"
                value={collectionDetails.price}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setCollectionDetails({ ...collectionDetails, price: 0 });
                  } else if (parseFloat(e.target.value)) {
                    setCollectionDetails({
                      ...collectionDetails,
                      price: parseFloat(e.target.value),
                    });
                  }
                }}
              />
            </ContainerInput>
            <ContainerInput>
              <LabelInput>Supply</LabelInput>
              <FormInput
                placeholder="Supply"
                value={collectionDetails.supply}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setCollectionDetails({ ...collectionDetails, supply: 0 });
                  } else if (parseFloat(e.target.value)) {
                    setCollectionDetails({
                      ...collectionDetails,
                      supply: parseFloat(e.target.value),
                    });
                  }
                }}
              />
            </ContainerInput>
            {/* <ContainerInput>
            <LabelInput>Doxxed</LabelInput>
            <FormInput placeholder="Doxxed"  />
          </ContainerInput> */}
          </ContainerScreen>

          <ContainerScreen style={springStepCandyMachine}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <ContainerInput>
                <LabelInput>Collection Twitter account*</LabelInput>
                <FormInput
                  placeholder="Collection Twitter account "
                  value={collectionSocialMedia.collectionTwitterAcc}
                  onChange={(e) => {
                    setCollectionSocialMedia({
                      ...collectionSocialMedia,
                      collectionTwitterAcc: e.target.value,
                    });
                  }}
                />
              </ContainerInput>
              <ContainerInput style={{ justifyContent: "start" }}>
                <CustomPError>
                  {collectionSocialMediaErrors.collectionTwitterAcc}
                </CustomPError>
              </ContainerInput>
            </div>

            <ContainerInput>
              <LabelInput>Collection Discord</LabelInput>
              <FormInput
                placeholder="Collection Discord"
                value={collectionSocialMedia.collectionDiscord}
                onChange={(e) => {
                  setCollectionSocialMedia({
                    ...collectionSocialMedia,
                    collectionDiscord: e.target.value,
                  });
                }}
              />
            </ContainerInput>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <ContainerInput>
                <LabelInput>Discord Contact*</LabelInput>
                <FormInput
                  placeholder="Discord Contact"
                  value={collectionSocialMedia.discordContact}
                  onChange={(e) => {
                    setCollectionSocialMedia({
                      ...collectionSocialMedia,
                      discordContact: e.target.value,
                    });
                  }}
                />
              </ContainerInput>
              <ContainerInput style={{ justifyContent: "start" }}>
                <CustomPError>
                  {collectionSocialMediaErrors.discordContact}
                </CustomPError>
              </ContainerInput>
            </div>
            <ContainerInput>
              <LabelInput>Candy Machine ID</LabelInput>
              <FormInput
                placeholder="Candy Machine ID"
                value={collectionSocialMedia.candyMachineID}
                onChange={(e) => {
                  setCollectionSocialMedia({
                    ...collectionSocialMedia,
                    candyMachineID: e.target.value,
                  });
                }}
              />
            </ContainerInput>
          </ContainerScreen>
        </ContentMainForm>
        <FooterForm>
          {steps > 0 ? (
            <ContainerClickGlowDiv
              style={{
                width: "fit-content",
                padding: "4px 24px",
                height: "35px",
              }}
              onClick={() => {
                setAlert("");
                setSteps(steps - 1);
              }}
            >
              Previous
            </ContainerClickGlowDiv>
          ) : (
            <div />
          )}
          {/*<div>{alert}</div>*/}
          {steps === 0 ? (
            <div />
          ) : steps === 3 ? (
            <ContainerClickGlowDiv
              style={{
                width: "fit-content",
                padding: "4px 24px",
                height: "35px",
              }}
              onClick={() => {
                if (
                  collectionSocialMedia.collectionTwitterAcc === "" ||
                  collectionSocialMedia.discordContact === ""
                ) {
                  setAlert("Please Complete the fields");
                  setCollectionSocialMediaErrors({
                    collectionTwitterAcc:
                      collectionSocialMedia.collectionTwitterAcc === ""
                        ? "Enter a correct Twitter Account"
                        : "",
                    discordContact:
                      collectionSocialMedia.discordContact === ""
                        ? "Enter a correct Discord Contact Account"
                        : "",
                  });
                } else {
                  setAlert("");
                  setCollectionSocialMediaErrors({
                    collectionTwitterAcc: "",
                    discordContact: "",
                  });
                  const requestOptions = {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      data: {
                        name: collectionBasics.name,
                        description: collectionBasics.description,
                        img_url: collectionBasics.collectionImgURL,
                        discord: collectionSocialMedia.collectionDiscord,
                        twitter: collectionSocialMedia.collectionTwitterAcc,
                        type: "NFT",
                        candy_machine_id: collectionSocialMedia.candyMachineID,
                        supply: collectionDetails.supply,
                        price: collectionDetails.price,
                        doxed: collectionDetails.doxxed,
                      },
                    }),
                  };
                  fetch("/api/onboardings", requestOptions)
                    .then((response) => response.json())
                    .then((data) => console.log(">>> data : ", data));

                  setAlertStateSchedule({
                    open: true,
                    message: "Application submitted successfully",
                    severity: "success",
                    hideDuration: 4000,
                  });
                  router.push("/platform");
                }
              }}
            >
              Submit
            </ContainerClickGlowDiv>
          ) : (
            <ContainerClickGlowDiv
              style={{
                width: "fit-content",
                padding: "4px 24px",
                height: "35px",
              }}
              onClick={() => {
                if (
                  (steps === 1 &&
                    (collectionBasics.name === "" ||
                      collectionBasics.description === "" ||
                      collectionBasics.collectionImgURL === "" ||
                      !checkURL(collectionBasics.collectionImgURL))) ||
                  (steps === 3 &&
                    (collectionSocialMedia.collectionTwitterAcc === "" ||
                      collectionSocialMedia.discordContact === ""))
                ) {
                  setAlert("Please complete the fields");
                  if (steps === 3) {
                    setCollectionSocialMediaErrors({
                      collectionTwitterAcc:
                        collectionSocialMedia.collectionTwitterAcc === ""
                          ? "Enter a correct Twitter Account"
                          : "",
                      discordContact:
                        collectionSocialMedia.discordContact === ""
                          ? "Enter a correct Discord Contact Account"
                          : "",
                    });
                  }
                  if (steps === 1) {
                    setCollectionBasicsErrors({
                      name:
                        collectionBasics.name === ""
                          ? "Enter a correct Collection name"
                          : "",
                      description:
                        collectionBasics.description === ""
                          ? "Enter a correct Collection Description"
                          : "",
                      collectionImgURL:
                        collectionBasics.collectionImgURL === "" ||
                        !checkURL(collectionBasics.collectionImgURL)
                          ? "Enter a correct Collection Image URL"
                          : "",
                    });
                  }
                } else {
                  setAlert("");
                  setSteps(steps + 1);
                  setCollectionSocialMediaErrors({
                    collectionTwitterAcc: "",
                    discordContact: "",
                  });
                  setCollectionBasicsErrors({
                    name: "",
                    description: "",
                    collectionImgURL: "",
                  });
                }
              }}
            >
              Next
            </ContainerClickGlowDiv>
          )}
        </FooterForm>
      </div>
    </ContainerForm>
  );
}
