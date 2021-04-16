import React from "react";
import "./instructionsStyles.scss";

export default class Credits extends React.Component {
  state = {
    page: 0,
    transformPage: "translateX(0)"
  };
  maxSites = 5;
  render() {
    return (
      <>
        <button
          onClick={(e) => {
            e.preventDefault();
            let newPage = this.state.page - 1;
            if (newPage >= 0)
              this.setState({
                page: newPage,
                transformPage: `translateX(${-newPage * 100}%)`
              });
          }}
          style={{
            visibility: this.state.page === 0 ? "hidden" : "visible"
          }}
        >
          🠸
        </button>
        <div className={"info_content"}>
          <div
            className="content_page_wrapper"
            style={{
              transform: this.state.transformPage
            }}
          >
            <div className="content_page">
              <h1>General rules</h1>
              <p>
                In this game your task is to hit as many notes and sliders as
                you can. They will move from right to left with the tempo of the
                music, and you have to catch them all when they are at this
                colored stripe - further called “a zipper”
              </p>
              <img src="/assets/pictures/instruction/image1.png" alt="" />
            </div>

            <div className="content_page">
              <p>
                Hits are counted when:
                <ul>
                  <li>
                    A note is at the zipper and a key matching the note’s letter
                    is pressed (up, down, left or right key).
                  </li>
                  <li>
                    A sliders badge is on the zipper ang a key matching the
                    slider’s number is held (1, 2, 3 or 4)
                  </li>
                </ul>
                Hits are signed with the note’s/slider’s color graying out and
                by achieving the next multiplier point.
              </p>
            </div>

            <div className="content_page">
              <h1>Bottom information</h1>
              <img src="/assets/pictures/instruction/image2.png" alt="" />
              <p>
                Gray bar: Hit counter. When it fills up (8 hits) and the next
                hit is made, the multiplier goes up by 1 and the bar resets.
                After the miss or if the note/slider went off the screen, the
                multiplier decreases by 1 and the bar turns to 8 hits (1 hit
                remains to achieve the previous multiplier). However, it just
                resets when the multiplier is 1.
                <br />
                red bar: A regular progress bar showing the percentage of
                collected points.
                <br />
                Information bar:
                <ul>
                  <li>Percent of points</li>
                  <li>Sum of the points/total points</li>
                  <li>
                    Multiplier (max. 5): Collected points are multiplied by its
                    actual value
                  </li>
                </ul>
                You got 25 points for each note and 100 points for each filled
                slider (with 1x multiplier)
              </p>
            </div>
            <div className="content_page">
              <h1>Level types</h1>
              <p>
                You can play either our levels or custom ones made by our
                community. The only thing you need to know to play custom levels
                is their code or level URL leading to the code file (such link
                should end up with .json extension). If you have a more creative
                mind and you want to do something new you can create your own
                level. Just use the “create a song” option in the main menu.
                There you will find all the useful stuff and information.
              </p>
            </div>
            <div className="content_page">
              <h1>Enjoy</h1>
              <p>
                I spent 2 months creating this game. Hope you'll have fun :)
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            let newPage = this.state.page + 1;
            if (newPage < this.maxSites)
              this.setState({
                page: newPage,
                transformPage: `translateX(${-newPage * 100}%)`
              });
          }}
          style={{
            visibility:
              this.state.page === this.maxSites - 1 ? "hidden" : "visible"
          }}
        >
          🠺
        </button>
      </>
    );
  }
}
