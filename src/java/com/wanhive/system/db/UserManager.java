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
import java.util.ArrayList;

import com.wanhive.basic.beans.User;
import com.wanhive.basic.db.DataSourceManager;
import com.wanhive.basic.utils.ServletUtils;
import com.wanhive.basic.utils.licensing.MD5;


public class UserManager {
	public static String changeUserPassword(User user,String newPassword,String oldPassword)
	{
		String str="<Action>\n";
		Connection conn=null;
		PreparedStatement stmt=null;
		boolean passwordMatched=false;
		try
		{
			conn=DataSourceManager.newConnection();
			passwordMatched=user.getPassword().equals(oldPassword);
			if(passwordMatched)
			{
				stmt=conn.prepareStatement("update user set password=? where user_id=?");
				stmt.setString(1, MD5.encrypt(newPassword));
				stmt.setInt(2, user.getId());
				stmt.execute();
				user.setPassword(newPassword);
				str+="<status flag='OK' />";
			}
			else
				str+="<status flag='INVALIDPASS' />";
		}
		catch (Exception e) {
			System.out.println("changeUserPassword: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>\n";
		return str;
	}

	public static String changeUserTheme(User user,String theme)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update user set app_theme=? where user_id=?");
			stmt.setString(1, theme);
			stmt.setInt(2, user.getId());
			stmt.execute();
			user.setTheme(theme);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("changeUserPassword: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</Action>";
		return str;
	}

	public static String getUsers()
	{
		String str="<Users>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();

			rst=stmt.executeQuery("select * from user");
			while(rst.next())
			{
				str+="<user>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<fullName>"+ServletUtils.filter(rst.getString(4))+"</fullName>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(5))+"</remarks>";
				str+="<empCode>"+rst.getString(6)+"</empCode>";
				str+="</user>";
			}
		}
		catch (Exception e) {
			System.out.println("getUser: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}	

		str+="</Users>";
		return str;
	}

	public static String deleteUsers(String ids)
	{
		String str="<Action>\n";
		Connection conn=null;
		Statement stmt=null;


		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("delete from user where user_id in ("+ids+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteUsers: "+e.getMessage());
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

	public static synchronized String addNewUser(String userId,String name,String employeeCode,String remarks)
	{
		String str="<Action>\n";

		String password=MD5.encrypt("abc");
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into user (user_name,password,fullName,remarks,employee_code) values (?,?,?,?,?)");

			stmt.setString(1,userId);
			stmt.setString(2,password);
			stmt.setString(3,name);
			stmt.setString(4,remarks);
			stmt.setString(5,employeeCode);
			stmt.execute();

			str+="<status flag='OK' />";
			rst=stmt.executeQuery("select max(user_id) from user");
			while(rst.next())
			{
				str+="<key value='"+rst.getInt(1)+"' />";
			}
		}
		catch (Exception e) {
			System.out.println("addNewUser: "+e.getMessage());
			str="<Action>";
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>\n";

		return str;
	}

	public static String getUserMenu(String userId,String menuParent)
	{
		String str="<Menu>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			//Find only those items which are not blocked(2) or which are not context menu items(3)
			rst=stmt.executeQuery("select * from (select menu_id,menu_parent_id,menu_name,menu_description from menu where menu_parent_id="+menuParent+" and menu_status<2) as a left join (select menu_id from menu_permission where user_id="+userId+") as b on a.menu_id=b.menu_id");
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				if(rst.getString(3).equals("-"))
					continue;
				str+="<item>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(3))+"</name>";
				str+="<description>"+ServletUtils.filter((rst.getString(4)==null || rst.getString(4).length()==0)?"-":rst.getString(4))+"</description>";
				str+="<status>"+((rst.getString(5)==null || rst.getString(5).length()==0)?0:1)+"</status>";
				str+="<parent>"+rst.getInt(2)+"</parent>";
				//str+="<>"++"</>";
				str+="</item>";

			}
			if(Integer.parseInt(menuParent)!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select menu_parent_id from menu where menu_id="+menuParent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />\n";
			}
		}
		catch (Exception e) {
			System.out.println("getUserMenu: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</Menu>";
		return str;
	}

	public static String updateMenuPermission(String userId,String menuId,String permission)
	{
		String str="<Action>";
		Connection conn=null;
		boolean commitFlag=true;

		try
		{
			conn=DataSourceManager.newConnection();
			commitFlag=conn.getAutoCommit();
			conn.setAutoCommit(false);
			setPermissions(userId,menuId,permission,conn);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			try{conn.rollback();}catch (Exception e1) {}
			System.out.println("updateMenuPermission: "+e.getMessage());
		}
		finally
		{
			try {conn.setAutoCommit(commitFlag);} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>";
		return str;
	}

	private static void setPermissions(String userId,String menuId,String permission,Connection conn) throws Exception
	{
		Statement stmt=null;
		PreparedStatement stmt1=null;
		PreparedStatement stmt2=null;
		ResultSet rst=null;
		ArrayList<Integer> contextMenuList=new ArrayList<Integer>();
		try
		{
			stmt=conn.createStatement();
			stmt1=conn.prepareStatement("delete from menu_permission where user_id=? and menu_id=?");
			stmt2=conn.prepareStatement("insert into menu_permission (user_id,menu_id) values (?,?)");
			boolean itemFound=false;

			rst=stmt.executeQuery("select menu_id from menu_permission where user_id="+userId+" and menu_id="+menuId);
			while(rst.next())
			{
				itemFound=true;
			}
			try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}
			//try {if(stmt!=null)stmt.close();stmt=null;} catch (Exception e) {}

			//Now find the context-menu items associated with this menu_id
			rst=stmt.executeQuery("select menu_id from menu_context where call_id="+menuId);
			while(rst.next())
			{
				contextMenuList.add(new Integer(rst.getInt(1)));
			}
			try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}

			if(itemFound && permission.equals("1"));
			else if(permission.equals("0") && itemFound)
			{
				stmt1.setString(1, userId);
				stmt1.setString(2, menuId);
				stmt1.execute();

				//Its time to remove the context-menu items from the permission table
				for(int i=0;i<contextMenuList.size();i++)
				{
					stmt1.setString(1, userId);
					stmt1.setInt(2, contextMenuList.get(i).intValue());
					stmt1.execute();
				}

				try {if(stmt1!=null)stmt1.close();stmt1=null;} catch (Exception e) {}
			}

			else if(!itemFound && permission.equals("1"))
			{
				stmt2.setString(1, userId);
				stmt2.setString(2, menuId);
				stmt2.execute();
				//Its time to add the context-menu items into the permission table
				for(int i=0;i<contextMenuList.size();i++)
				{
					stmt2.setString(1, userId);
					stmt2.setInt(2, contextMenuList.get(i).intValue());
					stmt2.execute();
				}
				try {if(stmt2!=null)stmt2.close();stmt2=null;} catch (Exception e) {}
			}

			rst=stmt.executeQuery("select menu_id,menu_name from menu where menu_parent_id="+menuId);
			while(rst.next())
			{
				if(rst.getString(2).equals("-"))
					continue;
				setPermissions(userId,rst.getString(1),permission,conn);
			}
		}
		catch (Exception e) {
			System.out.println("setPermissions: "+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();} catch (Exception e) {}
			try {if(stmt2!=null)stmt2.close();} catch (Exception e) {}
		}
	}
}