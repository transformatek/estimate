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
import com.wanhive.system.db.CostBookManager;


/**
 * Servlet implementation class AssemblyAction
 */
public class AssemblyAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public AssemblyAction() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//try{Thread.sleep(7000);}catch (Exception e) {}
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
		
		if(path==20010)
		{
			String key=request.getParameter("key");
			try
			{
				if(key==null || key.equalsIgnoreCase(""))
				{
					String parent=request.getParameter("parent");
					int parentId=Integer.parseInt(parent);
					out.println(AssemblyManager.getAssembly(parentId));
				}
				else
					out.println(AssemblyManager.searchAssemblies(key));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20020)
		{
			String ids=request.getParameter("id");
			if(ids==null || ids.equalsIgnoreCase(""))
				out.println("");
			else
				out.println(AssemblyManager.deleteAssembly(ids));
		}
		else if(path==20030)
		{
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String id=request.getParameter("id");
			String unit=request.getParameter("unit");
			String price=request.getParameter("price");
			String premium=request.getParameter("premium");
			String remarks=request.getParameter("remarks");
			String displayUnit=request.getParameter("displayUnit");
			String priceMultiplier=request.getParameter("priceMultiplier");
			//try {Double.parseDouble(priceMultiplier);} catch(Exception e) {out.println("");return;}
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || unit==null || price==null || premium==null || remarks==null || displayUnit==null || priceMultiplier==null)
				out.println("");
			else
				out.println(AssemblyManager.updateAssembly(id, name, description, unit, price, premium, remarks,displayUnit,priceMultiplier));
		}
		else if(path==20040)
		{
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String id=request.getParameter("id");
			String unit=request.getParameter("unit");
			String price=request.getParameter("price");
			String premium=request.getParameter("premium");
			String remarks=request.getParameter("remarks");
			String displayUnit=request.getParameter("displayUnit");
			String priceMultiplier=request.getParameter("priceMultiplier");
			//try {Double.parseDouble(priceMultiplier);} catch(Exception e) {out.println("");return;}
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || unit==null || price==null || premium==null || remarks==null || displayUnit==null || priceMultiplier==null)
				out.println("");
			else
				out.println(AssemblyManager.addAssembly(id, name, description, unit, price, premium, remarks,displayUnit,priceMultiplier));
		}
		/*else if(path==20050)
		{
			String parentStr=request.getParameter("parent");
			String key=request.getParameter("key");
			String assemblyIdStr=request.getParameter("asmId");
			try
			{
				int assemblyId=Integer.parseInt(assemblyIdStr);
				if(key==null || key.equalsIgnoreCase(""))
				{
					int parent=Integer.parseInt(parentStr);
					out.println(AssemblyManager.getMaterialList(parent, assemblyId));
				}
				else
				{
					out.println(AssemblyManager.searchMaterialList(key, assemblyId));
				}
			}
			catch (Exception e) {
				out.println("");
			}
		}*/
		/*else if(path==20060)
		{
			String id=request.getParameter("id");
			String asmId=request.getParameter("asmId");
			String fraction=request.getParameter("fraction");
			String flag=request.getParameter("flag");
			if((id==null || id.equalsIgnoreCase("")) || (asmId==null || asmId.equalsIgnoreCase("")))
				out.println("");
			else
				out.println(AssemblyManager.updateMaterialList(id, asmId, fraction, flag));
		}*/
		else if(path==100100)
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
		else if(path==100200)
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
