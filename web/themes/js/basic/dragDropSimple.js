if(!window.DHTMLSuite){var DHTMLSuite=new Object()}var DHTMLSuite_dragDropSimple_curZIndex=100000;var DHTMLSuite_dragDropSimple_curObjIndex=false;DHTMLSuite.dragDropSimple=function(j){var h;var d;var m;this.cloneNode=true;var c;var f;var p;var b;var a;var o;var t;var s;var q;var u;var v;var x;var w;var i;var n;this.positionSet=false;this.dragHandle=new Array();var l;var k;this.allowMoveX=true;this.allowMoveY=true;this.maxY=false;this.maxX=false;this.minX=false;this.minY=false;this.callbackOnAfterDrag=false;this.callbackOnBeforeDrag=false;this.dragStatus=-1;try{if(!standardObjectsCreated){DHTMLSuite.createStandardObjects()}}catch(r){alert("You need to include the dhtmlSuite-common.js file")}var g;this.objectIndex=DHTMLSuite.variableStorage.arrayDSObjects.length;DHTMLSuite.variableStorage.arrayDSObjects[this.objectIndex]=this;this.__setInitProps(j);this.__init()};DHTMLSuite.dragDropSimple.prototype={__setInitProps:function(a){if(a.cloneNode===false||a.cloneNode){this.cloneNode=a.cloneNode}if(a.allowMoveX===false||a.allowMoveX){this.allowMoveX=a.allowMoveX}if(a.allowMoveY===false||a.allowMoveY){this.allowMoveY=a.allowMoveY}if(a.minY||a.minY===0){this.minY=a.minY}if(a.maxY||a.maxY===0){this.maxY=a.maxY}if(a.minX||a.minX===0){this.minX=a.minX}if(a.maxX||a.maxX===0){this.maxX=a.maxX}if(!a.initOffsetX){a.initOffsetX=0}if(!a.initOffsetY){a.initOffsetY=0}this.initOffsetX=a.initOffsetX;this.initOffsetY=a.initOffsetY;if(a.callbackOnBeforeDrag){this.callbackOnBeforeDrag=a.callbackOnBeforeDrag}if(a.callbackOnAfterDrag){this.callbackOnAfterDrag=a.callbackOnAfterDrag}if(a.callbackOnDuringDrag){this.callbackOnDuringDrag=a.callbackOnDuringDrag}a.elementReference=DHTMLSuite.commonObj.getEl(a.elementReference);this.divElement=a.elementReference;this.initialXPos=DHTMLSuite.commonObj.getLeftPos(this.divElement);this.initialYPos=DHTMLSuite.commonObj.getTopPos(this.divElement);if(a.dragHandle){this.dragHandle[this.dragHandle.length]=DHTMLSuite.commonObj.getEl(a.dragHandle)}},__init:function(){var a=this.objectIndex;this.divElement.objectIndex=a;this.divElement.setAttribute("objectIndex",a);this.divElement.style.padding="0px";if(this.allowMoveX){this.divElement.style.left=(DHTMLSuite.commonObj.getLeftPos(this.divElement)+this.initOffsetX)+"px"}if(this.allowMoveY){this.divElement.style.top=(DHTMLSuite.commonObj.getTopPos(this.divElement)+this.initOffsetY)+"px"}this.divElement.style.position="absolute";this.divElement.style.margin="0px";if(this.divElement.style.zIndex&&this.divElement.style.zIndex/1>DHTMLSuite_dragDropSimple_curZIndex){DHTMLSuite_dragDropSimple_curZIndex=this.divElement.style.zIndex/1}DHTMLSuite_dragDropSimple_curZIndex=DHTMLSuite_dragDropSimple_curZIndex/1+1;this.divElement.style.zIndex=DHTMLSuite_dragDropSimple_curZIndex;if(this.cloneNode){var b=this.divElement.cloneNode(true);this.divElement.parentNode.insertBefore(b,this.divElement);b.style.visibility="hidden";document.body.appendChild(this.divElement)}DHTMLSuite.commonObj.addEvent(this.divElement,"mousedown",function(c){DHTMLSuite.variableStorage.arrayDSObjects[a].__initDragProcess(c)},a);DHTMLSuite.commonObj.addEvent(document.documentElement,"mousemove",function(c){DHTMLSuite.variableStorage.arrayDSObjects[a].__moveDragableElement(c)},a);DHTMLSuite.commonObj.addEvent(document.documentElement,"mouseup",function(c){DHTMLSuite.variableStorage.arrayDSObjects[a].__stopDragProcess(c)},a);if(!document.documentElement.onselectstart){document.documentElement.onselectstart=function(){return DHTMLSuite.commonObj.__isTextSelOk()}}},setCallbackOnAfterDrag:function(a){this.callbackOnAfterDrag=a},setCallbackOnBeforeDrag:function(a){this.callbackOnBeforeDrag=a},addDragHandle:function(a){this.dragHandle[this.dragHandle.length]=a},__initDragProcess:function(d){if(document.all){d=event}var c=this.objectIndex;DHTMLSuite_dragDropSimple_curObjIndex=c;var b=DHTMLSuite.variableStorage.arrayDSObjects[c];if(!DHTMLSuite.commonObj.isObjectClicked(b.divElement,d)){return}if(b.divElement.style.zIndex&&b.divElement.style.zIndex/1>DHTMLSuite_dragDropSimple_curZIndex){DHTMLSuite_dragDropSimple_curZIndex=b.divElement.style.zIndex/1}DHTMLSuite_dragDropSimple_curZIndex=DHTMLSuite_dragDropSimple_curZIndex/1+1;b.divElement.style.zIndex=DHTMLSuite_dragDropSimple_curZIndex;if(b.callbackOnBeforeDrag){b.__handleCallback("beforeDrag",d)}if(b.dragHandle.length>0){var a;for(var f=0;f<b.dragHandle.length;f++){if(!a){a=DHTMLSuite.commonObj.isObjectClicked(b.dragHandle[f],d)}}if(!a){return}}DHTMLSuite.commonObj.__setTextSelOk(false);b.mouse_x=d.clientX;b.mouse_y=d.clientY;b.el_x=b.divElement.style.left.replace("px","")/1;b.el_y=b.divElement.style.top.replace("px","")/1;b.dragTimer=0;b.__waitBeforeDragProcessStarts();return false},__waitBeforeDragProcessStarts:function(){var a=this.objectIndex;if(this.dragTimer>=0&&this.dragTimer<5){this.dragTimer++;setTimeout("DHTMLSuite.variableStorage.arrayDSObjects["+a+"].__waitBeforeDragProcessStarts()",5)}},__moveDragableElement:function(d){if(document.all){d=event}var c=this.objectIndex;var f=DHTMLSuite.variableStorage.arrayDSObjects[c];if(DHTMLSuite.clientInfoObj.isMSIE&&d.button!=1){return f.__stopDragProcess()}if(f.dragTimer==5){if(f.allowMoveX){var b=(d.clientX-this.mouse_x+this.el_x);if(this.maxX!==false){if(b+document.documentElement.scrollLeft>this.initialXPos+this.maxX){b=this.initialXPos+this.maxX}}if(this.minX!==false){if(b+document.documentElement.scrollLeft<this.initialXPos+this.minX){b=this.initialXPos+this.minX}}f.divElement.style.left=b+"px"}if(f.allowMoveY){var a=(d.clientY-f.mouse_y+f.el_y);if(this.maxY!==false){if(a>this.initialYPos+this.maxY){a=this.initialYPos+this.maxY}}if(this.minY!==false){if(a<this.initialYPos+this.minY){a=this.initialYPos+this.minY}}f.divElement.style.top=a+"px"}if(this.callbackOnDuringDrag){this.__handleCallback("duringDrag",d)}}return false},__stopDragProcess:function(b){var a=this.objectIndex;DHTMLSuite.commonObj.__setTextSelOk(true);var c=DHTMLSuite.variableStorage.arrayDSObjects[a];if(c.dragTimer==5){c.__handleCallback("afterDrag",b)}c.dragTimer=-1},__handleCallback:function(action,e){var callbackString="";switch(action){case"afterDrag":callbackString=this.callbackOnAfterDrag;break;case"beforeDrag":callbackString=this.callbackOnBeforeDrag;break;case"duringDrag":callbackString=this.callbackOnDuringDrag;break}if(callbackString){callbackString=callbackString+"(e)";try{eval(callbackString)}catch(e){alert("Could not execute callback function("+callbackString+")after drag")}}},__setNewCurrentZIndex:function(a){if(a>DHTMLSuite_dragDropSimple_curZIndex){DHTMLSuite_dragDropSimple_curZIndex=a/1+1}}};