import React from "react";
import Classnames from "classnames";
import Youtube from "react-player";
import axios from "axios";
import "./canvasGameStyles.scss";
import { ExtendedTimer } from "./Timers";
import "./gameLoadStyles.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faHome,
  faBinoculars,
  faUserCircle,
  faComments,
  faMapMarkedAlt,
  faMountain
} from "@fortawesome/free-solid-svg-icons";

const sliders = ["1", "2", "3", "4"],
  notes = ["U", "D", "L", "R"];

/* Błąd przy odpauzowaniu wideo */

interface SongJson {
  header: {
    title: string;
    author: string;
    videoId: string;
    bpm: number;
    videoStartingPoint?: number;
    startOffset?: number;
    endOffset?: number;
    devStartingTact?: number;
    videoStartingOffset?: number;
  };
  notes: Array<Array<Array<string | number> | number | string> | number>;
}

interface GameProps {
  header: {
    title: string;
    author: string;
    videoId: string;
    bpm: number;
    videoStartingPoint?: number;
    videoStartingOffset?: number;
    startOffset?: number;
    endOffset?: number;
  };
  notes: Tiles[];
  devStartingHexNote: number;
}
interface Fields {
  x: number;
}
interface Tiles {
  sliderFillPercent: any;
  sliderFill: any;
  x: number;
  ref?: any;
  hexNote: number;
  type: string;
  wasHit?: boolean;
  length?: number;
  isActivated?: boolean;
}

interface GameState {
  gameStarted: boolean;
  muted: boolean;
  notes?: string;
  fields: Fields[];
  tiles: Tiles[];
  points: number;
  maxPoints: number;
  currHexNote: number;
  interval?: any;
  playMusic: boolean;
  initializedVideo: boolean;
  playerRef?: any;
  restartTimer?: any;
  afterUnpause?: boolean;
  paused: boolean;
  pausedTiles: boolean;
  canvasRef: any;
  c?: CanvasRenderingContext2D;
  img?: [HTMLImageElement[], HTMLImageElement[]];

  gameSettings?: GameSettings;

  newGameTimer?: ExtendedTimer;
  videoPlayTimer?: ExtendedTimer;
}

interface GameSettings {
  author: string;
  title: string;
  videoId: string;
  tiles: Tiles[];
  bpm: number;
  startOffset: number;
  endOffset: number;
  initVideoState: number;
  devStartingHexNote: number;
  videoStartingOffset: number;
}

class Game extends React.Component<GameProps> {
  state: GameState = {
    fields: [],
    tiles: [],
    points: 0,
    maxPoints: 0,
    currHexNote: 0,
    playMusic: false,
    initializedVideo: false,
    gameStarted: false,
    playerRef: React.createRef(),
    canvasRef: React.createRef(),
    time: 0,
    prevNow: undefined,
    multiplier: 1,
    hitInRow: 0,

    paused: false,
    pausedTiles: true,
    muted: true,
    afterUnpause: false
  };

  compareLetters = [
    ["U", "1"],
    ["L", "2"],
    ["R", "3"],
    ["D", "4"]
  ];
  sliders = ["1", "2", "3", "4"];
  notes = ["U", "D", "L", "R"];

  constructor(props: GameProps) {
    super(props);

    this.test = props.test;

    this.win = props.win;
    this.state.gameSettings = {
      title: props.header.title,
      author: props.header.author,
      videoId: props.header.videoId,
      tiles: props.notes,
      bpm: props.header.bpm,
      startOffset: props.header.startOffset ? props.header.startOffset : 0,
      endOffset: props.header.endOffset ? props.header.endOffset : 0,
      initVideoState: props.header.videoStartingPoint
        ? props.header.videoStartingPoint
        : 0,
      devStartingHexNote: props.devStartingHexNote,
      videoStartingOffset: props.header.videoStartingOffset
    };
  }
  canvasLoadImages() {
    let upImg = new Image(),
      leftImg = new Image(),
      rightImg = new Image(),
      downImg = new Image(),
      s1Img = new Image(),
      s2Img = new Image(),
      s3Img = new Image(),
      s4Img = new Image();
    upImg.src = "assets/pictures/g-arrows/up.png";
    leftImg.src = "assets/pictures/g-arrows/left.png";
    rightImg.src = "assets/pictures/g-arrows/right.png";
    downImg.src = "assets/pictures/g-arrows/down.png";
    s1Img.src = "assets/pictures/g-sliders/1.png";
    s2Img.src = "assets/pictures/g-sliders/2.png";
    s3Img.src = "assets/pictures/g-sliders/3.png";
    s4Img.src = "assets/pictures/g-sliders/4.png";

    return [
      [upImg, leftImg, rightImg, downImg],
      [s1Img, s2Img, s3Img, s4Img]
    ];
  }

  w(value: number) {
    return window.innerWidth * (value / 100);
  }
  h(value: number) {
    return window.innerHeight * (value / 100);
  }

  canvas() {
    const canvas: HTMLCanvasElement = this.state.canvasRef.current;

    canvas.width = this.w(100);
    canvas.height = this.h(100);
    let c = canvas.getContext("2d"),
      img = this.canvasLoadImages();

    this.setState({
      c,
      img
    });

    window.onresize = async () => {
      let canvas: HTMLCanvasElement = this.state.canvasRef.current;
      if (!canvas) return;
      canvas.width = this.w(100);
      canvas.height = this.h(100);
      this.setState({
        c: canvas.getContext("2d")
      });
    };
  }

  countMultiplier(amount: number) {
    let multiplier = 1;
    if (amount >= 9) multiplier = 2;
    if (amount >= 18) multiplier = 3;
    if (amount >= 27) multiplier = 4;
    if (amount >= 36) multiplier = 5;
    return multiplier;
  }

