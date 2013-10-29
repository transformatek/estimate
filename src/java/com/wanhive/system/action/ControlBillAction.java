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


/**
 * Servlet implementation class ControlBillAction
 */
public class ControlBillAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ControlBillAction() {
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
		if(path==21120)
		{
			String controlEstimateId=request.getParameter("id");
			String estimateId=request.getParameter("estimateId");
			System.out.println("Estimate ID :"+estimateId+" controlEstimate ID:"+controlEstimateId);
			try
			{
				out.println(ControlProjectManager.getControlBill(estimateId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==21130)
		{
			String billId=request.getParameter("id");
			try
			{
				out.println(ControlProjectManager.getControlBillDetail(billId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==21140)
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				String sdate=request.getParameter("start");
				String fdate=request.getParameter("finish");
				int statusFlag=Integer.parseInt(request.getParameter("status"));
				out.println(ControlProjectManager.updatePlanSchedule(id,sdate,fdate,statusFlag));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==21150)
		{
			try
			{
				int entryId=Integer.parseInt(request.getParameter("entryId"));
				int controlEstimateId=Integer.parseInt(request.getParameter("controlEstimateId"));
				out.println(ControlProjectManager.getWorkDoneList(entryId,controlEstimateId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==21160)
		{
			String ids=request.getParameter("id");
			if(ids==null || ids.equalsIgnoreCase(""))
				out.println("");
			else
				out.println(ControlProjectManager.deleteWorks(ids));
		}
		else if(path==21170)
		{
			try
			{
				int entryId=Integer.parseInt(request.getParameter("entryId"));
				String description=request.getParameter("description");
				String number=request.getParameter("number");
				String length=request.getParameter("length");
				String breadth=request.getParameter("breadth");
				String height=request.getParameter("height");
				String weight=request.getParameter("weight");
				String start=request.getParameter("start");
				String finish=request.getParameter("finish");
				int controlEstimateId=Integer.parseInt(request.getParameter("controlEstimateId"));
				out.println(ControlProjectManager.addWork(entryId, description, number, length, breadth, height, weight,start,finish,controlEstimateId));
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
