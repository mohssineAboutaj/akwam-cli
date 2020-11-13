const { SingleBar, Presets } = require("cli-progress");
const { cyan, green } = require("colors");
const downloadFileWithProgressbar = require("download-file-with-progressbar");
const { startCase } = require("lodash");
const { existsSync, mkdirSync } = require("fs");

// goto() global configurations/options
const gotoGlobalOptions = {
  waitUntil: "networkidle2",
};

// main url
const URL = "https://old.akwam.co";

/**
 * @description the download function that show user a list of choices to customize his downloads
 *
 * @param {Puppeteer.Launch} browser
 * @param {Array} list
 * @param {Object} parent
 * @param {String} outputDir
 * @param {Boolean} isFilm
 * @param {Number} index
 */
async function downloadFunction(
  browser,
  list,
  parent,
  outputDir = "./",
  isFilm = false,
  index = 0,
) {
  // start download
  if (index < list.length) {
    let link = list[index];
    let page = await browser.newPage();
    await page.goto(encodeURI(link.href), gotoGlobalOptions);

    // extract elements
    await page.$eval("body", (elem) => {
      // to skip ads
      setTimeout(() => {
        console.log(
          elem.querySelector("#timerHolder a").getAttribute("href") +
            " " +
            elem
              .querySelector(".sub_title.sub_download_title")
              .querySelector("p b")
              .textContent.trim(),
        );
      }, 5000);
    });
    await page.on("console", async function (messages) {
      // extract fileURL & fileSIZE from opened browser console
      const out = await messages._text.trim().split(" ");

      // file url & size
      const fileURL = await out[0];
      const fileSIZE = await out[1];

      console.log(parent.name + " | " + link.name || parent.name);
      // new instance from cli-progress
      const downloadProgress = await new SingleBar(
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
      await downloadProgress.start(100, 0);

      // check outputDir exists
      if (outputDir !== "./" && !existsSync(outputDir)) {
        mkdirSync(outputDir);
      }

      // download file
      await downloadFileWithProgressbar(fileURL, {
        dir: outputDir,
        onDone: async function () {
          await downloadProgress.stop();
          if (isFilm) {
            await browser.close();
          } else {
            await downloadFunction(index + 1);
          }
        },
        onError: (err) => {
          console.log("error", err);
        },
        onProgress: async function (curr, total) {
          await downloadProgress.update((curr / total) * 100);
        },
      });
    });
  } else {
    await console.log(green(startCase("download finish")));
    await browser.close();
  }
}

// exports
module.exports = {
  gotoGlobalOptions,
  URL,
  downloadFunction,
};