  countHitsInRow(multiplier: number) {
    let hits = 0;
    if (multiplier === 2) hits = 8;
    if (multiplier === 3) hits = 17;
    if (multiplier === 4) hits = 26;
    if (multiplier === 5) hits = 35;
    return hits;
  }

  noHitPenelty() {
    this.setState((prev) => ({
      hitInRow: this.countHitsInRow(
        prev.multiplier === 1 ? 1 : prev.multiplier
      ),
      multiplier: prev.multiplier === 1 ? 1 : prev.multiplier - 1
    }));
  }

  moveGame(now) {
    let stripeH = this.h(10) > this.w(15) ? this.w(15) : this.h(10);
    let gamePadTop = this.h(50) - 2 * stripeH;
    let canvas: HTMLCanvasElement = this.state.canvasRef.current;
    if (!canvas) return;
    this.state.c.clearRect(0, 0, canvas.width, canvas.height);

    let longest = this.state.tiles[this.state.tiles.length - 1],
      longLen = 0;
    for (let tile of this.state.tiles) {
      //Find the longest note
      let len = tile.length ? tile.length : 0;
      longLen = longest.length ? longest.length : 0;

      if (longest.x + longLen < len + tile.x) {
        longest = tile;
      }
    }
    if (longest) {
      if (
        longest.pX +
          longLen * this.w(5) +
          this.w(10) +
          this.state.gameSettings.endOffset <
        0
      ) {
        this.state.theEnd = true;
        this.pause();
        this.win({
          points: this.state.points,
          maxPoints: this.state.maxPoints
        });
      } else requestAnimationFrame(this.moveGame.bind(this));
    } else {
      requestAnimationFrame(this.moveGame.bind(this));
    }

    let delta = (now - this.state.prevNow) / 1000;

    this.setState({
      prevNow: now
    });

    if (isNaN(delta)) return;
    if (!this.state.pausedTiles)
      this.setState((prev) => ({
        time: prev.time + delta,
        fpsTimeAccum:
          prev.fpsTimeAccum === undefined ? 0 : prev.fpsTimeAccum + delta,
        fpsCounter: prev.fpsCounter === undefined ? 0 : (prev.fpsCounter += 1),
        maxLICounter: prev.maxLICounter < delta ? delta : prev.maxLICounter
      }));

    if (
      (15 / this.state.gameSettings.bpm) * (this.state.currHexNote + 1) -
        this.state.time <=
      0
    ) {
      this.setState((prev) => ({
        currHexNote: prev.currHexNote === undefined ? 0 : prev.currHexNote + 1
      }));
    }

    if (this.state.fpsTimeAccum >= 1) {
      this.setState({
        fpsTimeAccum: 0,
        fpsCounter: 0,
        maxLICounter: 0,
        fps: this.state.fpsCounter,
        maxLI: this.state.maxLICounter
      });
    }

    let posW = this.h(7);
    if (posW > this.w(8)) posW = this.w(8);
    let sliders = [],
      buttons = [],
      buttonsFilter = [],
      buttonsFade = [];
    let cl;

    for (let tile of this.state.tiles) {
      //if (tile.pX === undefined) break;
      if (tile.pX < 0) continue;
      if (this.state[`m${tile.type}`] === "down" && tile.wasHit === false) {
        let s = this.w(5 * 4);
        let a = s - this.w(5) - posW / 2,
          b = s + this.w(5) + posW / 2;
        if (tile.pX >= a) {
          if (tile.pX <= b) {
            if (!cl) {
              cl = tile;
            } else if (Math.abs(s - tile.pX) < Math.abs(s - cl.pX)) {
              cl = tile;
            }
          } else break;
        }
      }
    }

    if (cl && this.state[`m${cl.type}`] === "down") {
      cl.isActivated = true;
      cl.wasHit = true;
      if (!(this.state.multiplier === 5 && this.state.hitInRow % 9 === 8))
        this.state.hitInRow++;

      this.state.multiplier = this.countMultiplier(this.state.hitInRow);

      if (this.notes.includes(cl.type)) {
        this.addPoints(25);
      }
    } else if (
      !cl &&
      (this.state.mU === "down" ||
        this.state.mL === "down" ||
        this.state.mD === "down" ||
        this.state.mR === "down" ||
        this.state.m1 === "down" ||
        this.state.m2 === "down" ||
        this.state.m3 === "down" ||
        this.state.m4 === "down")
    ) {
      this.noHitPenelty();
      this.setState((prev) => ({
        mU: prev.mU === "down" || prev.mU === "waitForUp" ? "waitForUp" : "up",
        mL: prev.mL === "down" || prev.mL === "waitForUp" ? "waitForUp" : "up",
        mR: prev.mR === "down" || prev.mR === "waitForUp" ? "waitForUp" : "up",
        mD: prev.mD === "down" || prev.mD === "waitForUp" ? "waitForUp" : "up",
        m1: prev.m1 === "down" || prev.m1 === "waitForUp" ? "waitForUp" : "up",
        m2: prev.m2 === "down" || prev.m2 === "waitForUp" ? "waitForUp" : "up",
        m3:
          prev.m3 === "down" || prev.m3 === "waitingForUp" ? "waitForUp" : "up",
        m4: prev.m4 === "down" || prev.m4 === "waitForUp" ? "waitForUp" : "up"
      }));
    }

    for (let tile of this.state.tiles) {
      if (
        !(
          this.state.gameSettings.devStartingHexNote <= tile.hexNote &&
          this.state.currHexNote > tile.hexNote &&
          this.state.currHexNote <=
            tile.hexNote + 21 + (tile.length ? tile.length * 5 : 2)
        )
      ) {
        continue;
      }
      let border = 2;

      if (this.notes.includes(tile.type) || this.sliders.includes(tile.type)) {
        let img, posY, sliderColor;

        if (tile.type === "U") {
          img = this.state.img[0][0];
          posY = (stripeH - posW) / 2;
        } else if (tile.type === "L") {
          img = this.state.img[0][1];
          posY = border + stripeH + (stripeH - posW) / 2;
        } else if (tile.type === "R") {
          img = this.state.img[0][2];
          posY = 2 * border + 2 * stripeH + (stripeH - posW) / 2;
        } else if (tile.type === "D") {
          img = this.state.img[0][3];
          posY = 2 * border + 3 * stripeH + (stripeH - posW) / 2;
        } else if (tile.type === "1") {
          img = this.state.img[1][0];
          posY = (stripeH - posW) / 2;
          sliderColor = "#D62B2B";
        } else if (tile.type === "2") {
          img = this.state.img[1][1];
          posY = border + stripeH + (stripeH - posW) / 2;
          sliderColor = "#00B51A";
        } else if (tile.type === "3") {
          img = this.state.img[1][2];
          posY = 2 * border + 2 * stripeH + (stripeH - posW) / 2;
          sliderColor = "#82A4F7";
        } else if (tile.type === "4") {
          img = this.state.img[1][3];
          posY = 2 * border + 3 * stripeH + (stripeH - posW) / 2;
          sliderColor = "#FFD400";
        }
        let sT = (15 * tile.hexNote) / this.state.gameSettings.bpm;
        let tT = 315 / this.state.gameSettings.bpm;
        let p = (this.state.time - sT) / tT;
        let posX = this.w(105 - 105 * p);

        if (tile.length) {
          sliders.push({
            color: sliderColor,
            x: Math.floor(posX + posW / 2),
            y: Math.floor(posY + posW / 3),
            w: tile.length * this.w(5),
            h: posW / 3
          });

          if (
            (tile.isActivated && this.state[`m${tile.type}`] === "waitForUp") ||
            this.state[`m${tile.type}`] === "down"
          ) {
            tile.wasActivated = true;
            let pointsToAdd = 20;

            if (tile) if (!tile.sliderFill) tile.posX = posX;
            if (tile.sliderFill === undefined) tile.sliderFill = 0;

            if (!tile.nextPoints) tile.nextPoints = pointsToAdd;
            if (
              tile.sliderFillPercent * 100 >= tile.nextPoints &&
              tile.nextPoints < 100
            ) {
              this.addPoints(pointsToAdd);
              tile.nextPoints += pointsToAdd;
            }

            tile.sliderFill += delta;
            tile.sliderFillPercent =
              (tile.sliderFill * this.state.gameSettings.bpm) /
              (15 * tile.length);

            if (tile.sliderFillPercent >= 1 && tile.isActivated) {
              if (tile.nextPoints === 100) {
                this.addPoints(pointsToAdd);
              }
              tile.isActivated = false;
              this.state[`m${tile.type}`] = "waitForUp";
            }
          } else {
            if (tile.sliderFill > 0 && tile.posX) {
              tile.posX = undefined;
            }
          }
          let sP = tile.sliderFillPercent ? tile.sliderFillPercent : 0;

          sliders.push({
            color: "#666666",
            x: Math.floor(posX + posW / 2),
            y: Math.floor(posY + posW / 3),
            w: tile.length * this.w(5) * sP,
            h: posW / 3
          });

          if (
            tile.wasHit &&
            (tile.opacity >= 0 || !tile.opacity) &&
            this.state[`m${tile.type}`] === "down"
          ) {
            if (!tile.hitX) {
              tile.hitX = posX;
              tile.opacity = 1;
              tile.width = posW;
            }
            tile.opacity -= 0.03;
            tile.width += 0.4;

            if (tile.opacity > 0)
              buttonsFade.push({
                opacity: tile.opacity,
                img,
                x: Math.floor(
                  tile.posX ? tile.posX : posX + tile.length * this.w(5) * sP
                ),
                y: Math.floor(posY),
                w: tile.width,
                h: tile.width
              });
          }
          if (sP >= 1 && !tile.isActivated)
            buttonsFilter.push({
              img,
              x: Math.floor(
                tile.posX ? tile.posX : posX + tile.length * this.w(5) * sP
              ),
              y: Math.floor(posY),
              w: posW,
              h: posW
            });
          tile.pX = Math.floor(
            tile.posX ? tile.posX : posX + tile.length * this.w(5) * sP
          );
          buttons.push({
            img,
            x: Math.floor(
              tile.posX ? tile.posX : posX + tile.length * this.w(5) * sP
            ),
            y: Math.floor(posY),
            w: posW,
            h: posW
          });
        } else {
          if (tile.wasHit && (tile.opacity >= 0 || !tile.opacity)) {
            if (!tile.hitX) {
              tile.hitX = posX;
              tile.opacity = 1;
              tile.width = posW;
            }
            tile.opacity -= 0.03;
            tile.width += 0.2;

            if (tile.opacity > 0)
              buttonsFade.push({
                opacity: tile.opacity,
                img,
                x: tile.hitX,
                y: posY,
                w: tile.width,
                h: tile.width
              });
          }
          if (tile.wasHit) {
            buttonsFilter.push({
              img,
              x: Math.floor(posX),
              y: Math.floor(posY),
              w: posW,
              h: posW,
              grayscale: tile.wasHit
            });
          }
          tile.pX = Math.floor(posX);

          buttons.push({
            img,
            x: Math.floor(posX),
            y: Math.floor(posY),
            w: posW,
            h: posW,
            grayscale: tile.wasHit
          });
        }
      }
      if (tile.pX <= 0) {
        if (!tile.ctdAsNotHit && !(tile.isActivated || tile.wasHit)) {
          this.noHitPenelty();
          tile.ctdAsNotHit = true;
        }
      }
    }

    if (cl && this.state[`m${cl.type}`] === "down") {
      this.state[`m${cl.type}`] = "waitForUp";
    }

    //Draw navbar

    this.state.c.fillRect(0, 0, this.w(100), this.h(10));

    let titleSize = 20;

    this.state.c.font = `${titleSize}px Arial`;
    this.state.c.fillStyle = "#ffffff";
    this.state.c.fillText(
      `${this.state.gameSettings.author} - ${this.state.gameSettings.title}`,
      this.w(10),
      this.h(5) + titleSize / 2
    );

    //Draw information bar

    this.state.c.fillStyle = "#000000";
    this.state.c.fillRect(0, this.h(80), this.w(100), this.h(20));

    this.state.c.beginPath();
    this.state.c.strokeStyle = "rgb(255, 255, 255)";
    this.state.c.lineWidth = 1;

    this.state.c.moveTo(0, this.h(83));
    this.state.c.lineTo(this.w(100), this.h(83));

    for (let i = 1; i < 8; i++) {
      this.state.c.moveTo(this.w((i * 100) / 8), this.h(83));
      this.state.c.lineTo(this.w((i * 100) / 8), this.h(85));
    }

    this.state.c.fillStyle = "rgb(0, 133, 6)";
    for (let i = 0; i < this.state.hitInRow % 9; i++) {
      this.state.c.fillRect(
        this.w((i * 100) / 8),
        this.h(83),
        this.w(100 / 8),
        this.h(2)
      );
    }

    this.state.c.moveTo(0, this.h(85));
    this.state.c.lineTo(this.w(100), this.h(85));
    this.state.c.moveTo(0, this.h(87));
    this.state.c.lineTo(this.w(100), this.h(87));
    this.state.c.stroke();

    this.state.c.fillStyle = "rgb(0, 133, 6)";
    this.state.c.filter = "invert(1)";
    this.state.c.fillRect(
      0,
      this.h(85),
      this.w(100 * (this.state.points / this.state.maxPoints)),
      this.h(2)
    );
    this.state.c.filter = "none";
    let text = `` + this.state.points;
    let textW = this.state.c.measureText(text).width;

    let pointsSize = 32;
    this.state.c.font = `${pointsSize}px Arial`;
    this.state.c.fillStyle = "rgb(255, 255, 255)";
    this.state.c.fillText(text, this.w(50) - textW / 2, this.h(95));

    let percentOfPoints = Math.round(
      (this.state.points * 100) / this.state.maxPoints
    );
    this.state.c.fillText(
      `${isNaN(percentOfPoints) ? 0 : percentOfPoints}%`,
      this.w(25),
      this.h(95)
    );

    this.state.c.fillText(`${this.state.multiplier}x`, this.w(70), this.h(95));

    this.state.c.font = `${pointsSize / 2}px Arial`;
    text = ` / ` + this.state.maxPoints;
    this.state.c.fillText(text, this.w(50) + textW + 5, this.h(92));

    //Draw the board
    this.state.c.fillStyle = "rgb(0, 0, 0, 0.8)";
    this.state.c.fillRect(
      0,
      gamePadTop - this.h(2),
      this.w(100),
      stripeH * 4 + this.h(2) * 2
    );
    this.state.c.fillStyle = "#000000";

    //Draw the clatch
    let s = this.w(5 * 4);
    let a = s - this.w(5) - posW / 4,
      b = s + this.w(5) + posW / 4;

    this.state.c.fillStyle = "rgba(0, 133, 6, 0.8)";
    this.state.c.fillRect(
      a,
      gamePadTop - this.h(2),
      b - a,
      4 * stripeH + this.h(2) * 2
    );
    this.state.c.fillStyle = "#000000";

    this.state.c.filter = "brightness(60%)";
    this.state.c.beginPath();
    this.state.c.strokeStyle = "rgb(0, 133, 6)";
    this.state.c.lineWidth = this.w(1);
    this.state.c.moveTo(s, gamePadTop - this.h(2));
    this.state.c.lineTo(s, gamePadTop + 4 * stripeH + this.h(2));
    this.state.c.stroke();

    this.state.c.beginPath();
    this.state.c.strokeStyle = "rgb(0, 133, 6)";
    this.state.c.lineWidth = this.w(0.2);
    this.state.c.moveTo(b, gamePadTop - this.h(2));
    this.state.c.lineTo(b, gamePadTop + 4 * stripeH + this.h(2));
    this.state.c.stroke();

    this.state.c.filter = "none";

    this.state.c.beginPath();
    this.state.c.strokeStyle = "rgb(0, 133, 6)";
    this.state.c.lineWidth = this.w(0.2);
    this.state.c.moveTo(a, gamePadTop - this.h(2));
    this.state.c.lineTo(a, gamePadTop + 4 * stripeH + this.h(2));
    this.state.c.stroke();

    this.state.c.beginPath();
    this.state.c.strokeStyle = "#ffffff";
    this.state.c.lineWidth = this.w(0.2);
    this.state.c.moveTo(0, gamePadTop);
    this.state.c.lineTo(this.w(100), gamePadTop);
    this.state.c.moveTo(0, gamePadTop + stripeH);
    this.state.c.lineTo(this.w(100), gamePadTop + stripeH);
    this.state.c.moveTo(0, gamePadTop + 2 * stripeH);
    this.state.c.lineTo(this.w(100), gamePadTop + 2 * stripeH);
    this.state.c.moveTo(0, gamePadTop + 3 * stripeH);
    this.state.c.lineTo(this.w(100), gamePadTop + 3 * stripeH);
    this.state.c.moveTo(0, gamePadTop + 4 * stripeH);
    this.state.c.lineTo(this.w(100), gamePadTop + 4 * stripeH);
    this.state.c.stroke();

    //Draw the

    this.state.c.font = "12px Arial";
    this.state.c.fillStyle = "black";
    this.state.c.fillText(
      `FPS: ${this.state.fps ? this.state.fps : 0}`,
      canvas.width - this.w(10),
      canvas.height - this.h(1)
    );
    this.state.c.fillText(
      `LI: ${this.state.maxLI}`,
      canvas.width - this.w(10),
      canvas.height - this.h(5)
    );
    this.state.c.font = "10px sans-serif";
    this.state.c.fillStyle = "#000000";

    for (let b of sliders) {
      this.state.c.fillStyle = b.color;
      this.state.c.fillRect(b.x, b.y + gamePadTop, b.w, b.h);
    }
    this.state.c.fillStyle = "#000000";
    for (let b of buttons)
      this.state.c.drawImage(b.img, b.x, b.y + gamePadTop, b.w, b.h);
    this.state.c.filter = "grayscale(100%)";
    for (let b of buttonsFilter)
      this.state.c.drawImage(b.img, b.x, b.y + gamePadTop, b.w, b.h);
    this.state.c.filter = "none";

    for (let b of buttonsFade) {
      this.state.c.globalAlpha = b.opacity;
      this.state.c.drawImage(b.img, b.x, b.y + gamePadTop, b.w, b.h);
    }
    this.state.c.globalAlpha = 1;
  }

