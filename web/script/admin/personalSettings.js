var TAB_CONTAINER_OUTER_DIV_NAME="blankContent";var TAB_CONTAINER_DIV_NAME="tabContainerDiv";var PASSWORD_CONTAINER_DIV_NAME="passwordDiv";var THEME_CONTAINER_DIV_NAME="themeDiv";var tabViewObj=null;var initTabs=function(){if(document.getElementById(TAB_CONTAINER_OUTER_DIV_NAME)==null){return}document.getElementById(TAB_CONTAINER_OUTER_DIV_NAME).innerHTML="<div id='"+TAB_CONTAINER_DIV_NAME+"'><div id='"+PASSWORD_CONTAINER_DIV_NAME+"' class='DHTMLSuite_aTab'>Password</div><div id='"+THEME_CONTAINER_DIV_NAME+"' class='DHTMLSuite_aTab'>Themes</div></div>";initPasswordTab();initThemesTab();tabViewObj=new DHTMLSuite.tabView();tabViewObj.setParentId("tabContainerDiv");tabViewObj.setTabTitles(Array("Change Password","Select Theme"));tabViewObj.setIndexActiveTab(0);tabViewObj.setWidth("100%");tabViewObj.setHeight("500");tabViewObj.init()};var initPasswordTab=function(){var a="<table border='0'><tr><td><label>Old Password:</label></td><td><input type='password' id='oldPassword'></td></tr>";a+="<tr><td><label>New Password:</label></td><td><input type='password' id='newPassword'></td></tr>";a+="<tr><td><label>Repeat Password:</label></td><td><input type='password' id='repeatPassword'></td></tr>";a+="<tr><td align='right'><a href='javascript:void(0)' onclick='changePassword(true)'>Update</a></td>";a+="<td><a href='javascript:void(0)' onclick='changePassword(false)'>Discard</a></td></tr>";a+="</table>";document.getElementById(PASSWORD_CONTAINER_DIV_NAME).innerHTML=a};var initThemesTab=function(){var a="<fieldset><legend>System Themes</legend><br><table border='0'><tr>";a+="<td bgcolor='#C3DAF9'><a href='javascript:void(0)' onclick='callChangeThemeAjax(\"blue\")'>Blue</a></td>";a+="<td>&nbsp;&nbsp;</td>";a+="<td bgcolor='#ebf2f8'><a href='javascript:void(0)' onclick='callChangeThemeAjax(\"cyan\")'>Cyan</a></td>";a+="<td>&nbsp;&nbsp;</td>";a+="<td bgcolor='#cdcdcd'><a href='javascript:void(0)' onclick='callChangeThemeAjax(\"gray\")'>Gray</a></td>";a+="<td>&nbsp;&nbsp;</td>";a+="<td bgcolor='#666'><a href='javascript:void(0)' onclick='callChangeThemeAjax(\"zune\")'><font color='#ffffff'>Zune</font></a></td>";a+="</tr></table></fieldset>";a+="<small><br>You will have to login again for change to take effect";a+="<br>You may need to clean browser's cache for change to take effect</small>";document.getElementById(THEME_CONTAINER_DIV_NAME).innerHTML=a};var changePassword=function(a){if(a==true){var c=document.getElementById("oldPassword").value;var d=document.getElementById("newPassword").value;var b=document.getElementById("repeatPassword").value;if(c==null||c==""){alert("Old Password Field cannot be left blank");document.getElementById("oldPassword").focus();return}else{if(d==null||d==""){alert("New Password Field cannot be left blank");document.getElementById("newPassword").focus();return}else{if(b==null||b==""){alert("Re-enter new Password");document.getElementById("repeatPassword").focus();return}else{if(b!=d){alert("New Passwords do not match");document.getElementById("newPassword").value="";document.getElementById("repeatPassword").value="";document.getElementById("newPassword").focus();return}}}}callChangePasswordAjax(d,c)}else{document.getElementById("oldPassword").value="";document.getElementById("newPassword").value="";document.getElementById("repeatPassword").value=""}};var callChangePasswordAjax=function(e,d){var b=getHTMLHTTPRequest();var c=parseInt(Math.random()*99999999);var a=myServerAddress+"MyXMLDispatcher?rand="+c+"&path="+20810+"&newPassword="+URLEncode(e)+"&oldPassword="+URLEncode(d)+"&method=changePassword";b.open("GET",a,true);b.onreadystatechange=function(){if(b.readyState==4){if(b.status==200){var g=b.responseXML;var f=null;if(g!=null){f=g.getElementsByTagName("status")}if((f!=null&&f.length>0)&&f[0].getAttribute("flag")=="OK"){document.getElementById("oldPassword").value="";document.getElementById("newPassword").value="";document.getElementById("repeatPassword").value="";alert("Password changed successfully to: "+e)}else{if((f!=null&&f.length>0)&&f[0].getAttribute("flag")=="INVALIDPASS"){alert("Old Password provide was invalid");document.getElementById("oldPassword").focus();document.getElementById("newPassword").value="";document.getElementById("repeatPassword").value=""}else{alert("Change Password: An Error Occured/Please check access permissions")}}}else{alert("Connection Problem:"+b.statusText)}closeSplashScreen()}};closeSplashScreen();b.send(null)};var callChangeThemeAjax=function(c){var d=getHTMLHTTPRequest();var b=parseInt(Math.random()*99999999);var a=myServerAddress+"MyXMLDispatcher?rand="+b+"&path="+20820+"&newTheme="+URLEncode(c)+"&method=changeTheme";d.open("GET",a,true);d.onreadystatechange=function(){if(d.readyState==4){if(d.status==200){var f=d.responseXML;var e=null;if(f!=null){e=f.getElementsByTagName("status")}if((e!=null&&e.length>0)&&e[0].getAttribute("flag")=="OK"){alert("Theme changed successfully to: "+c)}else{alert("Change Theme: An Error Occured/Please check access permission")}}else{alert("Connection Problem:"+d.statusText)}closeSplashScreen()}};closeSplashScreen();d.send(null)};initTabs();