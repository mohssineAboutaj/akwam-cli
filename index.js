// Dependencies
const { prompt } = require("inquirer");
const { startCase, isEmpty } = require("lodash");
const puppeteer = require("puppeteer");

// some helpers & constants
const URL = "https://old.akwam.co";
const gotoGlobalOptions = {
  waitUntil: "networkidle2",
};

// start user inputs collecting
prompt({
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
})
  .then(async ({ title }) => {
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
                return element.querySelector("a").getAttribute("href").trim();
              },
            );
          });

          // check if there is a result
          if (await list.length) {
            // await list.forEach(async (link) => {
            let page = await browser.newPage();
            await page.goto(encodeURI(list[0]), gotoGlobalOptions);

            // extract elements
            // await page.evaluate(() => {
            //   console.log(
            //     document
            //       .getElementById("timerHolder")
            //       .getAttribute("href")
            //       .trim(),
            //   );
            // });
            console.log(await page.title());
            // });

            // close browser
            await browser.close();
          } else {
            console.log(startCase("something went wrong, please try again"));
          }

          // close browser
          await browser.close();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log(startCase("no result found, please try again"));
    }

    // close browser
    await browser.close();
  })
  .catch((err) => {
    console.log(err);
  });
