/**********************************************************
 * Renders the navigation bar with breadcrumb, refresh button and help button(Main page)
 * Copyright (C) 2009  Amit Kumar(amitkriit@gmail.com)
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


var myNavigatorRequest=getHTMLHTTPRequest();

function callNavigatorAjax(path)
{
	myMoveAction.reInit();				//Defined in globalvars.js
	internalWindow.closeAll();
	//Ref: helpWindowOpener.js
	myHelpWindowReloadState=true;	//After reload help window must be reloaded
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"Navigator?rand="+myRandom+"&path="+path;
	myNavigatorRequest.open("GET",url,true);

	/* This function processes the response */
	myNavigatorRequest.onreadystatechange=drawNavAction;

	/* Send a new request */
	writeWaitMsg(div,"themes/icons/ajax_loading/8.gif","");
	myNavigatorRequest.send(null);
	//repeatedAjaxRequest=true;
}

var div="breadcrumb";	//Ref: main.jsp

function drawNavAction() {
	if(myNavigatorRequest.readyState==4) {
		if(myNavigatorRequest.status==200) {
			var navText='&nbsp;Navigation: <font color="#345678"><i>'+myNavigatorRequest.responseText+'</i></font>';
			var managedText='<table cellpadding="0" cellspacing="0" border="1" width=100%><tr><td>'+navText+'</td></tr></table>';
			drawNav(myNavigatorRequest.responseText,div);
		}
		else {
			alert("Connection Problem:"+myNavigatorRequest.statusText);
		}
	}
}

function drawNav(navText,area) {
	document.getElementById(area).innerHTML=null;
	document.getElementById(area).innerHTML=navText;
}

/* Execute Script embedded inside div's innerHTML */
/*function executeCustomReload() {
	var x = document.getElementById(div).getElementsByTagName("script");    for(var i=0;i<x.length;i++)   {       eval(x[i].text);   }
}*/