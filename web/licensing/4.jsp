<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <jsp:useBean id="license" class="com.wanhive.basic.beans.LicenseBean" scope="session"></jsp:useBean>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
            <title>Insert title here</title>
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
        <div  style="padding: 0px 5px 0px 5px; border: 0px dashed; margin-left: 5px; margin-bottom: 5px;margin-top: 5px;margin-right: 5px;border-color: #dddddd;min-height: 25px;width: 650px; background-color: #fcfcfe">
            <fieldset>
                <legend>Database Settings</legend>
                <form action="Configure?stage=5" method="post">
                    <table width='100%' class="contentTable">
                        <thead>
                            <tr>
                                <td>Parameter</td><td>Value</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Unique Name: </td><td><input type="text" name="name" value="<%=license.getDbPropertyName()%>" readonly="readonly" style="background-color: #ffaaaa" /></td></tr>
                            <tr><td>Driver Name: </td><td><input type="text" name="driver" value="<%=license.getDbDriverName()%>" size="40" readonly="readonly" style="background-color: #ffaaaa" /></td></tr>

                            <tr><td>Database URL:<br />(no backslash in the end) </td><td><input type="text" name="url" value="<%=license.getDbUrl()%>" size="40" required="1" /></td></tr>
                            <tr><td>Database Name:</td><td><input type="text" name="dbName" value="<%=license.getDbName()%>" size="40" required="1" /></td></tr>
                            <tr><td>Database User: </td><td><input type="text" name="user" value="<%=license.getDbUserName()%>" required="1" /></td></tr>
                            <tr><td>Password: </td><td><input type="text" name="password" value="<%=license.getDbUserPassword()%>" /></td></tr>
                            <tr><td>Minpool: </td><td><input type="text" name="minpool" value="<%=license.getDbMinPool()%>" required="1" /></td></tr>
                            <tr><td>MaxPool: </td><td><input type="text" name="maxpool" value="<%=license.getDbMaxPool()%>" required="1" /></td></tr>
                            <tr><td>Max Pool Size: </td><td><input type="text" name="maxsize" value="<%=license.getDbMaxSize()%>" required="1" /></td></tr>
                            <tr><td>Idle Timeout: </td><td><input type="text" name="idletimeout" value="<%=license.getDbIdleTimeOut()%>" required="1" /></td></tr>
                        </tbody>
                    </table>
                    <input type="submit" id="submitButtonId" value="Submit" />
                </form>
            </fieldset>
        </div>

        <%@include file="../onLoadScripts.jsp" %>
        <script type="text/javascript">
            openSplashScreen();			//put a veil until everything is loaded
        </script>
    </body>
</html>