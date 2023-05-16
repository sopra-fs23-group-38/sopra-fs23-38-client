import React from "react";
import ReactDOM from "react-dom";
import "styles/index.scss";
import App from "./App";


import { Provider } from 'react-redux';
// import { createStore } from 'redux';
import store from './models/reducers';
import ILayout from "./components/views/Layout.js";
// const store = createStore(rootReducer);
/**
 * This is the entry point of your React application where the root element is in the public/index.html.
 * We call this a “root” DOM node because everything inside it will be managed by React DOM.
 * Applications built with just React usually have a single root DOM node.
 * More: https://reactjs.org/docs/rendering-elements.html
 */
ReactDOM.render(
    <Provider store={store}>
        <ILayout>
          <App />
     </ILayout>
     </Provider>,
    document.getElementById("root"));
