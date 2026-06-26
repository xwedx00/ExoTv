//@ts-nocheck
import Drawer, { DrawerRef } from "@/components/shared/Drawer";
import Logo from "@/components/shared/Logo";
import NavItem from "@/components/shared/NavItem";
import { useSettings } from "@/contexts/SettingsContext";
import classNames from "classnames";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";

const routes = [
  { title: "Anime", href: "/" },
  { title: "Manga", href: "/manga" },
  { title: "Anime Themes", href: "/themes" },
  { title: "Anime Scene Search", href: "/scene-search" },
];

const TitleLanguageToggle: React.FC = () => {
  const { titleLanguage, toggleTitleLanguage } = useSettings();

  return (
    <button
      type="button"
      onClick={toggleTitleLanguage}
      title="Title language — English / native"
      aria-label="Toggle title language"
      className="flex items-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-xs font-semibold"
    >
      <span
        className={classNames(
          "px-2 py-1 transition-colors",
          titleLanguage === "english" ? "bg-primary-500 text-white" : "text-white/55"
        )}
      >
        EN
      </span>
      <span
        className={classNames(
          "px-2 py-1 transition-colors",
          titleLanguage === "native" ? "bg-primary-500 text-white" : "text-white/55"
        )}
      >
        原
      </span>
    </button>
  );
};

const Header = () => {
  const drawerRef = useRef<DrawerRef>();
  const router = useRouter();

  const searchUrl = router.asPath.includes("manga")
    ? "/browse?type=manga"
    : "/browse?type=anime";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="glass-pill pointer-events-auto flex h-12 w-[min(95%,1120px)] items-center gap-3 rounded-full px-3 md:gap-6 md:px-6">
        {/* Mobile drawer */}
        <Drawer
          ref={drawerRef}
          containerClassName="sm:hidden flex items-center"
          className="flex flex-col justify-between py-8"
          button={<GiHamburgerMenu className="h-5 w-5 text-white/80" />}
        >
          <div>
            <Logo />

            <div className="mt-6 space-y-2">
              {routes.map((route) => (
                <div onClick={drawerRef.current?.close} key={route.href}>
                  <NavItem className="block" href={route.href}>
                    {({ isActive }) => (
                      <p
                        className={classNames(
                          "border-l-4 pl-4 text-2xl font-semibold",
                          isActive
                            ? "border-primary-500 text-white"
                            : "border-white/10 text-typography-secondary"
                        )}
                      >
                        {route.title}
                      </p>
                    )}
                  </NavItem>
                </div>
              ))}
            </div>
          </div>
        </Drawer>

        {/* Logo */}
        <NavItem href="/">
          {() => (
            <div className="relative h-7 w-7 shrink-0">
              <Logo className="!h-full !w-full" />
            </div>
          )}
        </NavItem>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-[15px] font-medium text-white/60 sm:flex">
          {routes.map((route) => (
            <NavItem href={route.href} key={route.href}>
              {({ isActive }) => (
                <span
                  className={classNames(
                    "whitespace-nowrap transition-colors duration-300 hover:text-white",
                    isActive && "text-white"
                  )}
                >
                  {route.title}
                </span>
              )}
            </NavItem>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <TitleLanguageToggle />

          <NavItem href={searchUrl}>
            {({ isActive }) => (
              <AiOutlineSearch
                className={classNames(
                  "h-5 w-5 text-white/70 transition-colors duration-300 hover:text-white",
                  isActive && "text-primary-300"
                )}
              />
            )}
          </NavItem>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
