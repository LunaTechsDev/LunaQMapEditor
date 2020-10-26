import React from "react";
import { ipcRenderer } from "electron";

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
    this.context = null;
  }
  componentDidMount() {
    window.onresize = this.onResize.bind(this);
    this.context = this.canvas.getContext("2d");
    if (!this.image) {
    this.image = new Image();
    this.image.src = this.getImgPath();
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
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
    this.canvas.width = this.image.width;
    this.canvas.height = this.image.height;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw();
  }
  draw() {
    this.context.drawImage(this.image, 0, 0);
    this.drawGrid();
    this.drawSelector();
  }
  drawGridByColsRows () {
    const context = this.context;
    const cols = Number(this.props.data.cols);
    const rows = Number(this.props.data.rows);

    // We add (tilesize) to width and height so we draw the last lines on the grid
    const width = this.image.width + 48;
    const height = this.image.height + 48;
    const frameW = this.image.width / cols;
    const frameH =  this.image.height / rows;
    for (let x = 0; x < height; x += frameW) {
      context.moveTo(0, x);
      context.lineTo(width, x);
    }

    for (let y = 0; y < width; y += frameH) {
      context.moveTo(y, 0);
      context.lineTo(y, height);
    }

    context.strokeStyle = "white";
    context.stroke();
  }
  drawGrid() {
    if (this.props.data.gridType === "colsRows") {
      this.drawGridByColsRows();
      return;
    }
    const context = this.context;
    const tileWidth = Number(this.props.data.cols);
    const tileHeight = Number(this.props.data.rows);
    // We add (tilesize) to width and height so we draw the last lines on the grid
    const width = this.image.width + tileWidth;
    const height = this.image.height + tileHeight;
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
  drawSelector() {
    const frame = this.getFrame(this.mouseX, this.mouseY);
    const x = frame.x * 48;
    const y = frame.y * 48; 
    // draw highlighter
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