  onKeyDown = async (e) => {
    if (
      ((e.keyCode >= 37 && e.keyCode <= 40) ||
        (e.keyCode >= 49 && e.keyCode <= 52)) &&
      !this.state.pausedTiles
    ) {
      let direction: string;

      if (e.keyCode === 38) {
        //up
        direction = "U";
      } else if (e.keyCode === 37) {
        //left
        direction = "L";
      } else if (e.keyCode === 40) {
        //down
        direction = "D";
      } else if (e.keyCode === 39) {
        //right
        direction = "R";
      } else if (e.keyCode === 49) {
        direction = "1";
      } else if (e.keyCode === 50) {
        direction = "2";
      } else if (e.keyCode === 51) {
        direction = "3";
      } else {
        direction = "4";
      }
      if (
        !(
          this.state[`m${direction}`] === "waitForUp" ||
          this.state[`m${direction}`] === "down"
        )
      ) {
        this.state[`m${direction}`] = "down";
      }
    }
  };

  onKeyUp = async (e: any) => {
    if (
      ((e.keyCode >= 37 && e.keyCode <= 40) ||
        (e.keyCode >= 49 && e.keyCode <= 52)) &&
      !this.state.pausedTiles
    ) {
      let direction: string;

      if (e.keyCode === 38) {
        //up

        direction = "U";
      } else if (e.keyCode === 37) {
        //left
        direction = "L";
      } else if (e.keyCode === 40) {
        //down
        direction = "D";
      } else if (e.keyCode === 39) {
        //right
        direction = "R";
      } else if (e.keyCode === 49) {
        direction = "1";
      } else if (e.keyCode === 50) {
        direction = "2";
      } else if (e.keyCode === 51) {
        direction = "3";
      } else {
        direction = "4";
      }

      this.state[`m${direction}`] = "up";
    }
  };

