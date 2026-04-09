import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Coach } from "./pages/Coach";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "coach", Component: Coach },
      { path: "profile", Component: Profile },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
    ],
  },
]);