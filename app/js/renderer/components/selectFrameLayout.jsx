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
    this.image = new Image();
  }
  componentDidMount() {
    window.onresize = this.onResize.bind(this);
    this.context = this.canvas.getContext("2d");
    window.requestAnimationFrame((time => {
      this.updateCanvas(time);
    }))
    this.image.src = this.getImgPath();
    this.image.onload = () => {
      this.refresh();
    }
  }
  onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = this.props.data.height;
    this.refresh();
    this.setState({ height: window.innerHeight });
  }
  getFrame(x, y) {
      let frame = 0
      const tileWidth = 48
      const tileHeight = 48
      const maxCols = iconsetWidth / iconWidth
      const frameX = Math.floor(x / iconWidth)
      const frameY = Math.floor(y / iconHeight)

      if (frameY > 0) {
        for (let i = -1; i < frameY; i++) {
          frame += maxCols
        }
        frame = frame - Math.abs(frameX - maxCols)
      } else {
        frame = frameX
      }

      return frame
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
  refresh(){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw();
  }
  draw() {
    this.context.drawImage(this.image, 10, 10);
    this.drawGrid();
  }
  drawGrid() {
    const context = this.context;
    const width = this.image.width;
    const height = this.image.height;

    for (let x = 0; x < width; x += 48) {
      context.moveTo(0, x);
      context.lineTo(width, x);
    }
    for (let y = 0; y < height; y += 48) {
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
  updateCanvas(time) {
    // 
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
