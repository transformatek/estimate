<%@page import="com.wanhive.basic.utils.licensing.Application"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
        <% String title = Application.PRODUCTNAME + " (" + Application.RELEASENAME + ") " + Application.PRODUCTVERSION;%>
        <title>User Guide: <%=title%></title>
    </head>
    <body style="overflow: visible;">
        <center>
            <% int pageNumber = 1;
    String pageNum = request.getParameter("page");
    try {
        pageNumber = Integer.parseInt(pageNum);
        if (pageNumber <= 0) {
            pageNumber = 1;
        }
    } catch (Exception e) {
        pageNumber = 1;
    }%>
            <% String helpUrl = "\"user_guide.pdf#pagemode=bookmarks&zoom=100&toolbar=0&scrollbar=1&page=" + pageNumber + "\"";%>
            <% /*System.out.println(helpUrl);*/%>
            <embed src=<%=helpUrl%> width="100%" height="520" type='application/pdf'/>
        </center>
    </body>
</html>