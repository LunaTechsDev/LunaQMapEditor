import React from "react";
import Store from "../store";
import { observer } from "mobx-react";

@observer
export default class RecentProject extends React.Component {
  render() {
    const { isLoaded } = this.props;
    return (
      <div>
        <b>Recent Projects</b>
        {!isLoaded && <p>C:/Documents/Projects/MyProject</p>}
      </div>
    );
  }
}
