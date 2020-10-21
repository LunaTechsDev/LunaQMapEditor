import React from "react";
import Store from "./../store";
import { remote } from "electron";
import path from "path";

import Stage from "./../display/stage";

const MENUBAR_HEIGHT = 34;

export default class Canvas extends React.Component {
  componentWillMount() {
    window.addEventListener("resize", this.onResize);
    window.addEventListener("mouseup", this.onMouseUp);
  }
  componentDidMount() {
    Store.setup(this.canvas);
    Store.ticker.add(this.updatePIXI);
  }
  updatePIXI = () => {
    Store.renderer.render(Stage);
    Stage.update();
    if (this._isDragging) {
      this.updateDrag();
    }
    Store.updateInput();
  };
  updateDrag() {
    const { x, y } = remote.screen.getCursorScreenPoint();
    const dx = this._mouseX - x;
    const dy = this._mouseY - y;
    Stage.x -= dx;
    Stage.y -= dy;
    this._mouseX = x;
    this._mouseY = y;
  }
  onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight - MENUBAR_HEIGHT;
    Store.renderer.resize(width, height);
  };
  onClick = (event) => {
    if (Store.currentMapObj > -1 && !Stage.isAnyObjTouched()) {
      Store.selectMapObj(-1);
    }
    this.canvas.focus();
  };
  onMouseDown = (event) => {
    if (this.props.currentMap === -1) return;
    if (event.button === 1 || event.button === 2) {
      const { x, y } = remote.screen.getCursorScreenPoint();
      this._mouseX = x;
      this._mouseY = y;
      this._isDragging = true;
      this._draggingWith = event.button;
    }
  };
  onMouseUp = (event) => {
    if (this.props.currentMap === -1) return;
    if (this._isDragging && event.button === this._draggingWith) {
      this._isDragging = false;
    }
  };
  onWheel = (event) => {
    if (this.props.currentMap === -1) return;
    const x = event.pageX - event.target.offsetLeft;
    const y = event.pageY - event.target.offsetTop;
    Stage.zoomAt(x, y, event.deltaY);
  };
  onDrop = (event) => {
    if (this.props.currentMap === -1) return;
    const x = event.pageX - event.target.offsetLeft;
    const y = event.pageY - event.target.offsetTop;
    const pos = Stage.toLocal(new PIXI.Point(x, y));
    for (let file of event.dataTransfer.files) {
      if (file.type === "image/png") {
        let filePath = path.relative(Store.projectPath, file.path);
        let mapObj = Store.addMapObj({
          filePath,
          x: pos.x,
          y: pos.y,
        });
      }
    }
  };
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }
  render() {
    return (
      <canvas
        className="pixi"
        tabIndex="0"
        ref={(ref) => {
          this.canvas = ref;
        }}
        onClick={this.onClick}
        onMouseDown={this.onMouseDown}
        onWheel={this.onWheel}
        onDragOver={() => {
          return false;
        }}
        onDrop={this.onDrop}
      />
    );
  }
}
