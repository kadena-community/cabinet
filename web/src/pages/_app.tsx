import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "../app/store";
import "../styles/globals.css";
import KadenaProvider from "../features/components/KadenaProvider";
import type { AppProps } from "next/app";
import Head from "next/head";
import Footer from "@/features/components/Footer";
import Layout from "@/features/layout"; // Adjust the path as necessary
import App from "../App";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <KadenaProvider>
        <ThemeProvider attribute="class">
          <Head>
            <title>Kadena Cabinet</title>
            <meta
              name="description"
              content="A community advisory board on the Kadena blockchain where members can lock their tokens, participate in governance polls, and earn rewards through active involvement."
            />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Layout>
            <App />
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </KadenaProvider>
      <Footer />
    </Provider>
  );
}

export default MyApp;
