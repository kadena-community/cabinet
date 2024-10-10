import React from 'react';
import Link from 'next/link';

interface LinkProps {
  text: string;
  href?: string | null;
  fake?: boolean;
  underline?: boolean;
  small?: boolean;
  moreGap?: boolean;
  noTriangle?: boolean;
  center?: boolean;
  className?: string;
}

const IconLink: React.FC<LinkProps> = ({
  text,
  href,
  fake,
  underline,
  small,
  moreGap,
  noTriangle,
  center,
  className,
}) => {
  const style = `flex items-center whitespace-nowrap gap-2 font-normal leading-5 [&>img]:w-4 [&>img]:h-4
  ${underline && 'underline underline-offset-2'}
  ${small && 'text-sm'}
  ${moreGap ? 'gap-4' : 'gap-2'}
  ${center && 'justify-center'}
  ${className}`;

  return fake ? (
    <div className={style}>
      {text}
    </div>
  ) : (
    href && (
      <div className="flex gap-2 items-center">
        {href[0] === '/' || href[0] === '#' ? (
          <Link href={href} className={style}>
            {text}
          </Link>
        ) : (
          <a href={href} className={style} target="_blank" rel="noreferrer">
            {text}
          </a>
        )}
      </div>
    )
  );
};

export default IconLink;
