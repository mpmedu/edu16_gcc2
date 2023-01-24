
"use strict";

xx.module('q', function (apod) {
  // let vars = xx.vars;   // might need this in future

  const exports = {
    _: _,
    qs: qs,
    qa: qa,
    trigger: trigger,
    delegate: delegate,
    extend: extend,
    getWidth: getWidth,
    getHeight: getHeight,
    setWidth: setWidth,
    setHeight: setHeight,
    moveElement: moveElement,
    isChildOf: isChildOf,
    param: param,
    getTop: getTop,
    getMarginLeft: getMarginLeft,
    getMarginTop: getMarginTop,
    getMargin: getMargin,
    myOffset: myOffset,
    removeAllClasses: removeAllClasses,
    getOuterWidth: getOuterWidth,
    getOuterWidth: getOuterWidth,
    getOffsetWidth: getOffsetWidth,
    getOffsetHeight: getOffsetHeight
  }

  apod.extend(exports);

function _(ele){
  return document.getElementById(ele);
}

function qs(ele){
  return document.querySelector(ele);
}

function qa(ele){
  return document.querySelectorAll(ele);
}

function trigger(ele,eventName){
  if (typeof ele === 'string') ele = _(ele);
  let event = document.createEvent('HTMLEvents');
  event.initEvent(eventName, true, false);
  ele.dispatchEvent(event);
}

// this function adds an eventListener to all elements within a containing element, ele
function delegate(ele,eventName,elementSelector,handler) {
  if (ele == null || ele == undefined){
    // element does not exist
    console.log('element does not exist in delegate()');
    return;
  }
  if (typeof ele === 'string') ele = _(ele);
  ele.addEventListener(eventName, function(e) {
    // loop parent nodes from the target to the delegation node
    for (let target = e.target; target && target != this; target = target.parentNode) {
      if (target.matches(elementSelector)) {
        handler.call(target, e);
        break;
      }
    }
  }, false);
}

function extend(out){
  out = out || {};
  for (let i = 1; i < arguments.length; i++) {
    if (!arguments[i]) continue;
    for (let key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key))
        out[key] = arguments[i][key];
    }
  }
  return out;
}

// for testing
// let ob1 = {name:'john',age:30};
// let ob2 = {age:33,size:'big'};
 // extend(ob1,ob2);    // the properties of ob2 are added to ob1, so ob1 gets changed
 // let ob3 = extend({},ob2,{a:5,b:'joe'});  // ob2 does not get changed here

 function getWidth(ele){
  if (ele.classList.contains('nodisplay')){
    ele.style.visibility = 'hidden';
    ele.classList.remove('nodisplay');
    let w = parseFloat(getComputedStyle(ele, null).width.replace("px", ""));
    ele.classList.add('nodisplay');
    ele.style.visibility = 'visible';
    return w;
  }
  return parseFloat(getComputedStyle(ele, null).width.replace("px", ""));
}

function getHeight(ele){
  if (ele.classList.contains('nodisplay')){
    ele.style.visibility = 'hidden';
    ele.classList.remove('nodisplay');
    let h = parseFloat(getComputedStyle(ele, null).height.replace("px", ""));
    ele.classList.add('nodisplay');
    ele.style.visibility = 'visible';
    return h;
  }
  return parseFloat(getComputedStyle(ele, null).height.replace("px", ""));
}


function setWidth(ele, val) {
  // use this to set the width of an element using either a function, a string or a number, eg setWidth('eleId','auto');
  if (typeof ele === 'string') ele = _(ele);
  if (typeof val === "function") val = val();
  if (typeof val === "string") ele.style.width = val;
  else ele.style.width = val + "px";
}

function setHeight(ele, val) {
  // use this to set the height of an element using either a function, a string or a number, eg setHeight('eleId','auto');
  if (typeof ele === 'string') ele = _(ele);
  if (typeof val === "function") val = val();
  if (typeof val === "string") ele.style.height = val;
  else ele.style.height = val + "px";
}

// for testing
//setHeight('wrapper',200);
//setHeight(wrapper,'auto');

function moveElement(ele,x,y){
  // moves an element to position x, y within its container
  ele.style.left = x + 'px';
  ele.style.top = y + 'px';
}

function isChildOf(pNode,cNode){
  if (pNode === cNode) return true;
  while (cNode && cNode !== pNode) cNode = cNode.parentNode;
  return cNode === pNode;
}

function param(params){
  if (typeof params !== "object") return;
  let keys = Object.keys(params);
  if (keys.length === 0) return;
  let s = '';
  keys.forEach(key => {
    s += key + '=' + params[key] + '&';
  });
  s = s.slice(0,s.length-1);
  s = s.replace(/ /g,"%20");
  return s;
}

