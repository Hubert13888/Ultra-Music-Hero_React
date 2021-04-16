import React from "react";
import "./playGameStyles.scss";
import builtInLevels from "/public/builtInLevels.json";
import Classnames from "classnames";
import { connect } from "react-redux";
import {
  createGame,
  toggleGame,
  changeMenuPosition,
  setGameErrorGeneral,
  setGameErrorURL,
  setGameErrorJSON,
  removeCustomSongFromList
} from "../redux/actions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faClipboard } from "@fortawesome/free-regular-svg-icons";

class PlayGame extends React.Component {
  state = {
    URLerror: "",
    codeError: "",
    openMenu: false
  };
  render() {
    const gameErrors = this.props.gameErrors;
    return (
      <>
        <div className="first_column">
          <h1>Select a song</h1>
          <table>
            <thead>
              <th>
                <td></td>
                <td>Title</td>
                <td>Author</td>
                <td>Score</td>
                <td></td>
              </th>
            </thead>
            <tbody>
              {this.props.builtInSongList.map((level) => {
                let levelComb = {};
                for (let l of builtInLevels) {
                  if (l.id === level.id) {
                    levelComb = { ...l, ...level };
                    break;
                  }
                }
                return (
                  <tr>
                    <td>
                      <a
                        href={`https://youtube.com/v/${levelComb.yt}`}
                        target="_blank"
                      >
                        <img
                          className="youtubeIco"
                          src="assets/pictures/icons/youtube.png"
                          alt=""
                        />
                      </a>
                    </td>
                    <td>{levelComb.title}</td>
                    <td>{levelComb.author}</td>
                    <td>
                      {(() => {
                        let highScore = Number(levelComb.oldPoints),
                          maxScore = Number(levelComb.maxPoints);
                        return highScore
                          ? `${Math.floor((highScore * 100) / maxScore)}%`
                          : "0%";
                      })()}
                    </td>
                    <td>
                      <button
                        className="playGame_playBtn"
                        onClick={async (e) => {
                          e.preventDefault();

                          this.props.createGame(
                            levelComb.path,
                            null,
                            "GENERAL",
                            false,
                            true
                          );
                        }}
                      >
                        Play
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="second_column">
          <h1>Your custom songs</h1>
          {this.props.customSongList[0] ? (
            <table>
              <thead>
                <th>
                  <td></td>
                  <td>Title</td>
                  <td>Author</td>
                  <td>Score</td>
                  <td className="buttonCell"></td>
                  <td className="buttonCell"></td>
                  <td className="buttonCell"></td>
                </th>
              </thead>
              <tbody>
                {this.props.customSongList.map((level) => {
                  let levelcode = JSON.parse(level.code);
                  return (
                    <tr>
                      <td>
                        <a
                          href={`https://youtube.com/v/${levelcode.header.videoId}`}
                          target="_blank"
                        >
                          <img
                            className="youtubeIco"
                            src="assets/pictures/icons/youtube.png"
                            alt=""
                          />
                        </a>
                      </td>
                      <td>{levelcode.header.title}</td>
                      <td>{levelcode.header.author}</td>
                      <td>
                        {(() => {
                          let highScore = Number(level.highPoints),
                            maxScore = Number(level.maxPoints);
                          return highScore
                            ? `${Math.floor((highScore * 100) / maxScore)}%`
                            : "0%";
                        })()}
                      </td>
                      <td className="buttonCell">
                        <button
                          className="playGame_playBtn"
                          onClick={async (e) => {
                            e.preventDefault();

                            this.props.createGame(
                              null,
                              level.code,
                              "GENERAL",
                              false,
                              false
                            );
                          }}
                        >
                          Play
                        </button>
                      </td>

                      <td className="buttonCell">
                        <button
                          className="copy_playBtn"
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.createElement("textarea");
                            el.value = level.code;
                            document.body.appendChild(el);
                            el.select();
                            document.execCommand("copy");
                            document.body.removeChild(el);
                            alert("Level code has been copied to clipboard");
                          }}
                        >
                          <FontAwesomeIcon icon={faClipboard} />
                        </button>
                      </td>

                      <td className="buttonCell">
                        <button
                          className="delete_playBtn"
                          onClick={async (e) => {
                            e.preventDefault();
                            let customLevels = JSON.parse(
                              localStorage.getItem("customLevels")
                            );
                            delete customLevels[levelcode.header.id];

                            localStorage.setItem(
                              "customLevels",
                              JSON.stringify(customLevels)
                            );

                            this.props.removeCustomSongFromList(
                              levelcode.header.id
                            );
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="noSongInfo">
              No songs were found. Click + button to add one!
            </p>
          )}
          <div className="addLevel_show_wrapper">
            <button
              onClick={(e) => {
                this.setState({
                  openMenu: true
                });
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        <div
          className={Classnames({
            addLevel: true,
            addLevel_transition: this.state.openMenu
          })}
        >
          <section className="addLevel_close_wrapper">
            <div
              className="addLevel_close"
              onClick={(e) => {
                this.setState({
                  openMenu: false
                });
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </div>
            <h1>Add new custom level</h1>
          </section>

          <p>Enter level URL</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              this.setState({ URLerror: "" });
              let formdata = new FormData(e.target),
                url = "";
              for (let data of formdata) url = data[1];

              this.props.createGame(url, null, "URL", false, false);
            }}
          >
            <input name="game_url" />
            <button>Play</button>
            <div className="game_code_error">{gameErrors[1]}</div>
          </form>
          <p>Enter level code</p>
          <section>
            <div className="game_code" contentEditable></div>
            <button
              onClick={async (e) => {
                this.setState({ codeError: "" });
                e.preventDefault();
                let elem = document.getElementsByClassName("game_code")[0];
                this.props.createGame(
                  null,
                  elem.textContent,
                  "JSON",
                  false,
                  false
                );
              }}
            >
              Play
            </button>
            <div className="game_code_error">{gameErrors[2]}</div>
          </section>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  menuPosition: state.menuPosition,
  gameData: state.gameData,
  gameErrors: state.gameErrors,
  customSongList: state.customSongList,
  builtInSongList: state.builtInSongList
});

export default connect(mapStateToProps, {
  createGame,
  toggleGame,
  changeMenuPosition,
  setGameErrorGeneral,
  setGameErrorURL,
  setGameErrorJSON,
  removeCustomSongFromList
})(PlayGame);
