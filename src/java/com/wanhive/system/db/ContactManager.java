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

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

import com.wanhive.basic.db.DataSourceManager;
import com.wanhive.basic.utils.ServletUtils;


public class ContactManager {
	public static String getContact(int parent)
	{
		String str="<Contacts>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from contactdirectory where cd_parent_id="+parent);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<contactCat>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</contactCat>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from contacts where cd_id="+parent);
			while(rst.next())
			{
				str+="<contact>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(3))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(4))+"</specification>";
				str+="<address>"+ServletUtils.filter(rst.getString(5))+"</address>";
				str+="<number>"+ServletUtils.filter(rst.getString(6))+"</number>";
				str+="<website>"+ServletUtils.filter(rst.getString(7))+"</website>";
				str+="<email>"+ServletUtils.filter(rst.getString(8))+"</email>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(9))+"</remarks>";
				str+="<parent>"+rst.getInt(2)+"</parent>";
				//str+="<>"++"</>";
				str+="</contact>";

			}
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select cd_parent_id from contactdirectory where cd_id ="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />";
			}
		}
		catch (Exception e) {
			System.out.println("getContacts: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Contacts>";
		return str;
	}

	public static String deleteContact(String cbCatIds,String cbIds)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			if(cbCatIds!=null && cbCatIds.length()>0)
				stmt.execute("delete from contactdirectory where cd_id in ("+cbCatIds+")");
			if(cbIds!=null && cbIds.length()>0)
				stmt.execute("delete from contacts where contact_id in ("+cbIds+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteContact: "+e.getMessage());
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

	public static String updateContactItem(String id,String name,String description,String address,String number,String website,String email,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update contacts set contact_name=? , contact_description=?,contact_address=?,contact_number=?,contact_website=?,contact_email=? , contact_remarks=? where contact_id=?");
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, address);
			stmt.setString(4, number);
			stmt.setString(5, website);
			stmt.setString(6, email);
			stmt.setString(7, remarks);
			stmt.setString(8, id);
			stmt.execute();

			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateContactItem: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Action>";
		return str;
	}

	public static String updateContactCategory(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update contactdirectory set cd_name=? , cd_specification=? , cd_remarks=? where cd_id=?");
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateContactCategory: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Action>";
		return str;
	}

	public static String addContactItem(String id,String name,String description,String address,String number,String website,String email,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into contacts (contact_name,contact_description,contact_address,contact_number,contact_website,contact_email,contact_remarks,cd_id) values (?,?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, address);
			stmt.setString(4, number);
			stmt.setString(5, website);
			stmt.setString(6, email);
			stmt.setString(7, remarks);
			stmt.setString(8, id);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key type='contact' value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addContactItem: "+e.getMessage());
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
	public static synchronized String addContactCategory(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into contactdirectory (cd_name,cd_specification,cd_remarks,cd_parent_id) values (?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key type='contactCat' value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addContactCategory: "+e.getMessage());
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

	public static String moveContact(int id,int from,int to)
	{
		String str="<Action>\n";
		//We cannot make assembly part of it's own subtree
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
			stmt.execute("update contacts set cd_id="+to+" where contact_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveContacts: "+e.getMessage());
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
	public static String moveContactCategory(int id,int from,int to)
	{
		String str="<Action>\n";
		//We cannot make ContactCategory part of it's own subtree
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
			if(isInnerTree(id,to,conn,"contactdirectory","cd_id","cd_parent_id"))		//If destination is part of inner tree, abort
				return str+"</Action>";
			stmt=conn.createStatement();
			stmt.execute("update contactdirectory set cd_parent_id="+to+" where cd_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveContactdirectory: "+e.getMessage());
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
	public static String searchContact(String key)
	{
		String str="<Contacts>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from contactdirectory where cd_name like '%"+key+"%' or cd_specification like '%"+key+"%' or cd_remarks like '%"+key+"%'");
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<contactCat>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</contactCat>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from contacts where contact_name like '%"+key+"%' or contact_description like '%"+key+"%' or contact_address like '%"+key+"%' or contact_number like '%"+key+"%' or contact_website like '%"+key+"%' or contact_email like '%"+key+"%' or contact_remarks like '%"+key+"%'");
			while(rst.next())
			{
				str+="<contact>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(3))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(4))+"</specification>";
				str+="<address>"+ServletUtils.filter(rst.getString(5))+"</address>";
				str+="<number>"+ServletUtils.filter(rst.getString(6))+"</number>";
				str+="<website>"+ServletUtils.filter(rst.getString(7))+"</website>";
				str+="<email>"+ServletUtils.filter(rst.getString(8))+"</email>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(9))+"</remarks>";
				str+="<parent>"+rst.getInt(2)+"</parent>";
				//str+="<>"++"</>";
				str+="</contact>";

			}
		}
		catch (Exception e) {
			System.out.println("searchContact: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		//str+="<levelParent id='1' />";
		str+="</Contacts>";
		return str;
	}
}
