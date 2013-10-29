<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
        <title>Session Expired</title>
        <style type="text/css">
            body {
                font-family: Trebuchet MS, Lucida Sans Unicode, Arial, sans-serif;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <% /*if(request.getParameter("logout")!=null)*/ session.invalidate();%>
        <fieldset><legend>Error</legend>Unable to Process Request: Your session has expired<br><font color="#ff0000">Please login again.</font></fieldset>
    </body>
</html>