// props & methods to test
const { setMsgColor, isFilm, URL, fetchAndParse } = require("../lib/helpers");

// test helpers
const { isString } = require("lodash");

// describe block
describe("Basic functions", () => {
  test("should URL is string", () => {
    expect(isString(URL)).toBeTruthy();
  });

  test("should setMsgColor", () => {
    console.log = jest.fn();

    setMsgColor("hello world");

    expect(console.log.mock.calls[0][0]).toBe("[#] Hello World");
  });

  test("should isFilm return Bool", () => {
    expect(isFilm("فيلم اكشن")).toBeTruthy();
  });

  test("should fetchAndParse returm HTML content", async () => {
    const s = "film";

    const $ = await fetchAndParse(`${URL}/search/${s}`);
    expect($("title").text()).toBe(`${s} - اكوام`);
  });
});
