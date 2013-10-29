package com.wanhive.system.action;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.wanhive.system.db.ProjectManager;
import com.wanhive.system.db.TenderManager;


/**
 * Servlet implementation class TenderAction
 */
public class TenderAction extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public TenderAction() {
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
		if(path==22010 || path==104100)
		{
			String key=request.getParameter("key");
			try
			{
				if(key==null || key.equalsIgnoreCase(""))
				{
					String parent=request.getParameter("parent");
					int parentId=Integer.parseInt(parent);
					out.println(TenderManager.getTenderDocuments(parentId));
				}
				else
					out.println(TenderManager.searchTender(key));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==22020)
		{
			String tenderDirIds=request.getParameter("tenderDirId");
			String tenderIds=request.getParameter("tenderId");
			out.println(TenderManager.deleteTenders(tenderDirIds, tenderIds));
		}
		else if(path==22030 && method.equalsIgnoreCase("updateTenderDir"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(TenderManager.updateTenderDirectory(id, name, description, remarks));
		}
		else if(path==22030 && method.equalsIgnoreCase("updateTenderDoc"))
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			
			String amount=request.getParameter("amount");
			String earnestMoney=request.getParameter("earnestMoney");
			String timeLimit=request.getParameter("timeLimit");
			String openDate=request.getParameter("openDate");
			String status=request.getParameter("status");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null
					|| amount==null || earnestMoney==null || timeLimit==null || openDate==null || status==null)
				out.println("");
			else
				out.println(TenderManager.updateTenderDocument(id, name, description, remarks, amount, earnestMoney, timeLimit, openDate, status));
		}
		else if(path==22040)
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null)
				out.println("");
			else
				out.println(TenderManager.addTenderDirectory(id, name, description, remarks));
		}
		else if(path==22050)
		{
			String key=request.getParameter("key");
			int parentId;
			try
			{
				if(key==null || key.equalsIgnoreCase(""))
				{
					String parent=request.getParameter("parent");
					parentId=Integer.parseInt(parent);
					out.println(ProjectManager.getProject(parentId));
				}
				else
					out.println(ProjectManager.searchProject(key));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==22060)
		{
			String id=request.getParameter("id");
			String name=request.getParameter("name");
			String description=request.getParameter("description");
			String remarks=request.getParameter("remarks");
			
			String amount=request.getParameter("amount");
			String earnestMoney=request.getParameter("earnestMoney");
			String timeLimit=request.getParameter("timeLimit");
			String openDate=request.getParameter("openDate");
			//String status=request.getParameter("status");
			String projectId=request.getParameter("projectId");
			if(name==null || description==null ||(id==null || id.equalsIgnoreCase("")) || remarks==null
					|| amount==null || earnestMoney==null || timeLimit==null || openDate==null || (projectId==null || projectId.equalsIgnoreCase("")))
				out.println("");
			else
				out.println(TenderManager.addTenderDocument(id, name, description, remarks, amount, earnestMoney, timeLimit, openDate, projectId));
		}
		else if(path==22070)
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("tenderId"));
				out.println(TenderManager.getTenderNotes(id));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==22071)
		{
			try
			{
				String ids=request.getParameter("id");
				if(ids==null || ids.equalsIgnoreCase(""))
					out.println("");
				else
				out.println(TenderManager.deleteTenderNotes(ids));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==22072)
		{
			try
			{
				int id=Integer.parseInt(request.getParameter("id"));
				String description=request.getParameter("description");
				out.println(TenderManager.updateTenderNote(id, description));
			}
			catch (Exception e) {
				out.println("");
			}
		}
		else if(path==22073)
		{
			try
			{
				int tenderId=Integer.parseInt(request.getParameter("tenderId"));
				String description=request.getParameter("description");
				out.println(TenderManager.addTenderNote(tenderId, description));
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
