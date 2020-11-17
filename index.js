#!/usr/bin/env node

// to export
const {
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
} = require("./lib/helpers");

// import CLI
const CLI = require("./lib/cli");

// run CLI
(async () => {
  await CLI();
})();

// exports for external use
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
