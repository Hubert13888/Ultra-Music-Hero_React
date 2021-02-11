import React from "react";
import "./settingsStyles.scss";

export default class Credits extends React.Component {
  render() {
    return (
      <>
        <h1>Settings</h1>
        <table>
          <tbody>
            <tr>
              <td>Youtube video quality</td>
              <td>
                <select>
                  <option>automatic</option>
                  <option>low</option>
                  <option>medium</option>
                  <option>high</option>
                  <option>ultra</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Music</td>
              <td>
                <input
                  type="range"
                  name="musicLoudness"
                  min="0"
                  max="100"
                  step="1"
                />
              </td>
            </tr>
            <tr>
              <td>SFX</td>
              <td>
                <input
                  type="range"
                  name="SFXLoudness"
                  min="0"
                  max="100"
                  step="1"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );
  }
}
