"use strict";

xx.module("myExpl", function (apod) {

  const vars = xx.vars;
  const q = xx.q;
  let common;
  xx.imports.push(function () {
    common = xx.common;
  });

  apod.extend({
    init: init,
    fetchTheFolders: fetchTheFolders,
  });


  let folders;   // variable to hold the folderClass
  let onFolder;  // the folder that the mouse is on
  let displaceLeft; // items in folder_div to be moved left if no sub-folders
  let save_ai_id = -1;   // the id of the chosen folder
  let fname;    // full name of the file selected
  let save_selected_file = '';  // save the full name of the selected file
  let singleclickdone; // needed for checking double click when opening a file
  let show_dir_from = 1;   // 0 = root dir, 1 = 1 down from root dir

  // function to add event handlers that have a return to caller
  // it also sets the show_dir_from variable
  function init(caller, from_dir = show_dir_from) {
    show_dir_from = from_dir;
    q.delegate("files_div", "click", "li", function __clickOnFilename(e) {
      fname = this.dataset.fp;
      q._("fn_input").value = fname.substring(fname.lastIndexOf("/") + 1);
      if (fname != save_selected_file) {
        save_selected_file = fname;
        q.removeAllClasses("#files_div li span", "chosen");
        this.firstChild.classList.add("chosen");
      }
      singleclickdone = true;
    });

    q.delegate("files_div", "dblclick", "li", function __dblclickOnFilename(e) {
      if (singleclickdone === true) {
        returnToCaller("Open");
      }
    });

    q.delegate("myExplorer", "click", "button", function __clickButtonInMyExplorer(e) {
      let butt = this.textContent;
      if (butt == "Reset") {
        // clear everything and reput the folders
        set_selected_off();
        folders.putFob();
        // highlight the top folder and then trigger a click on it
        onFolder = q._("folders_div").querySelector(".holder"); // will find the first span.holder element
        q.trigger("itemPopup", "click");
        return;
      }
      // butt is either 'Open' or 'Cancel'
      if (butt === 'Open' && q._("fn_input").value === "") return;   // no file selected
      returnToCaller(butt);
    });

    function returnToCaller(butt) {
      // turn highlight on file off
      q.removeAllClasses("#files_div li span", "chosen");
      // clear values because myExplorer will be closed
      let tmp = fname;
      set_selected_off();
      // send button clicked and the selected filename back to the caller
      caller.checkopenfile(butt, tmp);
    }
  }

  function fetchTheFolders() {
    return new Promise((resolve, reject) => {
      displaceLeft = true;
      folders = new foldersClass({ "dir": vars.docPath, "notdirs": "_files" });
      // this also displays the folders and files
      folders.getFob().then(() => {
        resolve('is done after getFob()');
      });
    });
  }

  // .inbox is the plus or minus icon to open or close a folder
  q.delegate("folders_div", "click", ".inbox", function __clickOnOpenorCloseFolder(e) {
    //e.stopPropagation();
    let svg = this.parentNode;
    let doorClosed = svg.getAttribute("data-closed");
    if (doorClosed === "true") {
      // sideways, ie closed, so open folder
      let items = svg.parentNode.parentNode;
      svg.querySelector("line.down").classList.add("nodisplay");
      svg.setAttribute("data-closed", false);
      items.nextElementSibling.classList.remove("nodisplay");
      items.querySelector('.holder>span').classList.add('folder_open');
    } else if (doorClosed === "false") {
      // down, ie open, so close folder
      // I must check if this folder which is been closed contains the chosen folder
      // and if so then I must turn the chosen folder off
      let items = svg.parentNode.parentNode;
      let selected = folders.getSelected();
      if (selected >= 0) {
        let thisid = Number(items.id.slice(3));
        if (folders.isADecendentOf(selected, thisid)) {
          // the currently selected folder is a decendent of the folder that is now
          // being closed, so make selected be -1 and turn chosen off
          folders.setSelected(-1);
          // remove files from files_div
          q._("files_div").innerHTML = "";
        }
      }
      svg.querySelector("line.down").classList.remove("nodisplay");
      svg.setAttribute("data-closed", true);
      items.nextElementSibling.classList.add("nodisplay");
      items.querySelector('.holder>span').classList.remove('folder_open');
    }
  });

  // ******************************************
  // event handlers and routines for clicks and mouse events on items in the folder list in left column
  // ******************************************

  q.delegate("folders_div", "mouseover", ".holder", function __mouseoverOnHolder(e) {
    //e.stopPropagation();
    let ele = document.querySelector("#itemPopup");
    let offs = q.myOffset(this, "myExplorer", ele);
    //  left = offs[1] and top = offs[0];
    ele.style.left = offs[1] + "px";
    ele.style.top = offs[0] + "px";
    ele.innerHTML = common.htmlspecialchars_decode(this.innerHTML);
    ele.classList.remove("nodisplay");
    onFolder = this;
  });

  /* 
  The next 2 events turn off itemPopup if 
  a) the mouse exited itemPopup or 
  b) the mouse exited the underlying span.holder.
   */
  q._("itemPopup").addEventListener("mouseout", function __mouseoutItemPopup(e) {
    //e.stopPropagation();    // I don't think this is needed here
    if (q.isChildOf(this, e.relatedTarget)) return;
    this.classList.add("nodisplay");
    onFolder = null;
  });

  // Note that this might not be needed because once the mouse enters span.holder
  // then div#itemPopup covers the span.holder element. But I have found itemPopup
  // might not completely cover span.holder - I don't know why so I have put this
  // here just in case.
  q.delegate("folders_div", "mouseout", ".holder", function _mouseoutFromItemName(e) {
    //e.stopPropagation();
    if (e.relatedTarget.parentNode.id == "itemPopup") return;
    if (e.relatedTarget.id == "itemPopup") return;
    q._("itemPopup").classList.add("nodisplay");
  });

  // click on itemPopup, ie a folder
  q._("itemPopup").addEventListener("click", function __clickItemPopup(e) {
    e.stopPropagation();
    let item = onFolder.parentNode;
    let ai_id = Number(item.id.slice(3));
    if (ai_id === save_ai_id) return;  // same folder so return
    // a new folder so clear and save the new folder id
    set_selected_off();
    save_ai_id = ai_id;
    // turn itemPopup > span.itemName on, highlight folder
    let ele = this.querySelector("span.itemName");
    if (ele) ele.classList.add("chosen"); // ele will be null at start-up so test
    // turn the folder that is now selected on and old folder off
    folders.setSelected(ai_id);
    let fp = folders.fullPath(ai_id);
    // turn the spinner on while the files are fetched
    //showSpinner(this,onFolder)

    // this.classList.add("wait");
    // let savethis = this;
    // fetch the files in the folder and show them in file
    return new Promise((resolve, reject) => {
      // get the files in the folder clicked, ie fp, and show them in files_div
      let data = { "dir": fp };
      common.doFetch("ft_Explorer.php", "getFiles", null, data)
        .then((json) => {
          //turnOffSpinner(this,onFolder);
          // savethis.classList.remove("wait");
          if (json.value === "success") {
            document.getElementById('files_div').innerHTML = filesList(fp, json.files);
          } else {
            if (json.errmsg != undefined) {
              alert(json.errmsg);
            } else {
              alert("There was a problem with Fetch call");
            }
          }
          resolve();
        })
        .catch((err)=>{
          console.log('an error occurred when fetching the files');
          alert('error when fetching files')
        });
    });
  });

  // function showSpinner(popup, fold) {
  //   // show a spinner when a folder is clicked and files are fetched
  // }

  function filesList(fp, arr) {
    let ss = `<ul class="fileList" data-fp="${fp}">`;
    for (let i = 0; i < arr.length; i = i + 2) {
      ss += `<li data-fp="${fp}${arr[i]}"><span class="ext_${arr[i + 1]}">
        ${arr[i]}</span></li>`;
    }
    return ss + "</ul>";
  }

  function set_selected_off() {
    // clears all values in myExplorer
    q._("fn_input").value = "";
    save_ai_id = -1;
    fname = '';
    save_selected_file = '';
  }

  // start of foldersClass which has methods to get the folders and put them
  class foldersClass {
    constructor(data) {
      this.data = data;
      this.selected = -1;
      this.parr = [];
      this.fob = '';
    }

    getFob() {
      return new Promise((resolve, reject) => {
        common.doFetch("ft_Explorer.php", "getFolders", null, this.data)
          .then((json) => {
            this.fob = json;
            this.putFob();
            this.fix_parr();
            onFolder = q._("folders_div").querySelector(".holder"); // will find the first span.holder element
            q.trigger("itemPopup", "click");
            resolve();
          });
      });
    }

    putFob() {
      q._("folders_div").innerHTML = this.theFolders(this.fob);
      // if no subfolders then move items left because there is no + for subfolders
      if (displaceLeft) {
        q._("folders_div").querySelector(".items").style.marginLeft = -14 + "px";
      }
    }

    theFolders(json) {
      // turn itemPopup off just in case it is still showing
      let ele = q._("itemPopup");
      ele.classList.remove("chosen");
      ele.classList.add("nodisplay");
      try {
        let s;
        s = this.jsFolders(json, show_dir_from, 0);
        return s;
      } catch (e) {
        alert(`error : ${e}`);
      }
    }
  
    // Note that the spans are put together to prevent space gaps between the elements
    jsFolders(json, p, level) {
      let s = '<div class="items level' + level + '">';
      while (true) {
        if (json.ps[p] > 0) {
          // there are subfolders
          s += `<div id="ai_${p}">
            <span class="indx">${common.getHtml("tem_plusMinus")}</span><span 
            class="holder"><span class="directory"></span><span 
            class="itemName">${json.f[p]}</span></span>
            </div>
            <div class="subcatlistdiv nodisplay">${this.jsFolders(json, json.ps[p], level + 1)}
            </div>`;
          if (level === 0) displaceLeft = false;
        } else {
          // no subfolders
          s += `<div id="ai_${p}">
              <span class="indx"></span><span class="holder"><span 
              class="directory"></span><span class="itemName">${json.f[p]}</span>
              </span>
              </div>`;
        }
        p = json.pn[p];
        if (p === 0) return s + "</div>";
      }
    }

    setSelected(n) {
      if (this.selected >= 0)
        q._("ai_" + this.selected)
          .querySelector("span.itemName")
          .classList.remove("chosen");
      this.selected = n;
      if (n >= 0)
        q._("ai_" + this.selected)
          .querySelector("span.itemName")
          .classList.add("chosen");
    }

    getSelected() {
      return this.selected;
    }

    fix_parr() {
      this.parr[0] = 0;
      this.parr_fixsub(0);
    }

    parr_fixsub(p) {
      let pp = this.fob.ps[p];
      while (pp != 0) {
        this.parr[pp] = p;
        if (this.fob.ps[pp] > 0) this.parr_fixsub(pp);
        pp = this.fob.pn[pp];
      }
    }

    // This function returns true if idn1 is a decendent of idn2
    isADecendentOf(idn1, idn2) {
      let p = idn1;
      while (p > 0) {
        p = this.parr[p];
        if (p === idn2) return true;
      }
      return false;
    }

    fullPath(id) {
      let f = this.fob.f;
      let s = "";
      while (id != 0) {
        s = f[id] + "/" + s;
        id = this.parr[id];
      }
      return xx.vars.docPath + s;
    }
  } // end of folderClass

});
