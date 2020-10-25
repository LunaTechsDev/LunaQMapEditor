import React from "react";
import Store from "../store";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import { remote, ipcRenderer } from "electron";
import path from "path";

const EXTRAS = ["On Player", "Collider", "Tone", "Breath"];

@observer
export default class ToolbarProperties extends React.Component {
  componentWillMount() {
    ipcRenderer.on("setFrameIndex", this.onSetIndex);
    ipcRenderer.on("setCondition", this.onSetCondition);
  }
  componentWillUnmount() {
    ipcRenderer.removeListener("setCondition", this.onSetCondition);
  }
  updateProperty(key, value) {
    this.props.mapObject[key] = value;
  }
  updateExtra(key, value) {
    this.props.mapObject.meta[key] = value;
  }
  onChange = (e) => {
    const prop = e.target.name;
    let value = e.target.value;
    switch (prop) {
      case "cols":
      case "rows":
      case "x":
      case "y":
      case "z": {
        if (!/^-?[0-9]*$/.test(value)) {
          value = this.props.mapObject[prop];
        }
        break;
      }
      case "anchorX":
      case "anchorY":
      case "scaleX":
      case "scaleY":
      case "angle": {
        if (!/^-?[0-9]*(\.?[0-9]*)?$/.test(value)) {
          value = this.props.mapObject[prop];
        }
        break;
      }
      case "notes": {
        let changed = false;
        const oldMeta = this.props.mapObject.meta;
        const newMeta = Store.makeMeta(value);
        for (let prop in newMeta) {
          changed = oldMeta[prop] !== newMeta[prop];
          if (changed) break;
        }
        if (!changed) {
          for (let prop in oldMeta) {
            changed = oldMeta[prop] !== newMeta[prop];
            if (changed) break;
          }
        }
        if (changed) {
          this.updateProperty("meta", newMeta);
        }
        break;
      }
    }
    this.updateProperty(prop, value);
  };
  onWheel = (e) => {
    e.preventDefault();
    const prop = e.target.name;
    const dir = e.deltaY > 0 ? -1 : 1;
    let value = Number(e.target.value) || 0;
    switch (prop) {
      case "cols":
      case "rows":
      case "x":
      case "y":
      case "z":
      case "angle": {
        value += 1 * dir;
        break;
      }
      case "scaleX":
      case "scaleY":
      case "anchorX":
      case "anchorY": {
        value += 0.1 * dir;
        break;
      }
    }
    this.updateProperty(prop, String(value));
  };
  openFile = () => {
    const filePaths = remote.dialog.showOpenDialogSync({
      title: "Select Image",
      defaultPath: this.props.mapObject.filePath,
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "png"],
        },
      ],
    });
    if (!filePaths) return;
    let filePath = path.relative(this.props.projectPath, filePaths[0]);
    this.updateProperty("isQSprite", Store.isQSprite(filePath));
    this.updateProperty("pose", "");
    this.updateProperty("filePath", filePath);
  };
  openSelectCondition = (e) => {
    const { projectPath, mapObject } = this.props;
    const conditions = toJS(mapObject.conditions);
    const index = Number(e.target.value);
    ipcRenderer.send("openSelectCondition", {
      projectPath,
      conditions,
      index,
    });
  };
  onSetCondition = (e, data) => {
    const { index, type, value } = data;
    if (index === -1) {
      this.props.mapObject.conditions.push({
        type,
        value,
      });
    } else {
      this.props.mapObject.conditions[index] = {
        type,
        value,
      };
    }
  };
  onDeleteCondition = (e) => {
    const index = Number(e.target.id);
    this.props.mapObject.conditions.splice(index, 1);
  };
  openSelectIndex = () => {
    const { projectPath } = this.props;
    const { filePath, cols, rows, index, height, width } = this.props.mapObject;
    ipcRenderer.send("openSelectFrame", {
      projectPath,
      filePath,
      cols,
      rows,
      index,
      width: width * cols,
      height: height * rows,
    });
  };
  onSetIndex = (e, value) => {
    this.updateProperty("index", value);
  };
  addExtra = () => {
    // TODO
  };
  body() {
    const {
      name,
      x,
      y,
      z,
      scaleX,
      scaleY,
      angle,
      anchorX,
      anchorY,
      filePath,
      type,
      cols,
      rows,
      index,
      speed,
      conditions,
      notes,
      meta,
      isQSprite,
      pose,
    } = this.props.mapObject;
    // TODO make each block a seperate component?
    return (
      <div className="propsContainer">
        {this.nameBlock(name)}
        {this.positionBlock(x, y, z)}
        {this.transformBlock(scaleX, scaleY, angle)}
        {!isQSprite && this.anchorBlock(anchorX, anchorY)}
        {this.imageBlock(filePath, type, pose, isQSprite)}
        {!isQSprite && this.imageGridBlock(type, cols, rows, index, speed)}
        {this.conditionsBlock(conditions)}
        {this.notesBlock(notes)}
        {/*this.block9(meta)*/}
      </div>
    );
  }
  nameBlock(name) {
    return (
      <div className="props">
        <div className="full">
          <label htmlFor="text">Name</label>
          <input
            type="text"
            onChange={this.onChange}
            name="name"
            value={name}
          />
        </div>
      </div>
    );
  }
  positionBlock(x, y, z) {
    return (
      <div className="props">
        <div className="third">
          <label htmlFor="x">x</label>
          <input
            type="text"
            onChange={this.onChange}
            onWheel={this.onWheel}
            name="x"
            value={Math.round(x)}
          />
        </div>
        <div className="third">
          <label htmlFor="y">y</label>
          <input
            type="text"
            onChange={this.onChange}
            onWheel={this.onWheel}
            name="y"
            value={Math.round(y)}
          />
        </div>
        <div className="third">
          <label htmlFor="z">z</label>
          <input
            type="text"
            onChange={this.onChange}
            onWheel={this.onWheel}
            name="z"
            value={z}
          />
        </div>
      </div>
    );
  }
  transformBlock(scaleX, scaleY, angle) {
    return (
      <div className="props">
        <div className="third">
          <label htmlFor="scaleX">ScaleX</label>
          <input
            type="text"
            onChange={this.onChange}
            onWheel={this.onWheel}
            name="scaleX"
            value={scaleX}
          />
        </div>
        <div className="third">
          <label htmlFor="scaleY">ScaleY</label>
          <input
            type="text"
            onChange={this.onChange}
            onWheel={this.onWheel}
            name="scaleY"
            value={scaleY}
          />
        </div>
        <div className="third">
          <label htmlFor="angle">Angle</label>
          <input
            type="text"
            onChange={this.onChange}
            onWheel={this.onWheel}
            name="angle"
            value={angle}
          />
        </div>
      </div>
    );
  }
  anchorBlock(anchorX, anchorY) {
    return (
      <div className="props">
        <div className="half">
          <label htmlFor="anchorX">AnchorX</label>
          <input
            type="text"
            onChange={this.onChange}
            onWheel={this.onWheel}
            name="anchorX"
            value={anchorX}
          />
        </div>
        <div className="half">
          <label htmlFor="anchorY">AnchorY</label>
          <input
            type="text"
            onChange={this.onChange}
            onWheel={this.onWheel}
            name="anchorY"
            value={anchorY}
          />
        </div>
      </div>
    );
  }
  imageBlock(filePath, type, pose, isQSprite) {
    if (isQSprite) {
      return this.block5B(filePath, pose, isQSprite);
    }
    return (
      <div className="props">
        <div className="half">
          <label htmlFor="image">Image</label>
          <button name="image" onClick={this.openFile}>
            Select File
          </button>
          <small>{filePath}</small>
        </div>
        <div className="half">
          <label htmlFor="type">Type</label>
          <select value={type} onChange={this.onChange} name="type">
            <option value="full">Full</option>
            <option value="spritesheet">SpriteSheet</option>
            <option value="animated">Animated</option>
          </select>
        </div>
      </div>
    );
  }
  qSpriteBlock(filePath, pose, isQSprite) {
    const { poses } = Store.getQSprite(isQSprite);
    let list = [];
    for (let pose in poses) {
      if (poses.hasOwnProperty(pose)) {
        list.push(
          <option key={`pose-${pose}`} value={pose}>
            {pose}
          </option>
        );
      }
    }
    return (
      <div className="props">
        <div className="half">
          <label htmlFor="image">Image</label>
          <button name="image" onClick={this.openFile}>
            Select File
          </button>
          {filePath}
        </div>
        <div className="half">
          <label htmlFor="pose">Pose</label>
          <select value={pose} onChange={this.onChange} name="pose">
            <option value=""></option>
            {list}
          </select>
        </div>
      </div>
    );
  }
  imageGridBlock(type, cols, rows, index, speed) {
    if (type !== "spritesheet" && type !== "animated") return null;
    return (
      <div className="props">
        <div className="third">
          <label htmlFor="cols">Cols</label>
          <input
            type="text"
            onChange={this.onChange}
            onWheel={this.onWheel}
            name="cols"
            value={cols}
          />
        </div>
        <div className="third">
          <label htmlFor="rows">Rows</label>
          <input
            type="text"
            onChange={this.onChange}
            onWheel={this.onWheel}
            name="rows"
            value={rows}
          />
        </div>
        {type === "spritesheet" && (
          <div className="third">
            <label htmlFor="frame">Frame</label>
            <button name="frame" onClick={this.openSelectIndex}>
              Select
            </button>
          </div>
        )}
        {type === "animated" && (
          <div className="third">
            <label htmlFor="speed">Speed</label>
            <input
              type="text"
              onChange={this.onChange}
              name="speed"
              value={speed}
            />
          </div>
        )}
      </div>
    );
  }
  conditionsBlock(conditions) {
    return (
      <div className="props">
        <div className="full">Conditions</div>
        <div className="full conditions">
          {conditions.map((v, i) => {
            const { type, value } = v;
            return (
              <div
                value={i}
                className="full condition"
                key={`condition-${i}`}
                onDoubleClick={this.openSelectCondition}
              >
                <div className="col1">{type.toUpperCase()}</div>
                <div className="col2">{value.join(": ")}</div>
                <i
                  onClick={this.onDeleteCondition}
                  id={i}
                  className="col3"
                  aria-hidden
                />
              </div>
            );
          })}
        </div>
        <div className="full">
          <button value="-1" onClick={this.openSelectCondition}>
            New Condition
          </button>
        </div>
      </div>
    );
  }
  notesBlock(notes) {
    return (
      <div className="props">
        <div className="full">
          <label htmlFor="notes">Notes</label>
          <textarea onChange={this.onChange} name="notes" value={notes} />
        </div>
      </div>
    );
  }
  metaBlock(meta) {
    return (
      <div className="props">
        <div className="full">
          <label htmlFor="extras">Extras</label>
          <button name="extras" onClick={this.addExtra}>
            <i className="fa fa-plus" aria-hidden />
            New
          </button>
        </div>
        {/* TODO show list of set extras here */}
      </div>
    );
  }
  render() {
    const { mapObject } = this.props;
    const style = {
      right: mapObject ? 0 : -225,
    };
    return (
      <div className="toolbar properties" style={style}>
        <div className="header">Object Properties</div>
        {mapObject && this.body()}
      </div>
    );
  }
}
