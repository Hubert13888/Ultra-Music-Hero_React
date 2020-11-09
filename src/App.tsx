import React from "react";
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

  compareLetters = ["U", "L", "R", "D"];

  constructor(props: GameProps) {
    super(props);
    this.state.notes = props.notes;
  }
  componentDidMount() {
    this.newGame();
  }
  newGame() {
    let fields = [],
      tiles: Tiles[] = [
        {
          x: 0,
          hexNote: 0,
          type: "U"
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
      bpm = 80;
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
      }, (150 / bpm) * 100 * 20000)
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
                          return tile.type === this.compareLetters[j] &&
                            this.state.currHexNote >= tile.hexNote &&
                            this.state.currHexNote <= tile.hexNote + 21 ? (
                            <img
                              src=""
                              alt="x"
                              className="tile_animate"
                              style={{
                                animationDuration: `${300 / this.state.bpm}s`
                              }}
                            />
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