// I copied these from D:/jsTesting/test1.html where I tested them
function getTop(ele){
  // this might return 'auto' so it is not good for returning px values
  if (ele.classList.contains('nodisplay')){
    ele.style.visibility = 'hidden';
    ele.classList.remove('nodisplay');
    let h = parseFloat(getComputedStyle(ele, null).top.replace("px", ""));
    ele.classList.add('nodisplay');
    ele.style.visibility = 'visible';
    return h;
  }
  // let t = getComputedStyle(ele, null).top;
  return parseFloat(getComputedStyle(ele, null).top.replace("px", ""));
}

function getMarginLeft(ele){
  if (ele.classList.contains('nodisplay')){
    ele.style.visibility = 'hidden';
    ele.classList.remove('nodisplay');
    let h = parseFloat(getComputedStyle(ele, null).marginLeft.replace("px", ""));
    ele.classList.add('nodisplay');
    ele.style.visibility = 'visible';
    return h;
  }
  // let ml = getComputedStyle(ele, null).marginLeft;
  return parseFloat(getComputedStyle(ele, null).marginLeft.replace("px", ""));
}

function getMarginTop(ele){
  if (ele.classList.contains('nodisplay')){
    ele.style.visibility = 'hidden';
    ele.classList.remove('nodisplay');
    let h = parseFloat(getComputedStyle(ele, null).marginTop.replace("px", ""));
    ele.classList.add('nodisplay');
    ele.style.visibility = 'visible';
    return h;
  }
  return parseFloat(getComputedStyle(ele, null).marginTop.replace("px", ""));
}

function getMargin(ele){
  // it is recommended not to use this shortcut margin, rather use margin-top, margin-right etc.
  if (ele.classList.contains('nodisplay')){
    ele.style.visibility = 'hidden';
    ele.classList.remove('nodisplay');
    //let h = parseFloat(getComputedStyle(ele, null).margin.replace("px", ""));
    //let h = parseFloat(getComputedStyle(ele, null).margin);
    let h = getComputedStyle(ele, null).margin.split(' ').map(v => parseFloat(v));
    ele.classList.add('nodisplay');
    ele.style.visibility = 'visible';
    return h;
  }
  return getComputedStyle(ele, null).margin.split(' ').map(v => parseFloat(v));
}

// I use this function to determine the offset of an element inside an ancestor which is going to be masked by another element, ie its identical twin
function myOffset(inner, outer, mask = null) {
  if (typeof inner === 'string') inner = _(inner);
  if (typeof outer === 'string') outer = _(outer);
  let t = 0, l = 0;
  // if the masking element, mask, is given then we must adjust for
  // the differences in margins between the 2 elements
  if (mask) {
    if (typeof mask === 'string') mask = _(mask);
    t += parseInt(getComputedStyle(inner, null).marginTop.replace("px", ""));
    l += parseInt(getComputedStyle(inner, null).marginLeft.replace("px", ""));
    t -= parseInt(getComputedStyle(mask, null).marginTop.replace("px", ""));
    l -= parseInt(getComputedStyle(mask, null).marginLeft.replace("px", ""));
  }
  inner = inner.offsetParent;
  t += parseInt(getComputedStyle(inner, null).paddingTop.replace("px", ""));
  l += parseInt(getComputedStyle(inner, null).paddingLeft.replace("px", ""));
  while (inner && inner !== outer) {
    t += inner.offsetTop + parseInt(getComputedStyle(inner, null).borderTopWidth.replace("px", ""));
    l += inner.offsetLeft + parseInt(getComputedStyle(inner, null).borderLeftWidth.replace("px", ""));
    inner = inner.offsetParent;
  }
  return [t, l];
}

// removes all classes, cls, from a selection, s
function removeAllClasses(s,cls){
  // for(let ele of Array.from(document.querySelectorAll(s))) ele.classList.remove(cls);
  // for(let ele of document.querySelectorAll(s)) ele.classList.remove(cls);
  // Array.from(document.querySelectorAll(s)).forEach(ele=>{ele.classList.remove(cls)});
  Array.from(qa(s)).forEach(ele=>{ele.classList.remove(cls)});
}

function getOuterWidth(el) {
  // this is the outer width with margin
  var width = el.offsetWidth;
  var style = getComputedStyle(el);
  width += parseInt(style.marginLeft) + parseInt(style.marginRight);
  return width;
}

function getOuterWidth(el) {
  // this is the outer height with margin
  var height = el.offsetHeight;
  var style = getComputedStyle(el);
  height += parseInt(style.marginTop) + parseInt(style.marginBottom);
  return height;
}

function getOffsetWidth(ele){
  if (ele.classList.contains('nodisplay')){
    ele.style.visibility = 'hidden';
    ele.classList.remove('nodisplay');
    let w = ele.offsetWidth;
    ele.classList.add('nodisplay');
    ele.style.visibility = 'visible';
    return w;
  }
  return ele.offsetWidth;
}

function getOffsetHeight(ele){
  if (ele.classList.contains('nodisplay')){
    ele.style.visibility = 'hidden';
    ele.classList.remove('nodisplay');
    let w = ele.offsetHeight;
    ele.classList.add('nodisplay');
    ele.style.visibility = 'visible';
    return w;
  }
  return ele.offsetHeight;
}

});
