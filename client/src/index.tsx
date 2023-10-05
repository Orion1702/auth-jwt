import React, {createContext} from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Store from "./store/store";


interface State {
  store: Store,
}

const store = new Store()

export const Context = createContext<State>({
  store,
})

ReactDOM.render(
  <Context.Provider value={{
      store
  }}>
      <App />
  </Context.Provider>,
document.getElementById('root')
);



// OLD from some where
// const root = ReactDOM.createRoot(
//   document.getElementById('root') as HTMLElement
// );
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );