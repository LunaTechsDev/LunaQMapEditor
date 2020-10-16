import React from "react";
import { observer } from "mobx-react";

import RecentProjects from './recentProjects.jsx'

@observer
export default class Welcome extends React.Component {
  render() {
    return (
      <div style={{margin: 4 + 'rem'}}>
        <h1>Welcome</h1>
        <h3>Open a project to get started.</h3>
        <RecentProjects/>
      </div>
    );
  }
}
