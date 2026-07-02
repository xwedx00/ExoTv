//@ts-nocheck
import React from "react";
import Footer from "@/components/partials/Footer";
import Header from "@/components/partials/Header";

interface BaseLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  showFooter = true,
  showHeader = true,
}) => {
  return (
    <main>
      {showHeader && (
        <>
          {/* Top scrim so scrolling content fades out cleanly behind the
              floating pill header instead of bleeding raw up to the edge. */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-40 h-24 bg-gradient-to-b from-background via-background/55 to-transparent"
          />
          <Header />
        </>
      )}

      <div className="app">{children}</div>

      {showFooter && <Footer />}
    </main>
  );
};

export default BaseLayout;
