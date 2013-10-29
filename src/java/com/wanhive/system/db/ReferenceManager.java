/**********************************************************
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
package com.wanhive.system.db;


import java.io.DataInputStream;


import java.io.InputStream;
import java.io.OutputStream;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;

import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;

import com.wanhive.basic.db.DataSourceManager;




public class ReferenceManager {
	public static String getProjectRefForUpdate(int id,boolean edit,String uploadPath)
	{
		String str="";
		str+="<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">\n";

		str+="<html><head><title>FIles</title>\n";
		str+="<link rel=\"stylesheet\" href=\"themes/css/basic.css\" media=\"screen\" type=\"text/css\">\n";
		str+="<script type=\"text/javascript\" src=\"themes/js/globalDefs.js\"></script>";
		str+="<script type=\"text/javascript\" src=\"themes/js/common.js\"></script>\n";
		str+="<script type=\"text/javascript\" src=\"script/project/definitive/projectRefAction.js\"></script>\n";
		str+="</head>\n<body>\n";
		if(uploadPath!=null)
			projectUploadPath=uploadPath;
		if(edit==true)
			str+=getProjectFileUploadForm(id, "UploadProjectFile",projectUploadPath);
		str+=getProjectFileList(id,edit);
		str+="\n</body>\n</html>\n";
		return str;
	}

	private static String getProjectFileUploadForm(int id,String method,String path)
	{
		String str="";
		str+="<fieldset><legend>Upload File</legend>\n"+
		"<form method=\"post\" action=\"MyActionDispatcher?path="+path+"&method="+method+"&id="+id+"\" enctype=\"multipart/form-data\">\n";
		str+="<label>File Name:&nbsp;&nbsp;</label><input type=\"file\" size=\"30\" name=\"fname\" class=\"pgInp\"><br>\n";
		str+="<label>Comments:&nbsp;</label><input type=\"text\" size=\"30\" name=\"fremarks\"><br>\n";
		str+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n";
		str+="<input type=\"submit\" value=\"upload\" class=\"btn\">\n";
		str+="</form></fieldset>\n";
		//str+="<br><iframe name=\"fileList\" width=\"100%\"></iframe>";
		return str;
	}

	private static String getProjectFileList(int id,boolean edit)
	{
		String str="";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		str+="<br><table width='100%' class='contentTable'><thead id='TThead'><tr>\n";
		str+="<td width='16px'>sl</td><td width='25%'>Name</td><td width='40%'>Remarks</td><td width='18%'>Modified</td>";
		if(edit==true)
			str+="<td>&nbsp;</td>\n";
		else
			str+="<td>Size(Bytes)</td>\n";
		str+="</tr></thead><tbody id='TTbody'>\n";

		try
		{
			int sl=1;
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from projectfiles where project_id="+id);

			while(rst.next())
			{
				str+="<tr file_id='"+rst.getInt(1)+"'>";
				str+="<td>"+(sl++)+"</td>\n";
				if(edit==true)
					str+="<td><a href='javascript:void(0)' onclick='downloadProjectAction(event,true)'>"+rst.getString(3)+"</a></td>\n";
				else
					str+="<td><a href='javascript:void(0)' onclick='downloadProjectAction(event,false)'>"+rst.getString(3)+"</a></td>\n";
				str+="<td>"+rst.getString(4)+"</td>\n";
				str+="<td>"+rst.getString(5)+"</td>\n";
				if(edit==true)
					str+="<td align=\"right\"><a href='javascript:void(0)' onclick='deleteProjectRefAjax(event)'>"+"delete"+"</a></td>\n";
				else
					str+="<td>"+rst.getLong(8)+"</td>\n";
				str+="</tr>";
			}
		}
		catch (Exception e) {
			System.out.println("getProjectFileList: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</tbody></table>\n";
		return str;
	}

	@SuppressWarnings("unchecked")
	public static synchronized String UploadProjectFile(HttpServletRequest request)
	{
		String str="";
		Connection conn=null;
		PreparedStatement stmt=null;

		String remarks="";					//REMARKS WITH UPLOADED FILE
		String fileType="";					//TYPE OF FILE
		long fileSize=0;					//SIZE OF FILE IN BYTES
		String fileName="";					//NAME OF UPLOADED FILE
		//byte[] fileContent=null;	

		InputStream uploadedStream=null;	//CONTENTS OF UPLOADED FILE
		//File uploadedFile=new File("c:"+File.separator+System.currentTimeMillis());
		int id=0;
		try
		{
			//Project ID
			id=Integer.parseInt(request.getParameter("id"));

			// Create a factory for disk-based file items
			FileItemFactory factory = new DiskFileItemFactory();
			// Create a new file upload handler
			ServletFileUpload upload = new ServletFileUpload(factory);
			List<FileItem> items=(List<FileItem>)upload.parseRequest(request);

			Iterator<FileItem> iter=items.iterator();

			while(iter.hasNext())
			{
				FileItem item=iter.next();
				if(item.isFormField())
				{
					String name=item.getFieldName();
					String value=Streams.asString(item.getInputStream());

					if(name.equalsIgnoreCase("fremarks"))
						remarks=value;
				}
				else
				{
					fileType=item.getContentType();
					fileSize=item.getSize();
					fileName=item.getName();
					fileName=fileName.substring(fileName.lastIndexOf("\\")+1, fileName.length());
					//item.write(uploadedFile);
					//fileContent=item.get();
					uploadedStream=item.getInputStream();

				}
			}

			//PROCESS UPLOADED FILE
			if(remarks==null || remarks.equalsIgnoreCase(""))
				remarks="--";

			Date date=new Date();
			DateFormat df=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			String currentTime=df.format(date);		//TIME THE FILE WAS UPLOADED

			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into projectfiles (project_id,name,remarks,uploaded_on,file_content,type,size) values(?,?,?,?,?,?,?)");
			stmt.setInt(1, id);									//PROJECT ID
			stmt.setString(2, fileName);						//FILENAME
			stmt.setString(3, remarks);							//REMARKS
			stmt.setString(4, currentTime);						//TIME
			//stmt.setBytes(5, fileContent);						//FILE CONTENT
			//FileInputStream fin=new FileInputStream(uploadedFile);
			stmt.setBinaryStream(5, uploadedStream, uploadedStream.available());
			stmt.setString(6, fileType);						//FILE TYPE
			stmt.setLong(7, fileSize);							//SIZE OF FILE
			stmt.execute();
			uploadedStream.close();
		}
		catch (Exception e) {
			System.out.println("UploadProjectFile: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+=getProjectRefForUpdate(id,true,null);
		return str;
	}

	public static String deleteProjectFile(int fileId)
	{
		String str="<Action>\n";
		Connection conn=null;
		Statement stmt=null;
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("delete from projectfiles where file_id="+fileId);
			str+="<status flag='OK' />\n";
		}
		catch (Exception e) {
			System.out.println("deleteProjectFile: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>\n";
		return str;
	}

	public static void downloadProjectFile(int fileId,HttpServletResponse response)
	{
		Blob file=null;
		int size=0;
		String name="";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		InputStream in=null;
		OutputStream out=null;
		try
		{
			out=response.getOutputStream();
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select name,file_content,type,size from projectfiles where file_id="+fileId);

			while(rst.next())
			{
				name=rst.getString(1);
				file=rst.getBlob(2);
				size=rst.getInt(4);
				response.setContentLength(size);
				in=new DataInputStream(file.getBinaryStream());
				response.setContentType(rst.getString(3));
				response.setContentLength(size);
				response.setHeader( "Content-Disposition", "attachment; filename=\"" + name + "\"" );

				byte[] bbuf = new byte[4096];
				int length=0;
				while((in!=null) && ((length = in.read(bbuf)) != -1))
				{
					out.write(bbuf,0,length);
				}

			}
		}
		catch (Exception e) {
			System.out.println("downloadProjectFile: "+e.getMessage());
		}
		finally
		{
			try {out.flush();} catch (Exception e) {}
			try {out.close();} catch (Exception e) {}
			try {in.close();} catch (Exception e) {}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
	}

	static String projectUploadPath="";
	static String projectEditPath="";
	static String projectFilePath="";

	/*================================================================*/
	/*
	 * Control Project
	 */

	public static String getControlProjectRefForUpdate(int id,boolean edit,String uploadPath)
	{
		String str="";
		str+="<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">\n";

		str+="<html><head><title>FIles</title>\n";
		str+="<link rel=\"stylesheet\" href=\"themes/css/basic.css\" media=\"screen\" type=\"text/css\">\n";
		str+="<script type=\"text/javascript\" src=\"themes/js/globalDefs.js\"></script>";
		str+="<script type=\"text/javascript\" src=\"themes/js/common.js\"></script>\n";
		str+="<script type=\"text/javascript\" src=\"script/project/control/controlProjectRefAction.js\"></script>\n";
		str+="</head>\n<body>\n";
		if(uploadPath!=null)
			controlProjectUploadPath=uploadPath;
		if(edit==true)
			str+=getControlProjectFileUploadForm(id, "UploadControlProjectFile",controlProjectUploadPath);
		str+=getControlProjectFileList(id,edit);
		str+="\n</body>\n</html>\n";
		return str;
	}

	private static String getControlProjectFileUploadForm(int id,String method,String path)
	{
		String str="";
		str+="<fieldset><legend>Upload File</legend>\n"+
		"<form method=\"post\" action=\"MyActionDispatcher?path="+path+"&method="+method+"&id="+id+"\" enctype=\"multipart/form-data\">\n";
		str+="<label>File Name:&nbsp;&nbsp;</label><input type=\"file\" size=\"30\" name=\"fname\" class=\"pgInp\"><br>\n";
		str+="<label>Comments:&nbsp;</label><input type=\"text\" size=\"30\" name=\"fremarks\"><br>\n";
		str+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n";
		str+="<input type=\"submit\" value=\"upload\" class=\"btn\">\n";
		str+="</form></fieldset>\n";
		//str+="<br><iframe name=\"fileList\" width=\"100%\"></iframe>";
		return str;
	}

	private static String getControlProjectFileList(int id,boolean edit)
	{
		String str="";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		str+="<br><table width='100%' class='contentTable'><thead id='TThead'><tr>\n";
		str+="<td width='16px'>sl</td><td width='25%'>Name</td><td width='40%'>Remarks</td><td width='18%'>Modified</td>";
		if(edit==true)
			str+="<td>&nbsp;</td>\n";
		else
			str+="<td>Size(Bytes)</td>\n";
		str+="</tr></thead><tbody id='TTbody'>\n";

		try
		{
			int sl=1;
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from control_projectfiles where control_project_id="+id);

			while(rst.next())
			{
				str+="<tr file_id='"+rst.getInt(1)+"'>";
				str+="<td>"+(sl++)+"</td>\n";
				if(edit==true)
					str+="<td><a href='javascript:void(0)' onclick='downloadControlProjectAction(event,true)'>"+rst.getString(3)+"</a></td>\n";
				else
					str+="<td><a href='javascript:void(0)' onclick='downloadControlProjectAction(event,false)'>"+rst.getString(3)+"</a></td>\n";
				str+="<td>"+rst.getString(4)+"</td>\n";
				str+="<td>"+rst.getString(5)+"</td>\n";
				if(edit==true)
					str+="<td align=\"right\"><a href='javascript:void(0)' onclick='deleteControlProjectRefAjax(event)'>"+"delete"+"</a></td>\n";
				else
					str+="<td>"+rst.getLong(8)+"</td>\n";
				str+="</tr>";
			}
		}
		catch (Exception e) {
			System.out.println("getControlProjectFileList: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</tbody></table>\n";
		return str;
	}

	@SuppressWarnings("unchecked")
	public static synchronized String UploadControlProjectFile(HttpServletRequest request)
	{
		String str="";
		Connection conn=null;
		PreparedStatement stmt=null;

		String remarks="";					//REMARKS WITH UPLOADED FILE
		String fileType="";					//TYPE OF FILE
		long fileSize=0;					//SIZE OF FILE IN BYTES
		String fileName="";					//NAME OF UPLOADED FILE
		//byte[] fileContent=null;	

		InputStream uploadedStream=null;	//CONTENTS OF UPLOADED FILE
		//File uploadedFile=new File("c:"+File.separator+System.currentTimeMillis());
		int id=0;
		try
		{
			//ControlProject ID
			id=Integer.parseInt(request.getParameter("id"));

			// Create a factory for disk-based file items
			FileItemFactory factory = new DiskFileItemFactory();
			// Create a new file upload handler
			ServletFileUpload upload = new ServletFileUpload(factory);
			List<FileItem> items=(List<FileItem>)upload.parseRequest(request);

			Iterator<FileItem> iter=items.iterator();

			while(iter.hasNext())
			{
				FileItem item=iter.next();
				if(item.isFormField())
				{
					String name=item.getFieldName();
					String value=Streams.asString(item.getInputStream());

					if(name.equalsIgnoreCase("fremarks"))
						remarks=value;
				}
				else
				{
					fileType=item.getContentType();
					fileSize=item.getSize();
					fileName=item.getName();
					fileName=fileName.substring(fileName.lastIndexOf("\\")+1, fileName.length());
					//item.write(uploadedFile);
					//fileContent=item.get();
					uploadedStream=item.getInputStream();

				}
			}

			//PROCESS UPLOADED FILE
			if(remarks==null || remarks.equalsIgnoreCase(""))
				remarks="--";

			Date date=new Date();
			DateFormat df=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			String currentTime=df.format(date);		//TIME THE FILE WAS UPLOADED

			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into control_projectfiles (control_project_id,name,remarks,uploaded_on,file_content,type,size) values(?,?,?,?,?,?,?)");
			stmt.setInt(1, id);									//PROJECT ID
			stmt.setString(2, fileName);						//FILENAME
			stmt.setString(3, remarks);							//REMARKS
			stmt.setString(4, currentTime);						//TIME
			//stmt.setBytes(5, fileContent);						//FILE CONTENT
			//FileInputStream fin=new FileInputStream(uploadedFile);
			stmt.setBinaryStream(5, uploadedStream, uploadedStream.available());
			stmt.setString(6, fileType);						//FILE TYPE
			stmt.setLong(7, fileSize);							//SIZE OF FILE
			stmt.execute();
			uploadedStream.close();
		}
		catch (Exception e) {
			System.out.println("UploadControlProjectFile: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+=getControlProjectRefForUpdate(id,true,null);
		return str;
	}

	public static String deleteControlProjectFile(int fileId)
	{
		String str="<Action>\n";
		Connection conn=null;
		Statement stmt=null;
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("delete from control_projectfiles where file_id="+fileId);
			str+="<status flag='OK' />\n";
		}
		catch (Exception e) {
			System.out.println("deleteControlProjectFile: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>\n";
		return str;
	}

	public static void downloadControlProjectFile(int fileId,HttpServletResponse response)
	{
		Blob file=null;
		int size=0;
		String name="";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		InputStream in=null;
		OutputStream out=null;
		try
		{
			out=response.getOutputStream();
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select name,file_content,type,size from control_projectfiles where file_id="+fileId);

			while(rst.next())
			{
				name=rst.getString(1);
				file=rst.getBlob(2);
				size=rst.getInt(4);
				response.setContentLength(size);
				in=new DataInputStream(file.getBinaryStream());
				response.setContentType(rst.getString(3));
				response.setContentLength(size);
				response.setHeader( "Content-Disposition", "attachment; filename=\"" + name + "\"" );

				byte[] bbuf = new byte[4096];
				int length=0;
				while((in!=null) && ((length = in.read(bbuf)) != -1))
				{
					out.write(bbuf,0,length);
				}

			}
		}
		catch (Exception e) {
			System.out.println("downloadControlProjectFile: "+e.getMessage());
		}
		finally
		{
			try {out.flush();} catch (Exception e) {}
			try {out.close();} catch (Exception e) {}
			try {in.close();} catch (Exception e) {}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
	}

	static String controlProjectUploadPath="";
	static String controlProjectEditPath="";
	static String controlProjectFilePath="";
}
