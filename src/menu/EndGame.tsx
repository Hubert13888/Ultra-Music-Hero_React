import React from "react";
import { connect } from "react-redux";
import {
  toggleGame,
  changeMenuPosition,
  updateCustomSongs,
  updateBuiltInSongs
} from "../redux/actions";
import "./endGameStyles.scss";

class EndGame extends React.Component {
  points = 0;
  state = {
    pointsInBar: 0,
    transformBar: "translateX(0%)"
  };
  constructor(props) {
    super(props);

    props.changeMenuPosition("end-game");
    props.builtIn ? props.updateBuiltInSongs() : props.updateCustomSongs();
  }
  componentDidMount() {
    let pointsPerRound = this.props.maxPoints / 200;
    let a = setInterval(() => {
      if (this.state.pointsInBar + pointsPerRound < this.props.points) {
        this.setState((prev) => ({
          pointsInBar: prev.pointsInBar + pointsPerRound,
          transformBar: `${
            ((prev.pointsInBar + pointsPerRound) * 100) / this.props.maxPoints
          }%`
        }));
      } else {
        this.setState((prev) => ({
          pointsInBar: this.props.points,
          transformBar: `${(this.props.points * 100) / this.props.maxPoints}%`
        }));
        clearInterval(a);
      }
    }, 20);
  }
  render() {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .progressBar_wrapper > p:before {
            border-bottom: 5vh solid rgb(${this.props.gameColor});
            border-left: 5vh solid transparent;
          }
          `
          }}
        ></style>
        <div className="firstColumn">
          <h1>You made it!</h1>
          <div className="progressBar_wrapper">
            <p
              className="prograssBar_oldPoints"
              style={{
                backgroundColor: `rgb(${this.props.gameColor})`,
                left: `${(this.props.oldPoints * 100) / this.props.maxPoints}%`
              }}
            >
              {this.props.oldPoints}
            </p>
            <p
              className="prograssBar_pointsCounter"
              style={{
                left: `${this.state.transformBar}`,
                backgroundColor: `rgb(${this.props.gameColor})`
              }}
            >
              {Math.floor(this.state.pointsInBar)}
            </p>
            <p className="prograssBar_maxPoints">
              {Math.floor(this.props.maxPoints)}
            </p>

            <div
              className="progressBar"
              style={{
                border: `rgb(${this.props.gameColor}) 2px solid`
              }}
            >
              <div
                className="oldPoints_bar bar"
                style={{
                  background: `linear-gradient(180deg, rgb(${this.props.gameColor}) 4%, rgba(${this.props.gameColor}, 0.75) 50%, rgb(${this.props.gameColor}) 96%)`,
                  borderRight: `solid 5px ${this.props.gameColor}`,
                  transform: `translateX(${
                    (this.props.oldPoints * 100) / this.props.maxPoints
                  }%)`
                }}
              ></div>
              <div
                className="currentPoints_bar bar"
                style={{
                  background: `#ddd`,
                  borderRight: `solid 5px ${this.props.gameColor}`,
                  transform: `translateX(${this.state.transformBar})`
                }}
              ></div>
              <div
                className="bar"
                style={{
                  background: `linear-gradient(180deg, rgb(${this.props.gameColor}) 4%, rgba(${this.props.gameColor}, 0.75) 50%, rgb(${this.props.gameColor}) 96%)`,
                  borderRight: `solid 5px ${this.props.gameColor}`,
                  transform: `translateX(${this.state.transformBar})`
                }}
              ></div>
            </div>
          </div>
          <div className="scoreWrapper">
            <h2>You've got:</h2>
            <h2>
              {Math.floor((this.props.points * 100) / this.props.maxPoints)}%
            </h2>
          </div>
          <div className="prevScoreWrapper">
            <p>Last high score:</p>
            <p>
              {Math.floor((this.props.oldPoints * 100) / this.props.maxPoints)}%
            </p>
          </div>
        </div>
        <div className="secondColumn">
          <div className="end_menu">
            <div
              className="end_menu_option"
              onClick={(e) => {
                this.props.toggleGame();
              }}
            >
              <p>Once more!</p>
            </div>
            <div
              className="end_menu_option"
              onClick={(e) => {
                this.props.changeMenuPosition("song-list");
              }}
            >
              <p>Song select</p>
            </div>
            <div
              className="end_menu_option"
              onClick={(e) => {
                alert("This option is currently unavailable :c");
              }}
            >
              <p>More games</p>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  menuPosition: state.menuPosition
});

export default connect(mapStateToProps, {
  toggleGame,
  changeMenuPosition,
  updateCustomSongs,
  updateBuiltInSongs
})(EndGame);
