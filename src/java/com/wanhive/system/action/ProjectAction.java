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

import com.wanhive.system.db.CostBookManager;
import com.wanhive.system.db.ProjectManager;


/**
 * Servlet implementation class ProjectAction
 */
public class ProjectAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ProjectAction() {
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
		if(path==20310 || path==102100)
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
		else if(path==20320)
		{
			String proIds=request.getParameter("proid");
			String estIds=request.getParameter("estid");
			out.println(ProjectManager.deleteProject(proIds, estIds));
		}
		
		else if(path==20330 && method.equalsIgnoreCase("updateProject"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(ProjectManager.updateProject(id, name, description, remarks));
		}
		else if(path==20330 && method.equalsIgnoreCase("updateEstimate"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			String contingency=request.getParameter("contingency");
			String rndOffFigure=request.getParameter("rndOffFigure");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null || contingency==null || rndOffFigure==null)
				out.println("");
			else
				out.println(ProjectManager.updateEstimate(id, name, description, remarks,contingency,rndOffFigure));
		}
		
		else if(path==20340 && method.equalsIgnoreCase("addProject"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(ProjectManager.addProject(id, name, description, remarks));
		}
		else if(path==20340 && method.equalsIgnoreCase("addEstimate"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(ProjectManager.addEstimate(id, name, description, remarks));
		}
		else if(path==20350)
		{
			String key=request.getParameter("key");
			try
			{
				if(key==null || key.equalsIgnoreCase(""))
				{
					String parent=request.getParameter("parent");
					int parentId=Integer.parseInt(parent);
					out.println(CostBookManager.getCostBook(parentId));
				}
				else
					out.println(CostBookManager.searchCostBook(key));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20360)
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int estimateId=Integer.parseInt(request.getParameter("estimateId"));
				out.println(ProjectManager.updateEstimateCostBook(id, estimateId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		//Overheads
		else if(path==20370)
		{
			try
			{
				int estimateId=Integer.parseInt(request.getParameter("estimateId"));
				out.println(ProjectManager.getOverheadList(estimateId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20380)
		{
			try
			{
				String ids=request.getParameter("id");
				if(ids==null || ids.equalsIgnoreCase(""))
					out.println("");
				else
				out.println(ProjectManager.deleteOverheads(ids));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20390)
		{
			try
			{
				int estimateId=Integer.parseInt(request.getParameter("estimateId"));
				String description=request.getParameter("description");
				String percent=request.getParameter("percent");
				String type=request.getParameter("type");
				String amount=request.getParameter("amount");
				out.println(ProjectManager.addOverhead(estimateId, description, percent, type, amount));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20391)
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				String description=request.getParameter("description");
				String percent=request.getParameter("percent");
				String type=request.getParameter("type");
				String amount=request.getParameter("amount");
				out.println(ProjectManager.updateOverhead(id, description, percent, type, amount));
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
