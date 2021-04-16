import React from "react";
import Classnames from "classnames";
import Game from "./Game";
import axios from "axios";
import { connect } from "react-redux";
import {
  songHeaderValidate,
  songNotesValidation,
  countStartingHexNote,
  parseSongString,
  getTactInfo
} from "./GameFunctions";

import {
  changeMenuPosition,
  toggleGame,
  setGameErrorGeneral,
  setGameErrorJSON,
  setGameErrorURL,
  addCustomSongToList
} from "./redux/actions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo, faClipboard } from "@fortawesome/free-solid-svg-icons";

class LoadGame extends React.Component {
  state = {
    game: [],
    focusedEditorTop: false,
    focusedEditorBottom: false,
    errorsToDisplay: [
      <li>Hi there. You can create your own level here!</li>,
      <li>
        Don't know the rules? They are simple! Just check:{" "}
        <a
          href="https://docs.google.com/document/d/1oKyTBU-aojl1oiIwFlt-_bRC-kbt0e5vly2871Otoxg/edit?usp=sharing"
          target="_blank"
        >
          Click
        </a>{" "}
        for more info.
      </li>,
      <li>
        Your code errors will be displayed in this pop-up box just after
        clicking load button
      </li>,
      <li>
        All the warnings will be displayed in the console (F12 ˃ Console Tab) to
        not annoy you
      </li>
    ],
    showErrorMsg: true,
    transErrorMsg: false,
    writtenCodeTop: "",
    writtenCodeBottom: "",
    gameRef: React.createRef()
  };

