import React from "react";
import Game from "../AppCanvas";
import ClassNames from "classnames";
import PlayGame from "./PlayGame";
import Credits from "./Credits";
import EndGame from "./EndGame";

import Settings from "./Settings";
import Instructions from "./Instructions";
import "./menuStyles.scss";

interface StateMenu {
  menuPosition: string;
  game: Game[];
  lastGameData?: {
    url: string;
    json: string;
  };
  inputs: {
    width: number;
    height: number;
    content_of_new_1: number;
    content_of_new_2: number;
    number_of_new: number;
    winning_tile: number;
  };
  errors: string[];
}

export default class Home extends React.Component {
  state: StateMenu = {
    menuPosition: "settings",
    game: [],
    endGame: [],
    inputs: {
      width: 4,
      height: 4,
      content_of_new_1: 4,
      content_of_new_2: 2,
      number_of_new: 1,
      winning_tile: 2048
    },
    errors: []
  };

  deleteGames() {
    this.setState((prev: StateMenu) => ({
      game: [
        ...prev.game.map(() => {
          return void 0;
        })
      ]
    }));
  }
  createGame(url, json, test = false) {
    this.setState({
      lastGameData: {
        url,
        json
      }
    });
    if (json) {
      json = json
        .replace(/\\n/g, "")
        .replace(/\\'/g, "")
        .replace(/\\"/g, "")
        .replace(/\\&/g, "")
        .replace(/\\r/g, "")
        .replace(/\\t/g, "")
        .replace(/\\b/g, "")
        .replace(/\\f/g, "");
      json = json.replace(/[\u0000-\u0019]+/g, "");
      json = json.trim();
    }
    this.setState((prev: StateMenu) => ({
      game: [
        ...prev.game,
        <Game
          url={url}
          jsonData={json}
          test={test}
          error={(error) => {
            alert(error);
          }}
          win={(data) => {
            this.setState({ menuPosition: "end-game" });
            this.createGameEnd(data);
          }}
        />
      ]
    }));
  }
  createGameEnd(data) {
    this.setState((prev) => ({
      endGame: [
        ...prev.endGame,
        <EndGame
          data={data}
          lastGameData={this.state.lastGameData}
          createGame={this.createGame.bind(this)}
          changeMenuPosition={(pos) => {
            this.setState({ menuPosition: pos });
          }}
        />
      ]
    }));
  }
  deleteGameEnd() {
    this.setState((prev: StateMenu) => ({
      endGame: []
    }));
  }

  render() {
    return (
      <main>
        <button
          className={ClassNames({
            returnButton: true,
            back: true,
            hide_menu_routes: true,
            show_menu_routes: this.state.menuPosition !== "main-menu"
          })}
          onClick={() => this.setState({ menuPosition: "main-menu" })}
        >
          Back
        </button>

        <div
          className={ClassNames({
            menu: true,
            hide_menu_routes: true,
            show_menu_routes: this.state.menuPosition === "main-menu"
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
                <img
                  src="/assets/pictures/main-menu/information.png"
                  alt=""
                  onClick={() => {
                    this.setState({ menuPosition: "instructions" });
                  }}
                />

                <img
                  src="/assets/pictures/main-menu/settings.png"
                  alt=""
                  onClick={() => {
                    this.setState({ menuPosition: "settings" });
                  }}
                />
              </div>
            </div>
            <div className="menu_list menu_column column3">
              <div
                className="menu_option"
                onClick={() => {
                  this.setState({ menuPosition: "song-list" });
                }}
              >
                <img src="/assets/pictures/main-menu/song-list.png" alt="" />
                <p>Song list</p>
              </div>

              <div
                className="menu_option"
                onClick={() => {
                  this.setState({ menuPosition: "create-song" });
                }}
              >
                <p>Create a song</p>
                <img src="/assets/pictures/main-menu/create-song.png" alt="" />
              </div>

              <div
                className="menu_option"
                onClick={() =>
                  this.setState({
                    menuPosition: "credits"
                  })
                }
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
            show_menu_routes: this.state.menuPosition === "end-game",
            gameEnd: true
          })}
          onTransitionEnd={() => {
            if (this.state.menuPosition !== "end-game") this.deleteGameEnd();
          }}
        >
          {this.state.endGame}
        </div>

        <div
          className={ClassNames({
            hide_menu_routes: true,
            show_menu_routes: this.state.menuPosition === "song-list",
            selectSong: true
          })}
          onTransitionEnd={() => {}}
        >
          <PlayGame
            changeMenuPosition={(pos, data) => {
              this.createGame(data.url, data.json);
              this.setState({ menuPosition: pos });
            }}
          />
        </div>

        <div
          className={ClassNames({
            hide_menu_routes: true,
            show_menu_routes: this.state.menuPosition === "create-song",
            createSong: true
          })}
          onTransitionEnd={() => {}}
        >
          <Game test={true} />
        </div>

        <div
          className={ClassNames({
            hide_menu_routes: true,
            show_menu_routes: this.state.menuPosition === "new-game"
          })}
          onTransitionEnd={() => {
            if (this.state.menuPosition !== "new-game") this.deleteGames();
          }}
        >
          {this.state.game}
        </div>

        <div
          className={ClassNames({
            credits: true,
            hide_menu_routes: true,
            show_menu_routes: this.state.menuPosition === "credits"
          })}
        >
          {this.state.menuPosition === "credits" ? <Credits /> : <></>}
        </div>

        <div
          className={ClassNames({
            settings: true,
            hide_menu_routes: true,
            show_menu_routes: this.state.menuPosition === "settings"
          })}
        >
          {this.state.menuPosition === "settings" ? <Settings /> : <></>}
        </div>

        <div
          className={ClassNames({
            instructions: true,
            hide_menu_routes: true,
            show_menu_routes: this.state.menuPosition === "instructions"
          })}
        >
          {this.state.menuPosition === "instructions" ? (
            <Instructions />
          ) : (
            <></>
          )}
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
