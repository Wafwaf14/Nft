import type { NextPage } from "next";
import Head from "next/head";
import { BasicsView } from "../views";

const Basics: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>PengSol AI Tools</title>
        <meta
          name="description"
          content="PengSol AI Tools"
        />
      </Head>
      {/* <BasicsView /> */}
    </div>
  );
};

export default Basics;
