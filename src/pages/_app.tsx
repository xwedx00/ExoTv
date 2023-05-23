//@ts-nocheck
import { getStaticProps as nextGetStaticProps } from 'next';
import BaseLayout from "@/components/layouts/BaseLayout";
import { SubscriptionContextProvider } from "@/contexts/SubscriptionContext";
import "@/styles/index.css";
import { appWithTranslation } from "next-i18next";
import nextI18nextConfig from "next-i18next.config";
import { AppProps } from "next/app";
import Router from "next/router";
import Script from "next/script";
import NProgress from "nprogress";
import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { ErrorBoundary } from "react-error-boundary";
import { AppErrorFallback } from "@/components/shared/AppErrorFallback";
import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { UserProvider } from "@supabase/auth-helpers-react";
import GlobalPlayerContextProvider from "@/contexts/GlobalPlayerContext";
import AuthContext, { AuthContextProvider } from "@/contexts/AuthContext";
import { Analytics } from '@vercel/analytics/react';


Router.events.on("routeChangeStart", NProgress.start);
Router.events.on("routeChangeComplete", NProgress.done);
Router.events.on("routeChangeError", NProgress.done);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

interface WorkaroundAppProps extends AppProps {
  err: any;
}

function App({ Component, pageProps, router, err }: WorkaroundAppProps) {
  App.getStaticProps = async (context) => {
    const pageGetStaticProps = Component.getStaticProps
      ? await Component.getStaticProps(context)
      : {};
  
    return {
      props: {
        ...pageGetStaticProps.props,
      },
      revalidate: 10,
    };
  };
  const [errorInfo, setErrorInfo] = useState<React.ErrorInfo>(null);


  const getLayout =
    // @ts-ignore
    Component.getLayout || ((page) => <BaseLayout>{page}</BaseLayout>);

  return (
    <React.Fragment>
    <script id="syncData" type="application/json"></script>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <SubscriptionContextProvider>
            <GlobalPlayerContextProvider>
              <ErrorBoundary
                onError={(error, info) => {
                  setErrorInfo(info);
                }}
                fallbackRender={(fallbackProps) => {
                  return (
                    <AppErrorFallback
                      {...fallbackProps}
                      errorInfo={errorInfo}
                    />
                  );
                }}
              >
                {getLayout(<Component {...pageProps} err={err} />)}
                <Analytics />
              </ErrorBoundary>
            </GlobalPlayerContextProvider>
          </SubscriptionContextProvider>
        </AuthContextProvider>

        {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
      </QueryClientProvider>
    </React.Fragment>
  );
}

const AppWithISR = appWithTranslation(App, nextI18nextConfig);
AppWithISR.getStaticProps = App.getStaticProps;
export default AppWithISR;
