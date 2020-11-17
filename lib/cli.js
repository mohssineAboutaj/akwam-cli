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
  redefineListDownloadLink,
} = require("./helpers");

/**
 * @description CLI function contain everting you need to start this program in CLI
 */
function CLI() {
  // start CLI

  // start user inputs collecting
  prompt([
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
  ])
    .then(async ({ title }) => {
      // get result based on title
      const searchResults = await getSearchResults(title);

      // check if there is a result
      if (!isEmpty(searchResults)) {
        // choose from fetched list
        prompt([
          {
            type: "input",
            name: "outputDir",
            default: "./",
            message:
              startCase("where you want to save the download file") + "(s)?",
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
        ])
          .then(async ({ outputDir, exact }) => {
            // set info as list
            let list = await getPrimaryInfo(exact.href);

            // sort the list
            list = list.reverse();

            // check for episodes, files, video quality, ...
            if (!isEmpty(list)) {
              if (isFilm(exact.name)) {
                // ask user for video quality
                prompt([
                  {
                    type: "list",
                    name: "videoQuality",
                    choices: list,
                    validate: (val) => {
                      if (isEmpty(val)) {
                        return startCase(
                          "please choose a one to start downloading",
                        );
                      } else {
                        return true;
                      }
                    },
                    message: startCase("choose the movie quality"),
                  },
                ])
                  .then(async ({ videoQuality }) => {
                    // re-define list based on video quality
                    list = await getMovieByQuality(list, videoQuality);

                    // start downloading
                    downloadFunction([list], exact, outputDir);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } else {
                setMsgColor(`items count: ${list.length}`, "info");

                // sort the list
                list = list.sort();

                // ask user for to download all files or customize
                prompt([
                  {
                    type: "list",
                    name: "downloadType",
                    message: startCase("choose download type") + "?",
                    choices: [`All (${list.length})`, "Custom"], //["تحميل الكل", "تخصيص"],
                  },
                ])
                  .then(async ({ downloadType }) => {
                    // check download type
                    if (downloadType === "Custom") {
                      // ask user for custom download
                      prompt([
                        {
                          type: "checkbox",
                          name: "files",
                          message: startCase("choose to download") + "?",
                          choices: list,
                        },
                      ])
                        .then(async ({ files }) => {
                          // filter list & get the choosed
                          list = await filterAndSortChoosedList(files, list);

                          // start downloading
                          downloadFunction(list, exact, outputDir);
                        })
                        .catch((err) => {
                          console.log(err);
                        });
                    } else {
                      setMsgColor(
                        "please wait until start downloading",
                        "info",
                      );
                      // re-define download url
                      list = await redefineListDownloadLink(list);

                      // start downloading
                      downloadFunction(list, exact, outputDir);
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            } else {
              setMsgColor("something went wrong, please try again", "error");
              console.log(exact.href);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        setMsgColor("no result found, please try again", "warn");
        CLI();
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // end CLI
}

module.exports = CLI;
