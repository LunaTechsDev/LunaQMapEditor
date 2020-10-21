import React from "react";
import Store from "../store";
import { observer } from "mobx-react";

@observer
export default class RecentProject extends React.Component {
  render() {
    const { isLoaded, clickHandler } = this.props;
    const paths = Store.getUserData("recentProjectPaths");
    let items = paths.map((path, index) => (
      <li key={index}>
        <button onClick={() => clickHandler(path)}>{path}</button>
      </li>
    ));
    const clearList = () => {
      Store.setUserData("recentProjectPaths", []);
      items = [];
      this.setState(this.state);
    };

    return (
      <div>
        {!isLoaded && <ul>{items}</ul>}
        {paths.length > 0 && <button onClick={clearList}>Clear list</button>}
      </div>
    );
  }
}
