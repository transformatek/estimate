<%@page import="com.wanhive.basic.utils.licensing.Application"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td class="logo" colspan="2">
            <a href="<%=Application.PRODUCTWEBSITE%>" target="_blank">
                <% String title = Application.PRODUCTNAME + " (" + Application.RELEASENAME + ") " + Application.PRODUCTVERSION;%>
                <img src="themes/icons/product/elogo2.png" alt="<%= title%>" title="<%= title%>" style="float: left; width: 174px; height: 39px; border: 0px; padding-top: 15px; padding-bottom: 15px;padding-left: 10px" />
            </a>
    </tr>
    <tr bgcolor="#2e2e2e">
        <td><font style="font-family: serif;font-size: 1.1em; color: #ffffff; font-weight: bold;">Welcome &nbsp;</font>
            <font style="font-family: monospace; font-size: 1.1em; color: #ffffff; font-weight: bold;">
            <jsp:getProperty name="currentUser" property="fullName" />
            </font>
        </td>
        <td>&nbsp;</td>
    </tr>
    <tr>
        <td style="border-right: 1px;border-color: #000000; width: 250px; background-color: #CCCCCC" valign="top">
            <fieldset>
                <br><hr style="border: 1px dashed; color: #cdcdcd">
                <font style="font-size: 1.5em; color: #0000ff">&quot;</font>Web-Based solution for Construction Cost Estimating and Generating Bill of Quantity<font style="font-size: 1.5em; color: #0000ff">&quot;</font>
                <br><hr style="border: 1px dashed; color: #cdcdcd; bo"><br>
                <font style="color: #0000ff">Product Version: </font><font style="font-family: monospace"><%=Application.PRODUCTVERSION%></font><br>
                <a href="licensing/COPYING.html" target="_blank"><font style="color: #0000ff">Copyright&copy;<%=Application.RELEASEYEAR%> </font></a><font style="font-family: monospace;font-size: 1.1em;"><%=Application.COMPANYNAME%>&nbsp;</font><br>
                <br><hr style="border: 1px dashed; color: #cdcdcd">
                <a href="http://opensource.org" target="_blank">
                    <img alt="Join Open Source" title="Open Source" src="themes/icons/product/osi-logo-trans.png" style="width: 100px; height: 114px; border: 0px;">
                </a>
            </fieldset>
        </td>
        <td valign="top"><fieldset>
                <font style="font-size: 1.5em; color: #0000ff">&quot;</font><font style="font-size: 1.1em;">Building an accurate and comprehensive estimate, for a commercial construction project can be a grueling process.</font><font style="font-size: 1.5em; color: #0000ff">&quot;</font>
                <br>
                <table width="100%" style="border: solid;border-color: #cdcdcd;border-width: 2px ">
                    <tr><td>
                            <ul style="color: #990000;font-size: 0.9em;">
                                <li style="list-style: square;">
                                    Use <%=Application.PRODUCTNAME%> to gain a competitive advantage by preparation of detailed, profitable estimates.
                                </li>
                                <li style="list-style: square;">
                                    <%=Application.PRODUCTNAME%> is suitable for a wide variety of trades and businesses, including but not limited to: General/Industrial Construction, Carpentry, Plumbing, Electrical, Tile Work, Concrete Work, Landscaping, Maintenance &amp; Repair.
                                </li>
                            </ul>
                        </td></tr>
                </table>
                <table>
                    <tr>
                        <td colspan="2"><font style="font-size: 1.2em;font-weight: bolder">Product Features</font></td>
                    </tr>
                    <tr>
                        <td valign="top">
                            <ul>
                                <li>Manage &quot;Schedule of Rates&quot; &amp; &quot;Bill of Material&quot;.</li>
                                <li>Create/manage multiple costing standards(Analysis of Rate).</li>
                                <li>Generate extensive cost-sheets with breakups and Bill of Quantity.</li>
                                <li>Create Tender Documents and carry out Bid Analysis.</li>
                            </ul>
                        </td>
                        <td valign="top">
                            <ul>
                                <li>Build a database of completed jobs for quick reference.</li>
                                <li>Import from previously stored templates.</li>
                                <li>Upload project documents to various sections for quick reference.</li>
                                <li>Define and control Project Schedule, Resource-Utilization, generate Projections.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <hr>
                        </td>
                    </tr>
                    <tr>
                        <td valign="top">
                            <ul>
                                <li>Modern compact browser-based user interface, compatible with all popular browsers.</li>
                                <li>Lets multiple users to access the system concurrently.</li>
                                <li>User Interface based on XML and AJAX for smooth browsing and rich content.</li>
                            </ul>
                        </td>
                        <td valign="top">
                            <ul>
                                <li>Application configuration management.</li>
                                <li>Define access rights of the registered users.</li>
                                <li>Simplified database administration.</li>
                                <li>Generate detailed reports containing tables and charts for easy comprehension.</li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </fieldset></td>
    </tr>
</table>