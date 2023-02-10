"use strict";

(function(wnd) {
  const baseNode = 'xx';
  /** * @constructor */function APod() {}
  let root = wnd[baseNode];
  if (root) {
    APod = root.constructor;
  } else {
    wnd[baseNode] = root = new APod();
  }

  const proto = APod.prototype;
  
  proto.module = function(path, fn) {
    // first add the nodes on the path
    path = path.replace(/ /g, '');  // path might be 'package.common'
    let nodes = path.split('.');
    let i,ns = root;
    for (i = 0; i < nodes.length; i++) {
      if (ns[nodes[i]] === undefined) {
        ns[nodes[i]] = new APod();
      }
      ns = ns[nodes[i]];
    }
    // call the function, fn, using the last node in the path
    if (fn) fn(ns);
  };
  
  proto.extend = function(exports) {
    for (let prop in exports) {
      if (exports.hasOwnProperty(prop)) {
        this[prop] = exports[prop];
      }
    }
  };
  
  root.imports = new Array();    // imports are saved until all the modules have been loaded and then are executed
  proto.fixImports = function() {
    // execute each function in the root.imports[] array
    root.imports.forEach(imp=>imp());  
    delete root.imports;
  }
  
  let vars = wnd[baseNode].vars = new APod();
  let s = wnd.location.href.toLowerCase();
  // vars.URL_base = s.substring(0,s.lastIndexOf('/'));
  vars.isLocal = vars.debugon = (s.substr(s.indexOf('//') + 2, 9) === 'localhost');
  vars.bkcol = '#fff';  // default for setcolor is white
  // URL_lib must be set here for each project depending on the position of the /lib/ folder
  // if (vars.isLocal) {
  //   if (s.substr(s.indexOf('//') + 12, 5) === 'tests') {
  //     // this needs to be checked depending on how deep the folder is in /tests/
  //     vars.URL_lib = vars.URL_base + "/../../../lib/";  // for Categories and Menu and other tests
  //   } else if (s.indexOf('edu') > 0) { 
  //     vars.URL_lib = vars.URL_base + "/lib/";   // for local edu
  //   } else {
  //     vars.URL_lib = vars.URL_base + "/../../lib/";   // for EzFind
  //   }
  // } else { // /lib/ is in the same directory as the index file
  //   vars.URL_lib = vars.URL_base + "/lib/";  // when uploaded to the server
  // }
  s = wnd.location.pathname;
  s = s.substring(0,s.lastIndexOf('/')+1);
  vars.relPath = s.substr(1);
  vars.docPath = vars.relPath + 'docs/';
  
  // needed by showMessage()
  vars.inFunc = false;
  vars.msgArr = [];
  // needed to hold errors until an Ajax call finishes
  vars.errs =[];
  

}(window));