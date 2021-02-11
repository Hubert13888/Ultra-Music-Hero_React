import React from "react";
import "./creditsStyles.scss";

export default class Credits extends React.Component {
  render() {
    return (
      <>
        <h1>Ultra Music Hero</h1>
        <p>Game made by</p>
        <a href="http://hubert-siwczynski.000webhostapp.com" target="_blank">
          Hubert13888
        </a>
        <p>using React and canvas</p>
        <p>
          Inspired with an Adobe Flash game
          <a
            className="a_embded"
            href="http://www.notdoppler.com/supercrazyguitarmaniacdeluxe4.php"
            target="_blank"
          >
            Super Crazy Guitar Maniac Deluxe 4
          </a>
        </p>
      </>
    );
  }
}
