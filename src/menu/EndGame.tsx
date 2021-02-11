import React from "react";
import "./endGameStyles.scss";

export default class EndGame extends React.Component {
  points = 0;
  state = {
    pointsInBar: 0,
    transformBar: "translateX(0%)"
  };
  constructor(props) {
    super(props);

    this.changeMenuPosition = props.changeMenuPosition;
    this.lastGameData = props.lastGameData;
    this.createGame = props.createGame;
    this.points = props.data.points;
    this.maxPoints = props.data.maxPoints;
    this.title = props.data.title;
    this.author = props.data.author;
    this.notesAuthor = props.data.notesAuthor;
  }
  componentDidMount() {
    let pointsPerRound = this.maxPoints / 200;
    let a = setInterval(() => {
      if (this.state.pointsInBar + pointsPerRound < this.points) {
        this.setState((prev) => ({
          pointsInBar: prev.pointsInBar + pointsPerRound,
          transformBar: `translateX(${
            ((prev.pointsInBar + pointsPerRound) * 100) / this.maxPoints
          }%)`
        }));
      } else {
        this.setState((prev) => ({
          pointsInBar: this.points,
          transformBar: `translateX(${(this.points * 100) / this.maxPoints}%)`
        }));
        clearInterval(a);
      }
    }, 20);
  }
  render() {
    return (
      <>
        <div className="firstColumn">
          <h1>You made it!</h1>
          <div className="progressBar">
            <div
              className="bar"
              style={{
                transform: this.state.transformBar
              }}
            >
              <p>{Math.floor(this.state.pointsInBar)}</p>
            </div>
            <p>{Math.floor(this.maxPoints)}</p>
          </div>
          <h2>{Math.floor((this.points * 100) / this.maxPoints)}%</h2>
        </div>
        <div className="secondColumn">
          <div className="menu">
            <div
              className="option"
              onClick={(e) => {
                this.createGame(this.lastGameData.url, this.lastGameData.json);
                this.changeMenuPosition("new-game");
              }}
            >
              Once more!
            </div>
            <div
              className="option"
              onClick={(e) => {
                this.changeMenuPosition("song-list");
              }}
            >
              Song select
            </div>
            <div
              className="option"
              onClick={(e) => {
                alert("This option is currently unavailable :c");
              }}
            >
              More games
            </div>
          </div>
        </div>
      </>
    );
  }
}
