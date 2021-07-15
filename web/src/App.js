import React, {Suspense, useEffect, useMemo, useState} from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {toast, ToastContainer} from "react-toastify";
import MomentUtils from "@date-io/moment";
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Logout from "./pages/auth/Logout";
import Group from "./pages/groups/Group";
import Loading from "./components/style/Loading";
import PageNotFound from "./pages/PageNotFound";
import {fetchToken, fetchUserData, isAuthenticated, userData} from "./recoil/auth";
import {useSetRecoilState} from "recoil";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import ChangeEmail from "./pages/auth/ChangeEmail";
import ChangePassword from "./pages/auth/ChangePassword";
import SessionList from "./pages/auth/SessionList";
import GroupList from "./pages/groups/GroupList"
import Layout from "./components/style/Layout";
import {CssBaseline, useMediaQuery} from "@material-ui/core";

const Profile = React.lazy(() => import("./pages/auth/Profile"));
const ConfirmEmailChange = React.lazy(() => import("./pages/auth/ConfirmEmailChange"));
const ConfirmRegistration = React.lazy(() => import("./pages/auth/ConfirmRegistration"));
const GroupInvite = React.lazy(() => import("./pages/groups/GroupInvite"));

const routes = [
    {
        path: "/",
        component: <GroupList/>,
        auth: true,
        exact: true,
    },
    {
        path: "/invite/:inviteToken",
        component: <GroupInvite/>,
        auth: false,
    },
    {
        path: "/groups/:id",
        component: <Group/>,
        auth: true,
        layout: false,
    },
    {
        path: "/profile",
        component: <Profile/>,
        auth: true,
        exact: true,
    },
    {
        path: "/profile/change-email",
        component: <ChangeEmail/>,
        auth: true,
        exact: true,
    },
    {
        path: "/profile/change-password",
        component: <ChangePassword/>,
        auth: true,
        exact: true,
    },
    {
        path: "/profile/sessions",
        component: <SessionList/>,
        auth: true,
        exact: true,
    },
    {
        path: "/logout",
        component: <Logout/>,
        auth: true,
        exact: true
    },
    {
        path: "/confirm-registration/:token",
        component: <ConfirmRegistration/>,
        auth: false,
        layout: false,
    },
    {
        path: "/confirm-email-change/:token",
        component: <ConfirmEmailChange/>,
        auth: false,
    },
    {
        path: "/register",
        component: <Register/>,
        auth: false,
        layout: false,
    },
    {
        path: "/login",
        component: <Login/>,
        auth: false,
        layout: false,
    },
]

export default function App() {
    const setLoggedIn = useSetRecoilState(isAuthenticated);
    const setUserData = useSetRecoilState(userData);
    const authToken = fetchToken();
    const [loading, setLoading] = useState(authToken !== null);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = useMemo(
        () =>
            createMuiTheme({
                palette: {
                    type: prefersDarkMode ? 'dark' : 'light',
                },
            }),
        [prefersDarkMode]
    )

    useEffect(() => {
        if (authToken !== null) {
            fetchUserData()
                .then(result => {
                    console.log(localStorage.getItem("userID"))
                    setUserData(result);
                    setLoggedIn(true);
                    setLoading(false);
                })
                .catch(err => {
                    console.log("error loading user info in root app", err)
                    toast.error(`${err}`);
                    localStorage.removeItem("sessionToken");
                    localStorage.removeItem("userID");
                    setLoggedIn(false);
                    setLoading(false);
                })
        }
    }, [authToken, setLoading, setLoggedIn, setUserData])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                >
                </ToastContainer>
                {loading ? <Loading/> : (
                    <Router>
                        <Switch>
                            {routes.map(route => {
                                const authRoute = route.auth ? (
                                    <AuthenticatedRoute>{route.component}</AuthenticatedRoute>
                                ) : route.component;

                                const layoutRoute = route.layout === undefined || route.layout ? (
                                    <Layout><Suspense fallback={<Loading/>}>{authRoute}</Suspense></Layout>
                                ) : (
                                    <Suspense fallback={<Loading/>}>{authRoute}</Suspense>
                                );

                                return (
                                    <Route key={route.path} exact={route.exact !== undefined && route.exact}
                                           path={route.path}>
                                        {layoutRoute}
                                    </Route>
                                )
                            })}
                            <Route exact path="/404"><PageNotFound/></Route>
                        </Switch>
                    </Router>
                )}
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    );
}