  componentDidMount() {
    this.setBoard();
    this.canvas();
    requestAnimationFrame(this.moveGame.bind(this));

    this.setState({
      mU: "up",
      mL: "up",
      mR: "up",
      mD: "up",
      m1: "up",
      m2: "up",
      m3: "up",
      m4: "up"
    });

    window.onkeydown = this.onKeyDown;
    window.onkeyup = this.onKeyUp;
    window.addEventListener("fullscreenchange", (e) => {
      if (!document.fullscreenElement) {
        this.pause();
      }
    });
  }

  addPoints(amount: number) {
    this.state.points += amount * this.state.multiplier;
  }
  clearAllIntervals() {
    let interval_id = window.setInterval(() => {}, 9999);
    for (let i = interval_id - 30; i < interval_id; i++)
      window.clearInterval(i);
  }

  refreshNotes(data: SongJson) {
    let headerVal = songHeaderValidate(data);
    let notesVal = songNotesValidation(data);
    if (!headerVal[0][0] && !notesVal[0][0]) {
      if (headerVal[1][0] || notesVal[1][0]) {
        console.log("warnings: ", [...headerVal[1], ...notesVal[0]]);
      }
      console.log("loaded");

      this.setState((prev: GameState) => ({
        gameSettings: {
          ...prev,
          videoId: data.header.videoId,
          title: data.header.title,
          author: data.header.author,
          tiles: [...notesVal[2]],
          bpm: data.header.bpm,
          startOffset: data.header.startOffset ? data.header.startOffset : 0,
          endOffset: data.header.endOffset ? data.header.endOffset : 0,
          initVideoState: data.header.videoStartingPoint
            ? data.header.videoStartingPoint
            : 0,
          devStartingHexNote: data.header.devStartingTact
            ? countStartingHexNote(data.header.devStartingTact, data.notes)
            : 0,
          videoStartingOffset: data.header.videoStartingOffset
        }
      }));
    } else console.log("errors: ", [...headerVal[0], ...notesVal[0]]);
  }

