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
  currHexNote: number;
  interval?: any;
  bpm?: number;
}

class Game extends React.Component<GameProps> {
  state: GameState = {
    fields: [],
    tiles: [],
    currHexNote: 0
  };

  slidersRef = React.createRef();

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
              //zapisz state'a dla elementu jako trafioneo
              emptyHit = false;
              newTiles.push({
                ...tile,
                wasHit: true,
                isActivated: true
              });
              if (this.sliders.includes(direction)) {
                this.slidersRef.current.activated(tile.x);
              }
              continue;
            }
          }
          newTiles.push(tile);
        }
        if (!emptyHit) this.setState({ tiles: newTiles });
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
            newTiles.push({
              ...tile,
              isActivated: false
            });
            if (this.sliders.includes(direction)) {
              this.slidersRef.current.disactivated(tile.x);
            }
            break;
          }
        }
      }
    };
  }
  newGame() {
    let fields = [],
      tiles: Tiles[] = [
        {
          x: 0,
          hexNote: 0,
          isActivated: false,
          length: 5,
          type: "3"
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
        }
      ],
      bpm = 20;
    for (let i = 0; i < 20; i++) {
      fields.push({
        x: i
      });
    }

    this.setState({
      fields,
      tiles,
      bpm,
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
                                parent={this}
                                id={tile.x}
                                length={5}
                                number={3}
                                bpm={this.state.bpm}
                                type=""
                                callback={() => {}}
                                ref={this.slidersRef}
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
