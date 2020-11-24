/**
 * @name index
 *
 * @description just an exporter to use these modules in external files/projects
 *
 */

// import/require
const { URL, isFilm } = require("./lib/helpers");
const {
  fetchAndParse,
  fetchWithHeader,
  getSearchResults,
  getPrimaryInfo,
  getMovieByQuality,
  filterAndSortChoosedList,
  redefineListDownloadLink,
} = require("./lib/fetch");

// exportuse
module.exports = {
  URL,
  fetchAndParse,
  fetchWithHeader,
  isFilm,
  getSearchResults,
  getPrimaryInfo,
  getMovieByQuality,
  filterAndSortChoosedList,
  redefineListDownloadLink,
};
