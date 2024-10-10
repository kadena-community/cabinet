'use client';

import React, { useEffect } from 'react';

interface HsScriptProps {
  script?: boolean;
}

const HsScriptBlock: React.FC<HsScriptProps> = ({ script }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.hsforms.net/forms/v2.js';
    document.body.appendChild(script);

    script.addEventListener('load', () => {
      // @ts-ignore
      if (window.hbspt) {
        // @ts-ignore
        window.hbspt.forms.create({
          portalId: '44024904',
          formId: '5b36473b-6c5b-490d-9cdd-70596a1323b1',
          target: '#hubspot-form-wrapper',
        });
      }
      const stylez = document.createElement('style');
      stylez.innerHTML = `.hs-form-5b36473b-6c5b-490d-9cdd-70596a1323b1_49a7ad19-239b-47f2-b4ea-9b1c546a4f97.hs-form{
        width:100%;
        }`;
      document.body.appendChild(stylez);
    });
  }, []);

  return (
    <div className="md:w-1/2 w-full sm:max-w-[27.3125rem]">
      <div id="hubspot-form-wrapper" />
    </div>
  );
};

export default HsScriptBlock;
