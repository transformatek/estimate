<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <jsp:useBean id="license" class="com.wanhive.basic.beans.LicenseBean" scope="session"></jsp:useBean>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
            <title>Insert title here</title>

            <!-- ---------START: CSS FILES--------- -->
            <link rel="stylesheet" href="themes/css/basic.css" media="screen"
                  type="text/css">
            <!-- ---------END: CSS FILES--------- -->


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
                    <legend>Database Settings Updated</legend>
                    <table width='100%' class="contentTable">
                        <thead>
                            <tr>
                                <td>Parameter</td><td>Value</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Unique Name: </td><td><%=license.getDbPropertyName()%></td></tr>
                        <tr><td>Driver Name: </td><td><%=license.getDbDriverName()%></td></tr>

                        <tr><td>Database URL: </td><td><%=license.getDbUrl()%></td></tr>
                        <tr><td>Database Name: </td><td><%=license.getDbName()%></td></tr>
                        <tr><td>Database User: </td><td><%=license.getDbUserName()%></td></tr>
                        <tr><td>Password: </td><td><%=license.getDbUserPassword()%></td></tr>
                        <tr><td>Minpool: </td><td><%=license.getDbMinPool()%></td></tr>
                        <tr><td>MaxPool: </td><td><%=license.getDbMaxPool()%></td></tr>
                        <tr><td>Max Pool Size: </td><td><%=license.getDbMaxSize()%></td></tr>
                        <tr><td>Idle Timeout: </td><td><%=license.getDbIdleTimeOut()%></td></tr>
                    </tbody>
                </table>
            </fieldset>
            <br>
            <fieldset>
                <legend>Setup</legend>
                <a href="Configure?stage=6" target="resultFrame">Test Connection</a>&nbsp;&nbsp;<a href="Configure?stage=7" target="resultFrame" onclick="return confirm('Do you really want to Initialize/Reset the Application Database?')">Initialize Database</a>
            </fieldset>
            <iframe name="resultFrame" style="height: 30px;width: 100%;border-width: 0px"></iframe>
        </div>
    </body>
</html>