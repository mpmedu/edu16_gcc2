"use strict";

xx.module('meta', function (apod) {

  apod.extend({
    // "siteVars": {
    siteVars: {
      siteName: 'TestU',
      pageName: 'Home page'
    },
    topmenu: [
      { name: 'Open File', func: '__openFile' },          // 0
      { name: 'Categories', func: '__categories' },            // 1
      {
        name: 'Settings',   // 2
        submenu: [
          { name: 'Number of questions', func: '__numberOfQuestions' },
          { name: 'Time allowed', func: '__timeAllowed' },
          { name: 'Audio volume', func: '__audioVolume' }
        ]
      }
    ]
  });

  // apod.extend({
  //   // "siteVars": {
  //   siteVars: {
  //     "siteName": 'TestU',
  //     "pageName": 'Home page'
  //   },
  //   "topmenu": [
  //     { "name": 'Open File', "func": '__openFile' },          // 0
  //     { "name": 'Categories', "func": '__categories' },            // 1
  //     {
  //       "name": 'Settings',   // 2
  //       "submenu": [
  //         { "name": 'Number of questions', "func": '__numberOfQuestions' },
  //         { "name": 'Time allowed', "func": '__timeAllowed' },
  //         { "name": 'Audio volume', "func": '__audioVolume' }
  //       ]
  //     }
  //   ]
  // });

});


xx.module('menuFunctions', function (apod) {

  var edu;
  xx.imports.push(function () {
    edu = xx.edu;
  });

  apod.extend({
    callMenuFunc: callMenuFunc,
    // functions related to menu items
    __openFile: __openFile,
    __categories: __categories,
    __numberOfQuestions: __numberOfQuestions,
    __timeAllowed: __timeAllowed,
    __audioVolume: __audioVolume
  });

  function callMenuFunc(mob) {
    let mnu = (mob.submenuActive >= 0) ? mob.sm[mob.submenuActive] : mob.tm[mob.menuActive];
    mnu = this[mnu];  // turn mnu from a string into a function, this = xx.menuFunctions
    //test if the function exists and if so call it
    if (typeof mnu === 'function') {
      mnu();
    }
  }

  function __openFile() {
    edu.OpenFile();
  }

  function __categories() {
    edu.Categories();
  }

  function __numberOfQuestions() {
    edu.Numberofquestions();
  }

  function __timeAllowed() {
    edu.Timeallowed();
  }

  function __audioVolume() {
    edu.Audiovolume();
  }

});

