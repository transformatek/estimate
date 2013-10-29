package com.wanhive.system.action;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.wanhive.system.db.BidManager;
import com.wanhive.system.db.ContactManager;


/**
 * Servlet implementation class BidAction
 */
public class BidAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public BidAction() {
        super();
        // TODO Auto-generated constructor stub
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
		if(path==23020)
		{
			try
			{
				int tenderId=Integer.parseInt(request.getParameter("tenderId"));
				out.println(BidManager.getBidders(tenderId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==23030)
		{
			String ids=request.getParameter("id");
			if(ids==null || ids.equalsIgnoreCase(""))
				out.println("");
			else
				out.println(BidManager.deleteBidders(ids));
		}
		if(path==23040)
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
		else if(path==23050)
		{
			try
			{
				int contactId=Integer.parseInt(request.getParameter("contactId"));
				int tenderId=Integer.parseInt(request.getParameter("tenderId"));
				out.println(BidManager.addBidder(contactId, tenderId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==23060)
		{
			try
			{
				int bidderId=Integer.parseInt(request.getParameter("bidderId"));
				int tenderId=Integer.parseInt(request.getParameter("tenderId"));
				out.println(BidManager.getQutation(tenderId, bidderId));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==23070)
		{
			try
			{
				int itemId=Integer.parseInt(request.getParameter("itemId"));
				int bidderId=Integer.parseInt(request.getParameter("bidderId"));
				String quoteString=request.getParameter("quote");
				int basis=Integer.parseInt(request.getParameter("basis"));
				out.println(BidManager.updateQuotation(itemId, bidderId, quoteString, basis));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		if(path==104300)
		{
			try
			{
				int tenderId=Integer.parseInt(request.getParameter("tenderId"));
				out.println(BidManager.getApprovedBidders(tenderId));
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
