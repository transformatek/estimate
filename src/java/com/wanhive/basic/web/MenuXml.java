/**********************************************************
 * Menus(UI)
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
package com.wanhive.basic.web;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.wanhive.basic.beans.User;
import com.wanhive.basic.db.MenuManager;


/**
 * Servlet implementation class MenuXml
 */
public class MenuXml extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public MenuXml() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		PrintWriter out=response.getWriter();
		response.setContentType("text/xml");
		HttpSession session=request.getSession();
		User user=(User)session.getAttribute("currentUser");
		if(user==null)
		{
			out.println("");
			session.invalidate();
			return;
		}
		String method=request.getParameter("method");
		if(method==null)
			method="";
		//System.out.println(method);
		if(method.equalsIgnoreCase("getmainmenu"))
		{
			String xml="<menuManager>";
			xml+=MenuManager.getMainMenu();
			xml+=MenuManager.getMainMenuPermissions(user.getId());
			xml+="</menuManager>";
			out.println(xml);
			//MenuManager.getContextMenu(1, user.getId(), null);
		}
		else if(method.equalsIgnoreCase("getmenu"))
		{
			int menuParentId=0;
			try{menuParentId=Integer.parseInt(request.getParameter("id"));}catch (Exception e) {}
			String xml=MenuManager.getContextMenu(menuParentId, user.getId(), null);
			out.println(xml);
			//out.println("<status flag=\"INVALIDPATH\" />");
		}
		else
		{
			out.println("<status flag=\"INVALIDPATH\" />");
		}
		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
