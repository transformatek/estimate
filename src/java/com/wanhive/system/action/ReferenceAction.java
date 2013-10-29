/**********************************************************
 * Copyright (C) 2010  Amit Kumar(amitkriit@gmail.com)
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
package com.wanhive.system.action;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.wanhive.system.db.ReferenceManager;


/**
 * Servlet implementation class ReferenceAction
 */
public class ReferenceAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ReferenceAction() {
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
		System.out.println("MULTIPART: "+ServletFileUpload.isMultipartContent(request));
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
			PrintWriter out=response.getWriter();
			out.println("");
			return;
		}
		if(path==20710)
		{
			PrintWriter out=response.getWriter();
			try
			{
				response.setContentType("text/html");
				int id=Integer.parseInt(request.getParameter("id"));
				String uploadPath=request.getParameter("uploadPath");
				try{if(uploadPath!=null)Integer.parseInt(uploadPath);}catch(Exception e){uploadPath=null;}
				boolean edit=true;
				out.println(ReferenceManager.getProjectRefForUpdate(id,edit,uploadPath));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==102400)
		{
			PrintWriter out=response.getWriter();
			try
			{
				response.setContentType("text/html");
				int id=Integer.parseInt(request.getParameter("id"));
				boolean edit=false;
				out.println(ReferenceManager.getProjectRefForUpdate(id,edit,null));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20720)
		{
			PrintWriter out=response.getWriter();
			// Check that we have a file upload request
			boolean isMultipart = ServletFileUpload.isMultipartContent(request);
			if(isMultipart)
			{
				response.setContentType("text/html");
				out.println(ReferenceManager.UploadProjectFile(request));
			}
			else
				out.println("");
		}
		else if(path==20730)
		{
			PrintWriter out=response.getWriter();
			try
			{
				int fileId=Integer.parseInt(request.getParameter("fileId"));
				response.setContentType("text/xml");
				out.println(ReferenceManager.deleteProjectFile(fileId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20740 || path==102500)
		{
			try
			{
				int fileId=Integer.parseInt(request.getParameter("fileId"));
				//response.setContentType("application/octet-stream");
				ReferenceManager.downloadProjectFile(fileId,response);
				//out.println("");
			}
			catch (Exception e) {
				PrintWriter out=response.getWriter();
				out.println("");
			}
		}
		
		else if(path==20750)
		{
			PrintWriter out=response.getWriter();
			try
			{
				response.setContentType("text/html");
				int id=Integer.parseInt(request.getParameter("id"));
				String uploadPath=request.getParameter("uploadPath");
				try{if(uploadPath!=null)Integer.parseInt(uploadPath);}catch(Exception e){uploadPath=null;}
				boolean edit=true;
				out.println(ReferenceManager.getControlProjectRefForUpdate(id,edit,uploadPath));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==103200)
		{
			PrintWriter out=response.getWriter();
			try
			{
				response.setContentType("text/html");
				int id=Integer.parseInt(request.getParameter("id"));
				
				boolean edit=false;
				out.println(ReferenceManager.getControlProjectRefForUpdate(id,edit,null));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20760)
		{
			PrintWriter out=response.getWriter();
			// Check that we have a file upload request
			boolean isMultipart = ServletFileUpload.isMultipartContent(request);
			if(isMultipart)
			{
				response.setContentType("text/html");
				out.println(ReferenceManager.UploadControlProjectFile(request));
			}
			else
				out.println("");
		}
		else if(path==20770)
		{
			PrintWriter out=response.getWriter();
			try
			{
				int fileId=Integer.parseInt(request.getParameter("fileId"));
				response.setContentType("text/xml");
				out.println(ReferenceManager.deleteControlProjectFile(fileId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20780 || path==103300)
		{
			try
			{
				int fileId=Integer.parseInt(request.getParameter("fileId"));
				//response.setContentType("application/octet-stream");
				ReferenceManager.downloadControlProjectFile(fileId,response);
				//out.println("");
			}
			catch (Exception e) {
				PrintWriter out=response.getWriter();
				out.println("");
			}
		}
		else
		{
			//System.out.println("%$%$##&%&%&%&%&%&^%&%");
			PrintWriter out=response.getWriter();
			out.println("");
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
