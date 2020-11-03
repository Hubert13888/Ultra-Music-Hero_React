import React from "react";
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
}

class Game extends React.Component<GameProps> {
  state: GameState = {
    fields: [],
    tiles: [],
    currHexNote: 0
  };
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
          hexNote: 0,
          type: "U"
        }
      ],
      bpm = 120;
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
      }, 1000000)
    });
  }
  render() {
    return (
      <>
        <div className="game">
          {this.state.fields.map((field, i) => {
            return (
              <div className="game_field">
                <div className="game_stripe stripe0">
                  {i === this.state.fields.length - 1 ? (
                    //up
                    this.state.tiles.map((tile) => {
                      return tile.type === "U" &&
                        this.state.currHexNote === tile.hexNote ? (
                        <img src="" alt="x" />
                      ) : (
                        <></>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
                <div className="game_stripe stripe1">
                  {i === this.state.fields.length - 1 ? (
                    //right
                    this.state.tiles.map((tile) => {
                      return tile.type === "R" &&
                        this.state.currHexNote === tile.hexNote ? (
                        <img src="" alt="x" />
                      ) : (
                        <></>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
                <div className="game_stripe stripe2">
                  {i === this.state.fields.length - 1 ? (
                    //left
                    this.state.tiles.map((tile) => {
                      return tile.type === "L" &&
                        this.state.currHexNote === tile.hexNote ? (
                        <img src="" alt="x" />
                      ) : (
                        <></>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
                <div className="game_stripe stripe3">
                  {i === this.state.fields.length - 1 ? (
                    //down
                    this.state.tiles.map((tile) => {
                      return tile.type === "D" &&
                        this.state.currHexNote === tile.hexNote ? (
                        <img src="" alt="x" />
                      ) : (
                        <></>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
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
