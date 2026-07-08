"use client";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

function GoogleOAuth() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID!}>
      <GoogleLogin
        onSuccess={(response) => {
          console.log(response);
          window.location.href = "/app"
        }}
        onError={() => {
          alert("Login with Google failed");
        }}
        size="large"
        text="continue_with"
        shape="pill"
        width="250"
      />
    </GoogleOAuthProvider>
  );
}

export default GoogleOAuth;
