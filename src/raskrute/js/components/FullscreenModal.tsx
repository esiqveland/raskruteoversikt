import React, { PropsWithChildren, useEffect } from "react";
import { createPortal } from "react-dom";
import { portalEl } from "../../../index";

export const FullscreenModal: React.FC<PropsWithChildren<{ isOpen: boolean }>> = ({ children, isOpen }) => {
    if (!isOpen) {
        return null;
    }
    return createPortal(<div className="display-fullscreen">{ children }</div>, portalEl);
}
