'use client';
import React from 'react';
import HsScriptBlock from './HsScriptBlock';

const NewsletterSignup: React.FC = () => {
  return (
    <div
      className={`w-full flex flex-col em:flex-row md:items-center sm:width-wrapper justify-center sm:items-center gap-[2rem] sm:gap-20 py-[4rem] sm:py-[5rem] z-30`}
    >
      <div className="flex flex-col items-start gap-4 w-full max-w-[27.3125rem] md:w-1/2">
        <h2 className="font-Space-Grotesk leading-none font-bold text-2xl">
          Subscribe to Our Newsletter
        </h2>
        <p>
          Join our mailing list to stay up-to-date with project news and
          progress. No spam. Never shared. Opt out at any time.
        </p>
      </div>
    <HsScriptBlock script />
    </div>
  );
};

export default NewsletterSignup;
