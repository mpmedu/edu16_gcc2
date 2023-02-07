"use strict";

xx.module("common", function (apod) {
  // window.xx was created in myNamespace2.js
  let vars = xx.vars;
  let q = xx.q;
  let meta, menuFunctions;
  xx.imports.push(function () {
    meta = xx.meta;
    menuFunctions = xx.menuFunctions;
  });

  vars.hcode = {};

  apod.extend({
    addhcode: addhcode,
    loadingOn: loadingOn,
    loadingOff: loadingOff,
    isLoadingOn: isLoadingOn,
    getHtmlCode: getHtmlCode,
    getHtml: getHtml,
    replacer: replacer,
    getImageSize: getImageSize,
    showMessage: showMessage,
    htmlspecialchars: htmlspecialchars,
    htmlspecialchars_decode: htmlspecialchars_decode,
    fixElementAndMask: fixElementAndMask,
    validateEmail: validateEmail,
    isEmail: isEmail,
    isValidURL: isValidURL,
    widen: widen,
    enterKeyOnInput: enterKeyOnInput,
    get_ext: get_ext,
    doFetch: doFetch,
    //wait2:wait2,
    Slider1: Slider1,
    rgbaColor: rgbaColor,
    random: random,
    trim: trim,
    callMenuFunc: callMenuFunc,
    getMob: getMob,
    setMob: setMob,
    makemenu: makemenu,
    myStop: myStop,
    centreBoxAndShow: centreBoxAndShow,
    showDialog: showDialog,
    hideDialog: hideDialog,
    checkHeight: checkHeight,
    checkWidth: checkWidth,
    transfer_needed_variables: transfer_needed_variables,
  });

  xx.constants = {
    "MAX_FILE_SIZE": 2000000,
  };

  // for showing the loading spinner
  let nload = 0;

  // needed by msgbox and yesnobox
  let msgcallback1 = null;
  let msgcallback2 = null;
  // stores if msgboxmask must be turned off after a message was displayed
  let turnmaskoff = true;

  let lastBw;   // only in common module now


  // //////////////////////////
  // Functions start hear
  // ///////////////////////////


  window.onload = readyFunction;
  function readyFunction() {
    // alert("document is ready");
  }

  function addhcode(ob) {
    q.extend(vars["hcode"], ob);
  }

  function loadingOn(ob) {
    let domask, loadmsg, url;
    if (ob === undefined) {
      domask = true;
      loadmsg = "Please wait";
      url = "undefined";
    } else {
      domask = ob.domask === undefined ? true : ob.domask;
      loadmsg = ob.loadmsg === undefined || ob.loadmsg == "" ? "Please wait" : ob.loadmsg;
      url = ob.url === undefined ? "undefined" : ob.url;
    }
    nload++;
    // console.log('in loadingOn');
    // console.log("nload = " + nload);
    // console.log("url = " + url);
    // console.log('****************');
    // if (nload > 1) {
    // if (vars.isLocal || vars.debugon) alert('nload = ' + nload + ' in loadingOn');
    // return;
    // }
    //console.log("nload in loadingOn = " + nload +'  url= ' + url);
    q._("loadmsg").innerHTML = loadmsg;
    if (domask) {
      q._("loadingmask").classList.remove("nodisplay");
    }
    centreBoxAndShow(q._("loading"));
  }

  function loadingOff(ob) {
    let url = "";
    if (ob) url = ob.url;
    // console.log('in loadingOff');
    // console.log("nload = " + nload);
    // console.log("url = " + url);
    // console.log('--------------');
    //console.log("in loadingOff nload= " + nload);
    if (nload <= 0) return;
    nload--;
    //console.log("nload in loadingOff = " + nload);
    if (nload > 0) return;
    q._("loading").classList.add("nodisplay");
    q._("loadingmask").classList.add("nodisplay");
  }

  function isLoadingOn() {
    return nload > 0 ? true : false;
  }

  /*  
***************
** The next few functions are for getting html.
  getHtmlCode(v,ob) gets the html from the object hcode which is in the file hcode.js
  getHtml(id,ob) gets the html from html that gets imported into the document from a file such as common.php or template.php. I must be careful not to use the same id number
  for <div>s in index.php and the php file that gets included. Therefore using getHtmlCode
  is the newer and safer method.
They call functions replacer(s,dta) and getTemplateVars(str) to replace placeholders in the html code with variables from the ob object.
***************
 */

  function getHtmlCode(v, ob) {
    // from hcode.js
    let s = vars["hcode"][v];
    if (ob === undefined) return s;
    // ob is defined so replace placeholders with values from ob
    return replacer(s, ob);
  }

  function getHtml(id, ob) {
    let s = document.getElementById(id).innerHTML;
    if (ob === undefined) return s;
    // ob is defined so replace placeholders with values from ob
    return replacer(s, ob);
  }

  function replacer(s, ob) {
    let tempVars = getTemplateVars(s);
    let val;
    for (let i in tempVars) {
      let tempV = tempVars[i];
      let arrV = tempV.split(".");
      if (arrV.length > 1) {
        val = ob[arrV[0]];
        for (let j = 1; j < arrV.length; j++) {
          if (val === undefined) break;
          val = val[arrV[j]];
        }
      } else {
        val = ob[tempV];
      }
      if (val === undefined) val = "";
      s = s.replace("{" + tempV + "}", val);
    }
    return s;
  }

  // gets the variable names from templates used in templateParser
  function getTemplateVars(str) {
    let tempVars = [],
      regEx = /{([^}]+)}/g,
      text;
    while ((text = regEx.exec(str))) {
      tempVars.push(text[1]);
    }
    return tempVars;
  }

  /** 
@param imgSrc is the filepath to the image
@returns the height and width of the image in ob.w and ob.h
 */
  function getImageSize(imgSrc, ob) {
    if (imgSrc === "") {
      ob.w = 0;
      ob.h = 0;
      return;
    }
    var img = new Image();
    img.onload = function () {
      ob.w = this.width;
      ob.h = this.height;
    };
    img.src = imgSrc;
  }

  function validateEmail(email) {
    // validates an email
    var re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function isEmail(email) {
    // validates an email
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  /* function wait2(n){
  loadingOn();
  setTimeout(loadingOff,n);
}
 */

  function get_ext(arg) {
    // ok, gets the extension of a file obtained from an <input type="file"> tag
    var v;
    if (typeof arg === "string") {
      v = arg;
    } else {
      v = arg.val();
    }
    var t = v.lastIndexOf("/") + 1;
    if (t <= 0) t = v.lastIndexOf("\\") + 1;
    var fsname = v.slice(t);
    return fsname.slice(fsname.lastIndexOf(".") + 1);
  }

  var rexHttpUrl = (function () {
    // create the url regex in self executing function
    //URL pattern based on rfc1738 and rfc3986
    let rg_pctEncoded = "%[0-9a-fA-F]{2}";
    let rg_protocol = "(http|https):\\/\\/";
    let rg_userinfo =
      "([a-zA-Z0-9$\\-_.+!*'(),;:&=]|" + rg_pctEncoded + ")+" + "@";
    let rg_decOctet = "(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])"; // 0-255
    let rg_ipv4address =
      "(" + rg_decOctet + "(\\." + rg_decOctet + "){3}" + ")";
    let rg_hostname = "([a-zA-Z0-9\\-\\u00C0-\\u017F]+\\.)+([a-zA-Z]{2,})";
    let rg_port = "[0-9]+";
    let rg_hostport =
      "(" +
      rg_ipv4address +
      "|localhost|" +
      rg_hostname +
      ")(:" +
      rg_port +
      ")?";
    // chars sets
    // safe           = "$" | "-" | "_" | "." | "+"
    // extra          = "!" | "*" | "'" | "(" | ")" | ","
    // hsegment       = *[ alpha | digit | safe | extra | ";" | ":" | "@" | "&" | "=" | escape ]
    let rg_pchar = "a-zA-Z0-9$\\-_.+!*'(),;:@&=";
    let rg_segment = "([" + rg_pchar + "]|" + rg_pctEncoded + ")*";
    let rg_path = rg_segment + "(\\/" + rg_segment + ")*";
    let rg_query = "\\?" + "([" + rg_pchar + "/?]|" + rg_pctEncoded + ")*";
    let rg_fragment = "\\#" + "([" + rg_pchar + "/?]|" + rg_pctEncoded + ")*";
    return new RegExp(
      "^" +
      "(" +
      rg_protocol +
      ")?" +
      "(" +
      rg_userinfo +
      ")?" +
      rg_hostport +
      "(\\/" +
      "(" +
      rg_path +
      ")?" +
      "(" +
      rg_query +
      ")?" +
      "(" +
      rg_fragment +
      ")?" +
      ")?" +
      "$"
    );
  })();

  function isValidURL(url) {
    if (rexHttpUrl.test(url)) {
      return true;
    } else {
      return false;
    }
  }

  function doFetch(url, todo, params, data, loadmsg = "Please wait...") {
    // url = "lib/php/" + url;
    // url = "./lib/php/" + url;
    url = vars.URL_lib + 'php/' + url;
    let c = "?";
    if (todo) {
      url = url + "?todo=" + todo;
      c = "&";
    }
    if (params) url = url + c + q.param(params);
    let ob = { "url": url, "loadmsg": loadmsg };
    loadingOn(ob);

    return new Promise((resolve, reject) => {
      fetch(url, {
        "method": "POST",
        "headers": {
          "Accept": "application/json, text/plain, */*",
          //"Content-Type": "application/json; charset=UTF-8"
          "Content-Type": "application/json",
          // "Content-Type": "application/x-www-form-urlencoded"
        },
        "body": JSON.stringify(data),
      })
        // .then((res) => res.json())
        .then(async(res)=> {
          const isJson = res.headers.get('content-type')?.includes('application/json');
          const json = isJson ? await res.json() : null;



          // let txt = await res.text();
          if(!res.ok)
            throw await res.json();
          // return res.json();
          alert('here');

         return res.text();
        //  return res.json();
        })
        .then((json) => {
          if (json.substring(0, 1) === '{'){
// json = parse
          }

          console.log(json);
          // loadingOff(ob);
          resolve(json);
        })
        // .then(async response => {
        //   const isJson = response.headers.get('content-type')?.includes('application/json');
        //   const data = isJson ? await response.json() : null;

        //   if (!response.ok) {
        //     // get error message from body or default to response status
        //     const error = (data && data.message) || response.status;
        //     return Promise.reject(error);
        //   }
        //   alert(JSON.stringify(data, null, 4));
        //   // element.innerHTML = JSON.stringify(data, null, 4);
        // })

        .catch((err) => {
          console.log(err);
          console.log(err.message);
          // loadingOff(ob);
          reject(err);
        })
        .finally(() => {
          loadingOff(ob);
        });
    });
  }

  ////////////////////////////////////////////////////////////////////
  function AUDIO_AND_VOLUME_CONTROL() { }
  ////////////////////////////////////////////////////////////////////

  /** * @constructor */
  function Slider1(contId, ballId, r) {
    this.sl_cont = q._(contId);
    this.sl_ball = q._(ballId);
    this.sl_r = r;
    this.sl_maxRight = q.getWidth(this.sl_cont) - q.getWidth(this.sl_ball) - 2;
  }

  Slider1.prototype = {
    "moveBall": function (e) {
      let lf = e.offsetX - 7;
      if (e.target === this.sl_ball) {
        lf = lf + e.target.offsetLeft;
      }
      if (lf < 0) {
        lf = 0;
      } else if (lf > this.sl_maxRight) {
        lf = this.sl_maxRight;
      }
      this.sl_ball.style.left = lf + "px";
      this.sl_r = lf / this.sl_maxRight;
    },
    // "initBall": function () {
    initBall: function () {
      let lf = this.sl_r * this.sl_maxRight;
      this.sl_ball.style.left = lf + "px";
    },
  };

  initAud("cont", "ball", 0.2);

  function initAud(c, b, r) {
    let slider = new Slider1(c, b, r);
    slider.initBall();
    if (c === "cont") {
      q._("cont").addEventListener("click", (e) => {
        slider.moveBall(e);
        //setVolume();
      });
    } else {
      q._(c).addEventListener("click", (e) => {
        slider.moveBall(e);
      });
    }
    return slider;
  }

  // ////////////////////////////////////////////////////////////////
  // function COMMON_FUNCTIONS() { }
  // ////////////////////////////////////////////////////////////////

  // this function is now only used with msgbox, yesnobox and loading
  function fixElementAndMask(ele_id, mask_id, mustdoit = false) {
    // if (mustdoit === undefined) mustdoit = false;
    // if mustdoit is undefined (same as false) then the function will be exited early if the box is not showing
    let bx = q._(ele_id);
    if (!mustdoit) {
      // if not must do it then only do it if it is already visible
      if (bx.classList.contains("nodisplay")) return; // return if element is not visible
    }
    // the box must be showing so put it in the centre of the viewport
    q.moveElement(bx, 0, 0); // put temporary at top left so it doesn't affect the scrollbars
    let mask = q._(mask_id);
    mask.classList.add("nodisplay"); // turn off mask
    // get size of the body so that the mask can be set
    let w = document.body.clientWidth; // body width, jQ is safer
    let h = document.body.clientHeight; // body height, jQ is safer
    //get top and left to position the box to center
    let t = (window.outerHeight - q.getHeight(bx) - 100) / 2 +
      document.body.scrollTop;
    t = t - 10;
    if (t < 10) t = 10;
    // if (l < 10) l = 10;
    //Set height and width to $mask to fill up the whole screen
    if (!!mask) {
      // this tests if the box height is greater than the body height
      let oidh = q.getHeight(bx);
      if (h < t + oidh + 10) h = t + oidh + 10;
      mask.style.width = w + "px";
      mask.style.height = h + "px";
      // show the mask
      mask.classList.remove("nodisplay");
    }
    // centre the dialog and then show it
    centreBoxAndShow(bx);
  }

  /** showMessage()
  msg (string)        : the message to show, default = '', 
  putleft (boolean)   : if true then align left else align center, default = false, 
  bc (string)         : the background color of the box, default = '#eee', 
  boxType (string)    : 0 for message with OK button, default = 0, 
                        1 for message with Yes No buttons, 
  tmo (boolean)       : if true the mask will be turned off after message, default = true, 
  callback1 (function) : the function that will be called after the box closes if OK or Yes was chosen, default = null, 
  callback2 (function) : the function that will be called after the box closes if No was chosen, default = null
 */
  function showMessage(ops) {
    if (xx.vars.inFunc) {
      xx.vars.msgArr.push(ops);
      return;
    } else if (q._("msgbox").classList.contains("nodisplay") === false) {
      xx.vars.msgArr.push(ops);
      return;
    }
    xx.vars.inFunc = true;
    var dfs = {
      // defaults
      "msg": "testing 123",
      "putleft": false,
      // "putleft": true,
      "bc": "#eee",
      "boxType": 0,
      "tmo": true,
      "callback1": null,  // for OK or Yes buttons
      "callback2": null   // for No button
    };
    Object.assign(dfs, ops);
    dfs.msg = dfs.msg.replace(/\|/g, "<br>");
    msgcallback1 = dfs.callback1 || ops.callback1;
    msgcallback2 = dfs.callback2 || ops.callback2;
    turnmaskoff = dfs.tmo;
    if (dfs.bc === "g") {
      // good, greenish
      dfs.bc = "#8f8";
    } else if (dfs.bc === "w") {
      // warning, yellowish
      // dfs.bc = "#fe8";
      dfs.bc = "#f94";
    } else if (dfs.bc === "b") {
      // bad, reddish
      dfs.bc = "#f66";
    } else if (dfs.bc === "h") {
      // highlight, bright yellow
      dfs.bc = "#ff8";
    } else if (dfs.bc === undefined || dfs.bc === null) {
      dfs.bc = "#eee"; // neutral background color
    }
    let ele = q._("msgbox");
    ele.style.backgroundColor = dfs.bc;
    let el = ele.querySelector(".bmessage");
    el.innerHTML = dfs.msg;
    if (dfs.putleft) el.style.textAlign = "left";
    if (dfs.boxType === 0) {
      // OK button
      ele.querySelector("#msgButton").classList.remove("nodisplay");
      ele.querySelector('#msgButton button').focus();
    } else if (dfs.boxType === 1) {
      // Yes No buttons
      ele.querySelector("#yesnoButtons").classList.remove("nodisplay");
      ele.querySelector('#yesnoButtons button').focus();
    } else {
      // no button
    }
    // make the box to be 200px minimum
    ele.style.width = "auto"; // I don't think this is needed, it is the default value
    let w = q.getWidth(ele);
    if (w < 200) {
      ele.style.width = "200px";
    } else if (w > 800) {
      ele.style.width = "800px";
    }
    fixElementAndMask("msgbox", "msgboxmask", true); // turns the msgbox and its mask on
    if (dfs.boxType === 0) {
      // sets focus on OK button
      ele.querySelector('#msgButton button').focus();
    } else if (dfs.boxType === 1) {
      // sets focus on Yes button
      ele.querySelector('#yesnoButtons button').focus();
    }
    xx.vars.inFunc = false;
  }

  q.delegate('msgbox', 'click', 'button', function ___clickButtonOnmsgbox(e) {
    clickOrKeypressOnMsgbox(e, this);
  });

  q.delegate('msgbox', 'keypress', 'button', function _pressKeyOnmsgbox(e) {
    if (e.which == 13) {
      clickOrKeypressOnMsgbox(e, this);
    }
  });

  function clickOrKeypressOnMsgbox(e, ele) {
    e.preventDefault();
    let yes = ele.innerHTML !== "No";   // can be OK or Yes button
    q._("msgbox").classList.add("nodisplay");
    q._("msgButton").classList.add("nodisplay");
    q._("yesnoButtons").classList.add("nodisplay");
    if (turnmaskoff) q._("msgboxmask").classList.add("nodisplay");
    if (msgcallback1 != null && yes) {
      msgcallback1();
      msgcallback1 = null;
    } else if (msgcallback2 != null) {
      msgcallback2();
      msgcallback2 = null;
    }
    // check if there are more messages in the queue
    if (xx.vars.msgArr.length > 0) {
      let ops = xx.vars.msgArr.shift();
      showMessage(ops);
    }
  }

  function htmlspecialchars(string) {
    var escapedString = string;
    for (var x = 0; x < htmlspecialchars.specialchars.length; x++) {
      // Replace all instances of the special character with its entity.
      escapedString = escapedString.replace(
        new RegExp(htmlspecialchars.specialchars[x][0], "g"),
        htmlspecialchars.specialchars[x][1]
      );
    }
    return escapedString;
  }

  // A collection of special characters and their entities.
  htmlspecialchars.specialchars = [
    ["&", "&amp;"],
    ["<", "&lt;"],
    [">", "&gt;"],
    ['"', "&quot;"],
    ["'", "&#039;"],
  ];

  function htmlspecialchars_decode(string) {
    var unescapedString = string;
    for (var x = 0; x < htmlspecialchars_decode.specialchars.length; x++) {
      // Replace all instances of the entity with the special character.
      unescapedString = unescapedString.replace(
        new RegExp(htmlspecialchars_decode.specialchars[x][1], "g"),
        htmlspecialchars_decode.specialchars[x][0]
      );
    }
    return unescapedString;
  }

  htmlspecialchars_decode.specialchars = [
    ["'", "&#039;"],
    ['"', "&quot;"],
    [">", "&gt;"],
    ["<", "&lt;"],
    ["&", "&amp;"],
  ];

  // *******************************************
  // Some useful functions
  // *******************************************

  function trim(str) {
    // ok, trims white space from front and end of a string
    str = str.toString();
    let begin = 0;
    let end = str.length - 1;
    while (begin <= end && str.charCodeAt(begin) < 33) {
      ++begin;
    }
    while (end > begin && str.charCodeAt(end) < 33) {
      --end;
    }
    return str.substr(begin, end - begin + 1);
  }

  function spaces(n) {
    // gets spaces for insertion into html code
    let s = "";
    for (let i = 0; i < n; i++) {
      s += "\u00a0";
    }
    return s;
  }

  function centreItem(id) {
    let item = q._(id);
    let lf = (document.body.clientWidth - q.getWidth(item)) / 2;
    let top = (document.body.clientHeight - q.getHeight(item)) / 3;
    if (top < 100) top = 100;
    item.style.left = lf + "px";
    item.style.top = top + "px";
  }

  function centreBoxAndShow(b) {
    // b must be a jS element
    let t =
      (window.innerHeight - q.getOffsetHeight(b)) / 2.7 + document.body.scrollTop;
    let l =
      (window.innerWidth - q.getOffsetWidth(b)) / 2 + document.body.scrollLeft;

    // if less than a certain value then make them a minimum value
    if (t < 50) t = 50;
    if (l < 10) l = 10;
    // centre the flashbox and then show it
    b.style.top = t + "px";
    b.style.left = l + "px";
    b.classList.remove("nodisplay");
  }

  // not used at present
  // el must be a js element
  function setcolorjs(el, col) {
    if (col == undefined) col = vars["bkcol"];
    el.style.backgroundColor = col;
  }

  function random(low, high) {
    return Math.round(Math.random() * (high - low) + low);
  }

  function rgbaColor(v, opaque) {
    let rem1 = v % 256;
    v = Math.floor(v / 256);
    let rem2 = v % 256;
    let rem3 = Math.floor(v / 256);
    if (opaque) {
      return "rgba(" + rem1 + "," + rem2 + "," + rem3 + "," + opaque + ")";
    } else {
      return "rgb(" + rem1 + "," + rem2 + "," + rem3 + ")";
    }
  }

  function widen(yes) {
    if (yes === undefined) yes = true;
    if (yes) {
      // remove col3 so that col2 is wider
      q._("col3").classList.add("nodisplay");
      q._("col2").style.width = "99%";
    } else {
      // add col3
      q._("col3").classList.remove("nodisplay");
      q._("col2").style.width = "";
    }
  }

  function enterKeyOnInput(e, ele) {
    if (e.which == 13) {
      e.stopPropagation();
      e.preventDefault();
      let els = ele.querySelectorAll("input.input_key,input.textinput"); // I don't know what is input_key
      if (e.target === els[els.length - 1]) {
        return true;
      } else {
        for (let i = 0; i < els.length; i++) {
          if (e.target === els[i]) {
            els[i + 1].focus();
            return false;
          }
        }
      }
    }
    return false;
  }

  // takes on values of 0, 1, 2 etc according to which top menu and submenu item is on/active
  var mob = {
    "menuActive": -1,
    "submenuActive": -1,
  };

  function maskscreen() {
    //console.log('in maskscreen');
    // this is only needed to turn a submenu off
    q._("bodymask").classList.remove("nodisplay");
    setTimeout(() => {
      q._("bodymask").classList.add("nodisplay");
    }, 100);
  }

  function getMob() {
    return mob;
  }

  function setMob(x, y) {
    mob.menuActive = x;
    mob.submenuActive = y;
  }

  // ******************************************
  // this event handler is for clicks on the top menu and sub menu items
  // it calls the function attached to the menu item
  // ******************************************

  // this should really be in edu.js and not common.js
  q.delegate("topmenucontainer", "click", "#theMenu li", function __clickOnAMenuItem(e) {
    e.stopPropagation(); // Stop stuff happening
    //e.preventDefault(); // Totally stop stuff happening
    // light up the menu item and submenu item that was clicked
    maskscreen();
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
    callMenuFunc();
  }
  );

  function callMenuFunc() {
    menuFunctions.callMenuFunc(mob);
  }

  function makemenu() {
    // called from index.php; it inserts the top menu into the DOM
    let s = '<ul id="theMenu" class="links">';
    let n = 0;
    mob.tm = [];
    mob.sm = [];
    for (let i = 0; i < meta.topmenu.length; i++) {
      if (meta.topmenu[i].name) {
        if (meta.topmenu[i].func) {
          mob.tm.push(meta.topmenu[i].func);
        } else {
          mob.tm.push(funcName(meta.topmenu[i].name, i));
        }
        if (meta.topmenu[i].hide) {
          s += '<li class="menu nodisplay" data-v="' + i + '"';
        } else {
          s += '<li class="menu" data-v="' + i + '"';
        }
        if (meta.topmenu[i].id) {
          s += ' id="' + meta.topmenu[i].id + '"';
        }
        s += ">" + meta.topmenu[i].name;
        if (meta.topmenu[i].subpmenu) {
          // has dropdown submenus
          s += ' \u25bc<ul class="ul_' + i + ' nodisplay">';
          for (let j = 0; j < meta.topmenu[i].subpmenu.length; j++) {
            if (meta.topmenu[i].subpmenu[j].func) {
              mob.sm.push(meta.topmenu[i].subpmenu[j].func);
            } else {
              mob.sm.push(
                funcName(meta.topmenu[i].subpmenu[j].name, i, j)
              );
            }
            s +=
              '<li class="submenu" data-v="' +
              n +
              '">' +
              meta.topmenu[i].subpmenu[j].name +
              "</li>";
            n++;
          }
          s += "</ul>";
          s += "</li>";
        } else {
          // top menu which has no dropdown submenus
          s += "</li>";
        }
      }
    }
    s += "</ul>";
    q._("mainmenu_placeholder").outerHTML = s;

    function funcName(s, i, j = undefined) {
      s = s.replace(/[ -\/_!@#$%^&*()=+\\]/g, "");
      if (j === undefined) {
        // topmenu name
        return "mnu" + i + "_" + s;
      } else {
        // submenu name
        return "mnu" + i + "_" + j + s;
      }
    }
  }



  // function makemenu() {
  //   // called from index.php; it inserts the top menu into the DOM
  //   let s = '<ul id="theMenu" class="links">';
  //   let n = 0;
  //   mob.tm = [];
  //   mob.sm = [];
  //   for (let i = 0; i < meta["topmenu"].length; i++) {
  //     if (meta["topmenu"][i].name) {
  //       if (meta["topmenu"][i].func) {
  //         mob.tm.push(meta["topmenu"][i].func);
  //       } else {
  //         mob.tm.push(funcName(meta["topmenu"][i].name, i));
  //       }
  //       if (meta["topmenu"][i].hide) {
  //         s += '<li class="menu nodisplay" data-v="' + i + '"';
  //       } else {
  //         s += '<li class="menu" data-v="' + i + '"';
  //       }
  //       if (meta["topmenu"][i].id) {
  //         s += ' id="' + meta["topmenu"][i].id + '"';
  //       }
  //       s += ">" + meta["topmenu"][i].name;
  //       if (meta["topmenu"][i]["submenu"]) {
  //         // has dropdown submenus
  //         s += ' \u25bc<ul class="ul_' + i + ' nodisplay">';
  //         for (let j = 0; j < meta["topmenu"][i]["submenu"].length; j++) {
  //           if (meta["topmenu"][i]["submenu"][j].func) {
  //             mob.sm.push(meta["topmenu"][i]["submenu"][j].func);
  //           } else {
  //             mob.sm.push(
  //               funcName(meta["topmenu"][i]["submenu"][j].name, i, j)
  //             );
  //           }
  //           s +=
  //             '<li class="submenu" data-v="' +
  //             n +
  //             '">' +
  //             meta["topmenu"][i]["submenu"][j].name +
  //             "</li>";
  //           n++;
  //         }
  //         s += "</ul>";
  //         s += "</li>";
  //       } else {
  //         // top menu which has no dropdown submenus
  //         s += "</li>";
  //       }
  //     }
  //   }
  //   s += "</ul>";
  //   q._("mainmenu_placeholder").outerHTML = s;

  //   function funcName(s, i, j = undefined) {
  //     s = s.replace(/[ -\/_!@#$%^&*()=+\\]/g, "");
  //     if (j === undefined) {
  //       // topmenu name
  //       return "mnu" + i + "_" + s;
  //     } else {
  //       // submenu name
  //       return "mnu" + i + "_" + j + s;
  //     }
  //   }
  // }




  function extractBetween(s, s1 = null, s2 = null) {
    if (s2 === null) {
      if (s1 === null) return null;
      let p1 = s.indexOf(s1);
      if (p1 === -1) return null;
      return s.substring(p1 + s1.length);
    } else if (s1 === null) {
      let p2 = s.indexOf(s2);
      if (p2 === -1) return null;
      return s.substring(0, p2);
    } else {
      let p1 = s.indexOf(s1);
      if (p1 === -1) return null;
      let p2 = s.indexOf(s2);
      if (p2 === -1) return null;
      return s.substring(p1 + s1.length, p2);
    }
  }

  function myStop(msg) {
    msg = "<b>Sorry but a fatal error has occurred.</b>|" + msg;
    showMessage({
      "msg": msg,
      "putleft": true,
      "bc": "#f88",
      "boxType": 2,
      "tmo": false,
    });
  }

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
    fixElementAndMask("msgbox", "msgboxmask");
    fixElementAndMask("loading", "loadingmask");
    let e = q._("endbox");
    if (e.classList.contains("nodisplay")) {
      return;
    } else {
      centreBoxAndShow(e);
    }
  });


  // These are variables and functions that have been transferred from edu
  // They belong in edu but are called from common.
  let th;
  let bh;    // not really used in this module
  let tbh;
  let putTopdiv = function () { };

  function transfer_needed_variables(ob) {
    th = ob.th;
    bh = ob.bh;
    tbh = ob.tbh;
    putTopdiv = ob.putTopdiv;
  }

});
