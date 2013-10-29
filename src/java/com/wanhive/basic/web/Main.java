/**********************************************************
 * Main Page(user is redirected to this page after login)
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

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.wanhive.basic.beans.User;
import com.wanhive.basic.db.MenuManager;
import com.wanhive.basic.utils.licensing.Application;
import com.wanhive.basic.utils.licensing.SessionCounter;
import com.wanhive.basic.utils.logger.SystemLogger;


/**
 * Servlet implementation class Main
 */
public class Main extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Main() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//try{Thread.sleep(7000);}catch (Exception e) {}
		//Verify UserName and Password, if OK let in
		//SessionCounter.limitMaxSessions();
		//System.out.println("Max Sessions Allowed: "+SessionCounter.getMaxActiveSessions());
		String user=request.getParameter("id");
		String password=request.getParameter("password");
		String userIp=request.getRemoteAddr();
		HttpSession session=request.getSession();
		User userBean=null;
		if(!SessionCounter.limitReached())
		{
			userBean=MenuManager.verifyUser(user, password);	//VERIFY
		}
		else {
			System.out.println("Limit on maximum number of active Sessions has reached");
			response.sendRedirect("index.jsp?status=1");
			return;
		}
		if(userBean==null)
		{
			Application.writeLog("Access denied to UserID: ["+user+"] from: "+userIp, SystemLogger.WARN);
			response.sendRedirect("index.jsp?status=2");
		}
		else
		{
			userBean.setUserIp(userIp);
			session.setAttribute("currentUser", userBean);
			session.setMaxInactiveInterval(60*Application.SESSIONTIMEOUT);
			RequestDispatcher dispatcher=request.getRequestDispatcher("main.jsp");
			dispatcher.forward(request, response);
			Application.writeLog("User: ["+userBean.getName()+"] #"+userBean.getId()+" logged in from: "+userBean.getUserIp());
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
