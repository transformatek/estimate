<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@page import="com.wanhive.basic.db.DataSourceManager"%><html>
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
        <%int result = DataSourceManager.initializeDatabase(license);%>
        <%if (result == 0) {
        out.print("<b><font color='#0000ff'>Database Initialized</font></b>");
    } else {
        out.print("<b><font color='#ff0000'>Database Initialization Failed</font></b>");
    }%>
    </body>
</html>