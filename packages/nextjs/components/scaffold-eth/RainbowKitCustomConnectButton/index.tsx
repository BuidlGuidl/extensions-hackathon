"use client";

// @refresh reset
import { useEffect } from "react";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { signOut } from "next-auth/react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useAuthSession } from "~~/hooks/useAuthSession";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = ({ fullWidth }: { fullWidth?: boolean }) => {
  const { targetNetwork } = useTargetNetwork();
  const { address, isConnected } = useAccount();
  const { address: sessionAddress } = useAuthSession();

  useEffect(() => {
    if (isConnected && sessionAddress && sessionAddress !== address) {
      signOut();
    }
  }, [address, isConnected, sessionAddress]);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button
                    className={`btn btn-outline text-lg font-normal${fullWidth ? " w-full" : ""}`}
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <>
                  <AddressInfoDropdown
                    address={account.address as Address}
                    displayName={account.displayName}
                    ensAvatar={account.ensAvatar}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                  />
                  <AddressQRCodeModal address={account.address as Address} modalId="qrcode-modal" />
                </>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
