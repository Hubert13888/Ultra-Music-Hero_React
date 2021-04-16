import React from "react";
import "./menuStyles.scss";

import { connect } from "react-redux";
import { changeMenuPosition, toggleGame } from "../redux/actions";

import LoadGame from "../LoadGame";
import ClassNames from "classnames";
import PlayGame from "./PlayGame";
import Credits from "./Credits";
import EndGame from "./EndGame";

import Settings from "./Settings";
import Instructions from "./Instructions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface StateMenu {
  endGame: any;
}

export const EndGameContext = React.createContext((data) => {
  console.log(data);
});

class Home extends React.Component {
  state: StateMenu = {
    endGame: <></>
  };

  createGameEnd(data) {
    this.setState((prev) => ({
      endGame: <EndGame {...data} />
    }));
  }
  deleteGameEnd() {
    this.setState((prev: StateMenu) => ({
      endGame: <></>
    }));
  }

  render() {
    const menuPosition = this.props.menuPosition;
    const gameData = this.props.gameData;

    return (
      <main>
        <div
          className={ClassNames({
            returnButton: true,
            back: true,
            hide_menu_routes: true,
            show_menu_routes: menuPosition !== "main-menu"
          })}
          onClick={() => {
            const routeMap = {
              "new-game": "song-list",
              "end-game": "song-list"
            };
            this.props.changeMenuPosition(
              routeMap[menuPosition] ? routeMap[menuPosition] : "main-menu"
            );
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>

        <div
          className={ClassNames({
            menu: true,
            hide_menu_routes: true,
            show_menu_routes: menuPosition === "main-menu"
          })}
        >
          <>
            <div className="menu_column menu_game_title column1">
              <p>Welcome to:</p>
              <div className="menu_row">
                <h2>Ultra</h2>
                <h1>Music Hero</h1>
              </div>
            </div>
            <div className="menu_column menu_description column2">
              <div className="menu_row column2_row">
                <div className="column2_1">
                  <img
                    src="/assets/pictures/main-menu/information.png"
                    alt=""
                    onClick={() => {
                      this.props.changeMenuPosition("instructions");
                    }}
                  />

                  <img
                    src="/assets/pictures/main-menu/settings.png"
                    alt=""
                    onClick={() => {
                      this.props.changeMenuPosition("settings");
                    }}
                  />
                </div>
                <div className="column2_2">
                  <img
                    src="/assets/pictures/main-menu/fullscreen.png"
                    className="fullscreen"
                    alt=""
                    onClick={() => {
                      var docElm = document.documentElement;
                      if (!document.fullscreenElement) {
                        if (docElm.requestFullscreen) {
                          docElm.requestFullscreen();
                        } else {
                          alert("We are unable to turn fullscreen on");
                        }
                      } else {
                        if (document.exitFullscreen) {
                          document.exitFullscreen();
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="menu_list menu_column column3">
              <div
                className="menu_option"
                onClick={() => {
                  this.props.changeMenuPosition("song-list");
                }}
              >
                <img src="/assets/pictures/main-menu/song-list.png" alt="" />
                <p>Song list</p>
              </div>

              <div
                className="menu_option"
                onClick={() => {
                  this.props.changeMenuPosition("create-song");
                }}
              >
                <p>Create a song</p>
                <img src="/assets/pictures/main-menu/create-song.png" alt="" />
              </div>

              <div
                className="menu_option"
                onClick={() => {
                  this.props.changeMenuPosition("credits");
                }}
              >
                <img src="/assets/pictures/main-menu/credits.png" alt="" />
                <p>Credits</p>
              </div>
            </div>
          </>
          )
        </div>

        <div
          className={ClassNames({
            hide_menu_routes: true,
            show_menu_routes: menuPosition === "song-list",
            selectSong: true
          })}
        >
          <PlayGame />
        </div>

        <div
          className={ClassNames({
            hide_menu_routes: true,
            show_menu_routes: menuPosition === "create-song",
            createSong: true
          })}
        >
          <EndGameContext.Provider
            value={(data) => {
              console.log("Tested game to to the end");
            }}
          >
            {menuPosition === "create-song" && <LoadGame test={true} />}
          </EndGameContext.Provider>
        </div>

        <div
          className={ClassNames({
            hide_menu_routes: true,
            show_menu_routes: menuPosition === "new-game"
          })}
          onTransitionEnd={() => {
            if (gameData[1] && menuPosition !== "new-game")
              this.props.toggleGame();
          }}
        >
          <EndGameContext.Provider
            value={(data) => {
              this.createGameEnd(data);
            }}
          >
            {gameData[1] ? gameData[0] : <></>}
          </EndGameContext.Provider>
        </div>

        <div
          className={ClassNames({
            hide_menu_routes: true,
            show_menu_routes: menuPosition === "end-game",
            gameEnd: true
          })}
          onTransitionEnd={() => {
            if (menuPosition !== "end-game") this.deleteGameEnd();
          }}
        >
          {this.state.endGame}
        </div>

        <div
          className={ClassNames({
            credits: true,
            hide_menu_routes: true,
            show_menu_routes: menuPosition === "credits"
          })}
        >
          {menuPosition === "credits" ? <Credits /> : <></>}
        </div>

        <div
          className={ClassNames({
            settings: true,
            hide_menu_routes: true,
            show_menu_routes: menuPosition === "settings"
          })}
        >
          {menuPosition === "settings" ? <Settings /> : <></>}
        </div>

        <div
          className={ClassNames({
            instructions: true,
            hide_menu_routes: true,
            show_menu_routes: menuPosition === "instructions"
          })}
        >
          {menuPosition === "instructions" ? <Instructions /> : <></>}
        </div>
      </main>
    );
  }
  componentDidMount() {
    document
      .querySelector('div[contenteditable="true"]')
      .addEventListener("paste", (e) => {
        e.preventDefault();
        var text = e.clipboardData.getData("text/plain");
        document.execCommand("insertHTML", false, text);
      });
  }
}

const mapStateToProps = (state) => ({
  menuPosition: state.menuPosition,
  gameData: state.gameData
});
export default connect(mapStateToProps, { changeMenuPosition, toggleGame })(
  Home
);
