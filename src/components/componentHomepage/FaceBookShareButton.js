import React, { useEffect } from 'react';

const FacebookSharePlugin = ({ url }) => {
  useEffect(() => {
    // Function to load the SDK if not already loaded
    const loadFbSdk = () => {
      if (window.FB) {
        window.FB.XFBML.parse();
        return;
      }
      const script = document.createElement('script');
      script.src = "https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v22.0";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        window.FB && window.FB.XFBML.parse();
      };
      document.body.appendChild(script);
    };

    loadFbSdk();
  }, [url]);

  return (
    <div
      className="fb-share-button"
      data-href={url}
      data-layout="button"
      data-size="small">
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&amp;src=sdkpreparse`}
        className="fb-xfbml-parse-ignore">
        Chia sẻ
      </a>
    </div>
  );
};

export default FacebookSharePlugin;
