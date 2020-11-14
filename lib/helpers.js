const { SingleBar, Presets } = require("cli-progress");
const { yellow, red, cyan, green } = require("colors");
const downloadFileWithProgressbar = require("download-file-with-progressbar");
const { startCase } = require("lodash");
const { existsSync, mkdirSync } = require("fs");
const { load } = require("cheerio");
const { get } = require("axios");

// main url
const URL = "https://old.akwam.co";

/**
 * @description A custom function to set console message with colors
 *
 * @package Color
 *
 * @param {String} msg Message to show
 * @param {String} color Message type ['danger','success','info','error']
 */
const setMsgColor = (msg, color = null) => {
  if (color === "success" || color === "done") {
    console.log(green("[✔] " + startCase(msg)));
  } else if (color === "danger" || color === "error") {
    console.log(red("[✖] " + startCase(msg)));
  } else if (color === "info") {
    console.log(yellow("[ℹ] " + startCase(msg)));
  } else {
    console.log("[#] " + startCase(msg));
  }
};

/**
 * @description A custom function that get a URL to fetch data from & parse it and return as jQuery selector type
 *
 * @package axios
 * @package cheerio
 *
 * @param {String} url URL to fetch data from & parse it
 *
 * @returns parsed html
 */
const fetchAndParse = async (url) => {
  // encode URI
  url = encodeURI(url);
  // get data
  let { data } = await get(url);
  // parse html data & return as jQuery type
  return load(data);
};

/**
 * @description A function to get data based on headers option
 *
 * @package axios
 *
 * @param {String} url URL to fetch data
 *
 * @returns json
 */
const fetchWithHeader = async (url) => {
  const { data } = await get(url, {
    headers: {
      referer: url,
      "x-requested-with": "XMLHttpRequest",
    },
  });
  return data;
};

/**
 * @description the download function that show user a list of choices to customize his downloads
 *
 * @param {Array} list Array of files
 * @param {Object} parent The main file page
 * @param {String} outputDir Output directory
 * @param {Boolean} isFilm Check if it a movie to stop the loop
 * @param {Number} index The loop start index
 */
const downloadFunction = (
  list,
  parent,
  outputDir = "./",
  isFilm = false,
  index = 0,
) => {
  // start download
  if (index < list.length) {
    let link = list[index];

    // file url & size
    const fileURL = link.href;
    const fileSIZE = link.size;

    setMsgColor(parent.name + " | " + link.name || parent.name);
    // new instance from cli-progress
    const downloadProgress = new SingleBar(
      {
        format: `${startCase("size")}: ${fileSIZE} |${cyan(
          "{bar}",
        )}| {percentage}% | ETA: {eta_formatted}`,
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        hideCursor: true,
      },
      Presets.shades_classic,
    );

    // set start & end value for the progress
    downloadProgress.start(100, 0);

    // check outputDir exists
    if (outputDir !== "./" && !existsSync(outputDir)) {
      mkdirSync(outputDir);
    }

    // download file
    downloadFileWithProgressbar(fileURL, {
      dir: outputDir,
      onDone: () => {
        downloadProgress.stop();
        if (!isFilm) {
          setMsgColor("download finish", "success");
        } else {
          downloadFunction(index + 1);
        }
      },
      onError: (err) => {
        console.log("error", err);
      },
      onProgress: (curr, total) => {
        downloadProgress.update((curr / total) * 100);
      },
    });
  } else {
    setMsgColor("download finish", "success");
  }
};

// exports
module.exports = {
  URL,
  downloadFunction,
  setMsgColor,
  fetchAndParse,
  fetchWithHeader,
};
