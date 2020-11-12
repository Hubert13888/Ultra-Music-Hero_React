import React from "react";
import App from "./App";
import Classnames from "classnames";

import "./slider.scss";

interface SliderProps {
  parent: App;
  id: number;
  number: number;
  length: number;
  bpm: number;
  type: string;
  addPoints: (pointAmount: number) => void;
}

interface SliderState {
  id: number;
  parent?: App;
  number: number;
  length: number;
  bpm: number;
  type: string;
  stopCircle: boolean;
  bar_compl: number;
  bar_compl_interv?: any;
  bar_gradient: string;
  addPoints: (pointAmount: number) => void;
}

export default class Slider extends React.Component<SliderProps> {
  state: SliderState = {
    id: 0,
    number: 0,
    length: 0,
    type: "",
    bpm: 0,
    bar_gradient: `linear-gradient(90deg, rgba(230,230,230,1) 0%, rgba(0,83,99,1) 0%`,
    bar_compl: 0,
    stopCircle: false,
    addPoints: (pointAmount: number) => {}
  };
  constructor(props: SliderProps) {
    super(props);

    this.state.id = props.id;

    this.state.number = props.number;
    this.state.type = props.type;
    this.state.bpm = props.bpm;
    this.state.addPoints = props.addPoints;
    this.state.length = props.length;
  }
  activated(id: number) {
    if (this.state.id === id) {
      let progress = this.state.bar_compl + 1;
      if (!this.state.stopCircle) {
        this.setState({
          stopCircle: true,
          bar_compl_interv: setInterval(() => {
            this.setState((prev: SliderState) => ({
              bar_compl: prev.bar_compl + 1,
              bar_gradient: `linear-gradient(90deg, rgba(230,230,230,1) ${
                prev.bar_compl + 1
              }%, rgba(0,83,99,1) ${prev.bar_compl + 2}%)`
            }));
            this.state.addPoints(1);
            if (this.state.bar_compl === 100) {
              this.disactivated(this.state.id);
            }
          }, ((3 * this.state.length) / (25 * this.state.bpm)) * 1000)
        });
      }
    }
  }
  disactivated(id: number) {
    if (this.state.id === id) {
      this.setState({
        stopCircle: false
      });
      clearInterval(this.state.bar_compl_interv);
    }
  }

  sliderAnimDuration = () => {
    let bpm = this.state.bpm,
      sliderLen = this.state.length + 1;
    return (12 * (25 + sliderLen)) / bpm;
  };

  render() {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @keyframes slider_animation {
              from {
                transform: translateX(0);
              } 
              to {
                transform: translateX(calc(-100vw - ${
                  this.state.length + 1
                } * 5vw));
              }
            }
          `
          }}
        />
        <div
          className={Classnames({
            slider: true
          })}
          style={{}}
        >
          <div
            className={Classnames({
              slider_handle: true
            })}
            style={{
              animation: "slider_animation forwards linear",
              animationDuration: `${this.sliderAnimDuration()}s`,
              animationPlayState: this.state.stopCircle ? "paused" : "running"
            }}
          >
            <span>{this.state.number}</span>
          </div>
          <div
            className="slider_bar"
            style={{
              animation: "slider_animation forwards linear",
              animationDuration: `${this.sliderAnimDuration()}s`,
              width: `calc(${this.state.length} * 5vw)`,
              background: this.state.bar_gradient
            }}
          ></div>
        </div>
      </>
    );
  }
}
