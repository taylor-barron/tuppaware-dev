"use client";

import { useEffect, useState } from "react";
import Overlay from "../components/overlay";
import Modal from "./modal";

export default function OverlayModal({
  isOpen = false,
  onClose = () => {},
  children,

}) {
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);

  }, [isOpen]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Overlay isOpen={open} onClick={handleClose}>
      <Modal isOpen={open} onClose={handleClose}>
        {children}
      </Modal>
    </Overlay>
  );
}