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
import com.wanhive.system.db.MaterialManager;


/**
 * Servlet implementation class CostBookAction
 */
public class CostBookAction extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public CostBookAction() {
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
		if(path==20210)
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
		else if(path==20211)
		{
			//System.out.println(""+path);
			String key=request.getParameter("key");
			try
			{
				String parent=request.getParameter("parent");
				String assembly=request.getParameter("asmId");
				String flag=request.getParameter("flag");
				int asmId=Integer.parseInt(assembly);
				if(key==null || key.equalsIgnoreCase(""))
				{
					int parentId=Integer.parseInt(parent);
					//System.out.println("GET");
					if(flag!=null && flag.equalsIgnoreCase("1"))
						out.println(CostBookManager.getCostBookAssemblyAnalysis(parentId,asmId));
					else if(flag!=null && flag.equalsIgnoreCase("2"))
						out.println(CostBookManager.getCostBookAssemblyOverhead(parentId, asmId));
					else
						out.println("");
				}
				else
				{
					//System.out.println("SEARCH");
					if(flag!=null && flag.equalsIgnoreCase("1"))
						out.println(CostBookManager.searchCostBookAssemblyAnalysis(key,asmId));
					else if(flag!=null && flag.equalsIgnoreCase("2"))
						out.println(CostBookManager.searchCostBookAssemblyOverhead(key, asmId));
					else {
						//System.out.println("FLAG ERROR");
						out.println("");
					}
				}

			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20220)
		{
			String cbCatIds=request.getParameter("cbcatid");
			String cbIds=request.getParameter("cbid");
			out.println(CostBookManager.deleteCostBook(cbCatIds, cbIds));
		}

		else if(path==20230 && method.equalsIgnoreCase("updateCbCat"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(CostBookManager.updateCostBookCategory(id, name, description, remarks));
		}
		else if(path==20230 && method.equalsIgnoreCase("updateCb"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(CostBookManager.updateCostBookItem(id, name, description, remarks));
		}

		else if(path==20240 && method.equalsIgnoreCase("addCbCat"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(CostBookManager.addCostBookCategory(id, name, description, remarks));
		}
		else if(path==20240 && method.equalsIgnoreCase("addCb"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(CostBookManager.addCostBookItem(id, name, description, remarks));
		}
		else if(path==20250 && method.equalsIgnoreCase("getAssemblyCost"))
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
		
		else if(path==20250 && method.equalsIgnoreCase("getMaterialUsed"))
		{
			try
			{
				String costBook=request.getParameter("cbId");
				int cbId=Integer.parseInt(costBook);
				out.println(CostBookManager.getMaterialUsed(cbId));
			}
			catch (Exception e) {
				out.println("");
			}	
		}
		else if(path==20260)
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
		else if(path==20261)
		{
			String costBookId=request.getParameter("costBookId");
			String asmId=request.getParameter("asmId");
			out.println(CostBookManager.getAssemblyAnalysis(costBookId, asmId));
		}
		else if(path==20270)
		{
			String id=request.getParameter("id");
			String cbId=request.getParameter("cbId");
			String price=request.getParameter("price");
			//String premium=request.getParameter("premium");
			String flag=request.getParameter("flag");
			if((id==null || id.equalsIgnoreCase("")) || (cbId==null || cbId.equalsIgnoreCase("")))
				out.println("");
			else
				out.println(CostBookManager.updateMaterialCostbook(id, cbId, price, flag));
		}
		else if(path==20271)
		{
			String ids=request.getParameter("id");
			if(ids==null || ids.equalsIgnoreCase(""))
				out.println("");
			else
				out.println(CostBookManager.deleteMaterialCostbook(ids));
		}
		else if(path==20280)
		{
			String id=request.getParameter("id");
			String fraction=request.getParameter("fraction");
			String price=request.getParameter("price");
			out.println(CostBookManager.updateMaterialVolume(id,fraction,price));
		}
		else if(path==20281)
		{
			String id=request.getParameter("id");
			String cbId=request.getParameter("costBookId");
			String price=request.getParameter("price");
			String asmId=request.getParameter("asmId");
			String fraction=request.getParameter("fraction");
			if((id==null || id.equalsIgnoreCase("")) || (cbId==null || cbId.equalsIgnoreCase("")))
				out.println("");
			else
				out.println(CostBookManager.addMaterialToAnalysis(id, cbId, price, asmId,fraction));
		}
		else if(path==20282/*  && method.equalsIgnoreCase("importMaterialToAnalysis")*/)
		{
			String fromCbId=request.getParameter("fromCostBookId");
			String toCbId=request.getParameter("toCostBookId");
			String asmId=request.getParameter("asmId");
			int flag=method.equalsIgnoreCase("importMaterialToAnalysis")?1:2;
			out.println(CostBookManager.importFromCostBook(fromCbId,toCbId,asmId,flag));
		}
		/*else if(path==20282  && method.equalsIgnoreCase("importOverheadsToAnalysis"))
		{
			String fromCbId=request.getParameter("fromCostBookId");
			String toCbId=request.getParameter("toCostBookId");
			String asmId=request.getParameter("asmId");
			out.println(CostBookManager.importFromCostBook(fromCbId,toCbId,asmId,2));
		}*/
		else if(path==20283)
		{
			String asmId=request.getParameter("asmId");
			String cbId=request.getParameter("cbId");
			String multiplier=request.getParameter("multiplier");
			out.println(CostBookManager.updateRateMultiplier(asmId, cbId, multiplier));
		}
		else if(path==20284)
		{
			String costBookId=request.getParameter("costBookId");
			String asmId=request.getParameter("asmId");
			out.println(CostBookManager.getAssemblyOverheads(costBookId, asmId));
		}
		else if(path==20285)
		{
			String ids=request.getParameter("id");
			if(ids==null || ids.equalsIgnoreCase(""))
				out.println("");
			else
				out.println(CostBookManager.deleteAssemblyOverhead(ids));
		}
		else if(path==20286)
		{
			try
			{
				int asmId=Integer.parseInt(request.getParameter("asmId"));
				int cbId=Integer.parseInt(request.getParameter("cbId"));
				String name=request.getParameter("name");
				String description=request.getParameter("description");
				String amount=request.getParameter("amount");
				out.println(CostBookManager.addAssemblyOverhead(asmId, cbId, name, description, amount));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20287)
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				String name=request.getParameter("name");
				String description=request.getParameter("description");
				String amount=request.getParameter("amount");
				out.println(CostBookManager.updateAssemblyOverhead(id, name, description, amount));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20290)
		{
			try
			{
				int cbId=Integer.parseInt(request.getParameter("cbId"));
				out.println(CostBookManager.getAssembliesUsed(cbId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==20291)
		{
			String cbId=request.getParameter("cbId");
			String asmId=request.getParameter("asmId");
			String ids=request.getParameter("ids");
			String volumes=request.getParameter("volumes");
			int flag=method.equalsIgnoreCase("importResourcesFromAssemblies")?1:2;
			out.println(CostBookManager.importFromAssemblies(cbId, asmId, ids, volumes,flag));
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
