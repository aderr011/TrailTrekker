import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";
import CampProvider from '../components/contexts/camp/CampProvider';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>TrailTrekker</title>
      </Head>
      <CampProvider>
        <Component {...pageProps} />
      </CampProvider>
    </>
  );
}

export default MyApp;