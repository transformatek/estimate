/**********************************************************
 * System-Initialization Servlet
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
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.wanhive.basic.utils.licensing.Application;


/**
 * Servlet implementation class AppInit
 */
public class AppInit extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public AppInit() {
        super();
    }

	/**
	 * @see Servlet#init(ServletConfig)
	 */
	public void init(ServletConfig config) throws ServletException {
		//StringEncrypter.testUsingPassPhrase();
		//System.out.println(MD5.encrypt("abc"));
		super.init(config);
		System.out.println("Initializing basic parameters");
    	String prefix=getServletContext().getRealPath("/");
    	System.out.println("Application Started in: "+prefix);
    	//Application Configuration file
    	String file=getInitParameter("app-init-env");
    	//Database Schema File
    	String dbSchemaFile=getInitParameter("app-db-schema");
    	//Table-Data for intialization of Database
    	String dbDataFile=getInitParameter("app-db-data");
    	if(file!=null)
    	{
    		Application.init(prefix+file, prefix+dbSchemaFile, prefix+dbDataFile);
    	}
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	}

}
