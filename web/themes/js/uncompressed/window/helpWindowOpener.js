/**********************************************************
 * Opens an Iframe based window to show help file
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

var myHelpRequest=getHTMLHTTPRequest();
//Modal Window showing help doc
var helpWindow=null;
var helpWindowId="helpWindow";
var myHelpWindowOpenState=false;	//Used inside navigator.js
var myHelpWindowReloadState=true;	//Tells if contents must be reloaded
function spawnHelp(id) {
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"HelpPage?rand="+myRandom+"&path="+id;
	myHelpRequest.open("GET",url,true);

	/* This function processes the response */
	myHelpRequest.onreadystatechange=drawHelpWinAction;

	/* Send a new request */
	myHelpRequest.send(null);
}

function drawHelpWinAction() {
	if(myHelpRequest.readyState==4) {
		if(myHelpRequest.status==200) {
			var myRandom=parseInt(Math.random()*99999999);
			var url=myHelpRequest.responseText+"&myRandom="+myRandom;
			helpWindow=internalWindow.open(helpWindowId,"iframe", myHelpRequest.responseText, "Help Window", "width=720px,height=540px,left=10px,top=10px,resize=1,scrolling=1,keepOpen=1");
			//helpWindow.onclose=function(){return window.confirm("Do u want to close the help window?");};
		}
		else {
			alert("Connection Problem:"+myHelpRequest.statusText);
		}
	}
	else if(myHelpRequest.readyState==1) {
		//alert("Loading Help, please wait...");
	}
}
