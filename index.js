// Dependencies
const { prompt } = require("inquirer");
const { startCase, isEmpty } = require("lodash");
const puppeteer = require("puppeteer");
const { yellow } = require("colors");
const { downloadFunction, URL, gotoGlobalOptions } = require("./helpers");

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
          let list = await page.evaluate(async () => {
            return await Array.from(
              document.querySelectorAll(".sub_episode_links"),
              (element) => {
                return {
                  href: element.querySelector("a").getAttribute("href").trim(),
                  name: element.querySelector("h2").textContent.trim(),
                };
              },
            );
          });

          // sort
          list = await list.reverse();

          // check if there is a result
          if (await list.length) {
            if (exact.name.search(/فيلم|الفيلم|فلم/gi) >= 0) {
              prompt({
                type: "list",
                name: "eleQuality",
                choices: list,
                filter: (c) => {
                  return list.find((el) => el.name === c);
                },
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
              }).then(async ({ eleQuality }) => {
                list.length = await 0;
                await list.push(eleQuality);
                await downloadFunction(browser, list, exact, outputDir, true);
              });
            } else {
              console.log(yellow(startCase(`items count: ${list.length}`)));
              await downloadFunction(browser, list, exact, outputDir, false);
            }
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
