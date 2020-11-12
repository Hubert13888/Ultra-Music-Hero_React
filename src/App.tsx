import React from "react";
import Slider from "./Slider";
import Classnames from "classnames";
import "./gameStyles.scss";

interface GameProps {
  notes: string;
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
  bpm?: number;
}

class Game extends React.Component<GameProps> {
  state: GameState = {
    fields: [],
    tiles: [],
    points: 0,
    maxPoints: 0,
    currHexNote: 0
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
    this.state.notes = props.notes;
  }
  componentDidMount() {
    this.newGame();

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
            let fromLeftEdge = 19 - (this.state.currHexNote - tile.hexNote);

            if (fromLeftEdge === 4 || fromLeftEdge === 5) {
              emptyHit = false;
              if (this.sliders.includes(direction)) {
                newTiles.push({
                  ...tile,
                  wasHit: true,
                  werePointsAdded: true,
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
                  werePointsAdded: true,
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

        if (!emptyHit) this.setState({ tiles: newTiles });
        else this.addPoints(cpoints >= 10 ? -10 : -cpoints);
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

  newGame() {
    let fields = [],
      tiles: Tiles[] = [
        {
          x: 0,
          hexNote: 0,
          length: 26,
          type: "3",
          ref: React.createRef()
        },
        {
          x: 1,
          hexNote: 5,
          type: "L"
        },
        {
          x: 2,
          hexNote: 9,
          type: "D"
        },
        {
          x: 3,
          hexNote: 14,
          length: 8,
          type: "1",
          ref: React.createRef()
        },
        {
          x: 4,
          hexNote: 17,
          type: "L"
        }
      ],
      bpm = 80;
    for (let i = 0; i < 20; i++) {
      fields.push({
        x: i
      });
    }
    let pointSum = 0;
    for (let tile of tiles) {
      if (this.notes.includes(tile.type)) {
        pointSum += 80;
      } else pointSum += Math.floor((150 * tile.length) / bpm) * 2;
    }
    console.log(pointSum);

    this.setState({
      fields,
      tiles,
      bpm,
      maxPoints: pointSum,
      currHexNote: 0,
      interval: setInterval(() => {
        this.setState((prev: GameState) => ({
          currHexNote: prev.currHexNote + 1
        }));
      }, (150 / bpm) * 100)
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
                            this.state.currHexNote >= tile.hexNote &&
                            this.state.currHexNote <=
                              tile.hexNote +
                                21 +
                                (tile.length ? tile.length : 0) ? (
                            this.notes.includes(tile.type) ? (
                              <img
                                src=""
                                alt="x"
                                className={Classnames({
                                  tile_animate: true,
                                  hit: tile.wasHit
                                })}
                                style={{
                                  animationDuration: `${300 / this.state.bpm}s`
                                }}
                              />
                            ) : (
                              <Slider
                                id={tile.x}
                                length={tile.length}
                                handleContent={tile.type}
                                bpm={this.state.bpm}
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
      </>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <>
        <Game notes={"xd"} />
      </>
    );
  }
}
