//@ts-nocheck
import React from "react";
import Logo from "@/components/shared/Logo";
import NextLink, { LinkProps } from "next/link";

const Footer = () => {

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 md:px-12 py-16 space-y-4">
      <Logo className="!mb-0" />

      <div className="flex items-center space-x-8 text-center">
        <Link href="/tos">
          <p className="text-lg">Terms Of Service</p>
        </Link>

        <Link href="/contact">
          <p className="text-lg">Contact</p>
        </Link>
      </div>

      <p className="text-sm text-gray-300 text-center">Disclaimer</p>

      <p className="text-sm text-gray-300 text-center">© Exoexs</p>
    </div>
  );
};

const Link: React.FC<LinkProps> = (props) => {
  return (
    (<NextLink {...props} className="hover:text-primary-300 transition duration-300">

      {props.children}

    </NextLink>)
  );
};

export default Footer;
