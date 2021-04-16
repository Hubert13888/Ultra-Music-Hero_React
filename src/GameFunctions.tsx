import React from "react";
interface SongJson {
  header: {
    title: string;
    author: string;
    videoId: string;
    bpm: number;
    videoStartingPoint?: number;
    startOffset?: number;
    endOffset?: number;
    devStartingTact?: number;
    videoStartingOffset?: number;
  };
  notes: Array<Array<Array<string | number> | number | string> | number>;
}
interface Tiles {
  sliderFillPercent: any;
  sliderFill: any;
  x: number;
  ref?: any;
  hexNote: number;
  type: string;
  wasHit?: boolean;
  length?: number;
  isActivated?: boolean;
}

const sliders = ["1", "2", "3", "4"],
  notes = ["U", "D", "L", "R"];

function songHeaderValidate(song: SongJson) {
  let errors: string[] = [],
    alerts: string[] = [];

  try {
    /*Id powinno zawierać tylko cyfry i litery*/
    if (song.header.id === "" || typeof song.header.id !== "string")
      errors.push(
        "id: Your song should have a VERY unique ID, so it could be stored on a user's machine"
      );
    if (song.header.author === "" || typeof song.header.author !== "string")
      errors.push("author: No (or wrong) author specified");
    if (song.header.title === "" || typeof song.header.title !== "string")
      errors.push("title: No (or wrong) title specified");
    if (!song.header.bpm || typeof song.header.bpm !== "number")
      errors.push("bpm: No (or wrong) bpm specified");
    if (song.header.videoId === "" || typeof song.header.videoId !== "string")
      errors.push("videoId: You need to specify Youtube video's id (watch?v=)");
    if (
      ![undefined, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].includes(
        song.header.devGameSpeed
      )
    ) {
      errors.push(
        "gameDevSpeed: Speed has to be one of the following values: 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2"
      );
    }
    if (
      song.header.gameColor === "" ||
      typeof song.header.gameColor !== "string"
    )
      errors.push("gameColor: No color of the game provided");
    else {
      let a = song.header.gameColor;
      try {
        let b = a.split(",").map((c) => {
          c = Number(c);
          return 0 <= c && c <= 255;
        });
        if (b.length !== 3) {
          throw Error("e");
        }
        for (let c of b)
          if (!c) {
            throw Error("e");
          }
      } catch (e) {
        errors.push("gameColor: wrong RGB format");
      }
    }

    if (song.header.startOffset === undefined)
      alerts.push(
        "startOffset: You can specify the starting offset (delay between incoming notes and song start)"
      );
    else if (
      typeof song.header.startOffset !== "number" ||
      song.header.startOffset < 0
    )
      errors.push("startOffset: Wrong offset specified");

    if (song.header.endOffset === undefined)
      alerts.push(
        "endOffset: You can specify the ending offset (delay between last note and end of the game)"
      );
    else if (
      typeof song.header.endOffset !== "number" ||
      song.header.endOffset < 0
    )
      errors.push("endOffset: Wrong offset specified");

    if (song.header.videoStartingPoint === undefined)
      alerts.push(
        "videoStartingPoint: You can specify the starting video second"
      );
    else if (
      typeof song.header.videoStartingPoint !== "number" ||
      song.header.videoStartingPoint < 0
    )
      errors.push("videoStartingPoint: Wrong video starting time specified");

    if (song.header.devStartingTact === undefined)
      alerts.push(
        "devStartingTact: You can specify the starting tact (for easier level creating)"
      );
    else if (
      typeof song.header.devStartingTact !== "number" ||
      song.header.devStartingTact < 0
    )
      errors.push("devStartingTact: Wrong tact number specified");

    if (song.header.videoStartingOffset === undefined)
      alerts.push(
        "videoStartingOffset: You can specify the offset between gameStart and music play"
      );
    else if (
      typeof song.header.videoStartingOffset !== "number" ||
      song.header.videoStartingOffset < 0
    )
      errors.push("videoStartingOffset: Wrong video offset specified");
  } catch (e) {
    errors.push("unknown fatal error");
  }

  return [errors, alerts];
}