  restart() {
    if (this.state.theEnd) {
      requestAnimationFrame(this.moveGame.bind(this));
      this.setState({
        theEnd: false
      });
    }

    this.state.playerRef.current.seekTo(
      this.state.gameSettings.initVideoState +
        (15 * this.state.gameSettings.devStartingHexNote) /
          this.state.gameSettings.bpm
    );

    if (this.state.videoPlayTimer) {
      if (this.state.videoPlayTimer.pos === "run")
        this.state.videoPlayTimer.pause();
    }
    if (this.state.newGameTimer) {
      if (this.state.newGameTimer.pos === "run")
        this.state.newGameTimer.pause();
    }

    this.setState({
      tiles: [],
      muted: true,
      paused: false,
      pausedTiles: true,
      initializedVideo: false,
      newGameTimer: null,
      videoPlayTimer: null,
      gameStarted: false,
      time:
        (15 * this.state.gameSettings.devStartingHexNote) /
        this.state.gameSettings.bpm,
      prevTime: 0,
      currentHexNote: 0,
      hitInRow: 0,
      multiplier: 1
    });
  }
  pause() {
    if (!this.state.playerReady) return;
    if (this.state.pausedTiles) return this.restart();

    if (this.state.videoPlayTimer) {
      if (this.state.videoPlayTimer.pos === "run")
        this.state.videoPlayTimer.pause();
    }
    if (this.state.newGameTimer) {
      if (this.state.newGameTimer.pos === "run")
        this.state.newGameTimer.pause();
    }

    return this.setState((prev: GameState) => ({
      paused: true,
      pausedTiles: true
    }));
  }

