/**********************************************************
 * Javascript Window
 * Copyright (C) 2010  Amit Kumar(amitkriit@gmail.com)
 * Derived from Floating window(http://www.dhtmlgoodies.com/index.html?whichScript=floating_window)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 ***********************************************************/
var internalWindow={
		MSIEWIN : ((navigator.userAgent.indexOf('MSIE')>=0 && navigator.userAgent.indexOf('Win')>=0 && navigator.userAgent.toLowerCase().indexOf('opera')<0)?true:false),
		opera : (navigator.userAgent.toLowerCase().indexOf('opera')>=0?true:false),
		windowMinSize : [200,150],
		currentZIndex:20,
		winObjects: [], //object to contain references to dhtml window divs, for cleanup purposes
		activeWindow: {}, //currently active window
		activeWindowContent: {},	//Pointer to content-pane of the currently active window
		initResizeCounter: -1,
		startWindowSize : [],
		startEventPos:[],
		startPosWindow: [],
		moveCounter : -1,
		minimizedWindowOrder: 0,
		
		/*=============================================================*/
		/*
		 * Move/Resize Window
		 */
		cancelEvent:function(){
			return (internalWindow.moveCounter==-1 && internalWindow.initResizeCounter==-1)?true:false;
		},
		initMove:function(e){		
			if(document.all)e = event;
			internalWindow.moveCounter = 0;
			internalWindow.switchElement(false,this._parent);
			internalWindow.startEventPos = [e.clientX,e.clientY];
			internalWindow.startPosWindow = [internalWindow.activeWindow.offsetLeft,internalWindow.activeWindow.offsetTop];

			var contentWin=internalWindow.activeWindowContent;
			if (contentWin.dataType=="iframe"){
				contentWin.firstChild.style.visibility="hidden";
			}

			internalWindow.startMove();
			if(!internalWindow.MSIEWIN)return false;
		},
		startMove:function(){
			if(internalWindow.moveCounter>=0 && internalWindow.moveCounter<=10){
				internalWindow.moveCounter++;
				setTimeout('internalWindow.startMove()',5);
			}
		},
		stopMove:function(e){
			if(document.all)e = event;
			internalWindow.moveCounter=-1;
			internalWindow.initResizeCounter=-1;
			if(!internalWindow.activeWindow || !internalWindow.activeWindowContent)return;
			var state = '0';
			if(internalWindow.activeWindow.isMaximized)state = '1';

			var contentWin=internalWindow.activeWindowContent;
			if (contentWin.dataType=="iframe"){
				contentWin.firstChild.style.visibility="visible";
			}
		},

		moveWindow:function(e){
			var o=internalWindow;
			if(document.all)e = event;
			if(o.moveCounter>=10){
				o.activeWindow.style.left = o.startPosWindow[0] + e.clientX - o.startEventPos[0]  + 'px';
				o.activeWindow.style.top = o.startPosWindow[1] + e.clientY - o.startEventPos[1]  + 'px';
				if(o.activeWindow.isMaximized) o.registerPosition(o.activeWindow);
			}	

			if(o.initResizeCounter>=10){
				var newWidth = Math.max(o.windowMinSize[0],o.startWindowSize[0] + e.clientX - o.startEventPos[0]);
				var newHeight = Math.max(o.windowMinSize[1],o.startWindowSize[1] + e.clientY - o.startEventPos[1]);
				o.activeWindow.style.width =  newWidth + 'px';
				o.activeWindowContent.style.height = newHeight  + 'px';
				if(o.activeWindow.isMaximized) o.registerSize(o.activeWindow);
			}
			if(!document.all)return false;
		},

		initResizeWindow:function(e){
			if(document.all)e = event;
			var win=this._parent;
			//alert(win.id);
			var handle=win.elements.content;
			internalWindow.initResizeCounter = 0;
			internalWindow.switchElement(false,win);

			var contentWin=internalWindow.activeWindowContent;
			if (contentWin.dataType=="iframe"){
				contentWin.firstChild.style.visibility="hidden";
			}

			internalWindow.startWindowSize = [internalWindow.activeWindowContent.offsetWidth,internalWindow.activeWindowContent.offsetHeight];
			internalWindow.startEventPos = [e.clientX,e.clientY];
			internalWindow.startResizeWindow();
			return false;

		},

		startResizeWindow:function(){
			if(internalWindow.initResizeCounter>=0 && internalWindow.initResizeCounter<=10){
				internalWindow.initResizeCounter++;
				setTimeout('internalWindow.startResizeWindow()',5);
			}
		},
		/*=============================================================*/
		/*
		 * Set focus to the currently active window
		 */
		switchElement:function(e,inputElement){
			if(!inputElement) inputElement=this;
			inputElement.style.zIndex=++internalWindow.currentZIndex;
			internalWindow.activeWindow=inputElement;
			internalWindow.activeWindowContent=inputElement.elements.content[4];
			internalWindow.activeWindow.isClosed=false;
		},
		/*=============================================================*/
		/*
		 * Manipulate/register window's attributes and states
		 */
		registerSize:function(win) {
			var w=win.style.width;
			var h=win.elements.content[4].style.height;
			win.size={width:w, height:h};
		},
		registerPosition:function(win) {
			var offset=viewPort.getOffset();
			var x=parseInt((win.style.left || win.offsetLeft))-offset.left;
			var y=parseInt((win.style.top || win.offsetTop))-offset.top;
			win.position={left:x, top:y};
		},
		registerAttributes:function(win) {
			this.registerSize(win);
			this.registerPosition(win);
			//alert("regAttr");
		},
		setSize:function(win,width,height) {
			var minWidth=parseInt(this.windowMinSize[0]);
			var minHeight=parseInt(this.windowMinSize[1]);
			win.style.width =  Math.max(minWidth,parseInt(width)) + 'px';
			win.elements.content[4].style.height = Math.max(minHeight, parseInt(height)) + 'px';
		},
		setPosition:function(win,left,top) {
			//Get central position
			var centerPoint=viewPort.getCenter({width:win.offsetWidth, height:win.offsetHeight});
			//Find how much we scrolled up/down
			var offset=viewPort.getOffset();
			win.style.left=(left=="middle")? centerPoint.left+"px" : offset.left+parseInt(left)+"px";
			win.style.top=(top=="middle")? centerPoint.top+"px" : offset.top+parseInt(top)+"px";
		},
		setScroll:function(win,bool) {
			var handle=win.elements.content;
			var contentWindow=handle[4];
			var scrollProperty=(bool)?"scroll":"hidden";
			//alert(scrollProperty);
			contentWindow.style.overflow=scrollProperty;
			win.isScrollable=bool;
		},
		setResize:function(win,bool) {
			var handle=win.elements.content;
			var resizeHandle=handle[9];
			
			var resizeProperty=(bool)?"":"none";
			resizeHandle.style.display=resizeProperty;
			win.isResizable=bool;
		},
		/*=============================================================*/
		/*
		 * Window's controls
		 */
		closeWindow:function(){
			var win=this._parent;
			var contentWin=win.elements.content[4];
			if(win.isClosed){return;}
			var retVal;
			try {
				if(typeof win.onclose=="undefined") retVal=true;
				else
					retVal=win.onclose();
			}
			catch (e) {
				retVal=true;
			}
			finally {
				if (typeof retVal=="undefined"){
					alert("Error: \"onclose\" event handler failed");
					retVal=true;
				}
			}

			//If onclose returned succesfully, close the window
			if(retVal==true) {
				//Cleanup resources
				if (window.frames["_iwIframe-"+win.id]) //if this is an IFRAME DHTML window
					window.frames["_iwIframe-"+win.id].location.replace("about:blank");
					//window.frames["_iwIframe-"+win.id].setAttribute('src',null);
				else
					contentWin.innerHTML="";
				win.style.display='none';
				win.isClosed=true;
			}
			return retVal;
		},
		setMaximized:function(win) {
			//if(win.isMaximized) return;
			var position=win.position;
			var size=win.size;
			var handle=win.elements.content;
			var contentWindow=handle[4];
			contentWindow.style.display='block';
			if(win.isResizable)
				handle[9].style.display='';
			else
				handle[9].style.display='none';
			handle[7].className="minimizeButton";
			this.setSize(win, size.width, size.height);
			this.setPosition(win, position.left, position.top);
			win.isMaximized = true;
		},
		setMinimized:function(win) {
			//if(!win.isMaximized) return;
			this.registerAttributes(win);
			var handle=win.elements.content;
			var contentWindow=handle[4];
			contentWindow.style.display='none';
			handle[9].style.display='none';
			handle[7].className="maximizeButton";
			
			if(typeof win.minimizedWindowOrder=="undefined") {
				win.minimizedWindowOrder=++this.minimizedWindowOrder;
			}
			//Position and resize the minimized window
			win.style.left="50px";
			win.style.width="200px";
			
			//Stack the minimized window
			var stackSpacing=win.minimizedWindowOrder*2;
			var dimension=viewPort.getSize();
			var offset=viewPort.getOffset();
			win.style.top=offset.top+dimension.height-((win.offsetHeight*win.minimizedWindowOrder)+stackSpacing+100)+"px";
			win.isMaximized = false;
		},
		minimizeWindow:function(e,inputObj){
			if(!inputObj)inputObj = this;
			var win=inputObj._parent;
			var handle=win.elements.content;
			var state;	
			if(win.isMaximized){
				internalWindow.switchElement(false,win);
				internalWindow.setMinimized(win);
				state = '0';
			}else{
				internalWindow.switchElement(false,win);
				internalWindow.setMaximized(win);
				state = '1';
			}
		},
		show:function(win) {
			if(win.isClosed) {
				alert("Cannot show a closed window");
				return;
			}
			this.switchElement(false,win);
			internalWindow.activeWindow.style.display='block';
		},
		hide:function(win){
			//if(win.isClosed) return;
			win.style.display='none';
		},
		/*=============================================================*/
		setControls:function(e, win) {
			if(win) {
				var handle=win.elements.content;
				//handles can directly point to the main window
				for(var i=1;i<handle.length;i++)
					handle[i]._parent=win;
				win._parent=win;	//Pointer to self

				win.isMaximized=true;
				win.isClosed=false;
				win.isResizable=true;
				win.isScrollable=true;
				win.size=null;
				win.position=null;
				win.keepOpen=false;
				//win.size={};
				//win.position={};
				handle[4].dataType="";
				handle[7].onclick = internalWindow.minimizeWindow;
				handle[8].onclick = internalWindow.closeWindow;
				handle[9].onmousedown = internalWindow.initResizeWindow;
				handle[9].style.cursor = 'nw-resize';
				win.onmousedown=internalWindow.switchElement;
				handle[1].onmousedown = internalWindow.initMove;
				
				win.onclose=function(){return true;};
				win.show=function(){internalWindow.show(this);};
				win.hide=function(){internalWindow.hide(this);};
				win.close=internalWindow.closeWindow;
				win.setSize=function(width, height){internalWindow.setSize(this, width, height);};
				win.moveTo=function(left, top){internalWindow.setPosition(this, left, top);};
				win.load=function(type, contentsource, title){internalWindow.load(this, type, contentsource, title);}; //public function for loading content into window
				win.setScroll=function(bool){internalWindow.setScroll(this, bool);};
				win.setResize=function(bool){internalWindow.setResize(win, bool);};
				this.winObjects[this.winObjects.length]=win;
			}
			if(win==null){
				document.documentElement.onmouseup = internalWindow.stopMove;	
				document.documentElement.onmousemove = internalWindow.moveWindow;
				document.documentElement.ondragstart = internalWindow.cancelEvent;
				document.documentElement.onselectstart = internalWindow.cancelEvent;
			}
			return true;
		},
		create:function(uid){
			var div=document.createElement("div"); //create dhtml window div
			div.className='dhtmlgoodies_window';
			div.id=uid;		//This ID is unique for all windows
			document.body.appendChild(div);

			/*-------------------------------------------------------------*/
			//Title Bar
			var topDiv = document.createElement('DIV');
			topDiv.className='dhtmlgoodies_window_top';
			div.appendChild(topDiv);

			//Title of the window
			var title=document.createElement('LABEL');
			title.appendChild(document.createTextNode("Amit"));
			title.className='titleLabel';
			topDiv.appendChild(title);

			/*-------------------------------------------------------------*/
			//This div will contain our control elements
			var buttonDiv = document.createElement('DIV');
			buttonDiv.className='top_buttons';
			topDiv.appendChild(buttonDiv);

			var closeBtn = document.createElement('DIV');
			closeBtn.className='closeButton';
			buttonDiv.appendChild(closeBtn);
			closeBtn.onmouseover=this.mouseoverButton;
			closeBtn.onmouseout=this.mouseoutButton;

			var minimizeBtn = document.createElement('DIV');
			minimizeBtn.className='minimizeButton';
			buttonDiv.appendChild(minimizeBtn);	
			minimizeBtn.onmouseover=this.mouseoverButton;
			minimizeBtn.onmouseout=this.mouseoutButton;

			/*-------------------------------------------------------------*/
			//It's child-div will store the window-content
			var middleDiv = document.createElement('DIV');
			middleDiv.className='dhtmlgoodies_windowMiddle';
			div.appendChild(middleDiv);

			//The countent Div: this div will be rendered
			var contentDiv = document.createElement('DIV');
			contentDiv.className='dhtmlgoodies_windowContent';
			middleDiv.appendChild(contentDiv);

			//Status-Bar
			var bottomDiv = document.createElement('DIV');
			bottomDiv.className='dhtmlgoodies_window_bottom';
			div.appendChild(bottomDiv);

			//Resize-Handle
			var dragHandle = document.createElement('DIV');
			dragHandle.className='resizeHandle';
			//dragHandle.innerHTML='<span>A</span>';
			bottomDiv.appendChild(dragHandle);

			/*-------------------------------------------------------------*/
			//Populate properties of this window
			var contents=new Array();
			contents[0]=uid;		//Unique ID of the window
			//All divs
			contents[1]=topDiv;		//Title Bar
			contents[2]=buttonDiv;	//Div which contains control elements
			contents[3]=middleDiv;	//This div's child-node will be rendered
			contents[4]=contentDiv;	//This div will be rendered
			contents[5]=bottomDiv;	//Status Bar

			//All Controls
			contents[6]=title;		//Title object
			contents[7]=minimizeBtn;	//Minimize Button
			contents[8]=closeBtn;	//Close Button
			contents[9]=dragHandle;		//Drag Handle
			div.elements=new myPropertiesObject(contents);
			this.setControls(false,div);
			return div;
		},

		mouseoverButton:function() {
			this.className=this.className+' _a';
		},
		mouseoutButton:function() {
			this.className=this.className.replace(' _a','');
		},
		setupWindow:function(win, attr) {
			//Window Attributes
			var width=getAttribute("width", attr);
			var height=getAttribute("height", attr);
			var left=getAttribute("center", attr)? "middle":getAttribute("left", attr);
			var top=getAttribute("center", attr)? "middle":getAttribute("top", attr);
			var scroll=getAttribute("scrolling", attr);
			var resize=getAttribute("resize", attr);
			var recal=getAttribute("recal", attr);
			
			//Recalculate attributes, if either the window was opened for the first time
			//or recal attribute exists and has been set to 1
			if(win.size==null || win.position==null || recal==true) {
				this.setScroll(win, scroll);
				this.setResize(win, resize);
				this.setSize(win, width, height);
				this.setPosition(win, left, top);
				win.keepOpen=getAttribute("keepOpen", attr);
				this.registerAttributes(win);
			}
			
			//set it to the maximized state
			this.setMaximized(win);
			//Display the window
			win.style.visibility="visible";
			win.style.display="block";
			//set focus to this window
			this.switchElement(false,win);
			
		},
		open:function(id,type, src, title, attr) {
			//Following attributes are supported:
			//width=<value>px,height=<value>px,left=<value>px,top=<value>px,center=<1 or 0>scrolling=<1 or 0>resize=<1 or 0>recal=<1 or 0>keepOpen=<1 or 0>
			var obj=internalWindow;
			var win=document.getElementById(id);
			
			//If no window with this unique ID exists, create one
			if(win==null) {
				win=this.create(id);
			}
			
			//apply attributes to the window
			this.setupWindow(win,attr);
			//Load the contents
			win.load(type,src,title);
			return win;
		},

		load:function(win,type,src,title) {
			if(win.isClosed) {
				alert("cannot load a closed window");
				return;
			}
			var type=type.toLowerCase();
			if(typeof title!="undefined")
				win.elements.content[6].firstChild.nodeValue=title;

			var contentWindow=win.elements.content[4];	//Div which will store all contents

			if (type=="inline")
				contentWindow.innerHTML=src;

			else if (type=="div"){
				var internalDiv=document.getElementById(src);
				contentWindow.innerHTML=(internalDiv.innerHTML || internalDiv.defaultHTML); //Populate window with contents of inline div on page
				if (!internalDiv.defaultHTML)
					internalDiv.defaultHTML=internalDiv.innerHTML;
				internalDiv.innerHTML="";
				internalDiv.style.display="none";
			}

			else if (type=="iframe"){
				contentWindow.style.overflow="hidden";
				if (!contentWindow.firstChild || contentWindow.firstChild.tagName!="IFRAME")
					contentWindow.innerHTML='<iframe src="" style="margin:0; padding:0; width:100%; height: 100%" name="_iwIframe-'+win.id+'"></iframe>';
				window.frames["_iwIframe-"+win.id].location.replace(src);
			}
			else if (type=="ajax"){
				this.addContentFromUrl(src, contentWindow);
			}
			contentWindow.dataType=type;
		},

		addContentFromUrl:function(url,win){
			var obj = new sack();
			obj.requestFile = url;	// Specifying which file to get
			obj.onCompletion = function(){ internalWindow.showAjaxContent(this,win); };	// Specify function that will be executed after file has been found
			obj.runAJAX();		// Execute AJAX function			
		},

		showAjaxContent:function(obj,win){
			win.innerHTML = obj.response;
		},

		closeAll:function(){
			for (var i=0; i<internalWindow.winObjects.length; i++){
				//internalWindow.winObjects[i].onclose=function(){return true;};
				//internalWindow.hide(internalWindow.winObjects[i]);
				var win=internalWindow.winObjects[i];
				//If window has been set to be closed when navigating away from the current page
				//then close it(this is the default behavior)
				if(!win.keepOpen)
					win.close();
			}
		}

};

//window.onload = internalWindow.setControls;