<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
        <title>Insert title here</title>
        <!-- Import all basic scripts -->
        <%@include file="scripts.jsp" %>
        <script type="text/javascript" src="script/items/costbook/rateAnalysis.js"></script>
        <!-- ---------END: JS FILES--------- -->
        <style type="text/css">
            /*body {
                    margin: 5px;
                    border: 1px outset;
                    border-color: border-color :         #2e3e4e;
            }*/
        </style>
    </head>
    <body>
        <!-- Create blank divs where UI elements will be rendered -->
        <%@include file="blank.jsp" %>
        <%@include file="onLoadScripts.jsp" %>
        <script type="text/javascript">
            openSplashScreen();
            initCalendar();			//Initialize calendar Object

        //Initialize the first level
            <%= "costBookId =\"" + request.getParameter("id") + "\";"%>
            initializeAnalysisTable(210500);
            openSplashScreen();									//put a veil until everything is loaded

        </script>
    </body>
</html>