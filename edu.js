"use strict";

xx.module("edu", function (apod) {
  let vars = xx.vars;
  let q = xx.q; // q must be loaded before edu else this won't work
  let common, meta, myExpl;
  xx.imports.push(function () {
    common = xx.common;
    meta = xx.meta;
    myExpl = xx.myExpl;
  });

  const exports = {
    checkopenfile: checkopenfile,
    OpenFile: OpenFile,
    Categories: Categories,
    Numberofquestions: Numberofquestions,
    Timeallowed: Timeallowed,
    Audiovolume: Audiovolume,
    // Slider1: Slider1,

  };

  apod.extend(exports);

  //////////////////////////////////////////
  function VARIABLES() { }
  //////////////////////////////////////////

  // see init() for how debugon is set, ie true for localhost otherwise it remains false

  let canDebug = false;  //when on remote click

  // let relPath;   // relative path of application
  // let docPath;

  let lastBw = 0; // saving the last width of body


  // saves widths of menu items so that they can be properly placed when window is resized
  let topSiteNamew;
  let topPageNamew;
  let topscorew;
  let topmenuw;
  let topgobuttonw;

  const topPageNamew_min = 130;

  let th;  // topdiv height
  let bh;  // bottomdiv height
  let tbh; // topdiv + bottomdiv height

  let tickpos;

  let sd; // audio slider at bottom right for all sounds
  let sd1; // audio slider for correct/wrong sounds
  let sd2; // audio slider for background sounds
  let sd3; // audio slider for question/options sounds
  // let correct_beep = document.getElementById('correct_clip');
  // let wrong_beep = document.getElementById('wrong_clip');
  const correct_beep = q._("correct_clip");
  const wrong_beep = q._("wrong_clip");

  //////////////////////////////////////////
  function GENERAL() { }
  //////////////////////////////////////////

  window.onload = readyFunction;
  function readyFunction() {
    // alert("document is ready");
    xx.fixImports(); // this must always be first
    common.makemenu();
    myExpl.init(xx.edu, 1);


    init().then(() => {
      // console.log("at 1");
      // console.log('done after init');
      tm_disable();
      showDialog("startupbox");
      q.qs("body").removeChild(q._("startupDiv"));
      // for testing the startupDiv
      // setTimeout(() => {
      //   console.log('done after 4s in init');
      // showDialog("startupbox");
      // q.qs("body").removeChild(q._("startupDiv"));
      //-------- the following is for testing showMessage()
      // common.showMessage({
      //   "boxType": 0, "bc": 'w', "msg": 'just a message',
      //   "callback1" : () => {
      //     console.log('OK from callback1')
      //   },
      //   'callback2" : () => {
      //     console.log('OK from callback2')
      //   },
      // });
      // common.showMessage({
      //   "boxType": 1,
      //   "callback1" : () => {
      //     console.log('YesNo from callback1')
      //   },
      //   "callback2" : () => {
      //     console.log('YesNo from callback2')
      //   },
      // });
      // }, 4000);


    });

    // This is necessary to transfer variables/functions from edu to common
  }

  ////////////////////////////////////////////////////////////////////
  function INITIALIZE() { }
  ////////////////////////////////////////////////////////////////////

  function init() {
    return new Promise((resolve, reject) => {
      Promise.all([myExpl.fetchTheFolders(), fixCompid()])
        .then((result) => {
          // console.log(result);
          resolve();
        });
      initTopVariables();

      // const needed_variables = {
      //   "th": th,
      //   "bh": bh,
      //   "tbh": tbh,
      //   "putTopdiv": putTopdiv
      // }
      // common.transfer_needed_variables(needed_variables);

// common.transfer_ob(
//       {
//         "th": th,
//         // "bh": bh,
//         "tbh": tbh,
//         "putTopdiv": putTopdiv
//       }
//       );

      initAudio();
      // get the tick position for options numbers
      tickpos = Math.round((Math.round(q._("opt_num7").offsetHeight) - 12) / 2);
      const oh = q._("opt_get_height");
      oh.classList.remove("opt_class");
      oh.classList.add("nodisplay");
      // get information to display on the Home page
      getInfo();
      tm_enable();
    });
  }

  function fixCompid() {
    return new Promise((resolve, reject) => {
      if (typeof localStorage === "undefined") {
        // localStorage is not supported, so use cookies
        common.doFetch("ft_temp.php", "setCompID", null, {})
          .then((json) => {
            if (json.value === "success") {
              xx.vars.compid = json.compID;
            } else {
              if (json.errmsg != undefined) {
                if (vars.debugon) alert(json.errmsg);
              } else {
                if (vars.debugon) alert("There was a problem with Ajax call");
              }
            }
            resolve();
          })
          .catch((err) => {
            alert(`error in fixCompid, no local storage = ${err}`);
          });
      } else {
        // localStorage is supported
        var compid = localStorage.getItem("compID");
        if (compid) {
          compid = parseInt(compid, 10);
        } else {
          compid = common.random(68000000, 675999000);
          localStorage.setItem("compID", compid);
        }
        // alert(`compid = ${compid}`);
        xx.vars.compid = compid;
        // alert(`xx.vars.compid = ${xx.vars.compid}`);
        common.doFetch("ft_temp.php", "setSessionCompID", null, { "compID": xx.vars.compid })
          .then((json) => {
            if (json.value !== "success") {
              if (json.errmsg != undefined) {
                if (vars.debugon) alert(json.errmsg);
              } else {
                if (vars.debugon) alert("There was a problem with Ajax call");
              }
            }
            resolve();
          })
          .catch((err) => {
            alert(`error in fixCompid, localstorage = ${err}`);
          });
      }
    });
  }

  function initTopVariables() {
    const siteName = q._("siteName");
    const pageName = q._("pageName");
    siteName.textContent = meta.siteVars.siteName;
    pageName.textContent = meta.siteVars.pageName;
    const el = q._("bodymask");
    el.style.width = screen.width + "px";
    el.style.height = screen.height + "px";
    // inits variables topmenuw, topPageNamew and topSiteNamew
    const topdiv = q._("topdiv");
    topSiteNamew = topdiv.querySelector("#siteName").offsetWidth;
    topPageNamew = topdiv.querySelector("#pageName").offsetWidth;
    if (topPageNamew < topPageNamew_min) topPageNamew = topPageNamew_min;
    // width of top menu items and the filename box
    topscorew = q.getOffsetWidth(q._("scorecontainer"));
    let theMenu = topdiv.querySelector("#theMenu");
    topmenuw = theMenu.offsetWidth;
    const topmenumask = q._("topmenumask");
    topmenumask.style.width = topmenuw + "px";
    topmenumask.style.height = theMenu.offsetHeight + "px";
    const toprightmenumask = q._("toprightmenumask");
    toprightmenumask.style.width =
      topmenuw - theMenu.firstChild.offsetWidth + "px";
    toprightmenumask.style.height = theMenu.offsetHeight + "px";
    // width of game button and clock
    let gobutt = q._("gobutton");
    topgobuttonw = gobutt.offsetWidth;
    const gamecontainermask = q._("gamecontainermask");
    gamecontainermask.style.width = topgobuttonw + "px";
    gamecontainermask.style.height = gobutt.offsetHeight + "px";
    // height of topdiv + bottomdiv
    th = q._("topdiv").offsetHeight;
    bh = q._("bottomdiv").offsetHeight;
    tbh = th + bh;
    // also init the top of the wrappermask and dialogmask to be the top of the wrapper
    q._("wrappermask").style.top = th + "px";
    q._("wrappermask").style.bottom = bh + "px";
  }

  function initAudio() {
    sd = initAud("cont", "ball", 0.2); // make overall starting volume be 20%
    sd1 = initAud("cont_v1", "ball_v1", default_volumes.r1);
    sd2 = initAud("cont_v2", "ball_v2", default_volumes.r2);
    sd3 = initAud("cont_v3", "ball_v3", default_volumes.r3);

    function initAud(c, b, r) {
      var slider = new common.Slider1(c, b, r);
      // var slider = new Slider1(c, b, r);
      slider.initBall();
      if (c === "cont") {
        q._("cont").addEventListener("click", (e) => {
          slider.moveBall(e);
          setVolume();
        });
      } else {
        q._(c).addEventListener("click", (e) => {
          slider.moveBall(e);
        });
      }
      return slider;
    }
  }

  function getInfo() {
    // called from init() and clicking on gobutton when End is showing
    // it gets the information that is shown at startup
    const wrapper = q._("wrapper");
    wrapper.style.backgroundImage = "none";
    wrapper.innerHTML = common.getHtml("tem_info");
    checkHeight();
    checkWidth();
  }

  q.delegate("wrapper", "click", ".info_class", function clickOnInfoClassInWrapper(e) {
    // this is executed when you click on any item of info which is displayed in the wrapper
    this.nextElementSibling.nextElementSibling.classList.toggle("nodisplay");
    checkHeight();
    checkWidth();
  });

  ////////////////////////////////////////////////////////////////////
  function TOP_DIV() { }
  ////////////////////////////////////////////////////////////////////

  function putTopdiv(bw) {
    //---------- This puts the elements in the Top Div ------------
    // put siteName, ie TestU
    let v = Math.round(0.05 * bw);
    q.qs("#topdiv #siteName").style.left = v - 2 + "px";
    // put subject or pageName
    v = v + topSiteNamew;
    q.qs("#topdiv p#pageName").style.left = v + "px";
    v = v + topPageNamew;
    let v1 = 0.92 * (bw - topmenuw - topgobuttonw);
    let v2 = (v + v1 - topscorew) / 2 - 4;
    if (v2 > v1 - topscorew - 5) {
      // if pageName is too wide restrict its width
      v2 = v1 - topscorew - 5;
      q._("pageName").style.width = v2 - (v - topPageNamew) - 10 + "px";
    } else {
      q._("pageName").style.width = "auto";
    }
    q._("scorecontainer").style.left = v2 + "px";
    q._("topmenucontainer").style.left = v1 + "px";
    q._("gamecontainer").style.left = v1 + topmenuw + 0.025 * bw + "px";
  }

  // the next 2 functions enable/disable the top menu
  function tm_disable() {
    q._("topmenumask").classList.remove("nodisplay");
  }
  function tm_enable() {
    q._("topmenumask").classList.add("nodisplay");
  }

  // the next function enables the game button - it needs only to be done once, ie for the first opened file
  function gc_enable() {
    // turns game button mask off
    q._("gamecontainermask").classList.add("nodisplay");
  }

  ////////////////////////////////////////////////////////////////////
  function CHECKING_KEY_PRESSED() { }
  ////////////////////////////////////////////////////////////////////

  document.onkeydown = testKeyCode;
// if (vars.debugon) alert('debug is on');
  function testKeyCode(e) {
    //if (nload > 0) return;
    if (common.isLoadingOn() > 0) return;
    let keycode;
    if (window.event) {
      keycode = window.event.keyCode;
    } else if (e) {
      keycode = e.which;
    }
    //alert('keycode=' + keycode);
    e = e || window.event;
    if (e.altKey) {
      let temp = keycode;
      if (keycode === 83) {
        // Alt-S was pressed, toggles vars.debugon
        if (vars.isLocal) {
          // if (canDebug) {
          // vars.debugon = !vars.debugon;
          // }
          vars.debugon = !vars.debugon;
        } else if (vars.debugon === true) {
          vars.debugon = false;
        } else if (canDebug && vars.debugon === false) {
          vars.debugon = true;
        }
        if (vars.debugon) {
          q._("debug").classList.remove('nodisplay');
        } else {
          q._("debug").classList.add('nodisplay');
        }
      } else if (keycode === 76) {
        // Alt-L was pressed
        if (vars.debugon && document.getElementById("fn_output").value === "") {
          //update_finfo();
          //showfileslist();
        } else if (document.getElementById("fn_output").value !== "") {
          // a file is open so the owner can login
          if (!q._("dialogmask").classList.contains("nodisplay")) return;
          if (gamestate === "New game") showCreatorLoginBox();
        }
      } else if (keycode === 88) {
        // Alt-X was pressed, for showing dimensions
        // alert("testkeycode1 \n" + common.getDimensions());
      } else if (keycode === 90) {
        // Alt-Z was pressed, for showing the checkList
        // if (!q._("dialogmask").classList.contains("nodisplay")) return;
        // if (gamestate === "New game") showChecklist();
      }
    }
  }

  q._("pageName").addEventListener("click", function clickOnSubject() {
    canDebug = true;
    setTimeout("canDebug = false", 5000);
  });

  ///////////////////////////////////
  function START_UP_BOX() { }
  ///////////////////////////////////

  q.delegate("startupbox", "click", "button", function clickOnStartupboxButton() {
    if (this.innerHTML === "Accept") {
      hideDialog("startupbox");
      tm_enable(); // enable the top menu
    } else {
      location.replace("https://www.google.com");
    }
  }
  );

  ////////////////////////////////////////////////////////////////////
  function UNLOCK_BOX() { }
  ////////////////////////////////////////////////////////////////////
  // The unlockbox is shown when opening a file and the file is found to be a restricted-access file

  q.delegate("unlockbox", "click", "button", function clickOnUnlockboxButton() {
    const butt = this.textContent;
    if (butt === "Next") {
      let inps = q.qa("#unlockbox input");
      let ob = { "cid": inps[0].value, "key": inps[2].value };
      if (correctKey(ob)) {
        var doCookie = 0;
        if (typeof localStorage === "undefined") {
          // localStorage is not supported, use cookies
          doCookie = 1;
        } else {
          // set localStorage here, doCookie is already 0
          localStorage.setItem(fname1, xx.vars.compid);
        }
        // the correct key was entered to unlock the qna file, so set a cookie
        common.doFetch("ft_temp.php", "setFree", null, { "doCookie": doCookie })
          .then((json) => {
            isRestricted = false;
            common.showMessage({
              "msg": "Correct key",
              "bc": "g",
              "callback1": function () {
                hideDialog("unlockbox");
              },
            });
          })
          .catch((err) => {
            alert(`error from setFree = ${err}`);
          });

      } else {
        // wrong key
        common.showMessage({ "msg": "Wrong key", "bc": "b" });
      }
    } else {
      // must be Exit
      hideDialog("unlockbox");
    }
  });

  q.delegate(document.body, "keypress", "#unlockbox", function (e) {
    // this calls the click event handler above if Enter was pressed
    if (common.enterKeyOnInput(e, this)) {
      // qs, ie querySelector, returns the first element so that is the Next button
      const event = document.createEvent("HTMLEvents");
      event.initEvent("click", true, false);
      q.qs("#unlockbox button").dispatchEvent(event);
    }
  });

  function correctKey(ob) {
    // first check the key that was entered
    let s2 = ob.key;
    // remove seperators from the input key
    s2 = s2.replace(/[- _./\|,:\\]/g, "");
    if (s2.length != 12) {
      return false;
    }
    // now process the computer id and check it against the key that was entered
    let s1 = ob.cid;
    s1 = s1.replace(/-/g, "");
    s1 = getRegKey(s1);
    if (s1 != s2) {
      return false;
    }
    // they are the same so return True, because the correct key was entered
    return true;
  }

  ////////////////////////////////////////////////////////////////////
  function CREATOR_LOGIN() { }
  ////////////////////////////////////////////////////////////////////

  let loginTries;

  function showCreatorLoginBox() {
    if (++loginTries > 5) return;
    q._("clb1_input").value = q._("fn_output").value; // the filename, eg science.qna
    q._("clb2_input").value = ""; // textbox for the password to be entered by the owner of the file
    // show the box
    showDialog("creatorloginbox");
    // set focus on the 2nd input field, textbox of the creator's password
    q._("clb2_input").focus();
  }

  q.delegate("creatorloginbox", "click", "button", function clickOnCreatorloginboxButton(e) {
    // see what button was clicked
    const butt = this.textContent;
    if (butt === "Next") {
      let inps = q.qa("#creatorloginbox input");
      let ob = { "fName": inps[0].value, "pw": inps[1].value };
      if (pwStringCheck(ob)) {
        hideDialog("creatorloginbox");
        showGetQnaKeyBox();
      } else {
        common.showMessage({ "msg": "Wrong password" });
        if (++loginTries > 5) {
          hideDialog("creatorloginbox");
        }
      }
    } else {
      hideDialog("creatorloginbox");
    }
  });

  q.delegate(document.body, "keypress", "#creatorloginbox", function (e) {
    // this calls the click event handler above if Enter was pressed
    if (common.enterKeyOnInput(e, this)) {
      // qs, ie querySelector, returns the first element so that is the Next button
      const event = document.createEvent("HTMLEvents");
      event.initEvent("click", true, false);
      q.qs("#creatorloginbox button").dispatchEvent(event);
    }
  });

  function pwStringCheck(ob) {
    let ss, L;
    let preS, prePW;
    //Begin
    // if the string gotten for the file is "" then return false
    if (pwString === "") {
      return false;
    }
    if (pwString.length === 0) {
      return false;
    }
    // this call is common to writePWString() in editQnA and pwStringCheck() in editQnA and edu
    ss = preparePWString(ob.pw, ob.fName.toLowerCase());
    L = ss.length;
    // calculate how many letters before the start of encrypted string, ie prePW and get the string preS
    prePW = Math.trunc((100 - L) / 7);
    if (prePW < 2) {
      prePW = 2;
    }
    preS = pwString.substr(0, prePW);
    // calculate the new pwString to check against the existing one
    ss = newPWString(preS, ss, L);
    if (ss != pwString) {
      return false;
    }
    // they are the same so return True
    return true;
  }

  function preparePWString(pw, fName) {
    let s = new Array();
    // pw must be as least 3 characters long
    let L = pw.length;
    if (L < 3) {
      s[1] = pw + "XXX".substr(0, 3 - L);
    } else {
      s[1] = pw;
    }
    // if a vna file change it to a qna file
    let p = fName.lastIndexOf(".");
    if (fName.substr(p) === ".vna") {
      s[2] = fName.substr(p) + "qna";
    } else {
      s[2] = fName;
    }
    // merge pw and fName
    return mix(s);
  }

  function newPWString(preS, s, L) {
    let i, x, d, f;
    let ss = preS;
    for (i = 0; i < L; i++) {
      d = ss.charCodeAt(i) - 97; // so that d can never be 0
      if (d <= 0) return "";
      x = s.charCodeAt(i);
      while (true) {
        f = x % d;
        ss = ss + String.fromCharCode(f + 100);
        x = Math.trunc(x / d);
        if (f < 4) {
          d = f + 5;
          if (f < 2) {
            if (L > 25) break;
          } else {
            if (L > 35) break;
          }
        } else {
          d = f;
        }
        if (x === 0) break;
      }
    }
    return ss;
  }

  ////////////////////////////////////////////////////////////////////
  function GET_QNA_KEY_BOX() { }
  ////////////////////////////////////////////////////////////////////

  function showGetQnaKeyBox() {
    q._("gqkb2_input").value = q._("fn_output").value;
    q._("gqkb1_input").value = ""; // textbox for the string to be input, eg 637083_BN
    q._("gqkb3_input").value = ""; // textbox for the unlock key to be output, eg 2804-6317-0834
    // show the getqnakeybox
    showDialog("getqnakeybox");
    // set focus on the 1st input field, textbox for input
    q._("gqkb1_input").focus();
  }


  q.delegate("getqnakeybox", "click", "button", function clickOnGetqnakeyboxButton(e) {
    const butt = this.textContent;
    if (butt === "Calculate key") {
      q.qs("#gqkb3_input").value = ""; // set textbox for the unlock key to ''
      const inps = q.qa("#getqnakeybox input");
      let ob = { "cid": inps[0].value };
      if (calculateKey(ob)) {
        inps[2].value = ob.s2;
      } else {
        common.showMessage({ "msg": "Bad computer ID", "bc": "b" });
      }
    } else {    // Exit was clicked
      hideDialog("getqnakeybox");
    }
  }
  );

  function calculateKey(ob) {
    // This calculates the key to unlock the qna file
    // check the key that was entered
    let s1 = ob.cid;
    let pattern = /[- _./\|,:\\]/g;
    s1 = s1.replace(pattern, "");
    if (s1.length != 8) {
      return false;
    }
    s1 = s1.toUpperCase();
    s1 = getRegKey(s1);
    if (s1 == null) {
      return false;
    }
    ob.s2 = s1.substr(0, 4) + "-" + s1.substr(4, 4) + "-" + s1.substr(8);
    return true;
  }

  function getRegKey(s1) {
    // returns a 12 digit string, 8 digits made from the input comp id, s1, and 4 digits from
    // codeBytes(1 and 2) from the qna file
    // make 8 digits from the compID adjusted with codeBytes(1 and 2)
    let v = parseInt(s1.substr(0, 6), 10);
    if (v < 100000) {
      return null;
    }
    s1 = s1.substr(s1.length - 2);
    let n;
    for (let i = 1; i >= 0; i--) {
      v = v * 26;
      n = s1.charCodeAt(i) - 65;
      if (n < 0 || n > 25) {
        return null;
      }
      v = v + n;
    }
    // v is now the original comp id number with a value from 68 000 000 to 675 999 000
    // adjust v using codeBytes(1 and 2)
    let v1 = codeBytes[1];
    let v2 = codeBytes[2];
    if (v1 > v2) {
      v = Math.trunc(v / v1) * v2;
    } else {
      v = Math.trunc(v / v2) * v1;
    }
    // reduce v so that it has 8 digits
    while (v > 99999999) {
      // 8 digits
      v = Math.trunc(v / 7);
    }
    let ss = new Array();
    ss[1] = String(v);
    // make 4 digits from codeBytes(1 and 2) which are from the file
    v = v1 * v2;
    while (v > 9999) {
      // 4 digits
      v = Math.trunc(v / 6);
    }
    ss[2] = String(v);
    // now get one string from the 8 digit and 4 digit strings = 12 digit string
    return mix(ss);
  }

  function mix(s) {
    let ss = "";
    let L = [];
    let p, k;
    let i, j, r;
    //Begin
    L[1] = s[1].length;
    L[2] = s[2].length;
    if (L[1] > L[2]) {
      i = 1;
      j = 2;
    } else {
      j = 1;
      i = 2;
    }
    // get ratio and truncate to integer
    r = Math.trunc(L[i] / L[j]);
    // now merge/mix the 2 strings
    p = 0;
    for (k = 0; k < L[j]; k++) {
      ss = ss + s[i].substr(p, r) + s[j].substr(k, 1);
      p = p + r;
    }
    return ss + s[i].substr(p);
  }

  //////////////////////////////////////////////////////////////////////
  function OPEN_FILE() { }
  //////////////////////////////////////////////////////////////////////

  // fname1 saves the full filename, including the path, of the opened file
  // filesDir saves the directory of the files folder
  var fname1;
  var filesDir;

  // global variables saved from the qna file which are read when the file is opened
  let subject;
  let settings;
  let numCats;
  let catArr;
  let totalQs;
  let isRestricted;
  let nFreeAccessQs;
  let base;
  let fdata;
  let ptrArr;
  let codeBytes;
  let cdArr;
  let ansCoder;
  let filesPath;
  let textColor;
  let fontName;
  let fontSize;
  let fontBold = new Array();
  let fontUnderline = new Array();
  let fontItalic = new Array();
  let FrameBorderWidth;
  let FrameBackColor;
  let FrameBorderColor;
  let RimWidth;
  let backgroundPicture;
  let backgroundStyle;
  let backgroundColor;
  let backgroundSound;
  let backgroundQTimeSound;
  let keyForecolor;
  let keyBackcolor;
  let keyBordercolor;
  let fenceTLcolor;
  let fenceBRcolor;
  let tickColor;
  let pwString;
  let dcontact;

  // **************** OpenFile() *********************
  function OpenFile() {
    showDialog("myExplorer");
  }

  function checkopenfile(butt, fname = "") {
    hideDialog('myExplorer');
    if (butt === 'Cancel' || fname === '' || fname === fname1) {
      return;
    }
    q._("toprightmenumask").classList.add("nodisplay");
    gc_enable();  // this must be here for the first opened file
    fname1 = fname;
    // this function is called when you try to open a qna file
    getandopenfile(butt).then(function (result) {
      if (result === "bad") {
        common.showMessage({ "msg": "Problem with opening the file", "bc": "w" });
      } else if (result === "cancel") {
        // do nothing
      } else if (result === "good") {
        if (backgroundColor < 0) {
          backgroundColor = 300000;
        }
        q._("wrapper").style.backgroundColor = common.rgbaColor(backgroundColor, 0.6);
        loginTries = 0;
        if (isRestricted) {
          // this is a Restricted-access qna file so show the unlock box
          // first display the contact details
          let s = "<b>Name: " + dcontact[1] + "</b><br>";
          s += "<b>Contact: " + dcontact[2];
          if (dcontact[3] != "") {
            s += ", " + dcontact[3];
          }
          if (dcontact[4] != "") {
            s += ", " + dcontact[4];
          }
          if (dcontact[5] != "") {
            s += ", " + dcontact[5];
          }
          if (dcontact[6] != "") {
            s += ", " + dcontact[6];
          }
          s += "</b>";
          q._("contactdetails").innerHTML = s;
          // the following code puts the computer id in the 1st input field
          let x = vars.compid;
          s = String.fromCharCode(65 + (x % 26));
          x = Math.trunc(x / 26);
          s = s + String.fromCharCode(65 + (x % 26));
          x = Math.trunc(x / 26);
          s = x + "-" + s;
          q._("gcode_input1").value = s;
          // the filename is already in fn_output, so put it in the 2nd input field
          q._("gcode_input2").value = q._("fn_output").value;
          // clear the 3rd input field
          q._("gcode_input3").value = "";
          // show the unlock box
          showDialog("unlockbox");
          // set focus on the 3rd input field
          q._("gcode_input3").focus();
        }
      }
    });
  }

  function getandopenfile(butt) {
    return new Promise((resolve, reject) => {
      let root = window.location.origin + "/";
      filesDir = root + fname1.substr(0, fname1.lastIndexOf(".")) + "_files/";
      var stored = null;
      if (typeof localStorage !== "undefined") {
        stored = localStorage.getItem(fname1);
      }
      var data = { "fpath": fname1, "stored": stored };
      common.doFetch("ft_temp.php", "openfile", null, data, "Reading the file, please wait")
        .then((json) => {
          if (json.value === "success") {
            subject = json.subject;
            settings = json.settings;
            numCats = json.numCats;
            catArr = json.catArr;
            totalQs = json.totalQs;
            isRestricted = json.isRestricted;
            dcontact = json.dcontact;
            codeBytes = json.codeBytes;
            nFreeAccessQs = json.nFreeAccessQs;
            base = json.base;
            fdata = json.fdata;
            ptrArr = json.ptrArr;
            cdArr = json.cdArr;
            ansCoder = json.ansCoder;
            filesPath = json.filesPath;
            textColor = json.textColor;
            fontName = json.fontName;
            fontSize = json.fontSize;
            fontBold[1] = json.fontBold[1] !== 0;
            fontBold[2] = json.fontBold[2] !== 0;
            fontUnderline[1] = json.fontUnderline[1] !== 0;
            fontUnderline[2] = json.fontUnderline[2] !== 0;
            fontItalic[1] = json.fontItalic[1] !== 0;
            fontItalic[2] = json.fontItalic[2] !== 0;
            FrameBorderWidth = json.FrameBorderWidth;
            FrameBackColor = json.FrameBackColor;
            FrameBorderColor = json.FrameBorderColor;
            RimWidth = json.RimWidth;
            backgroundPicture = json.backgroundPicture;
            if (backgroundPicture != "") {
              backgroundPicture = backgroundPicture.substr(1);
            }
            backgroundStyle = json.backgroundStyle;
            backgroundColor = json.backgroundColor;
            backgroundSound = json.backgroundSound;
            if (backgroundSound != "") {
              backgroundSound = filesDir + backgroundSound.substr(1);
              q._("back_sound").setAttribute("src", backgroundSound);
              isBackSound = true;
            } else {
              isBackSound = false;
            }
            backgroundQTimeSound = json.backQTimeSound;
            if (backgroundQTimeSound != "") {
              backgroundQTimeSound =
                filesDir + backgroundQTimeSound.substr(1);
              q._("backQTime_sound").setAttribute(
                "src",
                backgroundQTimeSound
              );
              isBackQTimeSound = true;
            } else {
              isBackQTimeSound = false;
            }
            keyForecolor = json.keyForecolor;
            keyBackcolor = json.keyBackcolor;
            keyBordercolor = json.keyBordercolor;
            fenceTLcolor = json.fenceTLcolor;
            fenceBRcolor = json.fenceBRcolor;
            tickColor = json.tickColor;
            pwString = json.pwString;
            // set the subject for the newly opened file
            const ele = q._("pageName");
            ele.innerHTML = subject;
            topPageNamew = ele.offsetWidth;
            if (topPageNamew < topPageNamew_min) topPageNamew = topPageNamew_min;
            putTopdiv(
              getComputedStyle(document.body, null).width.replace("px", "")
            );
            document.getElementById("fn_output").value = fname1.substring(fname1.lastIndexOf("/") + 1);

            // get total qs
            resolve("good");
          } else {
            resolve("bad");
          }
        })
        .catch((err) => {
          resolve("bad");
          alert(`error = ${err}`);
        });
    });
  }

  // ******************************************
  // these are the functions for dealing with clicks on buttons in the top menu.
  // they should be exactly the same as the values in $topmenu and $submenu in myFunctions.php, ie except
  // for spaces , dashes and slashes in the string which should be removed.
  // note that there are no functions for topmenu items which have submenu items
  // ******************************************

  //////////////////////////////////////////////////////////////////////
  function CATEGORIES() { }
  //////////////////////////////////////////////////////////////////////

  // dirty is a boolean which is true if category selection boxes have been clicked
  let dirty;

  function Categories() {
    let ob = {};
    if (getcatarray(ob)) {
      document.getElementById("catlist_container").innerHTML = ob.s;
      showDialog("catlist_container");
      dirty = false;
    } else {
      alert("Problem with categories in the file");
    }
  }

  function getcatarray(ob) {
    let bk = new Array();
    bk[0] = "#eee";
    bk[1] = "#fff";
    // first the heading
    let s = `<div id="catlistDialog" style="background-color: ${bk[(numCats + 1) % 2]
      } ">
    <div style="background-color:#666; color:white;">
    <div class="cat_name">Category</div>
    <div class="numQs">Qs</div>
    <div class="selected_cb" style="padding-left:0;">Selected</div></div>`;
    // now all the categories
    for (let i = 1; i <= numCats; i++) {
      let cval = catArr[i]["selected"] === true ? "checked" : "";
      let dval = isRestricted ? 'disabled="true" ' : "";
      s += `<div style="background-color:${bk[i % 2]}">
     <div class="cat_name" >${i}) ${catArr[i]["name"]}</div>
     <div  class="numQs">${catArr[i]["n"]}</div>
     <div class="selected_cb"><input type="checkbox"${dval}${cval}></div></div>`;
    }
    s += "<br>";
    // finally put the buttons at the bottom
    if (!isRestricted) {
      // not restricted so allow selection of categories
      s += `<div style="margin-right:3%">
      <button id="sa1" class="butt_class1">Select all</button>
      <button id="sn1" class="butt_class1">Select none</button>
      </div>
      <div style="clear:right;margin-right:3%">
      <button id="catlist_save" class="butt_class1" style="padding:2px 10px;" >Apply</button>
      <button id="catlist_cancel" class="butt_class1" style="padding:2px 10px;">Cancel</button>
      </div>`;
    } else {
      // the file is restricted so only put OK, ie don't allow selection of categories
      s += `<div style="margin-right:3%">
      <button class="butt_class1" style="padding:2px 10px;">OK</button>
      </div>`;
    }
    s += "</div>";
    ob.s = s;
    return true;
  }

  //****************************************
  // event handlers in the categories list dialog
  //****************************************

  q.delegate("catlist_container", "click", "button", function clickOnButtonInCategoriesList(e) {
    // clicking on a button the catlist dialog
    let butt = this.textContent;
    if (butt === "Select all" || butt === "Select none") {
      const bool = butt === "Select all";
      const g = q.qa("#catlist_container input");
      for (let i = 0; i < g.length; i++) {
        g[i].checked = bool;
      }
      dirty = true;
    } else {
      // clicked on the Cancel or Apply button or OK
      hideDialog("catlist_container");
      if (butt === "Apply") {
        if (!dirty) return;
        // must first update the category array
        let cld = q.qa("#catlist_container input");
        let ta = new Array();
        for (let i = 0; i < cld.length; i++) {
          ta[i] = cld[i].checked;
        }
        if (numCats === ta.length) {
          for (let i = 0; i < numCats; i++) {
            catArr[i + 1]["selected"] = ta[i];
          }
          dirty = false;
        } else {
          alert("There was a problem with the Category list");
        }
      }
    }
  }
  );

  q.delegate("catlist_container", "change", "input", function changeInInputInCategoriesList(e) {
    dirty = true;
  }
  );

  //////////////////////////////////////////////////////////////////////
  function NO_OF_QUESTIONS() { }
  //////////////////////////////////////////////////////////////////////

  // ***********************
  // variables and functions for getting the number of questions in a test
  // ***********************

  let defaultn = "20";
  let realn = defaultn;
  let orgnq;

  function Numberofquestions() {
    q._("gnq1_input").value = defaultn;
    q._("gnq2_input").value = realn;
    orgnq = realn;
    showDialog("getnumqs");
  }

  q.delegate("getnumqs", "click", "button", function (e) {
    let butt = this.textContent;
    if (butt === "Reset") {
      realn = defaultn;
      orgnq = realn;
      q._("gnq2_input").value = realn;
    } else {
      hideDialog("getnumqs");
      if (butt === "Apply") {
        realn = orgnq;
      }
    }
  });

  q.delegate(document.body, "keyup", "#gnq2_input", function (ee) {
    let v = ee.target.value;
    if (badInput(v)) q._("gnq2_input").value = orgnq;
    else orgnq = v;
  });

  function badInput(v) {
    if (isNaN(v) || v <= 0 || v.indexOf("e") >= 0) return true;
  }

  //////////////////////////////////////////////////////////////////////
  function TIME_ALLOWED() { }
  //////////////////////////////////////////////////////////////////////

  // ***********************
  // variables and functions for getting the time allowed
  // ***********************

  let defaultta = "30";
  let realta = defaultta;
  let orgta;

  function Timeallowed() {
    // clicking on Settings -> Time allowed submenu
    q._("gta1_input").value = defaultta;
    q._("gta2_input").value = realta;
    orgta = realta;
    showDialog("gettimeallowed");
  }

  q.delegate("gettimeallowed", "click", "button", function (e) {
    const butt = this.textContent;
    if (butt == "Reset") {
      realta = defaultta;
      orgta = realta;
      q._("gta2_input").value = realta;
    } else {
      hideDialog("gettimeallowed");
      if (butt === "Apply") {
        realta = orgta;
      }
    }
  });

  q.delegate(document.body, "keyup", "#gta2_input", function (ee) {
    const v = ee.target.value;
    if (badInput(v)) q._("gta2_input").value = orgta;
    else orgta = v;
  });

  ////////////////////////////////////////////////////////////////////
  function PLAYING_THE_GAME() { }
  ////////////////////////////////////////////////////////////////////

  // save array of questions
  let testQ;
  let totalSelected;

  let gamestate = "New game";
  let mostate = -2;

  let markup; //saves the html for later use, ie for showq()
  let correctAnswer; // saves correct answer for use later
  let nextcorrectAnswer; // saves next correct answer for use later

  let timer;

  let nTest;
  let QsRound;
  let QsDone;
  let numcorrect;

  let getnextq_dfd;
  let qloaded;

  // for showing the background picture
  let cssChange;
  let pictureShowing;
  let styleShowing;
  let nextPic;
  let nextStyle;
  let nextPicPath;

  // variables used for playing sounds
  // for background sounds
  let bgSoundOn = 0;
  let backSound = document.getElementById("back_sound");
  let backQTimeSound = document.getElementById("backQTime_sound");
  let backQSound = document.getElementById("backQ_sound");
  let isBackSound = false;
  let isBackQTimeSound = false;
  let isBackQSound = false;
  // for q and options sound clips
  let clipOn = -1;
  let aon; // for which audio clips are active, either clips0 or clips1

  q._("gobutton").addEventListener("click", function __clickOnGoButton__(e) {
    // this is the go button
    const goButton = this;
    let color;
    if (gamestate === "New game") {
      setVolume();
      // prepare the testQ[] array
      testQ = new Array();
      let ob = {};
      if (fillTestQ(testQ, ob)) {
        totalSelected = ob.n;
        if (totalSelected === 0) {
          common.showMessage({
            "msg": "There are no questions in the selection pool",
            "bc": "w",
          });
          return;
        }
        // disable the menu
        tm_disable();
        // display the spinner while getting the first question
        common.loadingOn({ "loadmsg": "Preparing the test, please wait" });
        // save the info that was in the wrapper and then make it invisible
        document.getElementById("tem_info").innerHTML =
          common.getHtml("wrapper");
        q.qs("#wrapper .info").classList.add("nodisplay");
        // get the first question
        Promise.all([initForTest(), getnextq()]).then(function (result) {
          common.loadingOff();
          if (result[1] === "end") {
            // because this is the first q in the test, if "end" is returned here it means that there was even one valid question
            common.showMessage({
              "msg": "There are no valid questions in the selection pool",
              "bc": "w",
            });
            tm_enable();
            return;
          }
          //console.log('first return after preparing the test');
          // set ready for a new game
          const theScore = q._("thescore");
          theScore.style.backgroundColor = "";
          theScore.innerHTML = "0/0";
          q._("scorecontainer").classList.remove("nodisplay");
          // fix the number of qs in the test
          nTest = realn;
          if (nTest > totalSelected) nTest = totalSelected;
          document.getElementById("score_input").value = nTest;
          checkHeight();
          checkWidth();
          // change go button to Start, green
          gamestate = "Start";
          goButton.textContent = gamestate;
          goButton.style.backgroundColor = "#0f0"; // green

          backSound.currentTime = 0;
          backQTimeSound.currentTime = 0;
          backQSound.currentTime = 0;
          checkBackgroundSound();
          mostate = -1;
        });
      } else {
        alert("fault with fillTestQ");
      }
    } else if (gamestate === "Start") {
      gamestate = "End";
      goButton.textContent = gamestate;
      goButton.style.backgroundColor = "#f00"; // change Go button to red
      // show the loaded question and get the next one
      showq();
      if (QsRound < nTest) {
        //if only one q in test then stop, ie don't try to fetch another one
        getnextq_dfd = getnextq();
      }
    } else if (gamestate === "End") {
      // if the endbox is showing turn it off
      q._("endbox").classList.add("nodisplay");
      // clear the old game
      clearInterval(timer);
      q._("scorecontainer").classList.add("nodisplay");
      document.getElementById("clock").value = "";
      q._("wrappermask").classList.add("nodisplay");
      tm_enable();
      getInfo();
      q._("wrapper").style.backgroundColor = common.rgbaColor(
        backgroundColor,
        0.6
      );
      // change go button to New game, grey
      gamestate = "New game";
      goButton.textContent = gamestate;
      goButton.style.backgroundColor = "#eee"; // grey
      // quit the game
      stopBackgroundSound();
      mostate = -2;
    }
  });

  function initForTest() {
    return new Promise((resolve, reject) => {
      if (backgroundPicture === "") {
        resolve();
      } else {
        let img = new Image();
        img.onload = function () {
          resolve();
          putBackgroundImage();
        };
        img.onerror = function () {
          resolve();
        };
        img.src = filesDir + backgroundPicture;
      }
      QsRound = 0;
      QsDone = 0;
      numcorrect = 0;
      // make the css
      // first for the question
      let css = ".q_cell_text{" + textStyles(1) + frameStyles(1) + "}";
      // now for the options
      let s1 = common.rgbaColor(fenceTLcolor) + " ";
      let s2 = common.rgbaColor(fenceBRcolor) + " ";
      css +=
        ".opt_class2:hover, .on_div{background-color:rgba(120,120,120,0.2);border-color:" +
        s1 +
        s2 +
        s2 +
        s1 +
        "}";
      css += ".o_cell_text{" + textStyles(2) + frameStyles(2) + "}";
      css +=
        ".n_format2{color:" +
        common.rgbaColor(keyForecolor) +
        "; background-color:" +
        common.rgbaColor(keyBackcolor) +
        "; border-color:" +
        common.rgbaColor(keyBordercolor) +
        "}";
      q.qs("style").innerHTML = css;
      // fix background color and picture
      q._("wrapper").style.backgroundColor = common.rgbaColor(backgroundColor);
    });
  }

  function showq() {
    mostate = 0; // set to 'waiting for an answer'
    // change the background picture and style if necessary
    // -1 = no bg picture
    // 0 = no change
    // 1 = bg style change only
    // 2 = bg pic change only
    // 3 = change bg pic and bg style
    // 4 = put the background picture for the whole file
    if (cssChange === 0) {
      // do nothing
    } else if (cssChange === -1) {
      q._("wrapper").style.backgroundImage = "none";
      pictureShowing = "";
    } else if (cssChange === 2) {
      q._("wrapper").style.backgroundImage = " url(" + nextPicPath + ")";
      pictureShowing = nextPic;
    } else if (cssChange === 3) {
      q._("wrapper").style.backgroundImage = " url(" + nextPicPath + ")";
      setBackgroundStyle(nextStyle);
      pictureShowing = nextPic;
    } else if (cssChange === 4) {
      putBackgroundImage();
    } else if (cssChange === 1) {
      setBackgroundStyle(nextStyle);
    }
    // play the audio sound file
    // If there is a background sound file to this q then start it
    // else If there is a background QTime sound file then start it
    checkBackgroundSound();
    // put the question and options
    document.getElementById("wrapper").innerHTML = markup;
    aon = QsRound % 2;
    correctAnswer = nextcorrectAnswer;
    gametimer(realta);
    checkHeight();
    checkWidth();
    QsRound++;
  }

  function setBackgroundStyle(st) {
    styleShowing = st;
    if (styleShowing === 0) {
      q._("wrapper").style.backgroundSize = "100% 100%";
    } else if (styleShowing === 1) {
      q._("wrapper").style.backgroundSize = "cover";
    } else if (styleShowing === 2) {
      q._("wrapper").style.backgroundSize = "contain";
    } else if (styleShowing === 3) {
      q._("wrapper").style.backgroundSize = "auto";
    }
  }

  function gametimer(timeleft) {
    if (typeof timeleft === "undefined") timeleft = defaultta;
    if (timeleft > 3599) timeleft = 3599;
    if (timeleft === 0) timeleft = 1;
    let ob = new Object();
    ob.minutes = Math.floor(timeleft / 60);
    ob.seconds = timeleft % 60;
    ob.timeup = false;
    timeString(ob);
    timer = setInterval(function () {
      ob.seconds--;
      timeString(ob);
      if (ob.timeup) {
        clearInterval(timer);
        if (mostate === 0) {
          q.removeAllClasses("#wrapper .opt_class", "opt_class2");
          doresult("wrong", "Time up");
        }
      }
    }, 1000);
  }

  function doresult(s, ss = "Wrong") {
    // mostate = 1;
    mostate = -1; // I think this is safer for now to stop stuff happening
    q._('wrappermask').classList.remove('nodisplay');
    // put a tick next to the correct answer
    let ts = document.createElement("div");
    ts.setAttribute(
      "style",
      `font-size:1.3em;z-index:400;color:${common.rgbaColor(
        tickColor
      )};position:absolute;top: ${tickpos}px;left:36px;`
    );
    ts.textContent = "\u2714";
    q.qs("div#opt_num" + correctAnswer).insertAdjacentElement("afterend", ts);
    //flash a message Correct or Wrong
    if (s === "correct") {
      playCorrectOrWrong(true);
      flashmsg("Correct, well done!", 700, "good");
      numcorrect++;
    } else {
      // s === 'wrong'
      playCorrectOrWrong(false);
      flashmsg(ss + ", number " + correctAnswer + " is correct", 1000, "h");
    }
    // update the score
    q._("thescore").innerHTML = numcorrect + "/" + QsRound;
    if (QsRound >= nTest) {
      //alert('end of game')
      q._("thescore").style.backgroundColor = "red";
      // wait for 1000 milliseconds which gives the flashbox time to show, also 1000 ms
      setTimeout(() => showEndbox(), 1000);
    } else {
      mostate = 1;
    }
    // turn off QTime sound or QSound if playing
    pauseBackgroundSound(bgSoundOn); // pause bg QSound or bg QTime sound
    checkBackgroundSound(); // start bg sound for whole file if there is one
  }

  function showEndbox() {
    let eb = q._("endbox");
    let score = `Game over...<br>You scored ${numcorrect}/${QsRound}<br>`;
    eb.querySelector("p#endmsg").innerHTML = score;
    common.centreBoxAndShow(eb);
  }

  function timeString(ob) {
    let s;
    if (ob.minutes === 0) {
      if (ob.seconds <= 0) ob.timeup = true;
      s = ob.seconds;
    } else {
      if (ob.seconds < 0) {
        ob.seconds = 59;
        ob.minutes--;
      }
      if (ob.minutes === 0) {
        s = ob.seconds;
      } else {
        if (ob.seconds < 10) {
          s = ob.minutes + ":0" + ob.seconds;
        } else {
          s = ob.minutes + ":" + ob.seconds;
        }
      }
    }
    document.getElementById("clock").value = s;
  }

  function putBackgroundImage() {
    pictureShowing = backgroundPicture;
    styleShowing = backgroundStyle;
    q._("wrapper").style.backgroundImage =
      "url(" + filesDir + pictureShowing + ")";
    setBackgroundStyle(styleShowing);
  }

  function getnextq() {
    return new Promise((resolve, reject) => {
      var ok = 0;
      var bool_dfd; // either a bool or a deferred is returned, no change so that always a deferred is returned
      var si = setInterval(function () {
        if (ok === 0) {
          qloaded = false; // needed to start the loading spinner if a q has not yet been loaded
          ok = 1; // this stops a reload
          bool_dfd = loadq();
        }
        bool_dfd
          .then(function (result) {
            clearInterval(si);
            resolve(result);
            qloaded = true;
          })
          .catch(function () {
            // failed to load a question so put ok = 0 so that another attempt can be made on the next loop
            ok = 0;
          });
      }, 50);
    });
  }

  var isClip = [[], []];
  var ao = new Array();
  ao[0] = q.qa("#clips0 audio");
  ao[1] = q.qa("#clips1 audio");

  function loadq() {
    // this function returns false if there are no more questions in the selection pool otherwise
    // it returns a deferred
    return new Promise((resolve, reject) => {
      var n = totalSelected - QsDone;
      if (n === 0) {
        resolve("end");
      }
      var aonn = QsDone % 2;
      QsDone++;
      var r = common.random(1, n);
      var ob = {};
      var qx = {};
      var q = testQ[r];
      //moveFromTo n, r
      testQ[r] = testQ[n];
      getqna(q, ob, qx)
        .then(function () {
          var nOps = ob.nOps;
          var QPB = ob.QPB;
          // get the value for cssChange, ie the change in bg pic and bg style
          cssChange = getCssChange();
          // now make the html for the next question and options
          // first the question
          var maxw = settings["Q_W"][QPB];
          var maxh = settings["Q_H"][QPB];
          var img = getImgString(maxw, maxh, qx, QPB, 0);
          var offstyle = ob.s[6] === "" ? "nodisplay_important" : "";
          // give the <audio> tag for the q a src if there is one
          var si = "";
          if (qx.clipPath[0] === "") {
            isClip[aonn][0] = false;
          } else {
            isClip[aonn][0] = true;
            ao[aonn][0].src = filesDir + qx.clipPath[0].substr(1);
            si = '<img src="res/soundnew.gif">';
          }
          var obb = { "si": si, "offstyle": offstyle, "q": ob.s[6], "n": 0, "p0": img };
          var s = common.getHtml("tem_q", obb);
          // now for the options
          var sa = ob.sa;
          s = s + '<div class="opts" >';
          maxw = settings["A_W"][QPB];
          maxh = settings["A_H"][QPB];
          for (var i = 1; i <= nOps; i++) {
            var j = sa[i];
            img = getImgString(maxw, maxh, qx, QPB, j);
            offstyle = ob.s[j] === "" ? "nodisplay_important" : "";
            // give the <audio> tags for the options a src if there is one
            if (qx.clipPath[j] === "") {
              isClip[aonn][i] = false;
              si = "";
            } else {
              isClip[aonn][i] = true;
              ao[aonn][i].src = filesDir + qx.clipPath[j].substr(1);
              si = '<img src="res/soundnew.gif">';
            }
            obb = { "si": si, "offstyle": offstyle, "opt": ob.s[j], "n": i, "pn": img };
            var ss = common.getHtml("tem_opt", obb);
            s = s + ss;
          }
          s = s + "</div>";
          markup = s;
          // the correct answer
          nextcorrectAnswer = ob.ans;
          resolve("ok");
        })
        .catch(function () {
          reject("bad picture");
        });
    });
  }

  function getCssChange() {
    if (nextPic === "") {
      // no bg pic for the question
      if (backgroundPicture === "") {
        if (pictureShowing === "") {
          return 0; // no change is necessary
        } else {
          return -1; // remove the picture showing
        }
      } else {
        // there is a background picture
        if (pictureShowing === "") {
          return 4; // reput background picture
        } else {
          // there is picture showing
          if (pictureShowing === backgroundPicture) {
            if (backgroundStyle === styleShowing) {
              return 0; // no change is necessary
            } else {
              nextStyle = backgroundStyle;
              return 1; // change the bg style to backgroundStyle
            }
          } else {
            return 4; // reput background picture
          }
        }
      }
    } else {
      // there is a bg pic for the question
      if (nextPic === pictureShowing) {
        if (nextStyle === styleShowing) {
          return 0; // no change is necessary
        } else {
          return 1; // change the bg style
        }
      } else {
        // put the new bg pic
        if (nextStyle === styleShowing) {
          return 2; // only put the new image
        } else {
          return 3; // change the bg style and the image
        }
      }
    }
  }

  function textStyles(n) {
    let s1 = fontBold[n] ? "bold " : "";
    let s2 = fontUnderline[n] ? "underline " : "";
    let s3 = fontItalic[n] ? "italic " : "";
    let s4 = fontSize[n] + "pt ";
    let s5 = fontName[n] === "" ? "sans-serif" : fontName[n] + ",sans-serif";
    return (
      "color:" +
      common.rgbaColor(textColor[n]) +
      "; font:" +
      s1 +
      s2 +
      s3 +
      s4 +
      s5 +
      ";"
    );
  }

  function frameStyles(n) {
    if (FrameBorderWidth[n] < 0) return "";
    let s1 =
      FrameBorderWidth[n] +
      "px solid " +
      common.rgbaColor(FrameBorderColor[n]) +
      ";";
    return (
      "padding:12px 20px;background-color:" +
      common.rgbaColor(FrameBackColor[n]) +
      "; border:" +
      s1
    );
  }

  function getImgString(maxw, maxh, qx, QPB, i) {
    // returns the html <img> string for a either a q or any option that has a picture
    let img = "";
    if (qx.picPath[i] != "") {
      let w = qx.width[i];
      let h = qx.height[i];
      if (w > 0 && h > 0) {
        if (maxw <= 0) maxw = w;
        if (maxh <= 0) maxh = h;
        // restricts w and h to maxw and maxh
        if (maxw < w || maxh < h) {
          let r2 = w / h;
          if (maxw < w && maxh < h) {
            let r1 = maxw / maxh;
            if (r1 > r2) {
              // height controls
              h = maxh;
              w = Math.round(h * r2);
            } else {
              // width controls
              w = maxw;
              h = Math.round(w / r2);
            }
          } else if (maxw < w) {
            w = maxw;
            h = Math.round(w / r2);
          } else {
            // maxh < h
            h = maxh;
            w = Math.round(h * r2);
          }
        }
        // get style for border, border width and color
        let s = "";
        let bw = qx.picBorderWidth[i];
        if (bw > 0) {
          s =
            "border:solid " +
            bw +
            "px " +
            common.rgbaColor(qx.picBorderColor[i]) +
            ";";
        }
        img = `<div class="qo_cell_picture"><img src="${qx.nextPicPath[i]}" 
          width="${w}" height="${h}" alt="" style="vertical-align:middle;${s}">
          </div>`;
      }
    }
    return img;
  }

  q.delegate("wrapper", "click", ".opt_class2", function __clickOnOption__(e) {
    // clicking on an option
    if (mostate != 0) return;
    this.classList.add("on_div");
    clearInterval(timer);
    e.stopPropagation(); // Stop stuff happening
    e.preventDefault(); // Totally stop stuff happening
    let choice = parseInt(this.id.charAt(this.id.length - 1), 10);
    // flash Correct or Wrong
    if (choice === correctAnswer) {
      doresult("correct");
    } else {
      doresult("wrong");
    }
  });

  q._("wrappermask").addEventListener("click", function _clickOnWrappermask(e) {
    // clicking to show the next question
    e.stopPropagation(); // Stop stuff happening
    e.preventDefault(); // Totally stop stuff happening
    if (mostate != 1) return;
    q._("flashbox").classList.add("nodisplay");
    common.loadingOn({ "loadmsg": "Fetching the next question, please wait" });
    getnextq_dfd.then(function (result) {
      common.loadingOff();
      if (result === "end") {
        common.showMessage({
          "msg": "Unable to complete the test - some questions had errors",
          "bc": "w",
        });
        mostate = -1;
        // make the score have red background to indicate the end of test
        q._("thescore").style.backgroundColor = "red";
        return;
      }
      q._("wrappermask").classList.add("nodisplay");
      showq();
      if (QsRound < nTest) {
        getnextq_dfd = getnextq();
      }
    });
  }
  );

  function flashmsg(msg1, ms, bc) {
    // flash a message, msg1, for ms micro seconds, bc = background color
    if (ms === undefined) ms = 1000; // 1 second
    if (bc === undefined) bc = "#e55";
    else {
      if (bc === "good") bc = "#dfd";
      else if (bc === "w") bc = "#fe8";
      else if (bc === "b") bc = "#faa";
      else if (bc === "h") bc = "#ccc";
    }
    const fb = q._("flashbox");
    fb.querySelector("p#flashmsg").innerHTML = msg1 + "<br><br>";
    fb.style.backgroundColor = bc;
    common.centreBoxAndShow(fb);
    //ms = 20000;
    setTimeout(() => {
      fb.classList.add("nodisplay");
    }, ms);
  }

  q.qs("#endbox button").addEventListener("click", function clickOnOKinEndbox(e) {
    q.trigger("gobutton", "click");
  }
  );

  ////////////////////////////////////////////////////////////////////
  function STUFF_FROM_fileClass_and_general() { }
  ////////////////////////////////////////////////////////////////////

  function fillTestQ(testQ, ob) {
    // fills testQ[] array with questions in the selection pool
    let n = 0;
    if (isRestricted) {
      let j = 0;
      //while (n < inPool && n < nFreeAccessQs) {
      while (n < totalQs && n < nFreeAccessQs) {
        j++;
        for (let i = 1; i <= numCats; i++) {
          if (j <= catArr[i]["n"]) testQ[++n] = catArr[i]["q"][j];
          if (n >= nFreeAccessQs) break;
        }
      }
    } else {
      // isRestricted = false
      // this fills array testQ[] with all available questions
      for (let i = 1; i <= numCats; i++) {
        if (catArr[i]["selected"]) {
          for (let j = 1; j <= catArr[i]["n"]; j++) {
            testQ[++n] = catArr[i]["q"][j];
          }
        }
      }
    }
    ob.n = n;
    return true;
  }

  // after getting all the image sizes return resolve if ok = true or reject if ok = false
  function getqna(q, ob, qx) {
    return new Promise((resolve, reject) => {
      //console.log('q in getqna = ' + q);
      // get the text of the question in ob and the picPaths in qx
      readQ(q, ob, qx);
      // qx.nextPicPath[] is an array to hold the full paths to pictures
      qx.nextPicPath = new Array();
      // get image sizes of question,0, and options,1 to 5, and background,7 . This also
      // loads the images
      // I don't think ok is needed anymore because catch won't ever be
      // reached.
      let ok = true;
      let todocount = ob.nOps + 2; // todocount is the total possible no of images
      // first load the background picture if any
      nextPic = qx.picPath[7];
      if (nextPic != "") {
        nextStyle = qx.picBorderWidth[7];
        nextPic = nextPic.substr(1);
        nextPicPath = filesDir + nextPic;
        qx.nextPicPath[7] = nextPicPath; // needed for call to getImageSize()
        getImageSize(qx, 7).then(function (result) {
          // Don't worry about setting ok here - it is only the background image.
          // An uncaught error will occur if there is a bad image but I will ignore it.
          // if (result === 'Bad image') reject();
          if (--todocount === 0) {
            // if (ok) resolve(); else reject();
            if (ok) resolve();
            else reject();
          }
        });
      } else {
        if (--todocount === 0) {
          if (ok) resolve();
          else reject();
        }
      }
      // now load the question picture and options pictures if any
      for (let i = 0; i <= ob.nOps; i++) {
        if (qx.picPath[i] != "") {
          qx.nextPicPath[i] = filesDir + qx.picPath[i].substr(1);
          getImageSize(qx, i)
            .then(function (result) {
              // reject immediately if the image is bad
              if (result === "Bad image") reject();
              if (--todocount === 0) {
                // if (result === 'Bad image') reject();
                if (ok) resolve();
                else reject();
              }
            })
            .catch(function (err) {
              // this code shouldn't be reached because getImageSize() only
              // returns resolve(). However reject() just in case.
              reject();
              ok = false; // a bad image so set ok to false
              // alert(err);
              // if (--todocount === 0) reject();
            });
        } else {
          if (--todocount === 0) {
            if (ok) resolve();
            else reject();
          }
        }
      }
    });
  }

  function getImageSize(qx, i) {
    // gets the dimensions of an image
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = function () {
        qx.width[i] = this.width;
        qx.height[i] = this.height;
        resolve();
      };
      img.onerror = function () {
        // reject('Bad image in getImageSize()');
        resolve("Bad image");
      };
      img.src = qx.nextPicPath[i];
    });
  }

  // ------------------------------------------------------
  //  The following functions are for reading a question
  // ------------------------------------------------------

  // '****************************
  // ' this reads a q into s(1 to 7) and puts picPath[] and clipPath[] into qx
  // '****************************
  function readQ(q, ob, qx) {
    // ' read in the question from the data[] array
    let arr = new Array();
    let ob2 = {};
    getQArr(q, arr, ob2);
    // ' first decode
    switchDown(arr, ob2.L);
    // ' now turn arr() into s(1 to 7) and ans etc
    let ns = new Array();
    arrToQnA(arr, ns, ob, qx);
    //console.log(qx.picBorderWidth);
    //console.log(qx.picBorderColor);
    ob.nOps = arr[1];
    ob.QPB = arr[2];
    // ' get the scramble array, ob.sa[]
    scrambleArr(ns, ob);
  }

  function getQArr(q, arr, ob2) {
    let qp = ptrArr[q];
    let off = qp["off"];
    ob2.L = qp["len"];
    // I should use slice here instead - I see that it doesn't work with objects.  I had expected
    // fdata to be an array but I see that json_encode makes it an object.
    // arr = fdata.slice(off,off+ob2.L);
    for (let i = 1; i <= ob2.L; i++) {
      arr[i] = fdata[off + i];
    }
  }

  function switchDown(arr, n) {
    // ' switchDown decodes qna file
    let start = arr[n];
    let low = cdArr["low"];
    let high = cdArr["high"];
    let sum1 = cdArr["sum1"];
    // ' this does shift down
    let b;
    for (let i = 1; i < n; i++) {
      // To n - 1
      if (start > arr[i]) {
        b = arr[i] + 256 - start;
      } else {
        b = arr[i] - start;
      }
      start = b;
      // ' this does switch
      if (b > low) {
        if (b < high) {
          b = sum1 - b;
        }
      }
      arr[i] = b;
    }
  }

  // '------------------------------------------------------
  // ' These 2 functions return the Qs and As from the byte array
  // '------------------------------------------------------
  function arrToQnA(arr, ns, ob, qx) {
    //nOps = arr[1];   // don't need to return it because it is always in arr[1]
    //QPB = arr[2];    // don't need to return it because it is always in arr[2]
    let ob3 = {};
    ob3.p = 3;
    // init arrays in the qx object
    qx.picPath = new Array();
    qx.clipPath = new Array();
    qx.picBorderWidth = new Array();
    qx.picBorderColor = new Array();
    qx.width = new Array();
    qx.height = new Array();
    // init the s[] array to hold questions, options and explanation
    ob.s = new Array();
    // ' first the picPath and clipPath for the question as a whole
    qx.picPath[0] = toStr(arr, ob3, true);
    picBorderWidth_Color(arr, ob3, 0, qx);
    qx.clipPath[0] = toStr(arr, ob3, true);
    // ' now the question, ie the text
    ob.s[6] = toStr(arr, ob3, true);
    // the options
    for (let i = 1; i <= arr[1]; i++) {
      qx.picPath[i] = toStr(arr, ob3, true);
      picBorderWidth_Color(arr, ob3, i, qx);
      qx.clipPath[i] = toStr(arr, ob3, true);
      ob.s[i] = toStr(arr, ob3, false); //  option text
      if (arr[ob3.p] === 1) {
        ns[i] = true;
      } else {
        ns[i] = false;
      }
      ob3.p = ob3.p + 1;
    }
    // ' expl picPath and clipPath and then text
    qx.picPath[6] = toStr(arr, ob3, true);
    picBorderWidth_Color(arr, ob3, 6, qx);
    qx.clipPath[6] = toStr(arr, ob3, true);
    ob.s[7] = toStr(arr, ob3, true);
    // ' get picPath[7] and clipPath[7] for the background
    qx.picPath[7] = toStr(arr, ob3, true);
    picBorderWidth_Color(arr, ob3, 7, qx);
    qx.clipPath[7] = toStr(arr, ob3, true);
    // ' ans is last byte in the array
    ob.ans = corrAns(ansCoder, ob.s[6], arr[ob3.p]);
  }

  function picBorderWidth_Color(arr, ob3, Index, qx) {
    qx.picBorderWidth[Index] = arr[ob3.p];
    if (Index != 7) {
      if (qx.picBorderWidth[Index] > 0) {
        qx.picBorderColor[Index] =
          arr[ob3.p + 1] + 256 * arr[ob3.p + 2] + arr[ob3.p + 3] * 65536;
      } else {
        qx.picBorderColor[Index] = 0;
      }
    }
    ob3.p = ob3.p + 4;
  }

  function corrAns(ansCoder, s, codeByte) {
    let ss;
    if (s === "") {
      ss = " ";
    } else {
      ss = s;
    }
    return Math.round(codeByte / ((ss.charCodeAt(0) % ansCoder) + 1));
  }

  // '****************************
  // ' this turns an array of bytes into a string
  // '****************************
  function toStr(arr, ob3, twoByte) {
    let L = arr[ob3.p];
    if (twoByte) {
      ob3.p = ob3.p + 1;
      L = L + 256 * arr[ob3.p];
    }
    let s = "";
    for (let i = 1; i <= L; i++) {
      s = s + String.fromCharCode(arr[ob3.p + i]);
    }
    ob3.p = ob3.p + L + 1;
    return s;
  }

  // '****************************
  // ' if option selected then this scrambles an array to scramble choices - always scrambled now
  // '****************************

  function scrambleArr(ns, ob) {
    // In VB5 QnA I check if the scramble option box has been checked then the scramble code is
    // executed, otherwise ob.sa[i] = i for all options.  In this function the scramble code is
    // always executed.
    ob.sa = new Array();
    let nt = 0;
    let tmpA = new Array();
    let n = ob.nOps;
    for (let i = 1; i <= n; i++) {
      if (ns[i]) {
        ob.sa[i] = i;
      } else {
        ob.sa[i] = 0;
        nt++;
        tmpA[nt] = i;
      }
    }
    if (nt === 0) return;
    let nextOpen = 1;
    while (nt > 1) {
      while (ob.sa[nextOpen] !== 0) {
        nextOpen++;
      }
      let r = common.random(1, nt);
      ob.sa[nextOpen] = tmpA[r];
      tmpA[r] = tmpA[nt];
      nt--;
    }
    while (ob.sa[nextOpen] !== 0) {
      nextOpen++;
    }
    ob.sa[nextOpen] = tmpA[1];
    for (let i = 1; i <= n; i++) {
      if (ob.sa[i] === ob.ans) {
        ob.ans = i;
        return;
      }
    }
  }

  ////////////////////////////////////////////////////////////////////
  function AUDIO_VOLUME() { }
  ////////////////////////////////////////////////////////////////////

  // ***********************
  // variables and functions for playing audio and getting the audio volumes
  // ***********************

  let isActive = true; // if isActive is true then the page has focus

  const default_volumes = {
    r1: 1, // make starting volume for correct/wrong be 100%
    r2: 0.7, // make starting volume for background be 70%
    r3: 1, // make starting volume for q/options be 100%
    // "r1": 1, // make starting volume for correct/wrong be 100%
    // "r2": 0.7, // make starting volume for background be 70%
    // "r3": 1, // make starting volume for q/options be 100%
  };

  const last_volumes = {
  };

  function playCorrectOrWrong(corr) {
    if (!isActive) return;
    if (corr) {
      correct_beep.play();
    } else {
      wrong_beep.play();
    }
  }

  function set_last_volumes() {
    last_volumes.r1 = default_volumes.r1;
    last_volumes.r2 = default_volumes.r2;
    last_volumes.r3 = default_volumes.r3;
  }

  function Audiovolume() {
    // called from submenu which created at runtime
    // clicking on Settings -> Audio volume submenu
    showDialog("getaudiovolume");
    // save in case of Cancel
    last_volumes.r1 = sd1.sl_r;
    last_volumes.r2 = sd2.sl_r;
    last_volumes.r3 = sd3.sl_r;
  }

  q.delegate("getaudiovolume", "click", "button", function (e) {
    const butt = this.textContent;
    if (butt == "Reset") {
      sd1.sl_r = default_volumes.r1;
      sd1.initBall();
      sd2.sl_r = default_volumes.r2;
      sd2.initBall();
      sd3.sl_r = default_volumes.r3;
      sd3.initBall();
    } else {
      if (butt == 'Cancel') {
        // put back to saved last_volumes
        sd1.sl_r = last_volumes.r1;
        sd1.initBall();
        sd2.sl_r = last_volumes.r2;
        sd2.initBall();
        sd3.sl_r = last_volumes.r3;
        sd3.initBall();
      }
      hideDialog("getaudiovolume");
    }
  });

  function setVolume() {
    let vol = sd.sl_r * sd1.sl_r;
    correct_beep.volume = vol;
    wrong_beep.volume = vol;
    vol = sd.sl_r * sd2.sl_r;
    backSound.volume = vol;
    backQTimeSound.volume = vol;
    backQSound.volume = vol;
    vol = sd.sl_r * sd3.sl_r;
    Array.from(q.qa("#clips0 audio")).forEach((ele) => {
      ele.volume = vol;
    });
    Array.from(q.qa("#clips1 audio")).forEach((ele) => {
      ele.volume = vol;
    });
  }

  // mouseover and mouseout events needed for playing sound clips when the q is displayed

  q.delegate("wrapper", "mouseout", ".qq", function (e) {
    pauseClip(e, this);
  });

  q.delegate("wrapper", "mouseout", ".opt_class2", function (e) {
    pauseClip(e, this);
  });

  function pauseClip(e, ele) {
    e.stopPropagation(); // Stop stuff happening
    e.preventDefault(); // Totally stop stuff happening
    let choice = parseInt(ele.id.charAt(ele.id.length - 2), 10);
    if (isClip[aon][choice]) {
      ao[aon][choice].pause();
      clipOn = -1;
    }
  }

  q.delegate("wrapper", "mouseover", ".qq", function (e) {
    playClip(e, this);
  });

  q.delegate("wrapper", "mouseover", ".opt_class2", function (e) {
    playClip(e, this);
  });

  function playClip(e, ele) {
    e.stopPropagation(); // Stop stuff happening
    e.preventDefault(); // Totally stop stuff happening
    let choice = parseInt(ele.id.charAt(ele.id.length - 1), 10);
    if (isClip[aon][choice]) {
      ao[aon][choice].currentTime = 0;
      ao[aon][choice].play();
      clipOn = choice;
    }
  }

  function pauseBackgroundSound(n) {
    if (n < 1) return;
    if (n === 1) {
      backSound.pause();
    } else if (n === 2) {
      backQTimeSound.pause();
    } else {
      // n must be 3
      backQSound.pause();
    }
  }

  function checkBackgroundSound() {
    if (!isActive) return;
    if (mostate === 0) {
      // ie waiting for an answer
      if (isBackQSound) {
        // if there is a bg sound for the question then play it
        if (bgSoundOn === 1) backSound.pause();
        backQSound.play();
        bgSoundOn = 3;
      } else if (isBackQTimeSound) {
        // if there is a bg QTime sound for the file then play it
        if (bgSoundOn === 1) backSound.pause();
        backQTimeSound.play();
        bgSoundOn = 2;
      }
    } else {
      // the file Background sound should play if there is one
      if (isBackSound) {
        backSound.play();
        bgSoundOn = 1;
      } else {
        bgSoundOn = 0;
      }
    }
  }

  function stopBackgroundSound() {
    if (bgSoundOn === 0) return;
    if (bgSoundOn === 1) {
      backSound.pause();
    } else if (bgSoundOn === 2) {
      backQTimeSound.pause();
    } else {
      // bgSoundOn = 3
      backQSound.pause();
    }
  }

  // the blur and focus events needed for playing audio

  window.addEventListener("blur", function () {
    isActive = false;
    q._("bodymask").classList.remove("nodisplay");
    if (mostate === -2) return; // no sounds should be playing
    if (mostate === -1 || mostate === 1) {
      // only need to check the overall background sound
      if (isBackSound) backSound.pause();
    } else {
      // mostate must be 0 so check background sounds and q & options clips
      if (isBackQSound) {
        backQSound.pause();
      } else if (isBackQTimeSound) {
        backQTimeSound.pause();
      } else if (isBackSound) {
        backSound.pause();
      }
      if (clipOn >= 0) {
        ao[aon][clipOn].pause();
      }
    }
  });

  window.addEventListener("focus", function () {
    isActive = true;
    q._("bodymask").classList.add("nodisplay");
    if (mostate === -2) return; // no sounds should be playing
    checkBackgroundSound();
  });


  // ******************************************
  // this event handler is for clicks on the top menu and sub menu items
  // it calls the function attached to the menu item
  // ******************************************

  q.delegate("topmenucontainer", "click", "#theMenu li", function __clickOnAMenuItem(e) {
    e.stopPropagation(); // Stop stuff happening
    //e.preventDefault(); // Totally stop stuff happening
    // light up the menu item and submenu item that was clicked
    common.maskscreen();
    const mob = common.getMob();
    if (this.classList.contains("menu")) {
      mob.menuActive = Number(this.getAttribute("data-v"));
      mob.submenuActive = -1;
    } else {
      // it is a submenu item
      let pa = this.parentNode.parentNode;
      mob.menuActive = Number(pa.getAttribute("data-v"));
      mob.submenuActive = Number(this.getAttribute("data-v"));
    }
    // call the function associated with the menu item that was clicked
    // q._("tdhead").classList.add("nodisplay");  // I don't know what tdhead is
    common.callMenuFunc();
  });

  function showDialog(id) {
    const ele = q._(id);
    ele.classList.remove("nodisplay");
    checkHeight(ele);
    checkWidth(ele);
    q._("dialogmask").classList.remove("nodisplay"); // turn on dialogmask
  }

  function hideDialog(id) {
    q._(id).classList.add("nodisplay");
    q._("dialogmask").classList.add("nodisplay"); // turn off dialogmask
    checkHeight();
    checkWidth();
  }

  function checkHeight(ele = null) {
    if (ele) {
      ele.style.top = th + 35 + "px";
    }
    const wrap = q._("wrapper");
    wrap.style.height = 'auto';
    let h = wrap.offsetHeight;
    // min height to cover the wrapper
    let mh = window.innerHeight - tbh;
    if (h < mh) h = mh;
    if (ele) {
      // dialog is in the body so subtract the topdiv height then
      // add its height plus a bit of extra space
      const wh = (ele.offsetTop - th) + ele.offsetHeight + 30;
      if (h < wh) h = wh;
    }
    wrap.style.height = h + 'px';
  }

  function checkWidth(ele = null) {
    const w = document.body.offsetWidth;
    // center the dialog if one is showing
    if (ele) ele.style.left = (w - ele.offsetWidth) / 2 + "px";
    // fixes the topdiv if the body width has changed
    if (lastBw === w) return;
    lastBw = w;
    putTopdiv(w);
  }

  ////////////////////////////////////////////////////////////////////
  function RESIZING() { }
  ////////////////////////////////////////////////////////////////////

  window.addEventListener("resize", function windowResize() {
    // const bw = document.body.offsetWidth;
    // console.log('In resize: lastbw= ' + lastBw + ' bw= ' + bw);
    if (!q._("dialogmask").classList.contains("nodisplay")) {
      // a dialog box must be showing because the dialogmask is on
      // the dialogmask is used with one of the following dialog boxes
      let dialogsArray = [
        "startupbox",
        "myExplorer",
        "unlockbox",
        "creatorloginbox",
        "getqnakeybox",
        "catlist_container",
        "getnumqs",
        "gettimeallowed",
        "getaudiovolume",
      ];
      for (let i = 0; i < dialogsArray.length; i++) {
        let tmp = q._(dialogsArray[i]);
        if (!tmp.classList.contains("nodisplay")) {
          checkHeight(tmp);
          checkWidth(tmp);
          break;  // jump out of for loop because only 1 dialog can be on
        }
      }
    } else {
      // the wrappermask is used with the questions and options
      let wm = q._("wrappermask");
      if (!wm.classList.contains("nodisplay")) {
        wm.style.width = "0px";
        wm.style.height = "0px";
        checkHeight();
        checkWidth();
        let wrap = q._("wrapper");
        wm.style.width = wrap.offsetWidth + "px";
        wm.style.height = wrap.offsetHeight + "px";
      } else {
        // this is done if a dialog box is not showing and wrapper mask is not showing
        checkHeight();
        checkWidth();
      }
    }
    common.fixElementAndMask("msgbox", "msgboxmask");
    common.fixElementAndMask("loading", "loadingmask");
    let e = q._("endbox");
    if (e.classList.contains("nodisplay")) {
      return;
    } else {
      common.centreBoxAndShow(e);
    }
  });


});
