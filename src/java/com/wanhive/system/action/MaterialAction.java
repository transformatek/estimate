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
import com.wanhive.system.db.MaterialManager;


/**
 * Servlet implementation class MaterialAction
 */
public class MaterialAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public MaterialAction() {
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
		if(path==20110)
		{
			String key=request.getParameter("key");
			try
			{
				if(key==null || key.equalsIgnoreCase(""))
				{
					String parent=request.getParameter("parent");
					int parentId=Integer.parseInt(parent);
					out.println(MaterialManager.getMaterial(parentId));
				}
				else
					out.println(MaterialManager.searchMaterial(key));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20120)
		{
			String catIds=request.getParameter("cid");
			String itIds=request.getParameter("itid");
			out.println(MaterialManager.deleteMaterial(catIds, itIds));
		}
		
		else if(path==20130 && method.equalsIgnoreCase("updateCategory"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(MaterialManager.updateCategory(id, name, description, remarks));
		}
		else if(path==20130 && method.equalsIgnoreCase("updateItem"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String unit=request.getParameter("unit");
			String price=request.getParameter("price");
			String remarks=request.getParameter("remarks");
			String itemType=request.getParameter("itemType");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || unit==null || price==null || remarks==null || itemType==null)
				out.println("");
			else
				out.println(MaterialManager.updateItem(id, name, description, unit, price, remarks,itemType));
		}
		
		else if(path==20140 && method.equalsIgnoreCase("addCategory"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(MaterialManager.addCategory(id, name, description, remarks));
		}
		else if(path==20140 && method.equalsIgnoreCase("addItem"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String unit=request.getParameter("unit");
			String price=request.getParameter("price");
			String remarks=request.getParameter("remarks");
			String itemType=request.getParameter("itemType");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || unit==null || price==null || remarks==null || itemType==null)
				out.println("");
			else
				out.println(MaterialManager.addItem(id, name, description, unit, price, remarks,itemType));
		}
		else if(path==101100)
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
					out.println(MaterialManager.getMaterialWithCostBook(parentId, cbId));
				}
				else
					out.println(MaterialManager.searchMaterialWithCostBook(key, cbId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==101200)
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
