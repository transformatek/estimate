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

import com.wanhive.system.db.DocumentManager;


/**
 * Servlet implementation class DocumentAction
 */
public class DocumentAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public DocumentAction() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		boolean isMultipart = ServletFileUpload.isMultipartContent(request);
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
			PrintWriter out=response.getWriter();
			System.out.println("Invalid Path");
			out.println("");
			return;
		}
		if(path==24010)
		{
			response.setContentType("text/xml");
			String key=request.getParameter("key");
			PrintWriter out=response.getWriter();
			try
			{
				if(key==null || key.equalsIgnoreCase(""))
				{
					String parent=request.getParameter("parent");
					int parentId=Integer.parseInt(parent);
					out.println(DocumentManager.getDocuments(parentId));
				}
				else
					out.println(DocumentManager.searchDocuments(key));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==24020)
		{
			response.setContentType("text/xml");
			String dmsIds=request.getParameter("dmsId");
			String fileIds=request.getParameter("fileId");
			PrintWriter out=response.getWriter();
			out.println(DocumentManager.deleteDocuments(dmsIds, fileIds));
		}
		
		else if(path==24030 && method.equalsIgnoreCase("updateDMS"))
		{
			response.setContentType("text/xml");
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			PrintWriter out=response.getWriter();
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(DocumentManager.updateDirectory(id, name, description, remarks));
		}
		else if(path==24030 && method.equalsIgnoreCase("updateFile"))
		{
			response.setContentType("text/xml");
			String id=request.getParameter("id");
			//String name=request.getParameter("name");
			//String description=request.getParameter("description");
			
			String remarks=request.getParameter("remarks");
			PrintWriter out=response.getWriter();
			if((id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(DocumentManager.updateFile(id, remarks));
		}
		
		else if(path==24040 && method.equalsIgnoreCase("addDms"))
		{
			response.setContentType("text/xml");
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			PrintWriter out=response.getWriter();
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(DocumentManager.addDirectory(id, name, description, remarks));
		}
		if(path==24050 && isMultipart)
		{
			response.setContentType("text/html");
			PrintWriter out=response.getWriter();
			out.println(DocumentManager.uploadReference(request));
			
		}
		else if(path==24060)
		{
			try
			{
				int fileId=Integer.parseInt(request.getParameter("fileId"));
				//response.setContentType("application/octet-stream");
				DocumentManager.downloadFile(fileId,response);
				//out.println("");
			}
			catch (Exception e) {
				PrintWriter out=response.getWriter();
				out.println("");
			}
		}
		else
		{
			response.setContentType("text/xml");
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
