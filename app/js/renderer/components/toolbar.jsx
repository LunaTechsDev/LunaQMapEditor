import React from 'react'
import Store from '../store'
import { observer } from 'mobx-react'

import MapList from './toolbarMapList.jsx'
import ObjList from './toolbarObjList.jsx'
import Properties from './toolbarProperties.jsx'
import ContextMenu from './contextMenu.jsx'

@observer
export default class Toolbar extends React.Component {
  render() {
    const {
      projectPath,
      mapList,
      currentMap,
      currentMapObj,
      mapObjects,
      mapObject,
      context
    } = this.props.store;
    return (
      <div>
        <MapList
          mapList={mapList}
          currentMap={currentMap}
        />
        <ObjList
          mapObjects={mapObjects}
          currentMap={currentMap}
          currentMapObj={currentMapObj}
          selectedContext={context.type === 'mapObj' ? context.selected : -1}
        />
        <Properties
          projectPath={projectPath}
          mapObject={mapObject}
        />
        <ContextMenu context={context} />
      </div>
    )
  }
}
