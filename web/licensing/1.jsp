<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@page import="com.wanhive.basic.utils.licensing.Application"%>
<html>
    <head>
        <link rel="shortcut icon" href="favicon.ico" />
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
        <title>License Agreement: <%=Application.PRODUCTNAME + " (" + Application.RELEASENAME + ") " + Application.PRODUCTVERSION%></title>
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
        <div style="padding: 0px 5px 0px 5px; border: 0px dashed; margin-left: 5px; margin-bottom: 5px;margin-top: 5px;margin-right: 5px;border-color: #dddddd;min-height: 25px;width: 650px; background-color: #fcfcfe">
            <fieldset>
                <legend>LICENSE AGREEMENT</legend>
                <iframe name="licAgreement" id="licAgreement" height="400" width="600" src="licensing/COPYING.html"></iframe>
                <br></br>
                <form action="Configure" method="post" onsubmit="document.getElementById('submitButtonId').disabled = true;">
                    <label>Agree</label><input type="radio" name="agreement" value="0" onclick="document.getElementById('submitButtonId').disabled = false;" checked="checked">
                    &nbsp;&nbsp;&nbsp;<label>Disagree</label><input type="radio" name="agreement" value="1" onclick="document.getElementById('submitButtonId').disabled = true;">
                    <input type="hidden" name="stage" value="2">
                    <input type="submit" id="submitButtonId" value="Next">
                </form>
            </fieldset>
        </div>

        <%@include file="../onLoadScripts.jsp" %>
        <script type="text/javascript">
            openSplashScreen();									//put a veil until everything is loaded
        </script>
    </body>
</html>