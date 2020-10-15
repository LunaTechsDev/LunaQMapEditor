import React from 'react'
import { observer } from 'mobx-react'

import Menubar from './menubar.jsx'
import Toolbar from './toolbar.jsx'
import Canvas from './canvas.jsx'
import Notifications from './notifications.jsx'

@observer
export default class Layout extends React.Component {
  componentDidMount() {
    document.body.ondragover = document.body.ondrop = (e) => {
      e.preventDefault();
      return false;
    }
    document.body.ondragleave = document.body.ondragend = () => {
      return false;
    }
  }
  render() {
    const {
      theme,
      isLoaded,
      projectPath,
      currentMap,
      currentMapObj,
      mapList,
      notifications
    } = this.props.store;
    return (
      <div>
        <Menubar
          theme={theme}
          isLoaded={isLoaded}
          projectPath={projectPath}
          currentMap={currentMap}
        />
        { isLoaded && <Toolbar store={this.props.store} /> }
        <Canvas currentMap={currentMap} currentMapObj={currentMapObj} />
        <Notifications notifications={notifications} />
      </div>
    )
  }
}
