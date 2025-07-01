import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import TableComponent from "./components/TableComponent/TableComponent";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <TableComponent />
      </div>
    </Provider>
  );
};

export default App;
