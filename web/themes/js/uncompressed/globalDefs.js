/**********************************************************
 * Defines common functions (e.g. ajax calls, url-encoding, table-effects)
 * Copyright (C) 2010  Amit Kumar(amitkriit@gmail.com)
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

/*
 * Address of server to be appended to AJAX URL
 */
var myServerAddress = "";
/*
 * All Ajax Responses will be rendered in blank divs Here are definitions of
 * standard divs that needs to be there in the blank page
 */
var blankPageMainInnerContentDiv = "blankContent";
var blankPageMainHiddenContentDiv = "blankHidden";
var blankPageMainHiddenContentDiv1 = "blankHidden1";
var blankPageMainHiddenContentDiv2 = "blankHidden2";
var blankPageMainHiddenContentDiv3 = "blankHidden3";
var blankPageMainHiddenContentDiv4 = "blankHidden4";

/*
 * Global Context Menu Variable
 */
var contextMenu = null;

/* ============================================================= */
/*
 * Application-specific, used for general move/copy operations
 */
function moveAction() {
	var movableItemType; // Type of item we are trying to move
	var movableItemId; // ID of the item to be moved
	var movableFromCurrentParentId; // ID of the current parent of the item to
	// be moved
	var movableToParentId; // ID of the new parent
	var paramArray; // Array of fields for the movable item
	this.verify = function() {
		return false;
	};
	this.reInit = function() {
		// alert("reInit moveAction");
		this.movableItemType = null;
		this.movableItemId = null;
		this.movableFromCurrentParentId = null;
		this.movableToParentId = null;
		this.paramArray = new Array();
		this.verify = function() {
			return false;
		};
	};

	this.cut = function(type, id, oldPid) {
		this.movableItemType = type;
		this.movableItemId = id;
		this.movableFromCurrentParentId = oldPid;
	};
	this.paste = function(newParentid) {
		this.movableToParentId = "" + newParentid;
		// alert("MOVE: "+this.movableItemId+" of Type:"+this.movableItemType+"
		// From:"+this.movableFromCurrentParentId+"
		// To:"+this.movableToParentId);
		return this.verify();
	};

	this.initParams = function(arr) {
		this.paramArray = new Array();
		if (arr != null) {
			for ( var i = 0; i < arr.length; i++) {
				this.paramArray[i] = arr[i];
				// alert(arr[i]);
			}
		}
	};
}

/*
 * Only one object of this type will be created
 */
var myMoveAction = new moveAction();

/* ============================================================= */
/*
 * Returns HANDLE to execute AJAX Calls
 */

/*
 * function getHTMLHTTPRequest1() { var request=null; try { request=new
 * XMLHttpRequest(); } catch (e) { alert("failed to INIT: "+e.message); }
 * 
 * return request; }
 */
function getHTMLHTTPRequest() {
	var request = null;
	try {
		request = new XMLHttpRequest(); /* e.g. Firefox */
	} catch (err1) {
		try {
			request = new ActiveXObject("Msxml2.XMLHTTP");
			/* some versions IE */
		} catch (err2) {
			try {
				request = new ActiveXObject("Microsoft.XMLHTTP");
				/* some versions IE */
			} catch (err3) {
				alert("failed to INIT AJAX: " + e.message);
				request = null;
			}
		}
	}
	return request;
}

/*
 * Ajax Wait Message
 */
function writeWaitText(docId) {
	if(document.getElementById(docId)==null) return;
	document.getElementById(docId).innerHTML = '<img src="images/common/wait.gif">&nbsp;Loading Content...';
}

/*
 * Ajax Wait Message with Image
 */
function writeWaitMsg(docId, image, text) {
	if(document.getElementById(docId)==null) return;
	var imageTag = "";
	var textTag = "";
	if (image != null && image != "")
		imageTag = '<image src="' + image + '">';
	textTag = text;
	document.getElementById(docId).innerHTML = '<table><tr><td>' + imageTag
	+ '</td><td>' + textTag + '</td></tr></table>';
}

function confirmModify() {
	return window.confirm("Save Changes?");
}

function confirmDelete() {
	return window.confirm("Delete selected item(s)?");
}

