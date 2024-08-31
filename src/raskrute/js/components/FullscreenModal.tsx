import React, { PropsWithChildren, useEffect } from "react";
import { createPortal } from "react-dom";
import { portalEl } from "../../../index";

// TODO: This does not seem to work at all?
const Portal: React.FC<PropsWithChildren> = ({ children }) => {
    const portalRoot = portalEl;
    const elementMount = document.createElement('div');
    elementMount.className = 'display-fullscreen';
    useEffect(() => {
        portalRoot.appendChild(elementMount);
        return () => {
            portalRoot.removeChild(elementMount);
        }
    }, [ portalRoot, elementMount ]);

    return createPortal(children, portalRoot);
}

export const FullscreenModal: React.FC<PropsWithChildren<{ isOpen: boolean }>> = ({ children, isOpen }) => {
    if (!isOpen) {
        return null;
    }
    return createPortal(<div className="display-fullscreen">{ children }</div>, portalEl);
}
