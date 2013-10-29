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

import com.wanhive.system.db.ControlProjectManager;
import com.wanhive.system.db.ProjectManager;


/**
 * Servlet implementation class ControlProjectAction
 */
public class ControlProjectAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ControlProjectAction() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		PrintWriter out=response.getWriter();
		response.setContentType("text/xml");
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
			out.println("");
			return;
		}
		
		if(path==21010 || path==103100)
		{
			String key=request.getParameter("key");
			try
			{
				if(key==null || key.equalsIgnoreCase(""))
				{
					String parent=request.getParameter("parent");
					int parentId=Integer.parseInt(parent);
					out.println(ControlProjectManager.getControlProject(parentId));
				}
				else
					out.println(ControlProjectManager.searchProject(key));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==21020)
		{
			String proIds=request.getParameter("proid");
			String estIds=request.getParameter("estid");
			out.println(ControlProjectManager.deleteControlProject(proIds, estIds));
		}
		else if(path==21030 && method.equalsIgnoreCase("updateControlProject"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(ControlProjectManager.updateControlProject(id, name, description, remarks));
		}
		else if(path==21040 && method.equalsIgnoreCase("addControlProject"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(ControlProjectManager.addControlProject(id, name, description, remarks));
		}
		else if(path==21050)
		{
			String key=request.getParameter("key");
			int parentId;
			try
			{
				if(key==null || key.equalsIgnoreCase(""))
				{
					String parent=request.getParameter("parent");
					parentId=Integer.parseInt(parent);
					out.println(ProjectManager.getProject(parentId));
				}
				else
					out.println(ProjectManager.searchProject(key));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==21060)
		{	
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				System.out.println("ID:"+id);
				int controlProjectId=Integer.parseInt(request.getParameter("controlProjectId"));
				System.out.println("PROJID:"+controlProjectId);
				out.println(ControlProjectManager.addEstimateToControl(id, controlProjectId));
				
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else
			out.println("");
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
