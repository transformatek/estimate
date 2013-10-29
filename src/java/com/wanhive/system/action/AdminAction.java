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
import javax.servlet.http.HttpSession;

import com.wanhive.basic.beans.User;
import com.wanhive.system.db.UserManager;



/**
 * Servlet implementation class AdminAction
 */
public class AdminAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public AdminAction() {
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
		
		if(path==20810)
		{
			HttpSession session=request.getSession();
			User user=(User)session.getAttribute("currentUser");
			if(user==null)
			{
				out.println("");
				return;
			}
			String newPassword=request.getParameter("newPassword");
			String oldPassword=request.getParameter("oldPassword");
			if(newPassword==null || newPassword.length()==0)
				out.println("");
			else if(oldPassword==null || oldPassword.length()==0)
				out.println("");
			else
				out.println(UserManager.changeUserPassword(user, newPassword,oldPassword));
		}
		else if(path==20820)
		{
			HttpSession session=request.getSession();
			User user=(User)session.getAttribute("currentUser");
			if(user==null)
			{
				out.println("");
				return;
			}
			String theme=request.getParameter("newTheme");
			if(theme==null || theme.length()==0)
				theme="default";
			out.println(UserManager.changeUserTheme(user, theme));
		}
		else if(path==20910)
		{
			out.println(UserManager.getUsers());
		}
		else if(path==20920)
		{
			String ids=request.getParameter("userIds");
			if(ids==null || ids.equalsIgnoreCase(""))
				out.println("");
			else
				out.println(UserManager.deleteUsers(ids));
		}
		else if(path==20930)
		{
			String userId=request.getParameter("userId");
			String userName=request.getParameter("name");
			String employeeCode=request.getParameter("employeeCode");
			String remarks=request.getParameter("remarks");
			if((userId==null || userId.length()==0) || (userName==null || userName.length()==0)
					|| (employeeCode==null || employeeCode.length()==0) || (remarks==null || remarks.length()==0))
				out.println("");
			else
				out.println(UserManager.addNewUser(userId, userName, employeeCode, remarks));
		}
		else if(path==20940)
		{
			String userId=request.getParameter("userId");
			String menuParent=request.getParameter("parent");
			try
			{
				Integer.parseInt(userId);
				Integer.parseInt(menuParent);
			}
			catch (Exception e) {
				out.println("");
				return;
			}
			out.println(UserManager.getUserMenu(userId, menuParent));
		}
		else if(path==20950)
		{
			String userId=request.getParameter("userId");
			String menuId=request.getParameter("menuId");
			String permission=request.getParameter("permission");
			try
			{
				Integer.parseInt(userId);
				Integer.parseInt(menuId);
				Integer.parseInt(permission);
			}
			catch (Exception e) {
				out.println("");
				return;
			}
			out.println(UserManager.updateMenuPermission(userId, menuId, permission));
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
