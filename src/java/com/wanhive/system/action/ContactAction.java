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

import com.wanhive.system.db.ContactManager;


/**
 * Servlet implementation class ContactAction
 */
public class ContactAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ContactAction() {
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
		if(path==30020)
		{
			String key=request.getParameter("key");
			try
			{
				if(key==null || key.equalsIgnoreCase(""))
				{
					String parent=request.getParameter("parent");
					int parentId=Integer.parseInt(parent);
					out.println(ContactManager.getContact(parentId));
				}
				else
					out.println(ContactManager.searchContact(key));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==30030)
		{
			String cbCatIds=request.getParameter("contactCatId");
			String cbIds=request.getParameter("contactId");
			out.println(ContactManager.deleteContact(cbCatIds, cbIds));
		}
		
		else if(path==30040 && method.equalsIgnoreCase("updateContactCat"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(ContactManager.updateContactCategory(id, name, description, remarks));
		}
		else if(path==30040 && method.equalsIgnoreCase("updateContact"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String address=request.getParameter("address");
			String number=request.getParameter("number");
			String website=request.getParameter("website");
			String email=request.getParameter("email");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null || address==null || number==null || website==null || email==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(ContactManager.updateContactItem(id, name, description,address,number,website,email, remarks));
		}
		
		else if(path==30050 && method.equalsIgnoreCase("addContactCat"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(ContactManager.addContactCategory(id, name, description, remarks));
		}
		else if(path==30050 && method.equalsIgnoreCase("addContact"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String address=request.getParameter("address");
			String number=request.getParameter("number");
			String website=request.getParameter("website");
			String email=request.getParameter("email");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null || address==null || number==null || website==null || email==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(ContactManager.addContactItem(id, name, description,address,number,website,email, remarks));
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
