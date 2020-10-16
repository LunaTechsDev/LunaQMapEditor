import React from "react";
import { observer } from "mobx-react";

import RecentProjects from './recentProjects.jsx'

@observer
export default class Welcome extends React.Component {
  openRecentProject(path) {
    // We add filename + ext because Store.load uses path.dirname() on path
    Store.load([`${path}/game.rmmzproject`]);
  }

  render() {
    return (
      <div style={{ margin: 4 + "rem" }}>
        <h1>Welcome</h1>
        <h3>Open a project to get started.</h3>
        <RecentProjects clickHandler={this.openRecentProject} />
      </div>
    );
  }
}
