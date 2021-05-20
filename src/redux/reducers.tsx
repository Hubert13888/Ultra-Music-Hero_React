import { combineReducers } from "redux";
import LoadGame from "../LoadGame";
import React from "react";
import builtInLevelsJSON from "/public/builtInLevels.json";

const menuPosReducer = (state = "main-menu", action) => {
  if (action.type === "CHANGEMENUPOSITION") {
    if (action.payload) return action.payload;
    return "main-menu";
  }
  return state;
};

const gameData = (state = [<></>, false, {}], action) => {
  switch (action.type) {
    case "CREATEGAME":
      let data = action.payload,
        json;
      if (data.json) {
        json = data.json
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
      return [
        <LoadGame
          url={data.url}
          json={json}
          test={data.test}
          builtIn={data.builtIn}
        />,
        true,
        data
      ];
      break;
    case "TOGGLEGAME":
      let lastState = [...state];
      lastState[1] = !lastState[1];
      return lastState;
  }
  return state;
};

const gameSettings = (
  state = {
    music: 100
  },
  action
) => {
  let lastState = { ...state };
  switch (action.type) {
    case "CHANGEMUSICVOLUME":
      lastState.music = action.payload;
      break;
  }
  return lastState;
};

const gameErrors = (state = ["", "", ""], action) => {
  let lastState = [...state];
  switch (action.type) {
    case "GENERAL":
      lastState[0] = action.payload;
      break;
    case "URL":
      lastState[1] = action.payload;
      break;
    case "JSON":
      lastState[2] = action.payload;
      break;
  }
  return lastState;
};

const builtInSongList = (
  state = (() => {
    let builtInLevels: any = localStorage.getItem("builtInLevels"),
      levels = [],
      toSaveInLocalStorage = {};
    if (!builtInLevels) {
      for (let levelJSON of builtInLevelsJSON) {
        levels.push({
          id: levelJSON.id,
          oldPoints: 0,
          maxPoints: 0
        });
        toSaveInLocalStorage[levelJSON.id] = {
          oldPoints: 0,
          maxPoints: 0
        };
      }
      localStorage.setItem(
        "builtInLevels",
        JSON.stringify(toSaveInLocalStorage)
      );
    } else {
      builtInLevels = JSON.parse(builtInLevels);
      for (let level of builtInLevelsJSON) {
        levels.push({
          id: level.id,
          ...(builtInLevels?.[level.id] || { oldPoints: 0, maxPoints: 0 })
        });
        if (!builtInLevels[level.id]) {
          builtInLevels[level.id] = {
            oldPoints: 0,
            maxPoints: 0
          };
          localStorage.setItem("builtInLevels", JSON.stringify(builtInLevels));
        }
      }
    }
    return levels;
  })(),
  action
) => {
  if (action.type === "UPDATE_BI") {
    let builtInLevels: any = JSON.parse(localStorage.getItem("builtInLevels")),
      levels = [];
    for (let level of builtInLevelsJSON) {
      levels.push({
        id: level.id,
        ...(builtInLevels?.[level.id] || { oldPoints: 0, maxPoints: 0 })
      });

      if (!builtInLevels[level.id]) {
        builtInLevels[level.id] = {
          oldPoints: 0,
          maxPoints: 0
        };
        localStorage.setItem("builtInLevels", JSON.stringify(builtInLevels));
      }
    }
    return levels;
  }
  return state;
};

const customSongList = (
  state = (() => {
    let customLevels: any = localStorage.getItem("customLevels"),
      levels = [];
    if (!customLevels) customLevels = "{}";
    customLevels = JSON.parse(customLevels);

    for (let level in customLevels) {
      levels.push({
        id: level,
        ...customLevels[level]
      });
    }

    return levels;
  })(),
  action
) => {
  switch (action.type) {
    case "ADD":
      return [...state, action.payload];
    case "UPDATE":
      let customLevels: any = JSON.parse(localStorage.getItem("customLevels")),
        levels = [];
      for (let level in customLevels) {
        levels.push({
          id: level,
          ...customLevels[level]
        });
      }
      return levels;
    case "REMOVE":
      return [...state].filter((level) => {
        return action.payload !== level.id;
      });
  }
  return state;
};

const combinedReducers = combineReducers({
  menuPosition: menuPosReducer,
  gameData: gameData,
  gameErrors: gameErrors,
  customSongList: customSongList,
  builtInSongList: builtInSongList,
  gameSettings: gameSettings
});
export default combinedReducers;