function writeSystemErrorMessage(div, msg) {
	if (msg == null || msg == "")
		msg = "This functionality may not be available on your system &quot;or&quot; you are not authorized to access the facility. Please contact your system administrator for details.";
	var str = "<fieldset><legend>System Error</legend>Unable to Process Request: Unknown/Invalid Command.<br><font color=\"#ff0000\">"
		+ msg + "</font></fieldset>";
	document.getElementById(div).innerHTML = str;
}

function systemStatus(div, message) { // 0=ERROR; 1=OK; 2=STATUS FLAG NOT SET
	if ((message != null && message.length > 0)) {
		var status = message[0].getAttribute("flag");
		var str = null;
		if (status == null || status == "")
			return 2;
		if (status == "SESSIONERROR") {
			str = "Session Error: Please Login again";
			if (div==null || document.getElementById(div) == null)
				alert(str);
			else
			{
				//str = "Session Error: Please <a href='index.jsp'>Re-Login</a>";
				writeSystemErrorMessage(div, str);
			}
			return 0;
		} else if (status == "INVALIDPATH") {
			str = "Invalid Command: You may not have requisite permission to access the facility";
			if (div==null || document.getElementById(div) == null)
				alert(str);
			else
				writeSystemErrorMessage(div, null);
			return 0;
		} else if (status == "OK") {
			return 1;
		} else
			return 2;
	}
	return 2;
}

/* ============================================================= */
/*
 * UTF-8 ENCODE, used for sending special characters through AJAX calls
 */
function URLEncode(clearString) {
	var output = '';
	var x = 0;
	clearString = clearString.toString();
	var regex = /(^[a-zA-Z0-9_.]*)/;
	while (x < clearString.length) {
		var match = regex.exec(clearString.substr(x));
		if (match != null && match.length > 1 && match[1] != '') {
			output += match[1];
			x += match[1].length;
		} else {
			if (clearString[x] == ' ')
				output += '+';
			else {
				var charCode = clearString.charCodeAt(x);
				var hexVal = charCode.toString(16);
				output += '%' + (hexVal.length < 2 ? '0' : '')
				+ hexVal.toUpperCase();
			}
			x++;
		}
	}
	return output;
}

/*
 * DECODE UTF-8 STRING
 */
function URLDecode(encodedString) {
	var output = encodedString;
	var binVal, thisString;
	var myregexp = /(%[^%]{2})/;
	while ((match = myregexp.exec(output)) != null && match.length > 1
			&& match[1] != '') {
		binVal = parseInt(match[1].substr(1), 16);
		thisString = String.fromCharCode(binVal);
		output = output.replace(match[1], thisString);
	}
	return output;
}

/* ============================================================= */
/*
 * Table Row highlight
 */	
var arrayOfRolloverClasses = new Array();
var arrayOfClickClasses = new Array();
var activeRow = false;
var activeRowClickArray = new Array();

function highlightTableRow()
{
	var tableObj = this.parentNode;
	if(tableObj.tagName!='TABLE')tableObj = tableObj.parentNode;

	if(this!=activeRow){
		this.setAttribute('origCl',this.className);
		this.origCl = this.className;
	}
	this.className = arrayOfRolloverClasses[tableObj.id];

	activeRow = this;

}

function clickOnTableRow()
{
	var tableObj = this.parentNode;
	//This may happen if the selected row is deleted
	if(tableObj==null) return;
	if(tableObj.tagName!='TABLE')tableObj = tableObj.parentNode;	

	if(activeRowClickArray[tableObj.id] && this!=activeRowClickArray[tableObj.id]){
		activeRowClickArray[tableObj.id].className='';
	}
	this.className = arrayOfClickClasses[tableObj.id];

	activeRowClickArray[tableObj.id] = this;

}

function resetRowStyle()
{
	var tableObj = this.parentNode;
	if(tableObj.tagName!='TABLE')tableObj = tableObj.parentNode;

	if(activeRowClickArray[tableObj.id] && this==activeRowClickArray[tableObj.id]){
		this.className = arrayOfClickClasses[tableObj.id];
		return;	
	}

	var origCl = this.getAttribute('origCl');
	if(!origCl)origCl = this.origCl;
	this.className=origCl;

}

