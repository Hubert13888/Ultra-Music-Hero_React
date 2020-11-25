import React from "react";
import Slider from "./Slider";
import Classnames from "classnames";
import Youtube from "react-youtube";
import axios from "axios";
import "./gameStyles.scss";

const sliders = ["1", "2", "3", "4"],
  notes = ["U", "D", "L", "R"];

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
  notes?: string;
  fields: Fields[];
  tiles: Tiles[];
  points: number;
  maxPoints: number;
  currHexNote: number;
  interval?: any;
  playMusic: boolean;
  YoutubePlayer?: Youtube;
}

class Game extends React.Component<GameProps> {
  state: GameState = {
    fields: [],
    tiles: [],
    points: 0,
    maxPoints: 0,
    currHexNote: 0,
    playMusic: false
  };

  compareLetters = [
    ["U", "1"],
    ["L", "2"],
    ["R", "3"],
    ["D", "4"]
  ];
  sliders = ["1", "2", "3", "4"];
  notes = ["U", "D", "L", "R"];

  title: string;
  videoId: string;
  author: string;
  startOffset: number;
  endOffset: number;
  bpm: number;
  initializedVideo = false;
  initVideoState = 0;
  videoStartingPoint = 0;
  devStartingHexNote = 0;
  tiles: Tiles[];

  constructor(props: GameProps) {
    super(props);
    this.videoId = props.header.videoId;
    this.tiles = props.notes;
    this.bpm = props.header.bpm;
    this.startOffset = props.header.startOffset ? props.header.startOffset : 0;
    this.endOffset = props.header.endOffset ? props.header.endOffset : 0;
    this.initVideoState = props.header.videoStartingPoint
      ? props.header.videoStartingPoint
      : 0; //seconds
    this.devStartingHexNote = props.devStartingHexNote;
  }
  componentDidMount() {
    this.setBoard();

    window.onkeydown = (e) => {
      if (
        (e.keyCode >= 37 && e.keyCode <= 40) ||
        (e.keyCode >= 49 && e.keyCode <= 52)
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
            let fromLeftEdge =
              19 -
              (this.state.currHexNote - tile.hexNote) +
              (tile.length ? 2 : 0);

            if (
              fromLeftEdge === 3 ||
              fromLeftEdge === 4 ||
              fromLeftEdge === 5
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

    onkeyup = (e: any) => {
      if (e.keyCode >= 49 && e.keyCode <= 52) {
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

  restart() {
    console.log("restart");
  }
  pause() {
    console.log("pause");
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
      YoutubePlayer: (
        <Youtube
          videoId={this.videoId}
          opts={{
            width: "1",
            height: "1",
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              playsinline: 1,
              showinfo: 0,
              rel: 0,
              fs: 0
            }
          }}
          onReady={(e) => {
            e.target.mute();
            e.target.seekTo(
              this.initVideoState + (15 * this.devStartingHexNote) / this.bpm
            );
          }}
          onPlay={(e) => {
            if (!this.initializedVideo) {
              this.initializedVideo = true;
              e.target.pauseVideo();
              setTimeout(() => {
                e.target.unMute();
                e.target.playVideo();
              }, (240 / this.bpm) * 1000);

              setTimeout(() => {
                this.newGame();
              }, ((15 * this.startOffset) / this.bpm) * 1000);
            }
          }}
        />
      )
    });
  }

  newGame() {
    let pointSum = 0;
    for (let tile of this.tiles) {
      if (this.notes.includes(tile.type)) {
        pointSum += 80;
      } else pointSum += tile.length * 15;
    }

    this.setState({
      tiles: this.tiles,
      maxPoints: pointSum,
      currHexNote: this.devStartingHexNote,
      interval: setInterval(() => {
        this.setState((prev: GameState) => ({
          currHexNote: prev.currHexNote + 1
        }));
        for (let tile of this.state.tiles) {
          if (
            this.state.currHexNote - (tile.hexNote + 19) === 0 &&
            this.devStartingHexNote <= tile.hexNote
          ) {
            if (!tile.wasHit)
              this.addPoints(
                this.state.points >= 10 ? -10 : -this.state.points
              );
            if (tile.x === this.tiles[this.tiles.length - 1].x) {
              setTimeout(() => {
                console.log("The End");
              }, (15000 * this.endOffset) / this.bpm);
            }
          }
        }
      }, (150 / this.bpm) * 100)
    });
  }
  render() {
    return (
      <>
        <div className="game">
          {this.state.fields.map((field, i) => {
            return (
              <div className="game_field">
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
                            this.devStartingHexNote <= tile.hexNote &&
                            this.state.currHexNote >= tile.hexNote &&
                            this.state.currHexNote <=
                              tile.hexNote +
                                21 +
                                (tile.length ? tile.length : 0) ? (
                            this.notes.includes(tile.type) ? (
                              <>
                                <img
                                  src=""
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
                                    tile_animate: true
                                  })}
                                  style={{
                                    animationDuration: `${300 / this.bpm}s`,
                                    animationPlayState: tile.wasHit
                                      ? "paused"
                                      : "running"
                                  }}
                                />
                                <img
                                  src=""
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
                                    animationDuration: `${300 / this.bpm}s`
                                  }}
                                />
                              </>
                            ) : (
                              <Slider
                                id={tile.x}
                                length={tile.length}
                                handleContent={tile.type}
                                bpm={this.bpm}
                                addPoints={(amount: number) => {
                                  this.addPoints(amount);
                                }}
                                ref={tile.ref}
                              />
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
        {this.state.YoutubePlayer}
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
      </>
    );
  }
}

export default class App extends React.Component {
  state = {
    game: []
  };

  songHeaderValidate(song: SongJson) {
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
        errors.push(
          "videoId: You need to specify Youtube video's id (watch?v=)"
        );
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
    } catch (e) {
      errors.push("unknown fatal error");
    }

    return [errors, alerts];
  }
  songNotesValidation(song: SongJson) {
    let errors: string[] = [],
      alerts: string[] = [],
      tiles: Tiles[] = [];

    let extraPos = 0,
      index = 0,
      iButOnlyNotesInRow = 0;

    for (let [i, row] of song.notes.entries()) {
      if (Array.isArray(row) || typeof row === "number") {
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
                    notes.includes(
                      typeof itemArr === "string" ? itemArr : "xxx"
                    )
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

  countStartingHexNote(devTact: number, notes: SongJson["notes"]) {
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

  componentDidMount() {
    axios.get("/songs/song1.json").then((song: any) => {
      let headerVal = this.songHeaderValidate(song.data);
      let notesVal = this.songNotesValidation(song.data);
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
                  ? this.countStartingHexNote(
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
