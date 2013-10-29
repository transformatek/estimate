<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
        <title>Insert title here</title>
        <!-- Import all basic scripts -->
        <%@include file="scripts.jsp" %>
        <script type="text/javascript" src="script/project/definitive/billAction.js"></script>
    </head>
    <body>
        <!-- Create blank divs where UI elements will be rendered -->
        <%@include file="blank.jsp" %>
        <%@include file="onLoadScripts.jsp" %>
        <script type="text/javascript">
            openSplashScreen();									//put a veil until everything is loaded
            initCalendar();			//Initialize calendar Object

        //Initialize the first level
        //callBillAjax(<%=request.getParameter("id") + ", " + request.getParameter("cbId")%>);
            initializeBillTable(211100, <%=request.getParameter("id") + ", " + request.getParameter("cbId")%>);

        </script>
    </body>
</html>