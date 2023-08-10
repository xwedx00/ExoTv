//@ts-nocheck
import RefreshIcon from "@/components/icons/RefreshIcon";
import { useThemePlayer } from "@/contexts/ThemePlayerContext";
import { ControlButton } from "netplayer";
import React from "react";
import ControlsIcon from "../../themes/ControlsIcon";

const RefreshButton = () => {
  const { refresh } = useThemePlayer();

  return (
    <ControlButton onClick={refresh} tooltip="Play new video (Shift+N)">
      <ControlsIcon Icon={RefreshIcon} />
    </ControlButton>
  );
};

export default React.memo(RefreshButton);
