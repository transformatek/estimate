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
import com.wanhive.basic.utils.ServletUtils;


public class DocumentManager {
	public static String getDocuments(int parent)
	{
		String str="<Document>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from document_directory where directory_parent_id="+parent);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<document>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</document>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from document_reference where directory_id="+parent);
			while(rst.next())
			{
				str+="<file>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(3))+"</name>";
				//str+="<specification>"+ServletUtils.filter(rst.getString(4))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(2)+"</parent>";
				//str+="<>"++"</>";
				str+="</file>";

			}
			
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select directory_parent_id from document_directory where directory_id ="+parent);
				while(rst.next())
					
					str+="<levelParent id='"+rst.getInt(1)+"' />";
			}
		}
		catch (Exception e) {
			System.out.println("getDocuments: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Document>";
		return str;
	}

	public static String deleteDocuments(String dmsIds, String fileIds)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			if(dmsIds!=null && dmsIds.length()>0)
				stmt.execute("delete from document_directory where directory_id in ("+dmsIds+")");
			if(fileIds!=null && fileIds.length()>0)
				stmt.execute("delete from document_reference where file_id in ("+fileIds+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteDocuments: "+e.getMessage());
		}
		finally
		{
			//try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Action>";
		return str;
	}

	public static String updateDirectory(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update document_directory set name=? , description=?, remarks=? where directory_id=?");
			stmt.setString(1, name);
			stmt.setString(2, description);

			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();

			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateDirectory: "+e.getMessage());
		}
		finally
		{
			//try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Action>";
		return str;
	}

	public static String updateFile(String id,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update document_reference set remarks=? where file_id=?");
			//stmt.setString(1, name);
			
			stmt.setString(1, remarks);
			stmt.setString(2, id);
			stmt.execute();
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateFile: "+e.getMessage());
		}
		finally
		{
			//try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Action>";
		return str;
	}

	
	public static String addDirectory(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into document_directory (name,description,remarks,directory_parent_id) values (?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key type='document' value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addDirectory: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Action>";
		return str;
	}
	
	@SuppressWarnings("unchecked")
	public static String uploadReference(HttpServletRequest request)
	{
		String str="";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;
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
			id=Integer.parseInt(request.getParameter("documentId"));
			
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
			stmt=conn.prepareStatement("insert into document_reference (directory_id,name,remarks,uploaded_on,file_content,type,size) values(?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
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
			
			//rst=stmt.executeQuery("select file_id,name from document_reference where file_id = (Select max(file_id) from document_reference)");
			rst=stmt.getGeneratedKeys();
			if(rst.next())
			{
				str="<div>"+rst.getInt(1)+"</div>";
				str+="<div>"+ServletUtils.filter(fileName)+"</div>";
			}
		}
		catch (Exception e) {
			System.out.println("Uploadreference: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		return str;
	}

	public static void downloadFile(int fileId,HttpServletResponse response)
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
			rst=stmt.executeQuery("select name,file_content,type,size from document_reference where file_id="+fileId);
			
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
			System.out.println("downloadFile: "+e.getMessage());
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
	
	public static String moveReference(int id,int from,int to)
	{
		String str="<Action>\n";
		//We cannot make the item part of it's own subtree
		//if(id==to)
		//{
		//	return str+"</Action>";
		//}
		//We have nothing to do
		if(from==to)
		{
			return str+"<status flag='OK' /></Action>";
		}
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("update document_reference set directory_id="+to+" where file_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveReference: "+e.getMessage());
		}
		finally
		{
			//try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</Action>\n";
		return str;
	}
	public static String moveDirectory(int id,int from,int to)
	{
		String str="<Action>\n";
		//We cannot make CostBookCategory part of it's own subtree
		if(id==to)
		{
			return str+"</Action>";
		}
		//We have nothing to do
		if(from==to)
		{
			return str+"<status flag='OK' /></Action>";
		}

		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			if(isInnerTree(id,to,conn,"document_directory","directory_id","directory_parent_id"))		//If destination is part of inner tree, abort
				return str+"</Action>";
			stmt=conn.createStatement();
			stmt.execute("update document_directory set directory_parent_id="+to+" where directory_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveCostBookCategory: "+e.getMessage());
		}
		finally
		{
			//try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</Action>\n";
		return str;
	}
	private static boolean isInnerTree(int id, int to,Connection connection,String tableName,String idColumn,String parentIdColumn)
	{
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		
		try
		{
			stmt=conn.createStatement();
			while(to!=1 && to!=id)
			{
				rst=stmt.executeQuery("select "+parentIdColumn+" from "+tableName+" where "+idColumn+"="+to);
				while(rst.next())
				{
					to=rst.getInt(1);
				}
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=null;
			}
		}
		catch (Exception e) {
			System.out.println("isInnerTree: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			//try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		if(to==1) return false;
		else return true;
	}
	
	public static String searchDocuments(String key)
	{
		String str="<Document>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from document_directory where name like '%"+key+"%' or description like '%"+key+"%' or remarks like '%"+key+"%'");
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<document>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</document>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from document_reference where name like '%"+key+"%' or remarks like '%"+key+"%'");
			while(rst.next())
			{
				str+="<file>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(3))+"</name>";
				//str+="<specification>"+ServletUtils.filter(rst.getString(4))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(2)+"</parent>";
				//str+="<>"++"</>";
				str+="</file>";

			}
		}
		catch (Exception e) {
			System.out.println("searchDocuments: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Document>";
		return str;
	}
}

