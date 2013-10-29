<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@page import="com.wanhive.basic.utils.licensing.Application"%>
<html>
    <head>
        <link rel="shortcut icon" href="favicon.ico" />
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
        <title>System Settings: <%=Application.PRODUCTNAME + " (" + Application.RELEASENAME + ") " + Application.PRODUCTVERSION%></title>
        <%@include file="scripts.jsp" %>

        <style type="text/css">
            body {
                margin: 5px;
                /*border: 1px outset;*/
                /*border-color: border-color :         #2e3e4e;*/
            }
        </style>
    </head>
    <body>
        <% String image = "";%>
        <% String errImage = "images/common/cross.gif";%>
        <% String noErrImage = "images/common/tick.gif";%>
        <% int errorCode = Application.isLicDirectoryConfigured();%>
        <div  style="padding: 0px 5px 0px 5px; border: 0px dashed; margin-left: 5px; margin-bottom: 5px;margin-top: 5px;margin-right: 5px;border-color: #dddddd;min-height: 25px;width: 650px; background-color: #fcfcfe">
            <fieldset>
                <legend>SYSTEM SETTINGS</legend>
                <table class="contentTable" width="100%">
                    <thead><tr><td>Particular</td><td>Status</td></tr></thead>
                    <tbody>
                        <tr>
                            <td> Environment Variable <%=Application.ENVVARNAME%> Exists: </td>
                            <td>
                                <% if (errorCode != 0 && errorCode <= 1) {
        image = errImage;
    } else {
        image = noErrImage;
    }%>
                                <img src="<%=image%>"></img>
                            </td>
                        </tr>
                        <tr>
                            <td>License Path [<%if (errorCode == 0 || errorCode != 1) {
        out.print(Application.getApplicationEnv(Application.ENVVARNAME));
    } else {
        out.print("--");
    }%>] is a writable Directory: </td>
                            <% if (errorCode != 0 && errorCode <= 4) {
        image = errImage;
    } else {
        image = noErrImage;
    }%>
                            <td>
                                <img src="<%=image%>" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <form action="Configure" method="post" onsubmit="document.getElementById('submitButtonId').disabled = true;">
                    <input type="hidden" name="stage" value="3">
                    <input type="hidden" name="error" value="<%=errorCode%>">
                    <input type="submit" id="submitButtonId" value="<%if (errorCode == 0) {
        out.print("Next");
    } else {
        out.print("Retry");
    }%>" />
                </form>
            </fieldset>
        </div>

        <%@include file="../onLoadScripts.jsp" %>
        <script type="text/javascript">
            openSplashScreen();									//put a veil until everything is loaded
        </script>
    </body>
</html>