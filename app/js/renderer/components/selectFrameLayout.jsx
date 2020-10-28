import React from "react";
import { ipcRenderer } from "electron";
import Store from "../store";
import * as PIXI from "pixi.js";

export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: props.height,
      selected: props.data.index,
    };
    this.mouseX = 0;
    this.mouseY = 0;
    this.canvas = null;
    this.ticker = new PIXI.Ticker();
    this.loader = props.data.loader;
  }
  componentDidMount() {
    window.onresize = this.onResize.bind(this);
    this.setupPixi();
  }
  setupPixi() {
    if (this.renderer) {
      return;
    }
    this.renderer = new PIXI.Renderer({
      width: window.innerWidth,
      height: this.props.height,
      view: this.canvas,
      transparent: true,
      antialias: false,
    });

    PIXI.Loader.shared.add("tilesheet", this.getImgPath());

    PIXI.Loader.shared.load((loader, resources) => {
      this.grid = new PIXI.Graphics();
      this.selector = new PIXI.Graphics()
      this.stage = new PIXI.Container();
      this.image = new PIXI.Sprite(resources.tilesheet.texture);
      this.stage.addChild(this.image, this.grid, this.selector);

      this.refresh();
      this.ticker.add(this.update.bind(this));
      this.ticker.start();
    });
  }
  onResize() {
    this.setState({ height: window.innerHeight });
  }
  getFrame(x, y) {
    let frame = 0;
    const tileWidth = Number(this.props.data.cols);
    const tileHeight = Number(this.props.data.rows);
    const maxCols = this.image.width / tileWidth;
    const frameX = Math.floor(x / tileWidth);
    const frameY = Math.floor(y / tileHeight);

    if (frameY > 0) {
      for (let i = -1; i < frameY; i++) {
        frame += maxCols;
      }
      frame = frame - Math.abs(frameX - maxCols);
    } else {
      frame = frameX;
    }

    return frame;
  }
  getImgPath() {
    let filePath = this.props.data.filePath.split("\\");
    let file = filePath.pop().split(".");
    file[0] = encodeURIComponent(file[0]);
    file = file.join(".");
    filePath.push(file);
    filePath = filePath.join("\\");
    return this.props.data.projectPath + "\\" + filePath;
  }
  refresh() {
    this.draw();
  }
  draw() {
    this.drawGrid();
    this.drawSelector();
  }
  drawGrid() {
    this.grid.clear();
    this.grid.lineStyle(1, 0xffffff)
    if (this.props.data.gridType === "colsRows") {
      this.drawGridByColsRows();
      return;
    }
    const tileWidth = Number(this.props.data.cols);
    const tileHeight = Number(this.props.data.rows);
    const width = this.image.width;
    const height = this.image.height;

    for (let x = 0; x < height + tileWidth; x += tileWidth) {
      this.grid.moveTo(0, x);
      this.grid.lineTo(width, x);
    }

    for (let y = 0; y < width + tileHeight; y += tileHeight) {
      this.grid.moveTo(y, 0);
      this.grid.lineTo(y, height);
    }
    this.grid.endFill();
  }
  drawGridByColsRows() {
    const cols = Number(this.props.data.cols);
    const rows = Number(this.props.data.rows);
    const width = this.image.width + 48;
    const height = this.image.height + 48;
    const frameW = this.image.width / cols;
    const frameH = this.image.height / rows;

    for (let x = 0; x < height + frameW; x += frameW) {
      this.grid.moveTo(0, x);
      this.grid.lineTo(width, x);
    }
    
    for (let y = 0; y < width + frameH; y += frameH) {
      this.grid.moveTo(y, 0);
      this.grid.lineTo(y, height);
    }
    this.grid.endFill();
  }
  drawSelector() {
    const frame = this.getFrame(this.mouseX, this.mouseY);
    const x = frame * 48;
    const y = frame * 48;
    this.selector.lineStyle(1, 0xffffff);
    this.selector.beginFill(0xffffff, 0);
    this.selector.drawRect(x, y, x + 48, y + 48);
    this.selector.endFill();
  }
  onMouseDown(index) {
    this.setState({ selected: index });
  }
  onMouseMove(event) {
    const x = event.pageX;
    const y = event.pageY;
    this.mouseX = x;
    this.mouseY = y;
    this.refresh();
  }
  onOk = () => {
    ipcRenderer.send("setFrameIndex", this.state.selected);
    window.close();
  };
  update() {
    this.renderer.render(this.stage);
  }
  render() {
    const style = {
      height: this.state.height - 35,
      position: "relative",
    };

    return (
      <div>
        <div className="frameSelect" style={style}>
          <canvas ref={(c) => (this.canvas = c)}></canvas>
        </div>
        <div className="fixedRight">
          <button onClick={this.onOk}>Ok</button>
          <button onClick={window.close}>Cancel</button>
        </div>
      </div>
    );
  }
}
