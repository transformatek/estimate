/**********************************************************
 * Creates a splash-screen during Slow Ajax Operations
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

var modalWindow={
		initialized:false,
		active:false,
		init:function() {
			if(this.initialized) return;
			document.write('<div id="modalVeil__"></div><div id="modalMessageDiv__"></div><div id="modalDialogDiv__"></div>');
			this.veil=document.getElementById("modalVeil__");
			this.message=document.getElementById("modalMessageDiv__");
			this.dialog=document.getElementById("modalDialogDiv__");
			viewPort.addEvent(window, "resize", modalWindow.adjustComponents, false);
			viewPort.addEvent(window, "load", modalWindow.adjustComponents, false);
			viewPort.addEvent(window, "scroll", modalWindow.adjustComponents, false);
			this.initialized=true;
		},
		loadVeil:function(){
			var dimension=viewPort.getSize();
			var offset=viewPort.getOffset();
			this.veil.style.width=dimension.width+"px"; //set up veil over page
			this.veil.style.height=dimension.height+"px"; //set up veil over page
			this.veil.style.left=offset.left+"px"; //Position veil over page
			this.veil.style.top=offset.top+"px"; //Position veil over page
			this.veil.style.visibility="visible"; //Show veil over page
			this.veil.style.display="block"; //Show veil over page
		},
		adjustComponents:function() {
			if(modalWindow.active) {
				var dimension=viewPort.getSize();
				var offset=viewPort.getOffset();

				//VEIL
				modalWindow.veil.style.width=dimension.width+"px"; //set up veil over page
				modalWindow.veil.style.height=dimension.height+"px"; //set up veil over page
				modalWindow.veil.style.left=offset.left+"px"; //Position veil over page
				modalWindow.veil.style.top=offset.top+"px"; //Position veil over page

				//MESSAGE
				var centerPixel=viewPort.getCenter({width:modalWindow.message.offsetWidth, height:modalWindow.message.offsetHeight});
				modalWindow.message.style.left=centerPixel.left+"px";
				modalWindow.message.style.top=centerPixel.top+"px";

				//DIALOG
				centerPixel=viewPort.getCenter({width:modalWindow.dialog.offsetWidth, height:modalWindow.dialog.offsetHeight});
				modalWindow.dialog.style.left=centerPixel.left+"px";
				modalWindow.dialog.style.top=centerPixel.top+"px";
			}
		},
		adjustVeil:function(){ //function to adjust veil when window is resized
			if (modalWindow.veil && modalWindow.veil.style.display=="block") { //If veil is currently visible on the screen
				modalWindow.loadVeil(); //re-adjust veil
			}
		},
		/*-------------------------------------------------------------*/
		loadMessage:function(src,width,height) {
			this.message.innerHTML=src;
			this.message.style.width=parseInt(width)+"px";
			this.message.style.height=parseInt(height)+"px";
			this.message.style.visibility="visible";
			this.message.style.display="block";

			var centerPixel=viewPort.getCenter({width:this.message.offsetWidth, height:this.message.offsetHeight});

			this.message.style.left=centerPixel.left+"px";
			this.message.style.top=centerPixel.top+"px";
		},
		loadDialog:function(title,message,type,callBack) {
			var controlStr="";
			if(!type) {
				type = 'error';
			}
			if(type=='prompt') {
				controlStr+="<p></p><center><input type='button' value='OK' id='modalPromptAction__'>&nbsp;&nbsp;&nbsp;";
				controlStr+="<input type='button' value='Cancel' onclick='modalWindow.close();'></center>";
			}
			var str="<div id='dialog-header' class='"+type+"header"+"'>";
			str+="<div id='dialog-title'>"+title+"</div>";
			str+="<div id='dialog-close' onclick='modalWindow.close();'></div>";
			str+="</div>";
			str+="<div id='dialog-content' class='"+type+"'>"+message+controlStr+"</div>";
			this.dialog.innerHTML=str;

			this.dialog.style.visibility="visible";
			this.dialog.style.display="block";

			if(document.getElementById('modalPromptAction__')!=null) {
				document.getElementById('modalPromptAction__').onclick = callBack;
			}

			var centerPixel=viewPort.getCenter({width:this.dialog.offsetWidth, height:this.dialog.offsetHeight});
			this.dialog.style.left=centerPixel.left+"px";
			this.dialog.style.top=centerPixel.top+"px";

		},
		/*-------------------------------------------------------------*/
		closeveil:function(){ //function to close veil
			this.veil.style.display="none";
		},
		closeMessage:function() {
			this.message.style.display="none";
			this.message.innerHTML="";
		},
		closeDialog:function() {
			this.dialog.style.display="none";
			this.dialog.innerHTML="";
		},
		/*-------------------------------------------------------------*/
		close:function() {
			if(!this.initialized) return;
			this.closeMessage();
			this.closeDialog();
			this.closeveil();
			this.active=false;
		},
		open:function(src,width,height){
			this.init();
			//If a veil is already active, close it first
			if(this.active) this.close();
			this.loadVeil();
			this.loadMessage(src,width,height);
			this.active=true;
		},
		showDialog:function(title,message,type, callBack) {
			this.init();
			//If a veil is already active, close it first
			if(this.active) this.close();
			this.loadVeil();
			this.loadDialog(title, message, type, callBack);
			this.active=true;
		},

		/*-------------------------------------------------------------*/
		warn:function(text) {
			modalWindow.showDialog('Warning',text,'warning');
		},

		error:function(text) {
			modalWindow.showDialog('Error',text,'error');
		},

		success:function(text) {
			modalWindow.showDialog('Success',text,'success');
		},

		confirm:function(text,callBack) {
			modalWindow.showDialog('Confirmation',text,'prompt',callBack);
		}
};

function openSplashScreen() {
	var inlineTxt='<table bgcolor="#000000" border=0 bordercolor="#000000"	cellpadding=0 cellspacing=0 width="100%" height="100%">'+
	'<tr><td width="100%" height="100%" bgcolor="#dedeef" align="center" valign="middle">'+
	'<br>Processing,  please wait...'+
	'<br><br><img src="images/common/processing.gif" border="1" width="75" height="15"><br>'+
	'</td></tr></table>';
	modalWindow.open(inlineTxt,200,100);
	//modalWindow.showDialog('Warning','You must enter all required information.','warning');
	//modalWindow.showDialog('Error','You have encountered a critical error.','error',2);
	//modalWindow.showDialog('Success','Your request has been successfully received.','success');
	//var callBack=function(){alert("Hello");};
	//modalWindow.showDialog('Confirmation','Are you sure you want to delete the entry?','prompt',callBack);
}


function closeSplashScreen() {
	modalWindow.close();
}

onerror=handleErr;

function handleErr(msg,url,l)
{
	if(LOG_ESTIMATE_SUITE_JS_ERROR==true)
	{
		var txt="";
		txt="There was an error on this page.\n\n";
		txt+="Error: " + msg + "\n";
		txt+="URL: " + url + "\n";
		txt+="Line: " + l + "\n\n";
		txt+="Click OK to continue.\n\n";
		alert(txt);
	}
	try{closeSplashScreen();}catch (e) {
		// TODO: handle exception
	}
	return true;
}

/*function handleErr()
{
	closeSplashScreen();
	return true;
}*/
