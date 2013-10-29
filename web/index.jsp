<%-- 
    Document   : index.jsp
    Created on : Sep 21, 2013, 2:41:56 AM
    Author     : amit
--%>

<%@page import="com.wanhive.basic.utils.licensing.Application"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@page import="com.wanhive.basic.utils.licensing.SessionCounter"%><html>
    <head>
        <link rel="shortcut icon" href="favicon.ico" />
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
        <META http-equiv="Page-Enter" CONTENT="RevealTrans(Duration=1,Transition=23)">
        <% String title=Application.PRODUCTNAME + " (" + Application.RELEASENAME + ") " + Application.PRODUCTVERSION;%>
        <title><%=title%></title>
        <link rel="stylesheet" href="themes/css/basic.css" media="screen" type="text/css">
        <style type="text/css">
            .CSSButton {
                border: 1px solid #1D4675;
                background: -webkit-gradient( linear, left top, left bottom, color-stop(0, #A9D1E0), color-stop(0.73, #225289) );
                background: -moz-linear-gradient( center top, #A9D1E0 0%, #225289 73% );
                filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#A9D1E0', endColorstr='#225289');
                background-color: #A9D1E0;
                -moz-box-shadow: inset 0px 1px 2px 0px #FFFFFF;
                -webkit-box-shadow: inset 0px 1px  2px 0px #FFFFFF;
                box-shadow: inset 0px 1px  2px 0px #FFFFFF;
                -moz-border-radius: 6px;
                -webkit-border-radius: 6px;
                border-radius: 4px;
                text-shadow: 1px 1px 2px #000000;
                font-weight: bold;
                margin: 5px 5px;
                padding: 2px 5px;
                color: #FFFFFF;
                letter-spacing: 0px;
                font-family: 'Arial', sans-serif;
                font-size: 14px;
                /*width: 80px;*/
                text-transform: capitalize;
                text-align: center;
                text-decoration: none;
                cursor: pointer;
                display: inline-block;
            }
            .CSSButton:hover {
                background: -webkit-gradient( linear, left top, left bottom, color-stop(0, #225289), color-stop(0.73, #A9D1E0) );
                background: -moz-linear-gradient( center top, #225289 0%, #A9D1E0 73% );
                filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#225289', endColorstr='#A9D1E0');
                background-color: #225289;
            }
            .CSSButton:active {
                position: relative;
                top: 1px;
                left: 0px;
            }

            .logo {
                font-size:26px;
                color: #ffffff;
                font-weight:bold;
                text-decoration:none;

            }

            .footer, .footer a {
                font-size:11px;
                font-weight: normal;
                text-decoration:none;
                color: #ffffff;
                font-style: normal;
            }

            .footer a:hover {
                text-decoration:underline;
            }
            .foot {
                font-size:12px;
                font-weight: normal;
                text-decoration:none;
                color: #ffffff;
                font-style: normal;
            }

            .text1 {
                font-size:12px;
                font-weight: bold;
                text-decoration:none;
                color: #0D367B;
                font-style: normal;
                padding-left:0px;
            }

            .text2 {
                font-size:12px;
                font-weight: normal;
                text-decoration:none;
                color: #222222;
                font-style: normal;
                padding-left:0px;
            }

            .text3, .text3 a {
                font-size:12px;
                font-weight: normal;
                text-decoration:none;
                color: #C15B00;
                font-style: normal;
            }

            .text3 a:hover {
                color: #E67300;
            }

            .text4 {
                font-size:16px;
                font-weight:bold;
                text-decoration:none;
                color: #FF8000;
                font-style: normal;
                padding-left:5px;
            }

            .text5 {
                font-size:12px;
                font-weight: bold;
                text-decoration:none;
                color: #222222;
                font-style: normal;
                line-height:25px;
            }

            .text6 {
                font-size:11px;
                font-weight: normal;
                text-decoration:none;
                color: #555555;
                font-style: normal;
                padding-left:0px;
                padding-right:0px;
            }
        </style>
    </head>
    <body>
        <!-- TOP -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td bgcolor="#FFFFFF"><table width="960" border="0" align="center" cellpadding="0" cellspacing="0">
                        <tr>
                            <td bgcolor="#FFFFFF"><a href="<%= Application.PRODUCTWEBSITE%>" target="_blank"><img alt="<%= title%>" title="<%= title%>" src="themes/icons/product/elogo.png" width="199" height="47" /></a></td>
                        </tr>
                    </table></td>
            </tr>
            <tr>
                <td height="30" bgcolor="#2e2e2e">&nbsp;</td>
            </tr>
        </table>
        <% /*if(request.getParameter("logout")!=null)*/ session.invalidate();%>
        <!-- LEFT -->

        <table width="960" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#ffffff">
            <tr>
                <td align="left" valign="top" style="background-image:url(themes/icons/product/bg.jpg); background-repeat:repeat-y;" height="400"><table width="99%" border="0" align="center" cellpadding="2" cellspacing="0">

                        <tr>
                            <td colspan="2" align="left" valign="top" class="text6" >&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2" align="left" valign="top" class="text6" >&nbsp;</td>
                        </tr>
                        <tr>
                            <td width="57%" align="left" valign="top" class="text6" ><table width="400" border="0" align="center" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td width="133" align="left" valign="bottom" class="logo">ESTIMATE</td>
                                        <td width="21" height="35" align="left" valign="top" class="footer">&nbsp;</td>
                                        <td width="77" align="left" valign="bottom" class="footer"><%=Application.RELEASENAME%> v<%=Application.PRODUCTVERSION%></td>
                                        <td width="169" align="left" valign="bottom" class="footer">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td colspan="4">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td height="100" colspan="4" align="left" valign="top" class="footer"><strong>Web Based Solution for Construction Cost<br />
                                                Estimation and Generating Bill of Quantity</strong></td>
                                    </tr>
                                    <tr>
                                        <td height="20" colspan="4" align="left" valign="middle" class="footer"><span class="foot"><img alt="" src="themes/icons/product/dot.png" width="8" height="10" />&nbsp; Create/Manage Schedules and Analysis of Rates. </span></td>
                                    </tr>
                                    <tr>
                                        <td height="20" colspan="4" class="footer"><span class="foot"><img alt="" src="themes/icons/product/dot.png" width="8" height="10" /> &nbsp;Manage Projects, Archives &amp; Documents. </span></td>
                                    </tr>
                                    <tr>
                                        <td height="20" colspan="4" class="footer"><span class="foot"><img alt="" src="themes/icons/product/dot.png" width="8" height="10" /> &nbsp;Generate extensive Cost Sheets with breakups &amp; Bill of Quantity.</span></td>
                                    </tr>
                                </table></td>
                            <td width="43%" align="left" valign="top" class="text6" >
                                <form id="login-form" action="Main" method="post">
                                    <table width="300" border="0" cellspacing="0" cellpadding="5" bgcolor="#CCCCCC" style="border:#FFF solid 1px;">
                                        <tr>
                                            <td colspan="3" align="center" class="text5">Login</td>
                                        </tr>
                                        <tr>
                                            <td width="21" align="left" valign="top" class="text2">&nbsp;</td>
                                            <td width="67" align="left" valign="middle" class="text2"><label>Username</label></td>
                                            <td width="180" align="left" valign="top"><input name="id" type="text" /></td>
                                        </tr>
                                        <tr>
                                            <td align="left" valign="top" class="text2">&nbsp;</td>
                                            <td align="left" valign="middle" class="text2"><label>Password</label></td>
                                            <td align="left" valign="top">
                                                <input name="password" type="password" /></td>
                                        </tr>
                                        <tr>
                                            <td colspan="2" align="left" valign="top">&nbsp;</td>
                                            <td align="left" valign="middle">
                                                <!--<span class="CSSButton" onclick="document.forms['login-form'].submit()">Login</span>-->
                                                <input type="submit" value="Login" class="CSSButton">
                                            </td>
                                        </tr>
                                        <%
                                            String loginError = request.getParameter("status");
                                            if (loginError == null) {
                                                //loginError = "&nbsp;";
                                            } else if (loginError.equalsIgnoreCase("1")) {
                                                loginError = "Limit reached: Cannot create a new session";
                                            } else if (loginError.equalsIgnoreCase("2")) {
                                                loginError = "Invalid Username/Password";
                                            }

                                            if (loginError != null) {
                                        %>
                                        <tr>
                                            <td colspan="3"  align="center" valign="top"><font style="color: red; font-weight: bold;"><%=loginError%></font></td>
                                        </tr>
                                        <% }%>
                                        <tr>
                                            <td colspan="3" align="left" valign="top">
                                                <label>Number of Active Users: </label><b><%= SessionCounter.getActiveSessionCount()%>/<%= SessionCounter.getMaxActiveSessions()%></b>
                                                <% //System.out.println(request.getRemoteAddr()); %>
                                                <% if (request.getRemoteAddr().equalsIgnoreCase("127.0.0.1") || request.getRemoteAddr().equalsIgnoreCase("0:0:0:0:0:0:0:1")) {%>
                                                &nbsp;&nbsp;<a href="Configure">Configure</a>
                                                <% }%>
                                            </td>
                                        </tr>
                                    </table>
                                </form></td>
                        </tr>
                    </table></td>
            </tr>
            <tr>
                <td align="center" valign="top"><span class="text6">
                        Copyright&copy; <a href="licensing/COPYING.html" target="_blank"><%=Application.RELEASEYEAR%></a>&nbsp;<a href="<%=Application.COMPANYWEBSITE%>" target="_blank"><%=Application.COMPANYNAME%></a>. All rights reserved.
                    </span></td>
            </tr>
            <tr>
                <td align="center" valign="top">&nbsp;</td>
            </tr>
        </table>
    </body>
</html>