function songNotesValidation(song: SongJson) {
  let errors: string[] = [],
    alerts: string[] = [],
    tiles: Tiles[] = [];

  let extraPos = 0,
    index = 0,
    iButOnlyNotesInRow = 0;

  for (let [i, row] of song.notes.entries()) {
    if (
      Array.isArray(row) ||
      typeof row === "number" ||
      typeof row === "string"
    ) {
      if (typeof row === "string") continue;
      if (Array.isArray(row)) {
        for (let [j, item] of row.entries()) {
          if (
            Array.isArray(item) ||
            item === 0 ||
            notes.includes(typeof item === "string" ? item : "xxx")
          ) {
            if (Array.isArray(item)) {
              for (let [k, itemArr] of item.entries()) {
                if (
                  Array.isArray(itemArr) ||
                  notes.includes(typeof itemArr === "string" ? itemArr : "xxx")
                ) {
                  if (Array.isArray(itemArr)) {
                    if (
                      !sliders.includes(itemArr[0].toString()) &&
                      typeof itemArr[1] !== "number"
                    ) {
                      errors.push(
                        "Wrong slider data in row " +
                          i +
                          " at position " +
                          j +
                          ".Item number " +
                          k
                      );
                    } else {
                      tiles.push({
                        x: index,
                        hexNote: iButOnlyNotesInRow * 16 + j + extraPos,
                        type: itemArr[0],
                        length: itemArr[1],
                        ref: React.createRef(),
                        wasHit: false
                      });
                      index++;
                    }
                  } else {
                    tiles.push({
                      x: index,
                      hexNote: iButOnlyNotesInRow * 16 + j + extraPos,
                      type: itemArr.toString(),
                      wasHit: false
                    });
                    index++;
                  }
                } else
                  errors.push(
                    "Wrong slider data in row " +
                      i +
                      " at position " +
                      j +
                      ". Item number " +
                      k
                  );
              }
            } else {
              if (typeof item !== "number") {
                tiles.push({
                  x: index,
                  hexNote: iButOnlyNotesInRow * 16 + j + extraPos,
                  type: item,
                  wasHit: false
                });
                index++;
              }
            }
          } else errors.push("Wrong item in row " + i + " at position " + j);
        }
        iButOnlyNotesInRow++;
      } else extraPos += row;
    } else errors.push("typeError: Wrong type of row number " + i);
  }

  return [errors, alerts, tiles];
}

function countStartingHexNote(devTact: number, notes: SongJson["notes"]) {
  let amountOfNotNumbers = 0,
    totalOfNumbers = 0;
  for (let noteRow of notes) {
    if (typeof noteRow === "number") {
      totalOfNumbers += noteRow;
    } else amountOfNotNumbers++;

    if (amountOfNotNumbers === devTact) break;
  }
  return 16 * (devTact - 1) + totalOfNumbers;
}

function parseSongString(s) {
  s = s
    .replace(/\\n/g, "")
    .replace(/\\'/g, "")
    .replace(/\\"/g, "")
    .replace(/\\&/g, "")
    .replace(/\\r/g, "")
    .replace(/\\t/g, "")
    .replace(/\\b/g, "")
    .replace(/\\f/g, "");

  s = s.replace(/[\u0000-\u0019]+/g, "");
  s = s.trim();
  return s;
}

function getTactInfo(notes) {
  let tacts = [];
  for (let row of notes) {
    if (Array.isArray(row)) {
      tacts.push("T");
    } else if (typeof row === "number") {
      tacts.push(row);
    }
  }
  let currRow = 0,
    tactMarks = [],
    pauseMarks = [];
  for (let tact of tacts) {
    if (tact === "T") {
      tactMarks.push(currRow);
      currRow += 16;
    } else {
      pauseMarks.push(currRow);
      currRow += tact;
    }
  }
  return [tactMarks, pauseMarks];
}

export {
  songHeaderValidate,
  songNotesValidation,
  countStartingHexNote,
  parseSongString,
  getTactInfo
};
