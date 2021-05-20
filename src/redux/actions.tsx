const changeMenuPosition = (position: string) => {
  return {
    type: "CHANGEMENUPOSITION",
    payload: position
  };
};
const createGame = (
  url,
  json,
  type = "GENERAL",
  test = false,
  builtIn = false
) => {
  return {
    type: "CREATEGAME",
    payload: {
      url,
      json,
      type,
      test,
      builtIn
    }
  };
};
const toggleGame = () => {
  return {
    type: "TOGGLEGAME"
  };
};

const changeMusicVolume = (volume = 50) => {
  return {
    type: "CHANGEMUSICVOLUME",
    payload: volume
  };
};

const setGameErrorGeneral = (error = "") => {
  return {
    type: "GENERAL",
    payload: error
  };
};
const setGameErrorURL = (error = "") => {
  return {
    type: "URL",
    payload: error
  };
};
const setGameErrorJSON = (error = "") => {
  return {
    type: "JSON",
    payload: error
  };
};

const updateBuiltInSongs = () => {
  return {
    type: "UPDATE_BI"
  };
};

const addCustomSongToList = (data) => {
  return {
    type: "ADD",
    payload: data
  };
};
const removeCustomSongFromList = (id) => {
  return {
    type: "REMOVE",
    payload: id
  };
};
const updateCustomSongs = () => {
  return {
    type: "UPDATE"
  };
};
export {
  changeMenuPosition,
  createGame,
  toggleGame,
  setGameErrorGeneral,
  setGameErrorURL,
  setGameErrorJSON,
  addCustomSongToList,
  removeCustomSongFromList,
  updateCustomSongs,
  updateBuiltInSongs,
  changeMusicVolume
};
