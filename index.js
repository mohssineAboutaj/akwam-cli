// Dependencies
const { prompt } = require("inquirer");
const { startCase, isEmpty, toFixed } = require("lodash");
const puppeteer = require("puppeteer");
const dl = require("download-file-with-progressbar");
const { SingleBar, Presets } = require("cli-progress");
const { cyan, green, grey } = require("colors");
const { existsSync, mkdirSync } = require("fs");

// some helpers & constants
const URL = "https://old.akwam.co";
const gotoGlobalOptions = {
  waitUntil: "networkidle2",
};

// start user inputs collecting
prompt([
  {
    type: "input",
    name: "title",
    message: startCase("what do you search for") + "?",
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
])
  .then(async ({ title, outputDir }) => {
    const searchURL = `${URL}/search/${title}`;

    const browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.goto(searchURL, gotoGlobalOptions);

    // extract elements
    const choices = await page.evaluate(async () => {
      return await Array.from(
        document.querySelectorAll(".tags_box"),
        (element) => {
          return {
            href: element.querySelector("a").getAttribute("href").trim(),
            name: element.querySelector("h1").textContent.trim(),
          };
        },
      );
    });

    // check if the searched value exist
    if (await choices.length) {
      // choose from fetched list
      await prompt({
        type: "list",
        name: "exact",
        choices,
        message: startCase("Choose one from this list"),
        filter: (c) => {
          return choices.find((el) => el.name === c);
        },
      })
        .then(async ({ exact }) => {
          let page = await browser.newPage();
          await page.goto(encodeURI(exact.href), gotoGlobalOptions);

          // extract elements
          const list = await page.evaluate(async () => {
            return await Array.from(
              document.querySelectorAll(".sub_episode_links"),
              (element) => {
                return {
                  href: element.querySelector("a").getAttribute("href").trim(),
                  label: element.querySelector("h2").textContent.trim(),
                };
              },
            );
          });

          // check if there is a result
          if (await list.length) {
            // for await (let link of list) {
            let link = list[0];
            let page = await browser.newPage();
            await page.goto(encodeURI(link.href), gotoGlobalOptions);

            // extract elements
            await page.$eval("#timerHolder", (elem) => {
              setTimeout(() => {
                console.log(elem.querySelector("a").getAttribute("href"));
              }, 5000);
            });
            await page.on("console", async (messages) => {
              // file url
              const fileURL = await messages._text;

              console.log(exact.name + " | " + link.label || exact.name);
              // new instance from cli-progress
              const downloadProgress = await new SingleBar(
                {
                  format: `${startCase("progress")} |${cyan(
                    "{bar}",
                  )}| {percentage}%`,
                  // format: (
                  //   { barCompleteString, barsize },
                  //   { progress, value, total },
                  // ) => {
                  //   // bar grows dynamically by current progress - no whitespaces are added
                  //   const bar = barCompleteString.substr(
                  //     0,
                  //     Math.round(progress * barsize),
                  //   );
                  //   const task = exact.name + " | " + link.label + "\n\r" || "";

                  //   value = value.toFixed(2);

                  //   // end value reached ?
                  //   // change color to green when finished
                  //   if (value >= total) {
                  //     return `# ${grey(task)}   ${green(
                  //       // value + "/" + total,
                  //       value + "%",
                  //     )}  |${bar}`;
                  //   } else {
                  //     return `# ${task}   ${cyan(
                  //       // value + "/" + total,
                  //       value + "%",
                  //     )}  |${bar}`;
                  //   }
                  // },
                  barCompleteChar: "\u2588",
                  barIncompleteChar: "\u2591",
                  hideCursor: true,
                },
                Presets.shades_classic,
              );

              // set start & end value for the progress
              await downloadProgress.start(100, 0);

              // check outputDir exists
              if (outputDir != "./" && !existsSync(outputDir)) {
                await mkdirSync(outputDir);
              }

              // download file
              await dl(fileURL, {
                dir: outputDir || "./",
                onDone: async () => {
                  await downloadProgress.stop();
                  await browser.close();
                },
                onError: (err) => {
                  console.log("error", err);
                },
                onProgress: async (curr, total) => {
                  await downloadProgress.update((curr / total) * 100);
                },
              });
            });
            // }
          } else {
            console.log(startCase("something went wrong, please try again"));
            await browser.close();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log(startCase("no result found, please try again"));
      await browser.close();
    }
  })
  .catch((err) => {
    console.log(err);
  });
