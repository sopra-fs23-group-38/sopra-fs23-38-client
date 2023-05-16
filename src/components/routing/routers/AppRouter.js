import React from 'react';
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {LoginGuard} from "components/routing/routeProtectors/LoginGuard";
import {RegisterGuard} from "components/routing/routeProtectors/RegisterGuard";
import {IndexGuard} from "components/routing/routeProtectors/IndexGuard";
import {SearchGuard} from "components/routing/routeProtectors/SearchGuard";
import Login from "components/views/Login";
import Register from "components/views/Register"
import Index from "components/views/Index";
import Search from "components/views/Search";
import {ChatGuard} from "components/routing/routeProtectors/ChatGuard";
import Chat from "components/views/Chat";
import {CenterGuard} from "components/routing/routeProtectors/CenterGuard";
import Center from "components/views/Center";
import {QuestionGuard} from "components/routing/routeProtectors/QuestionGuard";
import QuestionDetail from "components/views/Question/[id].js";
import Create from "components/views/Question/Create.js";
import Answer from "components/views/Question/[id]/answer";
import AnswerComments from "components/views/Question/answer/[id]";
/**
 * Main router of your application.
 * In the following class, different routes are rendered. In our case, there is a Login Route with matches the path "/login"
 * and another Router that matches the route "/game".
 * The main difference between these two routes is the following:
 * /login renders another component without any sub-route
 * /game renders a Router that contains other sub-routes that render in turn other react components
 * Documentation about routing in React: https://reacttraining.com/react-router/web/guides/quick-start
 */


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Switch>
          <Route path="/question/create"  >
              <QuestionGuard>
                  <Create />
              </QuestionGuard>
          </Route>

          <Route path="/question/:id/answer" component={Answer} >
              <QuestionGuard>
                  <Answer/>
              </QuestionGuard>
          </Route>
          <Route path="/question/answer/:id" component={AnswerComments} >
              <QuestionGuard>
                  <AnswerComments/>
              </QuestionGuard>
          </Route>
          <Route path="/question/:id" component={QuestionDetail} >
              <QuestionGuard>
                  <QuestionDetail/>
              </QuestionGuard>
          </Route>
          <Route exact path="/login">
          <LoginGuard>
            <Login />
          </LoginGuard>
        </Route>
        <Route exact path="/register">
          <RegisterGuard>
            <Register />
          </RegisterGuard>
        </Route>
        <Route exact path="/index/:id" component={Index} >
          <IndexGuard>
            <Index />
          </IndexGuard>
        </Route>
        <Route exact path="/chat">
          <ChatGuard>
            <Chat />
          </ChatGuard>
        </Route>
        <Route exact path="/center/:id" component={Center}>
          <CenterGuard>
            <Center />
          </CenterGuard>
        </Route>
         <Route exact path="/search">
            <SearchGuard>
              <Search />
             </SearchGuard>
          </Route>
        <Route exact path="/">
          <Redirect to="/index/1"/>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

/*
* Don't forget to export your component!
 */
export default AppRouter;
