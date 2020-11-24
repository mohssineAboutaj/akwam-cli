const { cyan } = require("colors");
const { SingleBar, Presets } = require("cli-progress");
const downloadFileWithProgressbar = require("download-file-with-progressbar");
const { existsSync, mkdirSync } = require("fs");
const { setMsgColor } = require("./helpers");

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

// exports
module.exports = { downloadFunction };
