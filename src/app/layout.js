"use client";

import "./globals.scss";
import "bootstrap-icons/font/bootstrap-icons.min.css";

import { SWRConfig } from "swr";
import { Auth0Provider } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { Provider, useSelector } from "react-redux";
import { store } from "@/stores/store";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { setName } from "@/stores/auth-slice";
import { addFavorite } from "@/stores/favorites-slice";

/**
 * @file Entrypoint of the application.
 */
export default function RootLayout({ children }) {
  const redirect_uri = process.env.NEXT_PUBLIC_SUCCESSFUL_LOGIN_REDIRECT_URI;

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <Provider store={store}>
      <Auth0Provider
        domain="dev-xjgkgbbbpbo086ch.us.auth0.com"
        clientId="5AYBJcopjb0AOkKT7jAZu90rdrpmFATd"
        authorizationParams={{ redirect_uri }}
      >
        <SWRConfig value={{ provider: () => new Map() }}>
          <App children={children} />
        </SWRConfig>
      </Auth0Provider>
    </Provider>
  );
}

function App({ children }) {
  const { isLoading, isAuthenticated, user } = useAuth0();
  const dispatch = useDispatch();
  const favorites = useSelector((store) => store.favorites.favorites);
  const [doneFetchingFavorites, setDoneFetchingFavorites] = useState(false);

  useEffect(() => {
    if (doneFetchingFavorites) localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (Object.entries(favorites).length === 0 && localStorage.getItem("favorites")) {
      Object.entries(JSON.parse(localStorage.getItem("favorites"))).forEach(([favorite]) => {
        dispatch(addFavorite(favorite));
      });
    }
    setDoneFetchingFavorites(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) dispatch(setName(user.name));
  }, [isLoading, isAuthenticated]);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
