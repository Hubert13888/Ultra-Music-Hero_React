import React from "react";
import "./gameStyles.scss";

interface GameProps {
  notes: string;
}
interface Fields {
  x: number;
}

interface GameState {
  notes?: string;
  fields: Fields[];
}

class Game extends React.Component<GameProps> {
  state: GameState = {
    fields: []
  };
  constructor(props: GameProps) {
    super(props);
    this.state.notes = props.notes;
  }
  componentDidMount() {
    this.newGame();
  }
  newGame() {
    let fields = [];
    for (let i = 0; i < 100; i++) {
      fields.push({
        x: i
      });
    }
    this.setState({ fields });
  }
  render() {
    return (
      <>
        <div className="game">
          {this.state.fields.map((field) => {
            return (
              <div className="game_field">
                <div className="game_stripe stripe0"></div>
                <div className="game_stripe stripe1"></div>
                <div className="game_stripe stripe2"></div>
                <div className="game_stripe stripe3"></div>
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
