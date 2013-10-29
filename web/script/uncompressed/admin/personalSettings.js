/**********************************************************
 * Change personal settings like password, preferred theme for user-interface
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

var TAB_CONTAINER_OUTER_DIV_NAME="blankContent";
var TAB_CONTAINER_DIV_NAME="tabContainerDiv";

var PASSWORD_CONTAINER_DIV_NAME="passwordDiv";
var THEME_CONTAINER_DIV_NAME="themeDiv";
var tabViewObj=null;
var initTabs=function() {
	if(document.getElementById(TAB_CONTAINER_OUTER_DIV_NAME)==null) return;
	document.getElementById(TAB_CONTAINER_OUTER_DIV_NAME).innerHTML="<div id='"+
	TAB_CONTAINER_DIV_NAME+"'>"+"<div id='"+
		PASSWORD_CONTAINER_DIV_NAME+"' class='DHTMLSuite_aTab'>Password</div>"+
		"<div id='"+
		THEME_CONTAINER_DIV_NAME+"' class='DHTMLSuite_aTab'>Themes</div>"+"</div>";
	
	initPasswordTab();
	initThemesTab();
	tabViewObj = new DHTMLSuite.tabView();
	tabViewObj.setParentId('tabContainerDiv');
	tabViewObj.setTabTitles(Array('Change Password','Select Theme'));
	tabViewObj.setIndexActiveTab(0);
	tabViewObj.setWidth('100%');
	tabViewObj.setHeight('500');
	tabViewObj.init();
};

var initPasswordTab=function() {
	var str="<table border='0'>"+"<tr><td><label>Old Password:</label></td>"+
					"<td><input type='password' id='oldPassword'></td></tr>";
	str+="<tr><td><label>New Password:</label></td>"+
	"<td><input type='password' id='newPassword'></td></tr>";
	str+="<tr><td><label>Repeat Password:</label></td>"+
	"<td><input type='password' id='repeatPassword'></td></tr>";
	str+="<tr><td align='right'><a href='javascript:void(0)' onclick='changePassword(true)'>Update</a></td>";
	str+="<td><a href='javascript:void(0)' onclick='changePassword(false)'>Discard</a></td></tr>";
	str+="</table>";
	document.getElementById(PASSWORD_CONTAINER_DIV_NAME).innerHTML=str;
};

var initThemesTab=function() {
	var str="<fieldset><legend>System Themes</legend><br><table border='0'><tr>";
	str+="<td bgcolor='#C3DAF9'><a href='javascript:void(0)' onclick='callChangeThemeAjax(\"blue\")'>Blue</a></td>";
	str+="<td>&nbsp;&nbsp;</td>";
	str+="<td bgcolor='#ebf2f8'><a href='javascript:void(0)' onclick='callChangeThemeAjax(\"cyan\")'>Cyan</a></td>";
	str+="<td>&nbsp;&nbsp;</td>";
	str+="<td bgcolor='#cdcdcd'><a href='javascript:void(0)' onclick='callChangeThemeAjax(\"gray\")'>Gray</a></td>";
	str+="<td>&nbsp;&nbsp;</td>";
	str+="<td bgcolor='#666'><a href='javascript:void(0)' onclick='callChangeThemeAjax(\"zune\")'><font color='#ffffff'>Zune</font></a></td>";
	str+="</tr></table></fieldset>";
	str+="<small><br>You will have to login again for change to take effect";
	str+="<br>You may need to clean browser's cache for change to take effect</small>";
	document.getElementById(THEME_CONTAINER_DIV_NAME).innerHTML=str;
};

var changePassword=function(flag) {
	if(flag==true)
	{
		var oldPassword=document.getElementById('oldPassword').value;
		var newPassword=document.getElementById('newPassword').value;
		var repeatPassword=document.getElementById('repeatPassword').value;
		
		if(oldPassword==null || oldPassword=="")
		{
			alert("Old Password Field cannot be left blank");
			document.getElementById('oldPassword').focus();
			return;
		}
		else if(newPassword==null || newPassword=="")
		{
			alert("New Password Field cannot be left blank");
			document.getElementById('newPassword').focus();
			return;
		}
		else if(repeatPassword==null || repeatPassword=="")
		{
			alert("Re-enter new Password");
			document.getElementById('repeatPassword').focus();
			return;
		}
		else if(repeatPassword!=newPassword)
		{
			alert("New Passwords do not match");
			document.getElementById('newPassword').value="";
			document.getElementById('repeatPassword').value="";
			document.getElementById('newPassword').focus();
			return;
		}
		callChangePasswordAjax(newPassword,oldPassword);
	}
	else
	{
		document.getElementById('oldPassword').value="";
		document.getElementById('newPassword').value="";
		document.getElementById('repeatPassword').value="";
	}
};

var callChangePasswordAjax=function(newPassword,oldPassword) {
	var myChangePasswordRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20810+"&newPassword="+URLEncode(newPassword)+"&oldPassword="+URLEncode(oldPassword)+"&method="+"changePassword";
	
	myChangePasswordRequest.open("GET",url,true);
	myChangePasswordRequest.onreadystatechange=function() {
		if(myChangePasswordRequest.readyState==4) {
			if(myChangePasswordRequest.status==200) {
				var xmlDoc=myChangePasswordRequest.responseXML;
				var statusFlag=null;
				if(xmlDoc!=null)
					statusFlag=xmlDoc.getElementsByTagName("status");
				if((statusFlag!=null && statusFlag.length>0) && statusFlag[0].getAttribute("flag")=="OK") {
					document.getElementById('oldPassword').value="";
					document.getElementById('newPassword').value="";
					document.getElementById('repeatPassword').value="";
					alert("Password changed successfully to: "+newPassword);
				}
				else if((statusFlag!=null && statusFlag.length>0) && statusFlag[0].getAttribute("flag")=="INVALIDPASS")
				{
					alert("Old Password provide was invalid");
					document.getElementById('oldPassword').focus();
					document.getElementById('newPassword').value="";
					document.getElementById('repeatPassword').value="";
				}
				
				else {
					alert("Change Password: An Error Occured/Please check access permissions");
				}
			}
			else {
				alert("Connection Problem:"+myChangePasswordRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	
	closeSplashScreen();
	myChangePasswordRequest.send(null);
};

var callChangeThemeAjax=function(theme) {
	var myChangeThemeRequest=getHTMLHTTPRequest();
	var myRandom=parseInt(Math.random()*99999999);
	var url=myServerAddress+"MyXMLDispatcher?rand="+myRandom+"&path="+20820+"&newTheme="+URLEncode(theme)+"&method="+"changeTheme";
	
	myChangeThemeRequest.open("GET",url,true);
	myChangeThemeRequest.onreadystatechange=function() {
		if(myChangeThemeRequest.readyState==4) {
			if(myChangeThemeRequest.status==200) {
				var xmlDoc=myChangeThemeRequest.responseXML;
				var statusFlag=null;
				if(xmlDoc!=null)
					statusFlag=xmlDoc.getElementsByTagName("status");
				if((statusFlag!=null && statusFlag.length>0) && statusFlag[0].getAttribute("flag")=="OK") {
					
					alert("Theme changed successfully to: "+theme);
				}
				
				else {
					alert("Change Theme: An Error Occured/Please check access permission");
				}
			}
			else {
				alert("Connection Problem:"+myChangeThemeRequest.statusText);
			}
			closeSplashScreen();
		}
	};
	
	closeSplashScreen();
	myChangeThemeRequest.send(null);
};
initTabs();
