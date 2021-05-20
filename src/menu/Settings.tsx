import React from "react";
import "./settingsStyles.scss";

import Slider from "@material-ui/core/Slider";
import { withStyles } from "@material-ui/core/styles";

import { connect } from "react-redux";
import { changeMusicVolume } from "../redux/actions";

const StyledSlider = withStyles({
  root: {
    color: "#C00101",
    width: "20vw"
  }
})(Slider);

class Settings extends React.Component {
  render() {
    return (
      <>
        <h1>Settings</h1>
        <p>Change music volume</p>
        <StyledSlider
          value={this.props.gameSettings.music}
          onChange={(e, newValue) => {
            this.props.changeMusicVolume(newValue);
          }}
        />
        <p>{this.props.gameSettings.music}%</p>
      </>
    );
  }
}

export default connect(
  (state) => ({
    gameSettings: state.gameSettings
  }),
  {
    changeMusicVolume
  }
)(Settings);