  setBoard() {
    let fields = [];
    for (let i = 0; i < 20; i++) {
      fields.push({
        x: i
      });
    }
    this.setState({
      fields,
      //this.videoId}
      YoutubePlayer: <></>
    });
  }

  newGame() {
    let pointSum = 0;
    for (let tile of this.state.gameSettings.tiles) {
      let multiplier;
      multiplier = this.countMultiplier(tile.x + 1);

      if (this.notes.includes(tile.type)) {
        pointSum += 25 * multiplier;
      } else pointSum += 100 * multiplier;
    }
    this.setState({
      tiles: this.state.gameSettings.tiles,
      maxPoints: pointSum,
      currHexNote: this.state.gameSettings.devStartingHexNote,
      pausedTiles: false,
      points: 0,
      time:
        (15 * this.state.gameSettings.devStartingHexNote) /
        this.state.gameSettings.bpm,
      hitInRow: 0,
      multiplier: 1
    });
    for (let tile of this.state.tiles) {
      tile.isActivated = false;
      tile.wasHit = false;
      tile.posX = undefined;
      tile.opacity = undefined;
      tile.pX = undefined;
      tile.hitX = undefined;
      tile.nextPoints = undefined;
      tile.sliderFill = undefined;
      tile.sliderFillPercent = undefined;
    }
  }

  render() {
    return (
      <>
        <div className="game">
          <canvas ref={this.state.canvasRef}></canvas>
        </div>

        <nav>
          <button
            onClick={(e) => {
              e.preventDefault();
              this.restart();
            }}
          >
            Restart
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              this.pause();
            }}
          >
            Pause
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              document.documentElement.requestFullscreen();
            }}
          >
            Fullscreen
          </button>
        </nav>

        <div className="player">
          <Youtube
            url={`https://www.youtube.com/watch?v=${this.state.gameSettings.videoId}`}
            playing={!this.state.paused}
            muted={this.state.muted}
            ref={this.state.playerRef}
            width={"100vw"}
            height={"100vh"}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  disablekb: 1,
                  showinfo: 0,
                  ecver: 2,
                  fs: 0,
                  rel: 0
                }
              }
            }}
            onReady={() => {
              this.state.playerRef.current.seekTo(
                this.state.gameSettings.initVideoState +
                  (15 * this.state.gameSettings.devStartingHexNote) /
                    this.state.gameSettings.bpm
              );
              this.setState({
                playerReady: true
              });
            }}
            onBufferEnd={() => {
              if (!this.state.initializedVideo) {
                console.log("bufferEnd");
                this.setState({
                  initializedVideo: true,
                  paused: true,
                  newGameTimer: new ExtendedTimer(() => {
                    this.state.newGameTimer.setOff();
                    if (
                      !this.state.initialRestart &&
                      navigator.userAgent.indexOf("Firefox") === -1
                    ) {
                      this.state.videoPlayTimer.setOff();
                      this.setState({
                        initialRestart: true,
                        gameStarted: true,
                        paused: false,
                        muted: false
                      });
                      this.restart();
                    } else {
                      this.newGame();
                    }
                  }, ((15 * this.state.gameSettings.startOffset) / this.state.gameSettings.bpm) * 1000),
                  videoPlayTimer: new ExtendedTimer(() => {
                    if (this.state.paused) {
                      this.state.videoPlayTimer.setOff();
                      this.setState({
                        initialRestart:
                          navigator.userAgent.indexOf("Firefox") !== -1,
                        gameStarted: true,
                        paused: false,
                        muted: false
                      });
                    }
                  }, (240 / this.state.gameSettings.bpm) * 1000 + this.state.gameSettings.videoStartingOffset)
                });
              }
            }}
            onPlay={() => {
              if (this.state.paused) {
                this.restart();
              }
            }}
            onPause={() => {
              if (this.state.gameStarted && !this.state.paused) {
                this.restart();
              }
            }}
          />
        </div>
      </>
    );
  }
}

