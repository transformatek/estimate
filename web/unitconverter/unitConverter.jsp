<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
        <title>Insert title here</title>
        <style type="text/css">
            body {
                font-family: Trebuchet MS, Lucida Sans Unicode, Arial, sans-serif;
                font-size: 0.8em;
            }  
        </style>
    </head>
    <body>
        <center>
            <applet
                codebase = "applet/" 
                archive  = "junitconv.jar" 
                code     = "com.tecnick.junitconv.JUnitConv.class" 
                name     = "junitconv"
                id       = "junitconv"
                alt      = "junitconv example"
                width    = "600"
                height   = "400"
                hspace   = "0"
                vspace   = "0"
                align    = "top"
                >
                <param name="background_color" value="DDDDDD" />
                <param name="foreground_color" value="000000" />
                <param name="background_image" value="" />
                <param name="font" value="Arial,Verdana,Helvetica" />
                <param name="font_style" value="PLAIN" />
                <param name="font_size" value="12" />
                <param name="encoding" value="utf-8" />
                <param name="page_encoding" value="iso-8859-1" />
                <param name="labels_data_file" value="applet/labels.txt" />
                <param name="multiplier_data_file" value="applet/muldata.txt" />
                <param name="categories_data_file" value="applet/catdata.txt" />
                <param name="units_data_file" value="applet/unitdata.txt" />
                <div>Java applet is not enabled/supported in this browser&nbsp;&nbsp;<a href="http://www.java.com/en/download/">Get java</a></div>
            </applet>
        </center>
    </body>
</html>