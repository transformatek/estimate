<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@page import="com.wanhive.basic.utils.licensing.Application"%>
<html>
    <head>
        <link rel="shortcut icon" href="favicon.ico" />
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
        <title>Application Settings: <%=Application.PRODUCTNAME + " (" + Application.RELEASENAME + ") " + Application.PRODUCTVERSION%></title>
        <%@include file="scripts.jsp" %>
        <script type="text/javascript" src="script/licensing/config.js"></script>

        <style type="text/css">
            body {
                margin: 5px;
                /*border: 1px outset;*/
                /*border-color: border-color :         #2e3e4e;*/
            }
        </style>
    </head>
    <body>
        <div  style="padding: 0px 5px 0px 5px; border: 0px dashed; margin-left: 5px; margin-bottom: 5px;margin-top: 5px;margin-right: 5px;border-color: #dddddd;min-height: 25px;width: 650px; background-color: #fcfcfe">
            <fieldset>
                <legend>
                    Configuration
                </legend>
                <table class="contentTable">
                    <thead>
                        <tr>
                            <td><a href="javascript:void(0);" onclick="loadWindowInIframe('confWindowId', 'Configure?stage=4', 'Configure Database Settings');">Database Settings</a></td><td><a href="javascript:void(0);" onclick="loadWindowInIframe('confWindowId', 'Configure?stage=20', 'Licensing');">Application Settings</a></td>
                            <td><a href="index.jsp">Home</a></td>
                        </tr>
                    </thead>
                </table>
            </fieldset>

        </div>
        <div id="confWindowId" style="display: none;"></div>

        <%@include file="../onLoadScripts.jsp" %>
        <script type="text/javascript">
            openSplashScreen();
        </script>
    </body>
</html>