  async componentDidMount() {
    let codeEditorTop = document.getElementsByClassName("codeEditorTop")[0];
    let savedCodeTop = localStorage.getItem("savedCodeTop");
    if (codeEditorTop && savedCodeTop) {
      codeEditorTop.innerHTML = savedCodeTop;
    }

    let codeEditorBottom = document.getElementsByClassName(
      "codeEditorBottom"
    )[0];
    let savedCodeBottom = localStorage.getItem("savedCodeBottom");
    if (codeEditorBottom && savedCodeBottom) {
      codeEditorBottom.innerHTML = savedCodeBottom;
    }

    try {
      let song = {};
      if (!this.props.test) {
        if (this.props.url) {
          try {
            song = (await axios.get(this.props.url)).data;
            if (!song || song === {} || typeof song !== "object") {
              throw new Error(
                "Provided URL does not exist or gives an empty data object"
              );
            }
          } catch (e) {
            throw new Error("Provided URL causes an error in the request");
          }
        } else if (this.props.json) {
          try {
            song = JSON.parse(this.props.json);
          } catch (err) {
            throw new Error(
              "Cannot parse your code to JSON (wrong or no data provided)"
            );
          }
        } else {
          throw new Error("No data specified");
        }

        if (typeof song.header !== "object") {
          throw new Error("Received JSON data contains no 'header' field");
        }

        let headerVal = songHeaderValidate(song);

        let customLevels: any,
          customLevelsKeys: string[] = [];

        if (!this.props.builtIn) {
          customLevels = localStorage.getItem("customLevels");
          if (!customLevels) customLevels = "{}";
          customLevels = JSON.parse(customLevels);
          customLevelsKeys = Object.keys(customLevels);

          if (customLevelsKeys.includes(song.header.id)) {
            song = JSON.parse(customLevels[song.header.id].code);
          }
        }
        let notesVal;
        try {
          notesVal = songNotesValidation(song);
        } catch (err) {
          throw new Error("Received JSON data contains no 'notes' array");
        }
        console.log(headerVal);
        if (!headerVal[0][0] && !notesVal[0][0]) {
          console.log("ccasc2");
          if (headerVal[1][0] || notesVal[1][0]) {
            throw new Error([...headerVal[1], ...notesVal[0]][0]);
          }
          console.log("ccasc");
          this.props.changeMenuPosition("new-game");

          if (!this.props.builtIn) {
            if (!customLevelsKeys.includes(song.header.id)) {
              customLevels[song.header.id] = {
                code: JSON.stringify(song),
                highPoints: 0,
                maxPoints: 0
              };
              localStorage.setItem(
                "customLevels",
                JSON.stringify(customLevels)
              );
              this.props.addCustomSongToList({
                id: song.header.id,
                code: JSON.stringify(song),
                highPoints: 0,
                maxPoints: 0
              });
            }
          }

          this.setState({
            game: [
              <Game
                header={song.header}
                notes={notesVal[2]}
                devStartingHexNote={0}
                builtIn={this.props.builtIn && song.header.id}
              />
            ]
          });
        } else {
          throw new Error("Some fields in 'header' object are missing");
        }
      }
    } catch (err) {
      let msg = err.message;
      if (typeof msg !== "string") msg = "Unexpected Error";
      switch (this.props.gameData[2].type) {
        case "URL":
          this.props.setGameErrorURL(msg);
          break;
        case "JSON":
          this.props.setGameErrorJSON(msg);
          break;
        default:
          this.props.setGameErrorGeneral(msg);
          break;
      }
      this.props.toggleGame();
    }
  }
  render() {
    if (this.props.test) {
      return (
        <div className="gameLoad">
          <div
            className={Classnames({
              errors: true,
              errorsTransition: this.state.transErrorMsg
            })}
          >
            <div className="errorsList">
              <h2>ERRORS</h2>
              <ul>{this.state.errorsToDisplay}</ul>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                this.setState({
                  transErrorMsg: !this.state.transErrorMsg
                });
              }}
            >
              Understood
            </button>
          </div>
          <button
            className={Classnames({
              showErrors: true,
              hide_showErrors: !this.state.transErrorMsg
            })}
            onClick={(e) => {
              this.setState({
                transErrorMsg: false
              });
            }}
          >
            Show errors
          </button>
          <button
            className={Classnames({
              showErrors: true,
              instrButton: true,
              hide_showErrors: !this.state.transErrorMsg
            })}
          >
            <a
              href="https://docs.google.com/document/d/1oKyTBU-aojl1oiIwFlt-_bRC-kbt0e5vly2871Otoxg/edit?usp=sharing"
              target="_blank"
            >
              <FontAwesomeIcon icon={faInfo} />
            </a>
          </button>
          <div className="firstColumn">{this.state.game}</div>
          <form
            className="secondColumn"
            onSubmit={(e) => {
              e.preventDefault();
              let formData = new FormData(e.target);

              let d = {};
              for (let data of formData) {
                d[data[0]] = data[1];
              }

              this.setState({
                transErrorMsg: true
              });
              let compiledCode = {},
                error = false;
              try {
                compiledCode = JSON.parse(
                  parseSongString(
                    `{"header":{${d.header.trim()}}, "notes":[${d.notes.trim()}]}`
                  )
                );
              } catch (err) {
                //Trzeba zrobić lepszą wskazóekę gdzie jest błąd
                error = [
                  "JSON parse error. You've made an error in a JSON syntax"
                ];
              }

              if (!error) {
                if (Array.isArray(compiledCode.notes)) {
                  if (typeof compiledCode.header === "object") {
                    let headerVal = songHeaderValidate(compiledCode);
                    let notesVal = songNotesValidation(compiledCode);
                    if (!headerVal[0][0] && !notesVal[0][0]) {
                      if (headerVal[1][0] || notesVal[1][0]) {
                        console.log(
                          "warnings: ",
                          [...headerVal[1], ...notesVal[1]].join("\n")
                        );
                      }
                      if (this.state.game[0]) {
                        this.state.gameRef.current.refreshNotes(compiledCode);
                        setTimeout(() => {
                          this.state.gameRef.current.restart();
                        }, 50);
                      } else {
                        this.setState({
                          game: [
                            <Game
                              header={compiledCode.header}
                              notes={notesVal[2]}
                              marks={getTactInfo(compiledCode.notes)}
                              test={true}
                              devStartingHexNote={
                                compiledCode.header.devStartingTact
                                  ? countStartingHexNote(
                                      compiledCode.header.devStartingTact,
                                      compiledCode.notes
                                    )
                                  : 0
                              }
                              ref={this.state.gameRef}
                            />
                          ]
                        });
                      }
                    } else error = [...headerVal[0], ...notesVal[0]];
                  } else error = ["Your code doesn't contain 'header' part"];
                } else {
                  error = ["Your code doesn't contain valid 'notes' part"];
                  if (typeof compiledCode.header !== "object")
                    error.push("Your code doesn't contain valid 'header' part");
                }
              }

              if (error) {
                this.setState({
                  transErrorMsg: false,
                  errorsToDisplay: error.map((errerText) => {
                    return <li>{errerText}</li>;
                  })
                });
              }
            }}
          >
            <textarea
              name="header"
              style={{
                overflowY: this.state.focusedEditorTop ? "scroll" : "hidden",
                paddingRight: this.state.focusedEditorTop ? "0" : "15px"
              }}
              className={Classnames({
                codeEditor: true,
                game_code: true,
                codeEditorTop: true
              })}
              onPaste={(ev) => {
                ev.preventDefault();
                var text = ev.clipboardData.getData("text/plain");

                var v = ev.target.value,
                  s = ev.target.selectionStart,
                  e = ev.target.selectionEnd;
                ev.target.value = v.substring(0, s) + text + v.substring(e);
                ev.target.selectionStart = ev.target.selectionEnd = s;

                localStorage.setItem("savedCodeBottom", ev.target.value);
              }}
              onFocus={(e) => {
                this.setState({
                  focusedEditorTop: true
                });
              }}
              onBlur={(e) => {
                this.setState({
                  focusedEditorTop: false
                });
              }}
              onKeyDown={(ev) => {
                if (ev.keyCode === 9) {
                  var v = ev.target.value,
                    s = ev.target.selectionStart,
                    e = ev.target.selectionEnd;
                  ev.target.value = v.substring(0, s) + "\t" + v.substring(e);
                  ev.target.selectionStart = ev.target.selectionEnd =
                    s + text.length;

                  ev.preventDefault();
                }
              }}
              onKeyUp={(e) => {
                localStorage.setItem("savedCodeTop", e.target.value);
              }}
            ></textarea>
            <textarea
              name="notes"
              style={{
                overflowY: this.state.focusedEditorBottom ? "scroll" : "hidden",
                paddingRight: this.state.focusedEditorBottom ? "0" : "15px"
              }}
              className={Classnames({
                codeEditor: true,
                game_code: true,
                codeEditorBottom: true
              })}
              onPaste={(ev) => {
                ev.preventDefault();
                var text = ev.clipboardData.getData("text/plain");

                var v = ev.target.value,
                  s = ev.target.selectionStart,
                  e = ev.target.selectionEnd;
                ev.target.value = v.substring(0, s) + text + v.substring(e);
                ev.target.selectionStart = ev.target.selectionEnd =
                  s + text.length;

                localStorage.setItem("savedCodeBottom", ev.target.value);
              }}
              onFocus={(e) => {
                this.setState({
                  focusedEditorBottom: true
                });
              }}
              onBlur={(e) => {
                this.setState({
                  focusedEditorBottom: false
                });
              }}
              onKeyDown={(ev) => {
                if (ev.keyCode === 9) {
                  var v = ev.target.value,
                    s = ev.target.selectionStart,
                    e = ev.target.selectionEnd;
                  ev.target.value = v.substring(0, s) + "\t" + v.substring(e);
                  ev.target.selectionStart = ev.target.selectionEnd = s + 1;

                  ev.preventDefault();
                }
              }}
              onKeyUp={(e) => {
                localStorage.setItem("savedCodeBottom", e.target.value);
              }}
            ></textarea>
            <div className="action_buttons">
              <button className="load_button" onClick={(e) => {}}>
                Load
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  let headerVal = document.querySelector(".codeEditorTop")
                      ?.value,
                    notesVal = document.querySelector(".codeEditorBottom")
                      ?.value;
                  const el = document.createElement("textarea");
                  el.value = `{"header":{${headerVal.trim()}}, "notes":[${notesVal.trim()}]}`;
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand("copy");
                  document.body.removeChild(el);
                  alert("Level code has been copied to clipboard");
                }}
              >
                <FontAwesomeIcon icon={faClipboard} />
              </button>
            </div>
          </form>
        </div>
      );
    } else {
      return <div className="gameLoad">{this.state.game}</div>;
    }
  }
}

const mapStateToProps = (state) => ({
  menuPosition: state.menuPosition,
  gameData: state.gameData
});

export default connect(mapStateToProps, {
  changeMenuPosition,
  toggleGame,
  setGameErrorGeneral,
  setGameErrorJSON,
  setGameErrorURL,
  addCustomSongToList
})(LoadGame);
