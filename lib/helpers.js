(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  const { yellow, red, green, brightRed } = require("colors");
  const { startCase } = require("lodash");

  // main url
  const URL = "https://old.akwam.co";

  /**
   * @description A custom function to set console message with colors
   *
   * @package Color
   *
   * @param {String} msg Message to show
   * @param {String} color Message type ['danger','success','info','error','done']
   */
  function setMsgColor(msg, color = null) {
    if (["success", "done"].includes(color)) {
      console.log(green("[✔] " + startCase(msg)));
    } else if (["danger", "error"].includes(color)) {
      console.log(red("[✖] " + startCase(msg)));
    } else if (["warning", "warn"].includes(color)) {
      console.log(brightRed("[✖] " + startCase(msg)));
    } else if (["info"].includes(color)) {
      console.log(yellow("[ℹ] " + startCase(msg)));
    } else {
      console.log("[#] " + startCase(msg));
    }
  }

  /**
   * @description Function to check if the passed value contain film/movie word
   *
   * @param {String} val value to check
   *
   * @returns Boolean
   */
  function isFilm(val) {
    return val.search(/فيلم|الفيلم|فلم/gi) >= 0;
  }

  // exports
  module.exports = {
    URL,
    setMsgColor,
    isFilm,
  };

})));
