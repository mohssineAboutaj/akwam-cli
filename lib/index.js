// Dependencies
const { prompt } = require("inquirer");
const { startCase, isEmpty } = require("lodash");
const {
  downloadFunction,
  URL,
  setMsgColor,
  fetchAndParse,
  fetchWithHeader,
} = require("./helpers");

// exports
exports.main = async () => {
  // start user inputs collecting
  const { title, outputDir } = await prompt([
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
    {
      type: "input",
      name: "outputDir",
      default: "./",
      message: startCase("where you want to save the download file") + "?",
    },
  ]);

  // set search value
  const searchURL = `${URL}/search/${title}`;

  let $ = await fetchAndParse(searchURL);

  // extract elements
  const choices = Array.from($(".tags_box"), (element) => {
    return {
      href: $(element).find("a").attr("href").trim(),
      name: $(element).find("h1").text().trim(),
    };
  });

  if (!isEmpty(choices)) {
    // choose from fetched list
    const { exact } = await prompt([
      {
        type: "list",
        name: "exact",
        choices,
        message: startCase("Choose one from this list"),
        filter: (c) => {
          return choices.find((el) => el.name === c);
        },
      },
    ]);

    let $ = await fetchAndParse(exact.href);

    // extract elements
    let list = Array.from($(".direct_link_box"), (element) => {
      return {
        href: $(element).find("a").attr("href").trim(),
        name:
          $(element).find("h2").text().trim() ||
          startCase($(element).find(".sub_file_title").html().split("<i")[0]),
        size: $(element).find(".sub_file_title i").text().trim(),
      };
    });

    // sort the list
    list = list.reverse();

    // check for episodes, files, video quality, ...
    if (!isEmpty(list)) {
      if (exact.name.search(/فيلم|الفيلم|فلم/gi) >= 0) {
        // ask user for video quality
        const { videoQuality } = await prompt([
          {
            type: "list",
            name: "videoQuality",
            choices: list,
            filter: (c) => {
              return list.find((el) => el.name === c);
            },
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

        const data = await fetchWithHeader(list[0].href);

        // update list & set download url
        videoQuality.href = data.direct_link;
        list = [videoQuality];

        // start downloading
        downloadFunction(list, exact, outputDir, true);
      } else {
        setMsgColor(`items count: ${list.length}`, "info");
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

          // filter list & exerpt the choosed
          list = list.filter((el) => files.includes(el.name));

          // re-define download url
          for (const el of list) {
            const data = await fetchWithHeader(el.href);
            el.href = data.direct_link;
          }

          // start downloading
          downloadFunction(list, exact, outputDir);
        } else {
          // start downloading
          downloadFunction(list, exact, outputDir);
        }
      }
    } else {
      setMsgColor("something went wrong, please try again", "error");
      console.log(exact.href);
    }
  } else {
    setMsgColor("no result found, please try again", "danger");
  }

  // end main
};