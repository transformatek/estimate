/**********************************************************
 * System-Configuration Servlet(writes Database and Session configurations)
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

import com.wanhive.basic.beans.LicenseBean;
import com.wanhive.basic.utils.licensing.Application;


/**
 * Servlet implementation class Configure
 */
public class Configure extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public Configure() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String stage=request.getParameter("stage");
		if(stage==null)
			stage="1";
		int currentStage=0;
		//int lastStage=0;
		request.getSession().setMaxInactiveInterval(60*10);
		try{currentStage=Integer.parseInt(stage);}catch (Exception e) {}
		if(!(request.getRemoteAddr().equalsIgnoreCase("127.0.0.1") || request.getRemoteAddr().equalsIgnoreCase("0:0:0:0:0:0:0:1")))
		{
			RequestDispatcher dispatcher=request.getRequestDispatcher("defaultContent.jsp");
			dispatcher.forward(request, response);
			return;
		}
		HttpSession session=request.getSession();
		LicenseBean lic=new LicenseBean() ;
		if(currentStage==1) {
			Application.lastStage=currentStage;
			RequestDispatcher dispatcher=request.getRequestDispatcher("licensing/1.jsp");
			dispatcher.forward(request, response);
			return;
		}
		//Here admin accepts license agreement
		else if(currentStage==2) {
			boolean acceptFlag=request.getParameter("agreement")!=null && request.getParameter("agreement").equalsIgnoreCase("0");
			if(!Application.eulaAccepted)
				Application.eulaAccepted=acceptFlag;
			if(Application.eulaAccepted) {
				System.out.println("License Agreement Accepted");
				RequestDispatcher dispatcher=request.getRequestDispatcher("licensing/2.jsp");
				dispatcher.forward(request, response);
			}
			else {
				RequestDispatcher dispatcher=request.getRequestDispatcher("licensing/1.jsp");
				dispatcher.forward(request, response);
			}
			return;
		}
		//Here person moves to main config page
		//If there is any problem with license directory, we redirect to the same page
		else if(currentStage==3 && Application.eulaAccepted) {
			Application.licErrorFlag=Application.isLicDirectoryConfigured()!=0;
			if(Application.licErrorFlag) {
				System.out.println("Problem exists with Environment variable/Lic-Path");
				RequestDispatcher dispatcher=request.getRequestDispatcher("licensing/2.jsp");
				dispatcher.forward(request, response);
			}
			else {
				lic=Application.loadLicense();
				session.setAttribute("license", lic);
				RequestDispatcher dispatcher=request.getRequestDispatcher("licensing/3.jsp");
				dispatcher.forward(request, response);
			}
			return;
		}
		else if(currentStage==4 && !Application.licErrorFlag) {
			RequestDispatcher dispatcher;
			if(session.getAttribute("license")==null)
				dispatcher=request.getRequestDispatcher("licensing/errorPage.jsp");
			else
				dispatcher=request.getRequestDispatcher("licensing/4.jsp");
			dispatcher.forward(request, response);
		}
		else if(currentStage==5 && !Application.licErrorFlag) {
			String name=request.getParameter("name");
			String driver=request.getParameter("driver");
			String url=request.getParameter("url");
			String dbName=request.getParameter("dbName");
			String user=request.getParameter("user");
			String password=request.getParameter("password");
			String minPool=request.getParameter("minpool");
			String maxPool=request.getParameter("maxpool");
			String maxSize=request.getParameter("maxsize");
			String idleTimeOut=request.getParameter("idletimeout");
			
			boolean error=Application.setupDbParameters((LicenseBean)session.getAttribute("license"), name, driver, url, dbName,user, password, minPool, maxPool, maxSize, idleTimeOut);
			RequestDispatcher dispatcher;
			if(error)
				dispatcher=request.getRequestDispatcher("licensing/errorPage.jsp");
			else
				dispatcher=request.getRequestDispatcher("licensing/5.jsp");
			dispatcher.forward(request, response);
		}
		else if(currentStage==6 && !Application.licErrorFlag) {
			RequestDispatcher dispatcher;
			dispatcher=request.getRequestDispatcher("licensing/6.jsp");
			dispatcher.forward(request, response);
		}
		else if(currentStage==7 && !Application.licErrorFlag) {
			RequestDispatcher dispatcher;
			dispatcher=request.getRequestDispatcher("licensing/7.jsp");
			dispatcher.forward(request, response);
		}
		else if(currentStage==20 && !Application.licErrorFlag) {
			RequestDispatcher dispatcher;
			if(session.getAttribute("license")==null)
				dispatcher=request.getRequestDispatcher("licensing/errorPage.jsp");
			else
				dispatcher=request.getRequestDispatcher("licensing/20.jsp");
			dispatcher.forward(request, response);
		}
		else if(currentStage==21 && !Application.licErrorFlag) {
			String licenseKey=request.getParameter("licenseKey1");
			licenseKey+=request.getParameter("licenseKey2");
			licenseKey+=request.getParameter("licenseKey3");
			licenseKey+=request.getParameter("licenseKey4");
			licenseKey+=request.getParameter("licenseKey5");
			
			String numLic=request.getParameter("numLic");
			String licensedTo=request.getParameter("licensedTo");
			String email=request.getParameter("email");
			String organization=request.getParameter("organization");
			String contactAddress=request.getParameter("contactAddress");
			String contactNumber=request.getParameter("contactNumber");
			String website=request.getParameter("website");
			String registerFlag=request.getParameter("register");
			
			boolean registrationAllowed=registerFlag!=null && registerFlag.equalsIgnoreCase("1");
			
			boolean error=Application.setupLicenseParameters((LicenseBean)session.getAttribute("license"), licenseKey, numLic, licensedTo, email, organization, contactAddress, contactNumber, website, registrationAllowed);
			
			RequestDispatcher dispatcher;
			if(error)
				dispatcher=request.getRequestDispatcher("licensing/errorPage.jsp");
			else
				dispatcher=request.getRequestDispatcher("licensing/21.jsp");
			dispatcher.forward(request, response);
		}
		else {
			RequestDispatcher dispatcher=request.getRequestDispatcher("licensing/errorPage.jsp");
			dispatcher.forward(request, response);
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
}
