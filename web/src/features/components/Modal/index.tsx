import React from "react";
import { DialogContent, DialogOverlay } from "@reach/dialog";
import { animated, useSpring, useTransition } from "react-spring";
import { useGesture } from "react-use-gesture";
import { isMobile } from "../../../utils/userAgent";
import styles from "../../../styles/main.module.css";

interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  minHeight?: number | false;
  maxHeight?: number;
  width?: number;
  maxWidth?: number;
  initialFocusRef?: React.RefObject<any>; // Specify a more detailed type instead of any if possible
  children?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onDismiss,
  minHeight = false,
  maxHeight = 90,
  width = 50,
  maxWidth = 420,
  initialFocusRef,
  children,
}: ModalProps) {
  const fadeTransition = useTransition(isOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  const [{ y }, set] = useSpring(() => ({ y: 0 }));

  // Specify the type for the state parameter in the useGesture hook
  const bind = useGesture({
    onDrag: (state: any) => {
      // Replace any with the appropriate type from 'react-use-gesture'
      set({ y: state.down ? state.movement[1] : 0 });
      if (
        state.movement[1] > 300 ||
        (state.velocity > 3 && state.direction[1] > 0)
      ) {
        onDismiss();
      }
    },
  });

  return fadeTransition(({ opacity }, item) =>
    item ? (
      <DialogOverlay className={styles.dialogOverlay} onDismiss={onDismiss}>
        <animated.div
          className={`${styles.dialogContent} ${isMobile ? styles.dialogContentMobile : ""}`}
          style={{
            transform: y.to((y) => `translateY(${y > 0 ? y : 0}px)`),
            minHeight: minHeight ? `${minHeight}vh` : undefined,
            maxHeight: `${maxHeight}vh`,
            width: `${width}vh`,
            maxWidth: `${maxWidth}px`,
          }}
          {...(isMobile ? bind() : {})}
          aria-label="dialog content"
        >
          {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
          {children}
        </animated.div>
      </DialogOverlay>
    ) : null,
  );
}
