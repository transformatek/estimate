/**********************************************************
 * DISPATCHER: ALl commands must be sent through this interface(returns XML)
 * Copyright (C) 2009, 2010  Amit Kumar(amitkriit@gmail.com)
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
package com.wanhive.basic.web;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.wanhive.basic.beans.User;
import com.wanhive.basic.db.MenuManager;
import com.wanhive.basic.utils.licensing.Application;


/**
 * Servlet implementation class MyXMLDispatcher
 */
public class MyXMLDispatcher extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public MyXMLDispatcher() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		HttpSession session=request.getSession();
		PrintWriter out=response.getWriter();
		String link="";
		User user=(User)session.getAttribute("currentUser");
		String menuId=request.getParameter("path");
		String method=request.getParameter("method");
		if(user==null)
		{
			response.setContentType("text/xml");
			out.print("<status flag=\"SESSIONERROR\" />");
			session.invalidate();
			return;
		}
		else
		{
			int id=0;
			try{id=Integer.parseInt(menuId);}catch(Exception e){}
			link=MenuManager.appLink(id,user.getId());
			if(link==null || link.equalsIgnoreCase(""))
			{
				Application.writeLog("Access Denied for ["+user.getName()+"]: "+" to PATH:"+menuId+", METHOD:"+method);
				System.out.println("Invalid Path");
				response.setContentType("text/xml");
				out.print("<status flag=\"INVALIDPATH\" />");
				return;
			}
			else
			{
				Application.writeLog("["+user.getName()+"]: accessing"+" PATH:"+menuId+" METHOD:"+method);
				System.out.println("Redirecting to: "+link);
				RequestDispatcher dispatcher=request.getRequestDispatcher(link);
				dispatcher.forward(request, response);
			}
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
