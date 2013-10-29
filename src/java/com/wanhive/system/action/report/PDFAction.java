/**********************************************************
 * Serves PDF Reports
 * Copyright (C) 2009, 2010  Amit Kumar(amitkriit@gmail.com)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 ***********************************************************/
package com.wanhive.system.action.report;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.wanhive.system.db.report.AssemblyReport;
import com.wanhive.system.db.report.BidReport;
import com.wanhive.system.db.report.BillReport;
import com.wanhive.system.db.report.ControlEstimateReport;
import com.wanhive.system.db.report.ControlProjectReport;
import com.wanhive.system.db.report.MaterialReport;
import com.wanhive.system.db.report.ProjectReport;
import com.wanhive.system.db.report.TenderReport;

//import com.wanhive.system.db.report.ControlProjectReport;

/**
 * Servlet implementation class PDFAction
 */
public class PDFAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public PDFAction() {
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
		String fileName="_PDF"+System.currentTimeMillis()+".pdf";
		ByteArrayOutputStream pdfStream=null;
		try
		{
			if(path==102600)
			{
				pdfStream=ProjectReport.getProjectSummary(request);
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(pdfStream.size());

				ServletOutputStream out=response.getOutputStream();
				pdfStream.writeTo(out);
				out.flush();
			}
			else if(path==102700)
			{
				pdfStream=BillReport.getEstimateBook(request);
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(pdfStream.size());

				ServletOutputStream out=response.getOutputStream();
				pdfStream.writeTo(out);
				out.flush();
			}
			else if(path==102800 && method.equalsIgnoreCase("estimateBoqPDF"))
			{
				pdfStream=BillReport.getBillOfQuantityBook(request);
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(pdfStream.size());

				ServletOutputStream out=response.getOutputStream();
				pdfStream.writeTo(out);
				out.flush();
			}
			else if(path==102800 && method.equalsIgnoreCase("projectBoqPDF"))
			{
				pdfStream=ProjectReport.getBillOfQuantityBook(request);
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(pdfStream.size());

				ServletOutputStream out=response.getOutputStream();
				pdfStream.writeTo(out);
				out.flush();
			}
			else if(path==100300)
			{
				pdfStream=AssemblyReport.assemblyTreePDF(request);
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(pdfStream.size());

				ServletOutputStream out=response.getOutputStream();
				pdfStream.writeTo(out);
				out.flush();
			}
			else if(path==100400)
			{
				pdfStream=AssemblyReport.assemblyMaterialPDF(request);
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(pdfStream.size());

				ServletOutputStream out=response.getOutputStream();
				pdfStream.writeTo(out);
				out.flush();
			}
			else if(path==101300)
			{
				pdfStream=MaterialReport.getMaterialList(request);
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(pdfStream.size());

				ServletOutputStream out=response.getOutputStream();
				pdfStream.writeTo(out);
				out.flush();
			}
			
			else if(path==103400)
			{
				pdfStream=ControlEstimateReport.getEstimateStatus(request);
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(pdfStream.size());

				ServletOutputStream out=response.getOutputStream();
				pdfStream.writeTo(out);
				out.flush();
			}
			else if(path==103500)
			{
				pdfStream=ControlProjectReport.getProjectStatus(request);
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(pdfStream.size());

				ServletOutputStream out=response.getOutputStream();
				pdfStream.writeTo(out);
				out.flush();
			}
			else if(path==104200)
			{
				pdfStream=TenderReport.getDNIT(request);
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(pdfStream.size());

				ServletOutputStream out=response.getOutputStream();
				pdfStream.writeTo(out);
				out.flush();
			}
			else if(path==104400)
			{
				pdfStream=BidReport.getBidAnalysisReport(request);
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");
				response.setContentLength(pdfStream.size());

				ServletOutputStream out=response.getOutputStream();
				pdfStream.writeTo(out);
				out.flush();
			}
			else
			{
				response.setContentType("text/html");
				PrintWriter out=response.getWriter();
				out.println("<fieldset><legend>Error</legend>Unable to Process Request: Unknown Command</fieldset>");
			}
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
			if(pdfStream!=null)
			{
				pdfStream.reset();
			}
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