function songHeaderValidate(song: SongJson) {
  let errors: string[] = [],
    alerts: string[] = [];

  try {
    if (song.header.author === "" || typeof song.header.author !== "string")
      errors.push("author: No (or wrong) author specified");
    if (song.header.title === "" || typeof song.header.title !== "string")
      errors.push("title: No (or wrong) title specified");
    if (!song.header.bpm || typeof song.header.bpm !== "number")
      errors.push("bpm: No (or wrong) bpm specified");
    if (song.header.videoId === "" || typeof song.header.videoId !== "string")
      errors.push("videoId: You need to specify Youtube video's id (watch?v=)");
    if (song.header.startOffset === undefined)
      alerts.push(
        "startOffset: You can specify the starting offset (delay between incoming notes and song start)"
      );
    else if (
      typeof song.header.startOffset !== "number" ||
      song.header.startOffset < 0
    )
      errors.push("startOffset: Wrong offset specified");

    if (song.header.endOffset === undefined)
      alerts.push(
        "endOffset: You can specify the ending offset (delay between last note and end of the game)"
      );
    else if (
      typeof song.header.endOffset !== "number" ||
      song.header.endOffset < 0
    )
      errors.push("endOffset: Wrong offset specified");

    if (song.header.videoStartingPoint === undefined)
      alerts.push(
        "videoStartingPoint: You can specify the starting video second"
      );
    else if (
      typeof song.header.videoStartingPoint !== "number" ||
      song.header.videoStartingPoint < 0
    )
      errors.push("videoStartingPoint: Wrong video starting time specified");

    if (song.header.devStartingTact === undefined)
      alerts.push(
        "devStartingTact: You can specify the starting tact (for easier level creating)"
      );
    else if (
      typeof song.header.devStartingTact !== "number" ||
      song.header.devStartingTact < 0
    )
      errors.push("devStartingTact: Wrong tact number specified");

    if (song.header.videoStartingOffset === undefined)
      alerts.push(
        "videoStartingOffset: You can specify the offset between gameStart and music play"
      );
    else if (
      typeof song.header.videoStartingOffset !== "number" ||
      song.header.videoStartingOffset < 0
    )
      errors.push("videoStartingOffset: Wrong video offset specified");
  } catch (e) {
    errors.push("unknown fatal error");
  }

  return [errors, alerts];
}

function songNotesValidation(song: SongJson) {
  let errors: string[] = [],
    alerts: string[] = [],
    tiles: Tiles[] = [];

  let extraPos = 0,
    index = 0,
    iButOnlyNotesInRow = 0;

  for (let [i, row] of song.notes.entries()) {
    if (
      Array.isArray(row) ||
      typeof row === "number" ||
      typeof row === "string"
    ) {
      if (typeof row === "string") continue;
      if (Array.isArray(row)) {
        for (let [j, item] of row.entries()) {
          if (
            Array.isArray(item) ||
            item === 0 ||
            notes.includes(typeof item === "string" ? item : "xxx")
          ) {
            if (Array.isArray(item)) {
              for (let [k, itemArr] of item.entries()) {
                if (
                  Array.isArray(itemArr) ||
                  notes.includes(typeof itemArr === "string" ? itemArr : "xxx")
                ) {
                  if (Array.isArray(itemArr)) {
                    if (
                      !sliders.includes(itemArr[0].toString()) &&
                      typeof itemArr[1] !== "number"
                    ) {
                      errors.push(
                        "Wrong slider data in row " +
                          i +
                          " at position " +
                          j +
                          ".Item number " +
                          k
                      );
                    } else {
                      tiles.push({
                        x: index,
                        hexNote: iButOnlyNotesInRow * 16 + j + extraPos,
                        type: itemArr[0],
                        length: itemArr[1],
                        ref: React.createRef(),
                        wasHit: false
                      });
                      index++;
                    }
                  } else {
                    tiles.push({
                      x: index,
                      hexNote: iButOnlyNotesInRow * 16 + j + extraPos,
                      type: itemArr.toString(),
                      wasHit: false
                    });
                    index++;
                  }
                } else
                  errors.push(
                    "Wrong slider data in row " +
                      i +
                      " at position " +
                      j +
                      ". Item number " +
                      k
                  );
              }
            } else {
              if (typeof item !== "number") {
                tiles.push({
                  x: index,
                  hexNote: iButOnlyNotesInRow * 16 + j + extraPos,
                  type: item,
                  wasHit: false
                });
                index++;
              }
            }
          } else errors.push("Wrong item in row " + i + " at position " + j);
        }
        iButOnlyNotesInRow++;
      } else extraPos += row;
    } else errors.push("typeError: Wrong type of row number " + i);
  }

  return [errors, alerts, tiles];
}

function countStartingHexNote(devTact: number, notes: SongJson["notes"]) {
  let amountOfNotNumbers = 0,
    totalOfNumbers = 0;
  for (let noteRow of notes) {
    if (typeof noteRow === "number") {
      totalOfNumbers += noteRow;
    } else amountOfNotNumbers++;

    if (amountOfNotNumbers === devTact) break;
  }
  return 16 * (devTact - 1) + totalOfNumbers;
}

