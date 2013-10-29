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

import com.wanhive.system.db.AssemblyManager;
import com.wanhive.system.db.ProjectManager;


/**
 * Servlet implementation class BillAction
 */
public class BillAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public BillAction() {
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
		if(path==20420)
		{
			int estimateId;
			try
			{
				estimateId=Integer.parseInt(request.getParameter("estimateId"));
				out.println(ProjectManager.getBill(estimateId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20430)
		{
			String ids=request.getParameter("id");
			if(ids==null || ids.equalsIgnoreCase(""))
				out.println("");
			else
				out.println(ProjectManager.deleteBill(ids));
		}
		else if(path==20440)
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				String premium=request.getParameter("premium");
				String flag=request.getParameter("flag");
				out.println(ProjectManager.updatePremium(id, premium, flag));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20450)
		{
			String key=request.getParameter("key");
			String costBook=request.getParameter("cbId");
			try
			{
				int cbId=Integer.parseInt(costBook);
				if(key==null || key.equalsIgnoreCase(""))
				{
					String parent=request.getParameter("parent");
					int parentId=Integer.parseInt(parent);
					out.println(AssemblyManager.getAssemblyWithCostBook(parentId, cbId));
				}
				else
					out.println(AssemblyManager.searchAssemblyWithCostBook(key, cbId));
				
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20460)
		{	
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int estimateId=Integer.parseInt(request.getParameter("estimateId"));
				String premium=request.getParameter("premium");
				Double.parseDouble(premium);
				out.println(ProjectManager.addAssemblyToBill(id, estimateId,premium));
				
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20470)
		{	
			try
			{
				int billId=Integer.parseInt(request.getParameter("billId"));
				out.println(ProjectManager.getJobList(billId));
				
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20480)
		{
			String ids=request.getParameter("id");
			if(ids==null || ids.equalsIgnoreCase(""))
				out.println("");
			else
				out.println(ProjectManager.deleteJobs(ids));
		}
		else if(path==20490)
		{
			try
			{
				int billId=Integer.parseInt(request.getParameter("billId"));
				String description=request.getParameter("description");
				String number=request.getParameter("number");
				String length=request.getParameter("length");
				String breadth=request.getParameter("breadth");
				String height=request.getParameter("height");
				String weight=request.getParameter("weight");
				out.println(ProjectManager.addJob(billId, description, number, length, breadth, height, weight));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20500)
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				String description=request.getParameter("description");
				String number=request.getParameter("number");
				String length=request.getParameter("length");
				String breadth=request.getParameter("breadth");
				String height=request.getParameter("height");
				String weight=request.getParameter("weight");
				out.println(ProjectManager.updateJob(id, description, number, length, breadth, height, weight));
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
