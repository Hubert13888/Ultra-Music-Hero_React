import React from "react";
import App from "./App";
import Classnames from "classnames";

import "./slider.scss";

interface SliderProps {
  id: number;
  handleContent: string;
  length: number;
  bpm: number;
  addPoints: (pointAmount: number) => void;
}

interface SliderState {
  id: number;
  handleContent: string;
  length: number;
  bpm: number;
  stopCircle: boolean;
  bar_compl: number;
  bar_compl_interv?: any;
  bar_animation: string;
  animationEnd: boolean;
  addPoints: (pointAmount: number) => void;
}

export default class Slider extends React.Component<SliderProps> {
  state: SliderState = {
    id: 0,
    handleContent: "0",
    length: 0,
    bpm: 0,
    bar_animation: ``,
    bar_compl: 0,
    stopCircle: false,
    animationEnd: false,
    addPoints: (pointAmount: number) => {}
  };
  constructor(props: SliderProps) {
    super(props);

    this.state.id = props.id;

    this.state.handleContent = props.handleContent;
    this.state.bpm = props.bpm;
    this.state.addPoints = props.addPoints;
    this.state.length = props.length;
  }
  activated(id: number) {
    if (this.state.id === id) {
      if (!this.state.stopCircle) {
        this.setState({
          stopCircle: true,
          bar_animation: `bar_animation ${
            (15000 * this.state.length) / this.state.bpm
          }ms linear forwards
          `
        });
      }
    }
  }
  disactivated(id: number) {
    if (this.state.id === id) {
      this.setState({
        stopCircle: false
      });
      if (!this.state.animationEnd) clearInterval(this.state.bar_compl_interv);
    }
  }

  sliderAnimDuration = () => {
    let bpm = this.state.bpm,
      sliderLen = this.state.length;
    return (15 * (20 + sliderLen)) / bpm;
  };

  render() {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @keyframes slider_animation${this.state.id} {
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
              animation: `slider_animation${this.state.id} forwards linear`,
              animationDuration: `${this.sliderAnimDuration()}s`,
              animationPlayState: this.state.stopCircle ? "paused" : "running"
            }}
          >
            <img src="" alt={this.state.handleContent} />
          </div>
          <div
            className="slider_bar"
            style={{
              animation: `slider_animation${this.state.id} forwards linear`,
              animationDuration: `${this.sliderAnimDuration()}s`,
              width: `calc(${this.state.length} * 5vw)`
            }}
          >
            <div
              className="slider_bar_content"
              style={{
                animation: this.state.bar_animation,
                animationPlayState: this.state.stopCircle ? "running" : "paused"
              }}
              onAnimationStartCapture={() => {
                let points = 0,
                  pointsToGet = this.state.length * 15;
                this.setState({
                  bar_compl_interv: setInterval(() => {
                    points += 5;
                    this.state.addPoints(5);
                    if (points === pointsToGet)
                      clearInterval(this.state.bar_compl_interv);
                  }, (5 / this.state.bpm) * 1000)
                });
              }}
              onAnimationEndCapture={() => {
                this.setState({
                  stopCircle: false,
                  animationEnd: true
                });
                //clearInterval(this.state.bar_compl_interv);
              }}
            ></div>
          </div>
        </div>
      </>
    );
  }
}
