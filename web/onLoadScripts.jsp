<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<script  type="text/javascript">
    window.onload = function() {
        if (DHTMLSuite.commonObj == null)
            DHTMLSuite.createStandardObjects();
        DHTMLSuite.commonObj.loadCSS("basic.css");	//Load basic CSS(THEME)
        internalWindow.setControls(false, null);
        //initFormValidation();
        closeSplashScreen();
    };
</script>