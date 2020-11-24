const { get } = require("axios");
const { load } = require("cheerio");
const { startCase } = require("lodash");
const { URL } = require("./helpers");

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
 * @description A function to get searched results
 *
 * @param {String} val value to start searching
 * @param {String} searchType change the serch url based on the type
 *
 * @module fetchAndParse
 *
 * @param {String} href link to get basic info about the file
 */
async function getSearchResults(val, searchType = "quick") {
  // set search URL
  let searchURL;
  if (searchType == "quick") {
    searchURL = `${URL}/search/${val}`;
  } else {
    searchURL = `${URL}/advanced-search/${val}`;
  }

  // fetch and parse data
  const $ = await fetchAndParse(searchURL);

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
 * @module fetchAndParse
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
 * @module fetchWithHeader
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
  fetchAndParse,
  fetchWithHeader,
  getMovieByQuality,
  getPrimaryInfo,
  getSearchResults,
  filterAndSortChoosedList,
  redefineListDownloadLink,
};