function addTableRolloverEffect(tableId,whichClass,whichClassOnClick)
{
	arrayOfRolloverClasses[tableId] = whichClass;
	arrayOfClickClasses[tableId] = whichClassOnClick;

	var tableObj = document.getElementById(tableId);
	var tBody = tableObj.getElementsByTagName('TBODY');
	if(tBody){
		var rows = tBody[0].getElementsByTagName('TR');
	}else{
		var rows = tableObj.getElementsByTagName('TR');
	}
	for(var no=0;no<rows.length;no++){
		rows[no].onmouseover = highlightTableRow;
		rows[no].onmouseout = resetRowStyle;

		if(whichClassOnClick){
			rows[no].onclick = clickOnTableRow;	
		}
	}

}

function initiateTableRollover(tableId,whichClass,whichClassOnClick) {
	arrayOfRolloverClasses[tableId] = whichClass;
	arrayOfClickClasses[tableId] = whichClassOnClick;
}
//Must be used after the initialization: addTableRolloverEffect
var addRowRolloverEffect=function(row) {
	row.onmouseover = highlightTableRow;
	row.onmouseout = resetRowStyle;
	row.onclick = clickOnTableRow;
};

var clickOnTableRowContext=function(rowObj) {
	//var tableObj = this.parentNode;
	//if(tableObj.tagName!='TABLE')tableObj = tableObj.parentNode;
	if(rowObj.parentNode.tagName=='THEAD') return;
	var tableObj=rowObj.parentNode.parentNode;
	//alert(tableObj.tagName);
	if(activeRowClickArray[tableObj.id] && rowObj!=activeRowClickArray[tableObj.id]){
		activeRowClickArray[tableObj.id].className='';
	}
	rowObj.className = arrayOfClickClasses[tableObj.id];

	activeRowClickArray[tableObj.id] = rowObj;
};


/* ============================================================= */
/*
 * Search Table cell/term highlight
 */	
function doHighlight(bodyText, searchTerm) 
{
	// the highlightStartTag and highlightEndTag parameters are optional
	//if ((!highlightStartTag) || (!highlightEndTag)) {
	highlightStartTag = "<font style='color:blue; background-color:#FFCE9D;'>";
	highlightEndTag = "</font>";
	//}

	// find all occurences of the search term in the given text,
	// and add some "highlight" tags to them (we're not using a
	// regular expression search, because we want to filter out
	// matches that occur within HTML tags and script blocks, so
	// we have to do a little extra validation)
	var newText = "";
	var i = -1;
	var lcSearchTerm = searchTerm.toLowerCase();
	var lcBodyText = bodyText.toLowerCase();

	while (bodyText.length > 0) {
		i = lcBodyText.indexOf(lcSearchTerm, i+1);
		if (i < 0) {
			newText += bodyText;
			bodyText = "";
		} else {
			// skip anything inside an HTML tag
			if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
				// skip anything inside a <script> block
				//if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText.lastIndexOf("<script", i)) {
				newText += bodyText.substring(0, i) + highlightStartTag + bodyText.substr(i, searchTerm.length) + highlightEndTag;
				bodyText = bodyText.substr(i + searchTerm.length);
				lcBodyText = bodyText.toLowerCase();
				i = -1;
			}
			//}
		}
	}
	return newText;
}

/*
 * Filters Table rows for phrase
 */
function filter (phrase, _id){
	var words = phrase.value.toLowerCase().split(" ");
	var table = document.getElementById(_id);
	//alert(_id);
	var ele;
	for (var r = 0; r < table.tBodies[0].rows.length; r++){
		ele = table.tBodies[0].rows[r].innerHTML.replace(/<[^>]+>/g,"");
		var displayStyle = 'none';
		for (var i = 0; i < words.length; i++) {
			if (ele.toLowerCase().indexOf(words[i])>=0)
				displayStyle = '';
			else {
				displayStyle = 'none';
				break;
			}
		}
		table.tBodies[0].rows[r].style.display = displayStyle;
	}
}

/* ============================================================= */
/*
 * Generics for DOM Handling
 */	
