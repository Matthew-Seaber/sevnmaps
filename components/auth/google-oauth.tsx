"use client";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

function GoogleOAuth({ type }: { type: "login" | "signup" }) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID!}
    >
      <GoogleLogin
        onSuccess={(response) => {
          console.log(response);

          if (type === "login") {
            // Login logic here
          } else if (type === "signup") {
            // Signup logic here
          }

          window.location.href = "/app";
        }}
        onError={() => {
          alert("Continue with Google failed");
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
