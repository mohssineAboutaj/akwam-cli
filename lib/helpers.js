const { SingleBar, Presets } = require("cli-progress");
const { yellow, red, cyan, green, brightRed } = require("colors");
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
 * @param {String} color Message type ['danger','success','info','error','done']
 */
function setMsgColor(msg, color = null) {
  if (["success", "done"].includes(color)) {
    console.log(green("[✔] " + startCase(msg)));
  } else if (["danger", "error"].includes(color)) {
    console.log(red("[✖] " + startCase(msg)));
  } else if (["warning", "warn"].includes(color)) {
    console.log(brightRed("[✖] " + startCase(msg)));
  } else if (["info"].includes(color)) {
    console.log(yellow("[ℹ] " + startCase(msg)));
  } else {
    console.log("[#] " + startCase(msg));
  }
}

/**
 * @description Function to check if the passed value contain film/movie word
 *
 * @param {String} val value to check
 *
 * @returns Boolean
 */
function isFilm(val) {
  return val.search(/فيلم|الفيلم|فلم/gi) >= 0;
}

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
async function fetchAndParse(url) {
  // encode URI
  url = encodeURI(url);
  // get data
  const { data } = await get(url);
  // parse html data & return as jQuery type
  return load(data);
}

/**
 * @description A function to get data based on headers option
 *
 * @package axios
 *
 * @param {String} url URL to fetch data
 *
 * @returns json
 */
async function fetchWithHeader(url) {
  const { data } = await get(url, {
    headers: {
      referer: url,
      "x-requested-with": "XMLHttpRequest",
    },
  });
  return data;
}

/**
 * @description the download function that show user a list of choices to customize his downloads
 *
 * @param {Array} list Array of files
 * @param {Object} parent The main file page
 * @param {String} outputDir Output directory
 * @param {Number} index The loop start index
 */
function downloadFunction(list, parent, outputDir = "./", index = 0) {
  // set items count
  const itemsCount = list.length;

  // set link
  const link = list[index];

  // file url & size
  const fileURL = link.href;
  const fileSIZE = link.size;

  // show download file info
  setMsgColor(parent.name + " | " + link.name || parent.name);

  // new instance from cli-progress
  const downloadProgress = new SingleBar(
    {
      format: `${
        itemsCount > 1 ? `Download [${index + 1}/${itemsCount}] | ` : ""
      }Size: ${fileSIZE} |${cyan(
        "{bar}",
      )}| {percentage}% | ETA: {eta_formatted} `,
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
    onProgress: (curr, total) => {
      downloadProgress.update((curr / total) * 100);
    },
    onDone: () => {
      downloadProgress.stop();

      // check to running the download again
      if (index < itemsCount - 1) {
        downloadFunction(list, parent, outputDir, index + 1);
      } else {
        setMsgColor("download successfuly", "success");
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });
}

/**
 * @description A function to get searched results
 *
 * @param {String} val value to start searching
 *
 * @param {String} href link to get basic info about the file
 */
async function getSearchResults(val) {
  // fetch and parse data
  const $ = await fetchAndParse(`${URL}/search/${val}`);

  // extract elements
  return Array.from($(".tags_box"), (element) => {
    return {
      href: $(element).find("a").attr("href").trim(),
      name: $(element).find("h1").text().trim(),
    };
  });
}

/**
 * @description A functio to get file main info
 *
 * @param {String} href link to get basic info about the file
 *
 * @returns Array of objects
 */
async function getPrimaryInfo(href) {
  // fetch and parse data
  const $ = await fetchAndParse(href);

  // extract elements
  return Array.from($(".direct_link_box"), (element) => {
    return {
      href: $(element).find("a").attr("href").trim(),
      name:
        $(element).find("h2").text().trim() ||
        startCase($(element).find(".sub_file_title").html().split("<i")[0]),
      size: $(element).find(".sub_file_title i").text().trim(),
    };
  });
}

/**
 * @description A function to get film/movi by quality
 *
 * @param {Array} list
 * @param {String} quality
 *
 * @returns Array of objects
 */
async function getMovieByQuality(list, quality) {
  // filter by result
  list = list.find((el) => el.name === quality);

  // fetch download URL
  const data = await fetchWithHeader(list.href);

  // update download url
  list.href = data.direct_link;

  // return filtred list
  return list;
}

/**
 * @description Function to filter and sort list based on choices list
 *
 * @param {Array[String]} choices
 * @param {Array[Object]} list
 *
 * @returns Array
 */
async function filterAndSortChoosedList(choices, list) {
  // filter list & exerpt the choosed
  list = list.filter((el) => choices.includes(el.name));

  // re-define download url
  for (const el of list) {
    const data = await fetchWithHeader(el.href);
    el.href = data.direct_link;
  }

  // sort the list
  return list.sort();
}

// re-define download url & sort it
async function redefineListDownloadLink(list) {
  // re-define download url
  for (const el of list) {
    const data = await fetchWithHeader(el.href);
    el.href = data.direct_link;
  }

  // sort the list
  return list.sort();
}

// exports
module.exports = {
  URL,
  downloadFunction,
  setMsgColor,
  fetchAndParse,
  fetchWithHeader,
  isFilm,
  getSearchResults,
  getPrimaryInfo,
  getMovieByQuality,
  filterAndSortChoosedList,
  redefineListDownloadLink,
};