var myPropertiesObject=function (content) {
	this.content=Array();
	for(var i=0;i<content.length;i++)
	{
		this.content[i]=content[i];
	}
};
//get name/value config pair eg <name>=<integer_value>
//return value(int), or 0(false) if none found
function getAttribute(Name,attr){
	var config=new RegExp(Name+"=([^,]+)", "i");
	return (config.test(attr))? parseInt(RegExp.$1) : 0;
}

var viewPort={
		MSIEWIN : ((navigator.userAgent.indexOf('MSIE')>=0 && navigator.userAgent.indexOf('Win')>=0 && navigator.userAgent.toLowerCase().indexOf('opera')<0)?true:false),
		opera : (navigator.userAgent.toLowerCase().indexOf('opera')>=0?true:false),
		element: ((document.compatMode === "CSS1Compat")?document.documentElement:document.body),

		//returns width and height, in pixels, of the window's content area respectively.
		//Does not include the toolbar, scrollbars etc.
		getSize:function() {
			var viewPortWidth=0;
			var viewPortHeight=0;

			// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
			if ((typeof window.innerWidth != 'undefined') && (typeof window.innerWidth == 'number')) {
				viewPortWidth = window.innerWidth,
				viewPortHeight = window.innerHeight;
			}

			// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
			else if (typeof document.documentElement != 'undefined'
				&& typeof document.documentElement.clientWidth !=
					'undefined' && document.documentElement.clientWidth != 0) {
				viewPortWidth = document.documentElement.clientWidth,
				viewPortHeight = document.documentElement.clientHeight;
			}

			// older versions of IE
			else {
				viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
				viewPortHeight = document.getElementsByTagName('body')[0].clientHeight;
			}
			return {width:parseInt(viewPortWidth), height:parseInt(viewPortHeight)};
		},

		//Returns an integer representing the pixels the current document has been scrolled 
		//from the upper left corner of the window, horizontally and vertically, respectively
		getOffset:function() {
			var offsetX=0;
			var offsetY=0;
			//IE
			if(!window.pageYOffset)
			{
				//strict mode
				if(!(document.documentElement.scrollTop == 0))
				{
					offsetY = document.documentElement.scrollTop;
					offsetX = document.documentElement.scrollLeft;
				}
				//quirks mode
				else
				{
					offsetY = document.body.scrollTop;
					offsetX = document.body.scrollLeft;
				}
			}
			//w3c
			else
			{
				offsetX = window.pageXOffset;
				offsetY = window.pageYOffset;
			}

			return{left:parseInt(offsetX), top:parseInt(offsetY)};
		},

		//Gets the central pixel of window's content-area
		//e.g. getCenter({width:100,height:100})
		//Optional: Takes dimension of the DOM Object as argument
		getCenter:function() {
			var hWnd = (arguments[0] != null) ? arguments[0] : {width:0,height:0};
			var dimension=this.getSize();
			var offset=this.getOffset();

			var _x = ((dimension.width-hWnd.width)/2)+offset.left;
			var _y = ((dimension.height-hWnd.height)/2)+offset.top;

			return {left: parseInt(_x), top:parseInt(_y)};
		},

		/*-------------------------------------------------------------*/
		/*
		 * Cross-browser event handling
		 * thanks to: Scott Andrew LePera
		 * (http://www.scottandrew.com/weblog/articles/cbs-events)
		 */
		//e.g. this.addEvent(obj,"mousedown", processEvent, false); 
		addEvent:function(obj, evType, fn, useCapture){
			if (obj.addEventListener){
				obj.addEventListener(evType, fn, useCapture);
				return true;
			} else if (obj.attachEvent){
				var r = obj.attachEvent("on"+evType, fn);
				return r;
			} else {
				alert("Handler could not be attached");
			}
		},
		removeEvent:function(obj, evType, fn, useCapture){
			if (obj.removeEventListener){
				obj.removeEventListener(evType, fn, useCapture);
				return true;
			} else if (obj.detachEvent){
				var r = obj.detachEvent("on"+evType, fn);
				return r;
			} else {
				alert("Handler could not be removed");
			}
		} 
};
/************************************************************/
var Esticon=new Object();