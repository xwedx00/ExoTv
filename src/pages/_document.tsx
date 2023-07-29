//@ts-nocheck
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  public render() {
    return (
      <Html>
        <Head>
          <meta httpEquiv="Cache-Control" content="max-age=200" />
          <link rel="shortcut icon" href="/logo.ico" />
          <link rel="icon" href="/logo.ico" type="image/ico" />
          <link rel="preconnect" href="https://graphql.anilist.co" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
