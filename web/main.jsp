<%@page import="com.wanhive.basic.utils.licensing.Application"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <link rel="shortcut icon" href="favicon.ico">
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
        <title><%=Application.PRODUCTNAME + " (" + Application.RELEASENAME + ") " + Application.PRODUCTVERSION%></title>
        <!-- Import all basic scripts -->
        <%@include file="scripts.jsp" %>
        <link rel="stylesheet" href="documentation/mainpage/css/style.css" media="screen" type="text/css">
        <style type="text/css">
            body {
                margin: 5px;
                border: 1px outset;
                border-color: #2e3e4e;
            }
        </style>
    </head>

    <body>
        <!-- $Display User Name and Local Time$ -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="left"><small><b>User:&nbsp;&nbsp;<font
                                color="#0000ff" face='Arial'><jsp:getProperty
                                    name="currentUser" property="name" />&nbsp;&nbsp;</font>[<font color="#ff0000" face='Arial'><jsp:getProperty
                                    name="currentUser" property="userIp" /></font>]</b></small></td>
                <td><span id="clock" style="float: right;"><small><font
                                color='#449944' face='Arial'><b>&nbsp;</b></font></small></span></td>
            </tr>
        </table>

        <!-- $Top Menu Bar$ -->
        <div id="northContent">
            <div id="leftMenuBarContainer">
                <div id="menuBarContainer"></div>
                <div id="rightMenuDiv"></div>
            </div>
        </div>

        <!-- This is the main div, ends at bottom -->
        <div id="mainContainer"
             style="padding: 0px 0px 0px 5px; border: 1px groove; margin-left: 22px; border-color: #dedede; margin-right: 0px">

            <!-- This DIV will contain the Breadcrumb -->
            <div id="breadcrumb"
                 style="padding: 0px 5px 0px 5px; border: 1px dashed; margin-left: 5px; margin-bottom: 5px; margin-top: 5px; margin-right: 5px; border-color: #dddddd; min-height: 25px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%"
                       height="24">
                    <tr>
                        <td valign="middle">&nbsp;Navigation: <font color="#334455"><i>Your
                                    breadcrumb &amp; help!</i></font></td>
                    </tr>
                </table>
            </div>

            <!-- $$This div's contents will be replaced$$ -->
            <div id="mainContaintsWindow"
                 style="padding: 2px 5px 2px 5px; border: 1px dotted; margin-left: 5px; margin-bottom: 5px; margin-top: 5px; margin-right: 5px; min-height: 450px; border-color: #dedede">
                <!-- $$For Testing Purpose use this Div$$ -->
                <div id="centralContent">
                    <%@include file="documentation/mainpage/product_page.jsp" %>
                </div>

                <!-- Calculator and UnitConverter -->
                <div id="utilitiesDiv" style="display: none"></div>
            </div>
            <!-- End of mainContaintsWindow Div --></div>
        <!-- End MainContainer DIV -->

        <div id="debug"></div>
        <div id="scriptsDiv"></div>

        <!-- Create MenuBar and Startup Items -->
        <%@include file="onLoadScripts.jsp" %>
        <script type="text/javascript">
            openSplashScreen();									//put a veil until everything is loaded
            callMenuAjax();			//Main Menu
            slideInMenu.menuInit();			//Init Side Menu
        //callFavouriteAjax();	//Populate List of Favourites
            initBrowserTimeDisplay();		//Initialize Timer
            initCalendar();			//Initialize Calendar Object
            contextMenu = null;
            contextMenu = new DHTMLSuite.contextMenu();
        //DHTMLSuite.commonObj.setCssCacheStatus(false);
            contextMenu.setWidth(140);
        </script>
    </body>
</html>