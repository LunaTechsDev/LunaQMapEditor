import React from "react";
import Store from "../store";
import { observer } from "mobx-react";

@observer
export default class RecentProject extends React.Component {
  render() {
    const { isLoaded, clickHandler } = this.props;
    const paths = Store.getUserData("recentProjectPaths");
    const items = paths.map((path) => (
      <li>
        <button onClick={this.clickHandler}>{path}</button>
      </li>
    ));

    return (
    <div>{!isLoaded && <ul>{items}</ul>}</div>
    );
  }
}
