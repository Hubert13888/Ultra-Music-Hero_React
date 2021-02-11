import React from "react";
import "./playGameStyles.scss";

export default class PlayGame extends React.Component {
  state = {};
  constructor(props) {
    super(props);
    this.changeMenuPosition = props.changeMenuPosition;
  }
  render() {
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
              <tr>
                <td>Icon</td>
                <td>The Riddle</td>
                <td>Gigi d'Agostino</td>
                <td>-</td>
                <td>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      this.changeMenuPosition("new-game", {
                        url: "/songs/song1.json"
                      });
                    }}
                  >
                    Play
                  </button>
                </td>
              </tr>

              <tr>
                <td>Icon</td>
                <td>Test</td>
                <td>Test</td>
                <td>-</td>
                <td>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      this.changeMenuPosition("new-game", {
                        url: "/songs/song_test.json"
                      });
                    }}
                  >
                    Play
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="second_column">
          <h1>Play a custom level</h1>

          <p>Enter level URL</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              let formdata = new FormData(e.target),
                url = "";
              for (let data of formdata) url = data[1];

              this.changeMenuPosition("new-game", { url });
            }}
          >
            <input name="game_url" />
            <button>Play</button>
          </form>
          <p>Enter level code</p>
          <section>
            <div className="game_code" contentEditable></div>
            <button
              onClick={(e) => {
                e.preventDefault();
                let elem = document.getElementsByClassName("game_code")[0];
                this.changeMenuPosition("new-game", { json: elem.textContent });
              }}
            >
              Play
            </button>
          </section>
        </div>
      </>
    );
  }
}
