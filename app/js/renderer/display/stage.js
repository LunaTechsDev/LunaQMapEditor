import Store from "./../store";
import { observe } from "mobx";
import Sprite from "./sprite";
import * as PIXI from "pixi.js";
import { ShaderTilemap } from "./Tilemap";

const TILE_COLOR = 0xffffff;
const TILE_OUTLINE = 0xe0e0e0;

const ZOOM_AMT = 0.1;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 2;

class Stage extends PIXI.Container {
  constructor() {
    super();
    this.addListeners();
    this.create();
    this.setGrid(48, 48);
    this.x = 400;
    this.y = 50;
  }
  create() {
    this._mapBG = new PIXI.Graphics();
    this.addChild(this._mapBG);
    this._tilemap = new ShaderTilemap(
      this._mapWidth * 48,
      this._mapHeight * 48
    );
    this.addChild(this._tilemap);
    this._objContainer = new PIXI.Container();
    this.addChild(this._objContainer);
    this._mapGrid = new PIXI.Graphics();
    this._mapGrid.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    this.addChild(this._mapGrid);
    this._mapEvents = new PIXI.Container();
    this.addChild(this._mapEvents);
  }
  s;
  addListeners() {
    observe(Store, "currentMap", this.onCurrentMapChange);
  }
  onCurrentMapChange = (change) => {
    PIXI.utils.clearTextureCache();
    const id = change.newValue;
    if (this._observing) {
      this._observing();
      this._observing = null;
    }
    if (id !== -1 && Store.mapData) {
      this.alpha = 1;
      this.setSize(Store.mapData.width, Store.mapData.height);
      this.setObjects(Store.mapObjects);
      this.drawMapBG();
      this.drawMapTiles();
      this.drawMapEvents(Store.mapData.events);
      this._observing = observe(
        Store.mapObjects,
        this.onMapObjectsChange.bind(this)
      );
    } else {
      this.alpha = 0;
    }
  };
  onMapObjectsChange(change) {
    const { type, added, removed } = change;
    if (type === "splice") {
      added.forEach((obj) => {
        this.addObject(obj);
      });
      removed.forEach((obj) => {
        this.removeObject(obj);
      });
      this.sortObjects();
    }
  }
  setSize(width, height) {
    this._mapWidth = width;
    this._mapHeight = height;
  }
  setGrid(width, height) {
    this._gridWidth = width;
    this._gridHeight = height;
  }
  drawMapBG() {
    const fullMapWidth = this._mapWidth * this._gridWidth;
    const fullMapHeight = this._mapHeight * this._gridHeight;
    this._mapBG.clear();
    this._mapBG.beginFill(TILE_COLOR);
    this._mapBG.drawRect(0, 0, fullMapWidth, fullMapHeight);
    this._mapBG.endFill();
    this._mapGrid.clear();
    this._mapGrid.lineStyle(1, TILE_OUTLINE, 1);
    for (let x = 0; x <= this._mapWidth; x++) {
      this._mapGrid.moveTo(x * this._gridWidth, 0);
      this._mapGrid.lineTo(x * this._gridWidth, fullMapHeight);
    }
    for (let y = 0; y <= this._mapHeight; y++) {
      this._mapGrid.moveTo(0, y * this._gridHeight);
      this._mapGrid.lineTo(fullMapWidth, y * this._gridHeight);
    }
  }
  resize() {
    const tilemap = this._tilemap;
    if (!tilemap) return;
    const width = this._mapWidth * 48;
    const height = this._mapHeight * 48;
    tilemap.width = (width + 2 * tilemap._margin) * 1;
    tilemap.height = (height + 2 * tilemap._margin) * 1;
    this.scale.x = 1.0 / 1;
    this.scale.y = 1.0 / 1;
    this.filterArea = new PIXI.Rectangle(0, 0, width * 1, height * 1);
  }
  drawMapTiles() {
    PIXI.Loader.shared.load((loader, resources) => {
      // Get tileset info and tile data

      const tilesetId = Store.mapData.tilesetId;
      const tileset = Store.tilesetsData[tilesetId];
      const tilesetNames = tileset.tilesetNames;

      const width = this._mapWidth * 48;
      const height = this._mapHeight * 48;

      const tilemap = this._tilemap;
      while (tilemap.bitmaps.length > 0) {
        tilemap.bitmaps.pop();
      }

      for (var i = 0; i < tilesetNames.length; i++) {
        var texture =
          resources[tilesetNames[i]] && resources[tilesetNames[i]].texture;
        tilemap.bitmaps.push(texture);
        if (texture) {
          texture.baseTexture.mipmap = true;
        }
        if (i === tilesetNames.length - 1) {
          tilemap._updateBitmaps(); // Force update to bitmaps
        }
      }

      tilemap.flags = tileset.flags;
      tilemap.setData(this._mapWidth, this._mapHeight, Store.mapData.data);
      tilemap.refresh();
      this.resize();
    });
  }
  drawMapEvents(events) {
    this._mapEvents.removeChildren();
    for (let i = 0; i < events.length; i++) {
      if (events[i]) {
        const { x, y } = events[i];
        const style = {
          fontFamily: "Roboto",
          fontWeight: "bold",
          fill: 0x00ffff,
          strokeThickness: 0.5,
        };
        const sprite = new PIXI.Text("E", style);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.x = (x + 0.5) * this._gridWidth;
        sprite.y = (y + 0.5) * this._gridHeight;
        sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        this._mapEvents.addChild(sprite);
      }
    }
  }
  setObjects(newMapObjects = []) {
    let i;
    for (i = 0; i < this._objContainer.children.length; i++) {
      const sprite = this._objContainer.children[i];
      if (sprite) {
        sprite.removeListeners();
      }
    }
    this._objContainer.removeChildren();
    for (i = 0; i < newMapObjects.length; i++) {
      this.addObject(newMapObjects[i]);
    }
    this.sortObjects();
  }
  sortObjects() {
    this._objContainer.children.sort((a, b) => {
      if (a.z !== b.z) {
        return a.z - b.z;
      } else {
        return a.y - b.y;
      }
    });
    this._hasSorted = true;
  }
  addObject(obj) {
    const sprite = new Sprite(obj);
    this._objContainer.addChild(sprite);
  }
  removeObject(obj) {
    for (let i = 0; i < this._objContainer.children.length; i++) {
      const sprite = this._objContainer.children[i];
      if (sprite && sprite._obj === obj) {
        this._objContainer.removeChild(sprite);
        sprite.removeListeners();
        break;
      }
    }
  }
  zoomAt(x, y, deltaY) {
    let localPos = this.toLocal(new PIXI.Point(x, y));
    if (deltaY < 0) {
      this.scale.x = Math.min(this.scale.x + ZOOM_AMT, ZOOM_MAX);
      this.scale.y = Math.min(this.scale.y + ZOOM_AMT, ZOOM_MAX);
    } else {
      this.scale.x = Math.max(this.scale.x - ZOOM_AMT, ZOOM_MIN);
      this.scale.y = Math.max(this.scale.y - ZOOM_AMT, ZOOM_MIN);
    }
    this.x = -(localPos.x * this.scale.x) + x;
    this.y = -(localPos.y * this.scale.y) + y;
  }
  screenShot() {
    if (!Store.renderer) return;
    if (Store.currentMap > 0) {
      const width = this._mapWidth * 48;
      const height = this._mapHeight * 48;
      const renderTexture = PIXI.RenderTexture.create(width, height);
      const selected = Store.currentMapObj;
      const oldX = this.x;
      const oldY = this.y;
      const oldScaleX = this.scale.x;
      const oldScaleY = this.scale.y;
      this.x = 0;
      this.y = 0;
      this.scale.x = 48 / Store.gridWidth;
      this.scale.y = 48 / Store.gridHeight;
      Store.selectMapObj(-1);
      Store.renderer.render(this, renderTexture);
      let image = Store.renderer.extract.base64(renderTexture);
      image = image.replace(/^data:image\/\w+;base64,/, "");
      Store.saveScreenshot(image);
      Store.selectMapObj(selected);
      this.x = oldX;
      this.y = oldY;
      this.scale.x = oldScaleX;
      this.scale.y = oldScaleY;
      renderTexture.destroy(true);
    }
  }
  isObjectAt(x, y) {
    let localPos = this.toLocal(new PIXI.Point(x, y));
    x = localPos.x;
    y = localPos.y;
    const mapObjs = this._objContainer.children;
    return mapObjs.some((o) => {
      return x > o.x && x < o.x + o.width && y > o.y && y < o.y + o.height;
    });
  }
  update() {
    const mapObjs = this._objContainer.children;
    for (let i = 0; i < mapObjs.length; i++) {
      mapObjs[i].update();
    }
    this._tilemap.update();
  }
}

export default new Stage();
