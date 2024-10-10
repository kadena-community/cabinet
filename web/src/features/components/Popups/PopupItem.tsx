import React, { useCallback, useEffect } from 'react';
import { XCircle } from 'react-feather';
import { animated } from 'react-spring';
import { useSpring } from '@react-spring/web';
import { PopupContent } from '../../main/mainSlice';
import { useRemovePopup } from '../../main/hooks';
import MessagePopup, { MESSAGE_POPUP } from './MessagePopup';
import styles from '../../../styles/main.module.css';

export default function PopupItem({
  removeAfterMs,
  content,
  popKey
}: {
  removeAfterMs: number | null;
  content: PopupContent;
  popKey: string;
}) {
  const removePopup = useRemovePopup();
  const removeThisPopup = useCallback(() => removePopup(popKey), [popKey, removePopup]);

  useEffect(() => {
    if (removeAfterMs === null || removeAfterMs <= 0) return undefined;

    const timeout = setTimeout(() => {
      removeThisPopup();
    }, removeAfterMs);

    return () => clearTimeout(timeout);
  }, [removeAfterMs, removeThisPopup]);

  let popupContent;
  let popupClassName = '';

  if ('status' in content) {
    const { msg, status, wallet, reqKey } = content;
    popupClassName = MESSAGE_POPUP[status].className;
    popupContent = <MessagePopup msg={msg} status={status} wallet={wallet} reqKey={reqKey} />;
  }

  const faderStyle = useSpring({
    from: { width: '100%' },
    to: { width: '0%' },
    config: { duration: removeAfterMs ?? undefined },
  });

  return (
    <div className={`${styles.popupItem} ${popupClassName} rounded-lg`}>
      <XCircle className="absolute right-2 top-2 h-6 w-6" onClick={removeThisPopup} />
      {popupContent}
      {removeAfterMs !== null && removeAfterMs > 0 && (
        <animated.div className={styles.popupFader} style={faderStyle} />
      )}
    </div>
  );
}
