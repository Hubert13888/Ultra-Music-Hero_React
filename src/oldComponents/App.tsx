import React from "react";
import Slider from "./Slider";
import Classnames from "classnames";
import Youtube from "react-player/lazy";
import axios from "axios";
import "./gameStyles.scss";
import { ExtendedTimer } from "./Timers";
import accurateInterval from "accurate-interval";

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

  gameSettings?: GameSettings;

  newGameTimer?: ExtendedTimer;
  videoPlayTimer?: ExtendedTimer;
}

interface GameSettings {
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

    this.state.gameSettings = {
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
  componentDidMount() {
    this.setBoard();

    window.onkeydown = async (e) => {
      if (
        ((e.keyCode >= 37 && e.keyCode <= 40) ||
          (e.keyCode >= 49 && e.keyCode <= 52)) &&
        !this.state.pausedTiles
      ) {
        let direction: string;
        let cpoints = this.state.points;

        if (e.keyCode === 38) {
          //up
          direction = "U";
        }
        if (e.keyCode === 37) {
          //left
          direction = "L";
        }
        if (e.keyCode === 40) {
          //down
          direction = "D";
        }
        if (e.keyCode === 39) {
          //right
          direction = "R";
        }
        if (e.keyCode === 49) {
          direction = "1";
        }
        if (e.keyCode === 50) {
          direction = "2";
        }
        if (e.keyCode === 51) {
          direction = "3";
        }
        if (e.keyCode === 52) {
          direction = "4";
        }

        let tilesCpy = [...this.state.tiles],
          newTiles = [],
          emptyHit = true;

        for (let tile of tilesCpy) {
          if (tile.type === direction) {
            let fromLeftEdge = 21 - (this.state.currHexNote - tile.hexNote);
            if (
              (fromLeftEdge === 3 ||
                fromLeftEdge === 4 ||
                fromLeftEdge === 5) &&
              emptyHit
            ) {
              emptyHit = false;
              if (this.sliders.includes(direction)) {
                newTiles.push({
                  ...tile,
                  wasHit: true,
                  isActivated: true
                });
                tile.ref.current.activated(tile.x);
              } else {
                if (!tile.wasHit) this.addPoints(80);

                if (tile.isActivated) {
                  return this.addPoints(cpoints >= 10 ? -10 : -cpoints);
                }

                newTiles.push({
                  ...tile,
                  wasHit: true,
                  isActivated: true
                });
              }
              continue;
            }
            if (this.sliders.includes(tile.type) && tile.isActivated) {
              emptyHit = false;
            }
          }
          newTiles.push(tile);
        }

        if (!emptyHit) {
          this.setState({ tiles: newTiles });
        } else this.addPoints(cpoints >= 10 ? -10 : -cpoints);
      }
    };

    onkeyup = async (e: any) => {
      if (e.keyCode >= 49 && e.keyCode <= 52 && !this.state.paused && false) {
        let direction: string;

        if (e.keyCode === 49) {
          direction = "1";
        }
        if (e.keyCode === 50) {
          direction = "2";
        }
        if (e.keyCode === 51) {
          direction = "3";
        }
        if (e.keyCode === 52) {
          direction = "4";
        }
        let tilesCpy = [...this.state.tiles],
          newTiles = [];

        for (let tile of tilesCpy) {
          if (tile.type === direction && tile.isActivated === true) {
            if (this.sliders.includes(direction)) {
              newTiles.push({
                ...tile,
                isActivated: false
              });
              if (tile.ref.current) tile.ref.current.disactivated(tile.x);
              continue;
            }
          }
          newTiles.push(tile);
        }
        this.setState({ tiles: newTiles });
      }
    };
  }

  addPoints(amount: number) {
    this.setState((prev: GameState) => ({
      points: prev.points + amount
    }));
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

      this.setState((prev: GameState) => ({
        gameSettings: {
          ...prev,
          videoId: data.header.videoId,
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
    this.state.playerRef.current.seekTo(
      this.state.gameSettings.initVideoState +
        (15 * this.state.gameSettings.devStartingHexNote) /
          this.state.gameSettings.bpm
    );
    if (!this.state.paused) this.pause();
    this.clearAllIntervals();
    this.setState({
      tiles: [],
      muted: true,
      paused: true,
      initializedVideo: false,
      newGameTimer: null,
      videoPlayTimer: null,
      gameStarted: false
    });
    this.setState({
      paused: false
    });
  }
  pause() {
    if (!this.state.gameStarted) {
      if (this.state.pausedTiles) return this.restart();
      else this.state.interval.clear();

      if (!this.state.videoPlayTimer.getOff()) {
        if (this.state.videoPlayTimer.pos == "run")
          this.state.videoPlayTimer.pause();
      }
      if (!this.state.newGameTimer.getOff()) {
        if (this.state.newGameTimer.pos == "run")
          this.state.newGameTimer.pause();
      }

      for (let tile of this.state.tiles) {
        if (sliders.includes(tile.type)) {
          if (tile.ref.current) {
            tile.ref.current.stopSlider();
          }
        }
      }

      return this.setState((prev: GameState) => ({
        paused: !prev.pausedTiles,
        pausedTiles: !prev.pausedTiles
      }));
    }

    if (this.state.paused) {
      if (!this.state.gameSettings.devStartingHexNote) return this.restart();
      this.setState({ interval: this.createGameLoop() });
    } else {
      this.state.interval.clear();
    }
    this.setState((prev: GameState) => ({
      paused: !prev.paused,
      pausedTiles: !prev.pausedTiles
    }));

    for (let tile of this.state.tiles) {
      if (sliders.includes(tile.type)) {
        if (tile.ref.current) {
          tile.ref.current.stopSlider();
        }
      }
    }
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

  createGameLoop = () => {
    return accurateInterval(
      () => {
        this.setState((prev: GameState) => ({
          currHexNote: prev.currHexNote + 1
        }));
        /*for (let tile of this.state.tiles) {
          if (
            this.state.currHexNote - (tile.hexNote + 19) === 0 &&
            this.state.gameSettings.devStartingHexNote <= tile.hexNote
          ) {
            if (!tile.wasHit)
              this.addPoints(
                this.state.points >= 10 ? -10 : -this.state.points
              );
            if (
              tile.x ===
              this.state.gameSettings.tiles[
                this.state.gameSettings.tiles.length - 1
              ].x
            ) {
              setTimeout(() => {
                console.log("The End");
              }, (15000 * this.state.gameSettings.endOffset) / this.state.gameSettings.bpm);
            }
          }
      }*/
      },
      (150 / this.state.gameSettings.bpm) * 100,
      {}
    );
  };

  newGame() {
    let pointSum = 0;
    for (let tile of this.state.gameSettings.tiles) {
      if (this.notes.includes(tile.type)) {
        pointSum += 80;
      } else pointSum += tile.length * 5;
    }
    this.setState({
      tiles: this.state.gameSettings.tiles,
      maxPoints: pointSum,
      currHexNote: this.state.gameSettings.devStartingHexNote,
      pausedTiles: false,
      points: 0,
      interval: this.createGameLoop()
    });
  }
  render() {
    return (
      <>
        <div className="game">
          {this.state.fields.map((field, i) => {
            return (
              <div className={"game_field"}>
                {[0, 1, 2, 3].map((j) => {
                  return (
                    <div
                      className={Classnames({
                        [`game_stripe stripe${j}`]: true,
                        clearer: field.x === 3 || field.x === 4
                      })}
                    >
                      {i === this.state.fields.length - 1 ? (
                        //up
                        this.state.tiles.map((tile) => {
                          return this.compareLetters[j].includes(tile.type) &&
                            this.state.gameSettings.devStartingHexNote <=
                              tile.hexNote &&
                            this.state.currHexNote > tile.hexNote &&
                            this.state.currHexNote <=
                              tile.hexNote +
                                21 +
                                (tile.length ? tile.length * 2 : 2) ? (
                            this.notes.includes(tile.type) ? (
                              <>
                                <img
                                  src={(() => {
                                    switch (tile.type) {
                                      case "U":
                                        return "assets/pictures/arrows/up.png";
                                      case "L":
                                        return "assets/pictures/arrows/left.png";
                                      case "R":
                                        return "assets/pictures/arrows/right.png";
                                      case "D":
                                        return "assets/pictures/arrows/down.png";
                                    }
                                  })()}
                                  alt={(() => {
                                    switch (tile.type) {
                                      case "U":
                                        return "🡅";
                                      case "L":
                                        return "🡄";
                                      case "R":
                                        return "🡆";
                                      case "D":
                                        return "🡇";
                                    }
                                  })()}
                                  style={{
                                    animation: `tile_animation ${
                                      315 / this.state.gameSettings.bpm
                                    }s forwards linear ${
                                      tile.wasHit || this.state.pausedTiles
                                        ? "paused"
                                        : ""
                                    } ${
                                      tile.wasHit
                                        ? `, tile_fadeOut forwards ${
                                            (15 * 5) /
                                            this.state.gameSettings.bpm
                                          }s`
                                        : ""
                                    }`
                                  }}
                                />
                                <img
                                  src={(() => {
                                    switch (tile.type) {
                                      case "U":
                                        return "assets/pictures/arrows/up.png";
                                      case "L":
                                        return "assets/pictures/arrows/left.png";
                                      case "R":
                                        return "assets/pictures/arrows/right.png";
                                      case "D":
                                        return "assets/pictures/arrows/down.png";
                                    }
                                  })()}
                                  alt={(() => {
                                    switch (tile.type) {
                                      case "U":
                                        return "🡅";
                                      case "L":
                                        return "🡄";
                                      case "R":
                                        return "🡆";
                                      case "D":
                                        return "🡇";
                                    }
                                  })()}
                                  className={Classnames({
                                    tile_animate: true,
                                    hit: tile.wasHit
                                  })}
                                  style={{
                                    animationDuration: `${
                                      315 / this.state.gameSettings.bpm
                                    }s`,
                                    animationPlayState: this.state.pausedTiles
                                      ? "paused"
                                      : ""
                                  }}
                                />
                              </>
                            ) : (
                              /*<Slider
                                id={tile.x}
                                handleContent={tile.type}
                                length={tile.length}
                                bpm={this.state.gameSettings.bpm}
                                addPoints={(pointAmount: number) => {
                                  this.addPoints(pointAmount);
                                }}
                                ref={tile.ref}
                              />*/
                              <></>
                            )
                          ) : (
                            <></>
                          );
                        })
                      ) : (
                        <></>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <p>
          Punkty: {this.state.points} / {this.state.maxPoints}
        </p>
        <div className="progressBar">
          {this.state.maxPoints ? (
            <div
              className="progressBar_content"
              style={{
                transform: `translateX(-${
                  100 - (this.state.points / this.state.maxPoints) * 100
                }%)`
              }}
            ></div>
          ) : (
            <></>
          )}
        </div>
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
          onClick={async (e) => {
            e.preventDefault();

            await axios.get("/songs/song1.json").then((song: any) => {
              this.refreshNotes(song.data);
            });
          }}
        >
          Refresh
        </button>
        <div className="player">
          <Youtube
            url={`https://www.youtube.com/watch?v=${this.state.gameSettings.videoId}`}
            playing={!this.state.paused}
            muted={this.state.muted}
            ref={this.state.playerRef}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  disablekb: 1,
                  showinfo: 0,
                  rel: 0,
                  modestbranding: 1,
                  fs: 0
                }
              }
            }}
            onReady={() => {
              this.state.playerRef.current.seekTo(
                this.state.gameSettings.initVideoState +
                  (15 * this.state.gameSettings.devStartingHexNote) /
                    this.state.gameSettings.bpm
              );
            }}
            onBufferEnd={() => {
              if (!this.state.initializedVideo) {
                this.setState({
                  initializedVideo: true,
                  paused: true,
                  newGameTimer: new ExtendedTimer(() => {
                    this.newGame();
                    this.state.newGameTimer.setOff();
                  }, ((15 * this.state.gameSettings.startOffset) / this.state.gameSettings.bpm) * 1000),
                  videoPlayTimer: new ExtendedTimer(() => {
                    if (this.state.paused) {
                      this.state.videoPlayTimer.setOff();
                      this.setState({
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
            onProgress={() => {
              if (this.state.afterUnpause) {
                clearTimeout(this.state.restartTimer);
                this.setState({
                  afterUnpause: false
                });
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
    tiles: Tiles[][] = [];

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
  let conplexTiles = new Array(song.notes.length).fill([]);
  //for()

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

export default class LoadGame extends React.Component {
  state = {
    game: []
  };

  componentDidMount() {
    axios.get("/songs/song1.json").then((song: any) => {
      let headerVal = songHeaderValidate(song.data);
      let notesVal = songNotesValidation(song.data);
      if (!headerVal[0][0] && !notesVal[0][0]) {
        if (headerVal[1][0] || notesVal[1][0]) {
          console.log("warnings: ", [...headerVal[1], ...notesVal[0]]);
        }
        this.setState({
          game: [
            <Game
              header={song.data.header}
              notes={notesVal[2]}
              devStartingHexNote={
                song.data.header.devStartingTact
                  ? countStartingHexNote(
                      song.data.header.devStartingTact,
                      song.data.notes
                    )
                  : 0
              }
            />
          ]
        });
      } else console.log("errors: ", [...headerVal[0], ...notesVal[0]]);
    });
  }
  render() {
    return <>{this.state.game}</>;
  }
}
