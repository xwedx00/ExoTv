//@ts-nocheck
import { useRouter } from "next/dist/client/router";
import Link, { LinkProps } from "next/link";
import React, { useMemo } from "react";

interface NavItemProps extends LinkProps {
  children({ isActive: boolean }): React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ onClick, ...props }) => {
  const router = useRouter();
  const isActive = useMemo(
    () => router.route === props.href,
    [props.href, router.route]
  );

  return (
    (<Link {...props} className={props.className} onClick={onClick}>

      {props.children({ isActive })}

    </Link>)
  );
};

export default React.memo(NavItem);