function parseSongString(s) {
  s = s
    .replace(/\\n/g, "")
    .replace(/\\'/g, "")
    .replace(/\\"/g, "")
    .replace(/\\&/g, "")
    .replace(/\\r/g, "")
    .replace(/\\t/g, "")
    .replace(/\\b/g, "")
    .replace(/\\f/g, "");

  s = s.replace(/[\u0000-\u0019]+/g, "");
  s = s.trim();
  return s;
}

export default class LoadGame extends React.Component {
  state = {
    game: [],
    errorsToDisplay: [
      <li>Hi there. You can create your own level here!</li>,
      <li>
        Don't know the rules? They are simple! Just check:{" "}
        <a href="https://github.com" target="_blank">
          Link
        </a>{" "}
        for more info.
      </li>,
      <li>
        Your code errors will be displayed in this pop-up box just after
        clicking load button
      </li>,
      <li>
        All the warnings will be displayed in the console (F12 ˃ Console Tab) to
        not annoy you
      </li>
    ],
    showErrorMsg: true,
    transErrorMsg: false,
    writtenCode: "",
    gameRef: React.createRef()
  };

  constructor(props) {
    super(props);
    this.json = props.jsonData;
    this.test = props.test;
    this.url = props.url;
    this.errorHandler = props.error;
    this.winHandler = props.win;
  }
  async componentDidMount() {
    let song = {};
    //rozpocząć możliwość tworzenia nowych map
    if (!this.test) {
      if (this.url) {
        try {
          song = (await axios.get(this.url)).data;
          if (!song || song === {} || typeof song !== "object")
            return this.errorHandler("0");
        } catch (e) {
          return this.errorHandler("0");
        }
      } else if (this.json) {
        try {
          song = JSON.parse(this.json);
        } catch (err) {
          return this.errorHandler(err);
        }
      } else return this.errorHandler("2");

      let headerVal = songHeaderValidate(song);
      let notesVal = songNotesValidation(song);
      if (!headerVal[0][0] && !notesVal[0][0]) {
        if (headerVal[1][0] || notesVal[1][0]) {
          this.errorHandler([...headerVal[1], ...notesVal[0]]);
        }
        this.setState({
          game: [
            <Game
              header={song.header}
              notes={notesVal[2]}
              devStartingHexNote={0}
              win={(data) => {
                this.winHandler({
                  ...data,
                  title: song.header.title,
                  author: song.header.author,
                  notesAuthor: song.header.notesAuthor
                });
              }}
            />
          ]
        });
      } else this.errorHandler([...headerVal[0], ...notesVal[0]]);
    }
  }
  render() {
    if (this.test) {
      let parser = new DOMParser();
      return (
        <div className="gameLoad">
          <div
            className={Classnames({
              errors: true,
              errorsTransition: this.state.transErrorMsg
            })}
          >
            <div className="errorsList">
              <h2>ERRORS</h2>
              <ul>{this.state.errorsToDisplay}</ul>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                this.setState({
                  transErrorMsg: !this.state.transErrorMsg
                });
              }}
            >
              Understood
            </button>
          </div>
          <button
            className={Classnames({
              showErrors: true,
              hide_showErrors: !this.state.transErrorMsg
            })}
            onClick={(e) => {
              this.setState({
                transErrorMsg: false
              });
            }}
          >
            Show errors
          </button>
          <div className="firstColumn">{this.state.game}</div>
          <div className="secondColumn">
            <div
              contentEditable="true"
              className="codeEditor"
              onPaste={(e) => {
                e.preventDefault();
                var text = e.clipboardData.getData("text/plain");
                document.execCommand("insertHTML", false, text);
              }}
              onKeyDown={(e) => {
                if (e.keyCode === 9) {
                  document.execCommand("insertHTML", false, "&#009");
                  e.preventDefault();
                }
              }}
              onInput={(e) => {
                this.setState({
                  writtenCode: e.target.textContent
                });
              }}
              tabindex="0"
            ></div>

            <button
              onClick={(e) => {
                this.setState({
                  transErrorMsg: true
                });
                let compiledCode = {},
                  error = false;
                try {
                  compiledCode = JSON.parse(
                    parseSongString(this.state.writtenCode.trim())
                  );
                } catch (err) {
                  error = [
                    "JSON parse error. You've made an error in a JSON syntax"
                  ];
                }

                if (!error) {
                  if (Array.isArray(compiledCode.notes)) {
                    if (typeof compiledCode.header === "object") {
                      let headerVal = songHeaderValidate(compiledCode);
                      let notesVal = songNotesValidation(compiledCode);
                      if (!headerVal[0][0] && !notesVal[0][0]) {
                        if (headerVal[1][0] || notesVal[1][0]) {
                          console.log(
                            "warnings: ",
                            [...headerVal[1], ...notesVal[1]].join("\n")
                          );
                        }
                        if (this.state.game[0]) {
                          this.state.gameRef.current.refreshNotes(compiledCode);
                          setTimeout(() => {
                            this.state.gameRef.current.restart();
                          }, 50);
                        } else {
                          this.setState({
                            game: [
                              <Game
                                header={compiledCode.header}
                                notes={notesVal[2]}
                                devStartingHexNote={
                                  compiledCode.header.devStartingTact
                                    ? countStartingHexNote(
                                        compiledCode.header.devStartingTact,
                                        compiledCode.notes
                                      )
                                    : 0
                                }
                                win={(data) => {
                                  console.log("Win!");
                                }}
                                ref={this.state.gameRef}
                              />
                            ]
                          });
                        }
                      } else error = [...headerVal[0], ...notesVal[0]];
                    } else error = ["Your code doesn't contain 'header' part"];
                  } else {
                    error = ["Your code doesn't contain valid 'notes' part"];
                    if (typeof compiledCode.header !== "object")
                      error.push(
                        "Your code doesn't contain valid 'header' part"
                      );
                  }
                }

                if (error) {
                  this.setState({
                    transErrorMsg: false,
                    errorsToDisplay: error.map((errerText) => {
                      return <li>{errerText}</li>;
                    })
                  });
                }
              }}
            >
              Load
            </button>
          </div>
        </div>
      );
    } else {
      return <div className="gameLoad">{this.state.game}</div>;
    }
  }
}
