package com.wanhive.system.action.report;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.wanhive.system.db.report.BidReport;


/**
 * Servlet implementation class SimpleHtmlReportAction
 */
public class SimpleHtmlReportAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public SimpleHtmlReportAction() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		PrintWriter out=response.getWriter();
		response.setContentType("text/html");
		String method=request.getParameter("method");
		if(method==null)
			method="";
		System.out.println("METHOD_TO_CALL: "+method);
		int path=0;
		String pathStr=request.getParameter("path");
		try
		{
			path=Integer.parseInt(pathStr);
			System.out.println("PATH: "+path);
		}
		catch (Exception e) {
			System.out.println("Invalid Path");
			out.println("Invalid Path Requested");
			return;
		}
		try
		{
			if(path==104400)
				out.println(BidReport.getBidAnalysisHtmlReport(request));
			else
				out.println("<fieldset><legend>Error</legend>Unable to Process Request: Unknown Command</fieldset>");
		}
		catch (Exception e) {
			out.println(
					this.getClass().getName() 
					+ " caught an exception: " 
					+ e.getClass().getName()
					+ "<br>");
			out.println("<pre>");
			e.printStackTrace(out);
			out.println("</pre>");
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
