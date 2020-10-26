import React from "react";
import { ipcRenderer } from "electron";

export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: props.height,
      selected: props.data.index,
    };
    this.canvas = null;
    this.context = null;
  }
  componentDidMount() {
    window.onresize = this.onResize.bind(this);
    this.context = this.canvas.getContext("2d");
    if (!this.image) {
    this.image = new Image();
    this.image.src = this.getImgPath();
      this.image.onload = () => {
        this.refresh();
      };
    }
  }
  onResize() {
    this.setState({ height: window.innerHeight });
  }
  getFrame(x, y) {
    let frame = 0;
    const tileWidth = Number(this.props.data.cols);
    const tileHeight = Number(this.props.data.rows);
    const maxCols = iconsetWidth / tileWidth;
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
    this.canvas.width = this.image.width;
    this.canvas.height = this.image.height;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw();
  }
  draw() {
    this.context.drawImage(this.image, 0, 0);
    this.drawGrid();
  }
  drawGrid() {
    const context = this.context;
    const tileWidth = Number(this.props.data.cols);
    const tileHeight = Number(this.props.data.rows);

    // We add (tilesize) to width and height so we draw the last lines on the grid
    const width = this.image.width + tileWidth;
    const height = this.image.height + tileHeight;
    console.log(height)
    for (let x = 0; x < height; x += tileWidth) {
      context.moveTo(0, x);
      context.lineTo(width, x);
    }

    for (let y = 0; y < width; y += tileHeight) {
      context.moveTo(y, 0);
      context.lineTo(y, height);
    }

    context.strokeStyle = "white";
    context.stroke();
  }
  onClick(index) {
    this.setState({ selected: index });
  }
  onOk = () => {
    ipcRenderer.send("setFrameIndex", this.state.selected);
    window.close();
  };
  render() {
    const style = {
      height: this.state.height - 35,
      position: "relative",
    };

    return (
      <div>
        <div className="frameSelect" style={style}>
          <canvas ref={(c) => this.canvas = c}></canvas>
        </div>
        <div className="fixedRight">
          <button onClick={this.onOk}>Ok</button>
          <button onClick={window.close}>Cancel</button>
        </div>
      </div>
    );
  }
}
