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
import com.wanhive.system.db.ContactManager;
import com.wanhive.system.db.ControlProjectManager;
import com.wanhive.system.db.CostBookManager;
import com.wanhive.system.db.DocumentManager;
import com.wanhive.system.db.MaterialManager;
import com.wanhive.system.db.ProjectManager;
import com.wanhive.system.db.TenderManager;



/**
 * Servlet implementation class MoveAction
 */
public class MoveAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public MoveAction() {
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
		if(path==20610)
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(AssemblyManager.moveAssembly(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		if(path==20611)
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(AssemblyManager.copyAssembly(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20620 && method.equalsIgnoreCase("item"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(MaterialManager.moveItem(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20620 && method.equalsIgnoreCase("category"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(MaterialManager.moveCategory(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20630 && method.equalsIgnoreCase("cbCat"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(CostBookManager.moveCostBookCategory(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20630 && method.equalsIgnoreCase("cb"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(CostBookManager.moveCostBook(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20640 && method.equalsIgnoreCase("project"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(ProjectManager.moveProject(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20640 && method.equalsIgnoreCase("estimate"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(ProjectManager.moveEstimate(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20650)
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(ProjectManager.copyEstimate(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		
		else if(path==20660 && method.equalsIgnoreCase("controlProject"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(ControlProjectManager.moveControlProject(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20660 && method.equalsIgnoreCase("controlEstimate"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(ControlProjectManager.moveControlEstimate(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		/*else if(path==20670)
		{
			try
			{
				//int id=Integer.parseInt(request.getParameter("id"));
				//int from=Integer.parseInt(request.getParameter("pid"));
				//int to=Integer.parseInt(request.getParameter("newPid"));
				out.println("");
				//out.println(ProjectManager.copyEstimate(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}*/
		else if(path==20680 && method.equalsIgnoreCase("contactCat"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(ContactManager.moveContactCategory(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20680 && method.equalsIgnoreCase("contact"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(ContactManager.moveContact(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		//$$$: Tender Management
		else if(path==20690 && method.equalsIgnoreCase("tender"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(TenderManager.moveTenderDoc(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20690 && method.equalsIgnoreCase("tenderDir"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(TenderManager.moveTenderDirectory(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		//$$$: End of Tender management
		
		else if(path==24070 && method.equalsIgnoreCase("document"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(DocumentManager.moveDirectory(id, from, to));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==24070 && method.equalsIgnoreCase("file"))
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				int from=Integer.parseInt(request.getParameter("pid"));
				int to=Integer.parseInt(request.getParameter("newPid"));
				out.println(DocumentManager.moveReference(id, from, to));
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
