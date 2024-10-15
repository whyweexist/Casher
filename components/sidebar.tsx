import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import React from "react";
import SidebarItem from "./sidebar-item";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import Tokens from "./tokens";

type Props = {
  className?: string;
};

// Updated available tokens for Ethereum
const availableTokens = [
  {
    iconSrc: '/eth-token.svg', // Change the icon to an Ethereum token icon
    label: "Ether",
    href: "/ether",
    balance: '0.001'
  },
  {
    iconSrc: '/dai-token.svg', // Example token, update as needed
    label: "DAI",
    href: "/dai",
    balance: '0.121'
  }
];

export default function Sidebar({ className }: Props) {
  return (
    <div className={cn(
      "flex h-full lg:w-[322px] lg:fixed left-0 top-0 px-4 py-6 border-r-2 flex-col",
      className,
    )}>
      <div className="px-2 pb-6">
        <Link href="/">
          <Logo className={"text-xl"} />
        </Link>
      </div>
      <div className="pt-4 py-2 flex flex-col gap-y-2 flex-1">
        <div>
          <div className="font-bold">
            Active Network
          </div>
          <SidebarItem
            iconSrc="/eth-token.svg" // Update to Ethereum icon
            label="Ethereum Mainnet" // Change the network name
            href="/#"
          />
        </div>
        <div className="pt-3">
          <div className="font-bold">
            Tokens
          </div>
          {availableTokens.map((token) => (
            <Tokens
              key={token.label}
              iconSrc={token.iconSrc}
              label={token.label}
              href={token.href}
              balance={token.balance}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-between">
        <Button variant={"secondary"} className="w-[80%]">
          Disconnect
        </Button>
        <ModeToggle />
      </div>
    </div>
  );
};
