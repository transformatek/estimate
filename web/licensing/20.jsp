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
                <legend>Application Settings</legend>
                <form action="Configure?stage=21" method="post">
                    <table width='100%' class="contentTable">
                        <thead>
                            <tr>
                                <td>Parameter</td><td>Value</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>License Key: </td>
                                <td>
                                    <%
                                        String[] keyStr = new String[5];
                                        String licenseKey = license.getLicenseKey();
                                        if (licenseKey == null || licenseKey.length() < 25) {
                                            for (int i = 0; i < 5; i++) {
                                                keyStr[i] = "XXXXX";
                                            }
                                        } else {
                                            keyStr[0] = licenseKey.substring(0, 5);
                                            keyStr[1] = licenseKey.substring(5, 10);
                                            keyStr[2] = licenseKey.substring(10, 15);
                                            keyStr[3] = licenseKey.substring(15, 20);
                                            keyStr[4] = licenseKey.substring(20, 25);
                                        }
                                    %>
                                    <input type="text" name="licenseKey1" size="5" value="<%=keyStr[0]%>" style="background-color: #aaaaff" maxlength="5" required="1" />&nbsp;
                                    <input type="text" name="licenseKey2" size="5" value="<%=keyStr[1]%>" style="background-color: #aaaaff" maxlength="5" required="1" />&nbsp;
                                    <input type="text" name="licenseKey3" size="5" value="<%=keyStr[2]%>" style="background-color: #aaaaff" maxlength="5" required="1" />&nbsp;
                                    <input type="text" name="licenseKey4" size="5" value="<%=keyStr[3]%>" style="background-color: #aaaaff" maxlength="5" required="1" />&nbsp;
                                    <input type="text" name="licenseKey5" size="5" value="<%=keyStr[4]%>" style="background-color: #aaaaff" maxlength="5" required="1" />
                                </td></tr>


                            <tr><td>Number of Licenses: </td><td><input type="text" name="numLic" size="4" value="<%=license.getNumberOfLicenses()%>" style="background-color: #aaaaff" required="1" /></td></tr>
                            <tr><td>Licensed To: </td><td><input type="text" name="licensedTo" size="40" value="<%=license.getUserName()%>" required="1" /></td></tr>
                            <tr><td>Email ID: </td><td><input type="text" name="email" size="40" value="<%=license.getEmail()%>" required="1" /></td></tr>

                            <tr><td>Organization: </td><td><input type="text" name="organization" size="40" value="<%=license.getOrganization()%>" required="1" /></td></tr>
                            <tr><td>Contact Address: </td><td><textarea rows="5" cols="40" name="contactAddress"  required="1"><%=license.getAddress()%></textarea></td></tr>
                            <tr><td>Contact Number: </td><td><input type="text" name="contactNumber" size="30" value="<%=license.getPhone()%>" required="1" /></td></tr>
                            <tr><td>Website: </td><td><input type="text" name="website" size="40" value="<%=license.getWebsite()%>" required="1" /></td></tr>
                            <tr style="display: none;"><td>Register User (Your contact information will be sent to the server): </td><td><input type="radio" name="register" value="1" />Yes&nbsp;&nbsp;&nbsp;<input type="radio" name="register" value="0" checked="checked" />No</td></tr>
                        </tbody>
                    </table>
                    <input type="submit" id="submitButtonId" value="Submit" />
                </form>
            </fieldset>
        </div>

        <%@include file="../onLoadScripts.jsp" %>
        <script type="text/javascript">
            openSplashScreen();									//put a veil until everything is loaded
        </script>
    </body>
</html>