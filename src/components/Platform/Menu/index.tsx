import { AuthContext } from "contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useContext, useState } from "react";
import { IconWrapper, MenuElement, SubMenu } from "./Menu.style";

export function Menu({
  showMenu,
  handleCloseMenu,
}: {
  showMenu: boolean;
  handleCloseMenu: () => void;
}) {
  const { hasNft } = useContext(AuthContext);

  return (
    <div
      className={`${
        showMenu ? "translate-x-0" : "translate-x-[-100%] sm:translate-x-0"
      } flex flex-col transition-transform duration-500 z-10 py-1 px-8 gap-4 items-center h-full bg-[#15132b] absolute sm:relative`}
      style={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.6)" }}
    >
      <div
        onClick={handleCloseMenu}
        className="absolute top-6 right-4 text-xl h-5 w-5 flex sm:hidden justify-center items-center cursor-pointer"
      >
        <svg
          id="Layer_1"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 122.88 122.88"
        >
          <title>close</title>
          <path
            fill="#a33"
            fillRule="evenodd"
            d="M61.44,0A61.44,61.44,0,1,1,0,61.44,61.44,61.44,0,0,1,61.44,0ZM74.58,36.8c1.74-1.77,2.83-3.18,5-1l7,7.13c2.29,2.26,2.17,3.58,0,5.69L73.33,61.83,86.08,74.58c1.77,1.74,3.18,2.83,1,5l-7.13,7c-2.26,2.29-3.58,2.17-5.68,0L61.44,73.72,48.63,86.53c-2.1,2.15-3.42,2.27-5.68,0l-7.13-7c-2.2-2.15-.79-3.24,1-5l12.73-12.7L36.35,48.64c-2.15-2.11-2.27-3.43,0-5.69l7-7.13c2.15-2.2,3.24-.79,5,1L61.44,49.94,74.58,36.8Z"
          />
        </svg>
      </div>
      <Link href="/platform">
        <div
          style={{
            height: "60px",
            width: "100px",
            position: "relative",
            marginTop: "20px",
          }}
        >
          <Image src="/img/logoPengSol.png" layout="fill" objectFit="contain" />
        </div>
      </Link>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p
          style={{
            letterSpacing: "1px",
            fontSize: "14px",
            color: "#b0b0c2",
            textAlign: "start",
            fontWeight: "bold",
            margin: "0px",
          }}
        >
          MAIN MENU
        </p>
        <Link href="/dashboard">
          <SubMenu disabled={!hasNft}>
            <IconWrapper>
              {hasNft ? (
                <Image
                  src="/img/dashboard_green.png"
                  layout="fill"
                  objectFit="contain"
                />
              ) : (
                <Image
                  src="/img/vector-144@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              )}
            </IconWrapper>
            <p
              style={{
                letterSpacing: "1px",
                fontSize: "14px",
                color: hasNft ? "#38e25d" : "#464366",
                textAlign: "start",
                margin: "0px",
              }}
            >
              Dashboard
            </p>
          </SubMenu>
        </Link>
        <Link href="/platform">
          <SubMenu>
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
              }}
            >
              Minting Tools
            </p>
          </SubMenu>
        </Link>
        <Link href="/hedera">
          <SubMenu disabled={!hasNft}>
          <IconWrapper>
              {hasNft ? (
                <Image
                  src="/img/path-9-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              ) : (
                <Image
                  src="/img/path-10-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              )}
            </IconWrapper>
           
            <p
              style={{
                letterSpacing: "1px",
                fontSize: "14px",
                color: hasNft ? "#38e25d" : "#464366",

                textAlign: "start",
                margin: "0px",
              }}
            >
              HEDERA Address
            </p>
          </SubMenu>
        </Link>
        <Link href="/icemint">
          <SubMenu disabled={!hasNft}>
          <IconWrapper>
              {hasNft ? (
                <Image
                  src="/img/path-9-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              ) : (
                <Image
                  src="/img/path-10-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              )}
            </IconWrapper>
           
            <p
              style={{
                letterSpacing: "1px",
                fontSize: "14px",
                color: hasNft ? "#38e25d" : "#464366",

                textAlign: "start",
                margin: "0px",
              }}
            >
              ICE MINT
            </p>
          </SubMenu>
        </Link>
        <Link href="/scheduling">
          <SubMenu disabled={!hasNft}>
            <IconWrapper>
              {hasNft ? (
                <Image
                  src="/img/path-9-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              ) : (
                <Image
                  src="/img/path-10-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              )}
            </IconWrapper>
            <p
              style={{
                letterSpacing: "1px",
                fontSize: "14px",
                color: hasNft ? "#38e25d" : "#464366",
                textAlign: "start",
                margin: "0px",
              }}
            >
              Scheduling
            </p>
          </SubMenu>
        </Link>
        <SubMenu disabled>
          <IconWrapper>
            <Image
              src="/img/path-10-10@1x.png"
              layout="fill"
              objectFit="contain"
            />
          </IconWrapper>
          <p
            style={{
              letterSpacing: "1px",
              fontSize: "14px",
              color: "#464366",
              fontWeight: "bold",
              textAlign: "start",

              margin: "0px",
            }}
          >
            Forensic Tools
          </p>
        </SubMenu>
        <SubMenu disabled>
          <IconWrapper>
            <Image
              src="/img/path-10-10@1x.png"
              layout="fill"
              objectFit="contain"
            />
          </IconWrapper>
          <p
            style={{
              letterSpacing: "1px",
              fontSize: "14px",
              color: "#464366",
              fontWeight: "bold",
              textAlign: "start",
              margin: "0px",
            }}
          >
            Analytics
          </p>
        </SubMenu>
        <SubMenu disabled>
          <IconWrapper>
            <Image
              src="/img/path-10-10@1x.png"
              layout="fill"
              objectFit="contain"
            />
          </IconWrapper>
          <p
            style={{
              letterSpacing: "1px",
              fontSize: "14px",
              color: "#464366",
              fontWeight: "bold",
              textAlign: "start",
              margin: "0px",
            }}
          >
            ICE Vault
          </p>
        </SubMenu>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://pengpad.pengsol.com/login"
        >
          <SubMenu disabled={!hasNft}>
            <IconWrapper>
              {hasNft ? (
                <Image
                  src="/img/path-9-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              ) : (
                <Image
                  src="/img/path-10-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              )}
            </IconWrapper>
            <p
              style={{
                letterSpacing: "1px",
                fontSize: "14px",
                color: hasNft ? "#38e25d" : "#464366",
                textAlign: "start",
                margin: "0px",
              }}
            >
              Raffle & Auction
            </p>
          </SubMenu>
        </a>
        <a
          // target="_blank"
          // rel="noopener noreferrer"
          href="https://staking.pengsol.com/"
        >
          <SubMenu disabled={!hasNft}>
            <IconWrapper>
              {hasNft ? (
                <Image
                  src="/img/path-9-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              ) : (
                <Image
                  src="/img/path-10-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              )}
            </IconWrapper>
            <p
              style={{
                letterSpacing: "1px",
                fontSize: "14px",
                color: hasNft ? "#38e25d" : "#464366",
                textAlign: "start",

                margin: "0px",
              }}
            >
              Staking
            </p>
          </SubMenu>
        </a>
        <Link href="/onBoarding">
          <SubMenu disabled={!hasNft}>
            <IconWrapper>
              {hasNft ? (
                <Image
                  src="/img/path-9-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              ) : (
                <Image
                  src="/img/path-10-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              )}
            </IconWrapper>
            <p
              style={{
                letterSpacing: "1px",
                fontSize: "14px",
                color: hasNft ? "#38e25d" : "#464366",
                textAlign: "start",
                margin: "0px",
              }}
            >
              Onboarding
            </p>
          </SubMenu>
        </Link>
        <SubMenu disabled>
          <IconWrapper>
            <Image
              src="/img/path-10-10@1x.png"
              layout="fill"
              objectFit="contain"
            />
          </IconWrapper>
          <p
            style={{
              letterSpacing: "1px",
              fontSize: "14px",
              color: "#464366",
              fontWeight: "bold",
              textAlign: "start",

              margin: "0px",
            }}
          >
            King Council
          </p>
        </SubMenu>
        <Link href="/settings">
          <SubMenu disabled={!hasNft}>
            <IconWrapper>
              {hasNft ? (
                <Image
                  src="/img/path-9-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              ) : (
                <Image
                  src="/img/path-10-10@1x.png"
                  layout="fill"
                  objectFit="contain"
                />
              )}
            </IconWrapper>
            <p
              style={{
                letterSpacing: "1px",
                fontSize: "14px",
                color: hasNft ? "#38e25d" : "#464366",

                textAlign: "start",
                margin: "0px",
              }}
            >
              Settings
            </p>
          </SubMenu>
        </Link>
      </div>
    </div>
  );
}
