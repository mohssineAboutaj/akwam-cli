// Dependencies
const { prompt } = require("inquirer");
const { isEmpty, startCase } = require("lodash");
const {
  downloadFunction,
  setMsgColor,
  isFilm,
  getSearchResults,
  getPrimaryInfo,
  getMovieByQuality,
  filterAndSortChoosedList,
} = require("./helpers");

/**
 * @description CLI function contain everting you need to start this program in CLI
 */
module.exports = async () => {
  // await CLI();

  // start user inputs collecting
  const { title } = await prompt([
    {
      type: "input",
      name: "title",
      message: startCase("what are you looking for") + "?",
      validate: (val) => {
        if (isEmpty(val)) {
          return startCase("please type something to start searching");
        } else {
          return true;
        }
      },
      filter: (c) => {
        return c.trim();
      },
    },
  ]);

  // get result based on title
  const searchResults = await getSearchResults(title);

  // check if there is a result
  if (!isEmpty(searchResults)) {
    // choose from fetched list
    const { outputDir, exact } = await prompt([
      {
        type: "input",
        name: "outputDir",
        default: "./",
        message: startCase("where you want to save the download file") + "(s)?",
      },
      {
        type: "list",
        name: "exact",
        choices: searchResults,
        message: startCase("Choose one from this list"),
        filter: (c) => {
          return searchResults.find((el) => el.name === c);
        },
      },
    ]);

    // set info as list
    let list = await getPrimaryInfo(exact.href);

    // sort the list
    list = list.reverse();

    // check for episodes, files, video quality, ...
    if (!isEmpty(list)) {
      if (isFilm(exact.name)) {
        // ask user for video quality
        const { videoQuality } = await prompt([
          {
            type: "list",
            name: "videoQuality",
            choices: list,
            validate: (val) => {
              if (isEmpty(val)) {
                return startCase("please choose a one to start downloading");
              } else {
                return true;
              }
            },
            message: startCase("choose the movie quality"),
          },
        ]);

        // re-define list based on video quality
        list = await getMovieByQuality(list, videoQuality);

        // start downloading
        downloadFunction([list], exact, outputDir);
      } else {
        setMsgColor(`items count: ${list.length}`, "info");

        // sort the list
        list = list.sort();

        // ask user for to download all files or customize
        const { downloadType } = await prompt([
          {
            type: "list",
            name: "downloadType",
            message: startCase("choose download type") + "?",
            choices: [`All (${list.length})`, "Custom"], //["تحميل الكل", "تخصيص"],
          },
        ]);

        // check download type
        if (downloadType === "Custom") {
          // ask user for custom download
          const { files } = await prompt([
            {
              type: "checkbox",
              name: "files",
              message: startCase("choose to download") + "?",
              choices: list,
            },
          ]);

          // filter list & get the choosed
          list = await filterAndSortChoosedList(files, list);

          // start downloading
          downloadFunction(list, exact, outputDir);
        } else {
          setMsgColor("please wait until start downloading", "info");
          // re-define download url
          list = await redefineListDownloadLink(list);

          // start downloading
          downloadFunction(list, exact, outputDir);
        }
      }
    } else {
      setMsgColor("something went wrong, please try again", "error");
      console.log(exact.href);
    }
  } else {
    setMsgColor("no result found, please try again", "warn");
    await CLI();
  }

  // end CLI
};
