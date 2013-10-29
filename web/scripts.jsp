<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<jsp:useBean id="currentUser" type="com.wanhive.basic.beans.User" scope="session"></jsp:useBean>
    <!-- ---------START: CSS FILES--------- -->
    <!-- Basic CSS -->
    <link rel="stylesheet" href="themes/css/basic.css" media="screen" type="text/css">
    <!-- ---------END: CSS FILES--------- -->

    <!-- ---------START: JS FILES--------- -->
<%String theme = currentUser.getTheme();%>

<script type="text/javascript">
//Set the theme
    <%= "var DHTML_SUITE_THEME =\"" + theme + "\";"%>
//Set whether JS error must be reported, or silently ignored
    var LOG_ESTIMATE_SUITE_JS_ERROR = false;
</script>
<script type="text/javascript" src="themes/js/globalDefs.js"></script>
<script type="text/javascript" src="themes/js/common.js"></script>
<!-- For Menu and Common Components -->
<script type="text/javascript">
    DHTMLSuite.include("basics"); //Basic Libraries
    DHTMLSuite.include("menus"); //Basic Visual Elements
    DHTMLSuite.include("windows"); //Modal/DHTML Windows
    DHTMLSuite.include("tabs"); //Modal/DHTML Windows
    DHTMLSuite.include("calendar");	//Calendar
</script>
<!-- ---------END: JS FILES--------- -->