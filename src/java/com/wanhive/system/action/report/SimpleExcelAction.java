package com.wanhive.system.action.report;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
//import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class SimpleExcelAction
 */
public class SimpleExcelAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public SimpleExcelAction() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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
			response.setContentType("text/html");
			PrintWriter writer=response.getWriter();
			writer.println("Invalid Path Requested");
			return;
		}
		//String fileName="_XSL"+System.currentTimeMillis()+".pdf";
		ByteArrayOutputStream exlStream=null;
		
		try
		{
			/*if(path==104400)
			{
				exlStream=ExcelBidReport.getBidAnalysisReport(request);
				response.setContentType("application/vnd.ms-excel");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(exlStream.size());

				ServletOutputStream out=response.getOutputStream();
				exlStream.writeTo(out);
				out.flush();
			}*/
		}
		catch (Exception e) {
			response.setContentType("text/html");
			PrintWriter writer=response.getWriter();
			writer.println(
					this.getClass().getName() 
					+ " caught an exception: " 
					+ e.getClass().getName()
					+ "<br>");
			writer.println("<pre>");
			e.printStackTrace(writer);
			writer.println("</pre>");
		}
		finally
		{
			if(exlStream!=null)
			{
				exlStream.reset();
			}
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		super.doPost(request, response);
	}

}
