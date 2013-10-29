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


public class AssemblyManager {
	public static String getAssembly(int parent)
	{
		String str="<Assembly>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from assembly where assembly_parent_id="+parent);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<item>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				str+="<price>"+rst.getString(5)+"</price>";
				str+="<premium>"+rst.getString(6)+"</premium>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(7))+"</remarks>";
				str+="<parent>"+rst.getInt(8)+"</parent>";
				str+="<displayUnit>"+ServletUtils.filter(rst.getString(9))+"</displayUnit>";
				str+="<unitMultiplier>"+rst.getDouble(10)+"</unitMultiplier>";
				//str+="<>"++"</>";
				str+="</item>";

			}
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select assembly_parent_id from assembly where assembly_id="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />\n";
			}
		}
		catch (Exception e) {
			System.out.println("getAssembly: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</Assembly>";
		return str;
	}

	public static String deleteAssembly(String ids)
	{
		String str="<Action>\n";
		Connection conn=null;
		Statement stmt=null;


		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("delete from assembly where assembly_id in ("+ids+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteAssembly: "+e.getMessage());
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
	public static String updateAssembly(String id,String name,String description,String unit,String price,String premium,String remarks,String displayUnit,String priceMultiplier)
	{
		String str="<Action>\n";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();

			stmt=conn.prepareStatement("update assembly set assembly_name=? , assembly_specification=? , assembly_unit=?"+
					" , assembly_price=? , assembly_premium=?"
					+" , assembly_remarks=? , assembly_display_unit=? , assembly_price_multiplier=? where assembly_id=?");
			stmt.setString(1,name);
			stmt.setString(2,description);
			stmt.setString(3,unit);
			stmt.setString(4,price);
			stmt.setString(5,premium);
			stmt.setString(6,remarks);
			stmt.setString(7, displayUnit);
			stmt.setString(8, priceMultiplier);
			stmt.setString(9,id);
			stmt.execute();
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateAssembly: "+e.getMessage());
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

	public static String addAssembly(String id,String name,String description,String unit,String price,String premium,String remarks,String displayUnit,String priceMultiplier)
	{
		String str="<Action>\n";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into assembly (assembly_name,assembly_specification,assembly_unit,assembly_price,assembly_premium,assembly_remarks,assembly_parent_id,assembly_display_unit,assembly_price_multiplier) values (?,?,?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);

			stmt.setString(1,name);
			stmt.setString(2,description);
			stmt.setString(3,unit);
			stmt.setString(4,price);
			stmt.setString(5,premium);
			stmt.setString(6,remarks);
			stmt.setString(7,id);
			stmt.setString(8,displayUnit);
			stmt.setString(9,priceMultiplier);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addAssembly: "+e.getMessage());
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

	public static String moveAssembly(int id,int from,int to)
	{
		String str="<Action>\n";
		//We cannot make assembly part of it's own subtree
		if(id==to)
		{
			return str+"</Action>";
		}
		//We have nothing to do
		else if(from==to)
		{
			return str+"<status flag='OK' /></Action>";
		}

		Connection conn=null;
		Statement stmt=null;


		try
		{
			conn=DataSourceManager.newConnection();
			if(isInnerTree(id,to,conn,"assembly","assembly_id","assembly_parent_id"))		//If destination is part of assembly's inner tree, abort
				return str+"</Action>";
			stmt=conn.createStatement();
			stmt.execute("update assembly set assembly_parent_id="+to+" where assembly_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveAssembly: "+e.getMessage());
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

	public static String copyAssembly(int id,int from,int to)
	{
		String str="<Action>\n";
		boolean commitFlag=true;
		int newKey;
		Connection conn=null;
		Statement stmt=null;
		PreparedStatement stmt1=null;
		ResultSet rst=null;
		ResultSet rst1=null;
		try
		{
			conn=DataSourceManager.newConnection();
			commitFlag=conn.getAutoCommit();
			conn.setAutoCommit(false);
			stmt=conn.createStatement();
			stmt1=conn.prepareStatement("insert into assembly (assembly_name,assembly_specification,assembly_unit,assembly_price,assembly_premium,assembly_remarks,assembly_parent_id,assembly_display_unit,assembly_price_multiplier) values (?,?,?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			rst=stmt.executeQuery("select *from assembly where assembly_id="+id);
			while(rst.next())
			{
				stmt1.setString(1,rst.getString(2));
				stmt1.setString(2,rst.getString(3));
				stmt1.setString(3,rst.getString(4));
				stmt1.setString(4,rst.getString(5));
				stmt1.setString(5,rst.getString(6));
				stmt1.setString(6,rst.getString(7));
				stmt1.setString(7,""+to);
				stmt1.setString(8,rst.getString(9));
				stmt1.setString(9,rst.getString(10));

				stmt1.execute();
				conn.commit();
				rst1=stmt1.getGeneratedKeys();
				while(rst1.next())
				{
					newKey=rst1.getInt(1);
					str+="<key type='assembly' value='"+newKey+"' />";

					//Copy all assemblies under this tree
					//newKey: new Parent under which we need to populate tree
					//id: old parent to fetch the tree
					copyAssemblyTree(newKey,id,conn);
				}
				try {if(rst1!=null)rst1.close();} catch (Exception e) {}
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			try{conn.rollback();}catch (Exception e1) {}
			System.out.println("copyAssembly: "+e.getMessage());
		}
		finally
		{
			try {conn.setAutoCommit(commitFlag);} catch (Exception e) {}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>\n";
		return str;
	}

	private static void copyAssemblyTree(int newParentId,int oldParentId, Connection conn) throws Exception
	{
		int newKey;
		int oldKey;
		Statement stmt=null;
		PreparedStatement stmt1=null;
		ResultSet rst=null;
		ResultSet rst1=null;

		try
		{
			stmt=conn.createStatement();
			stmt1=conn.prepareStatement("insert into assembly (assembly_name,assembly_specification,assembly_unit,assembly_price,assembly_premium,assembly_remarks,assembly_parent_id,assembly_display_unit,assembly_price_multiplier) values (?,?,?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			rst=stmt.executeQuery("select *from assembly where assembly_parent_id="+oldParentId);
			while(rst.next())
			{
				oldKey=rst.getInt(1);	//Preserve the old key so that we can copy tree under it
				stmt1.setString(1,rst.getString(2));
				stmt1.setString(2,rst.getString(3));
				stmt1.setString(3,rst.getString(4));
				stmt1.setString(4,rst.getString(5));
				stmt1.setString(5,rst.getString(6));
				stmt1.setString(6,rst.getString(7));
				stmt1.setString(7,""+newParentId);
				stmt1.setString(8,rst.getString(9));
				stmt1.setString(9,""+rst.getDouble(10));

				stmt1.execute();
				rst1=stmt1.getGeneratedKeys();
				while(rst1.next())
				{
					newKey=rst1.getInt(1);
					copyAssemblyTree(newKey,oldKey,conn);
				}
				try {if(rst1!=null)rst1.close();} catch (Exception e) {}
			}
		}
		catch (Exception e) {
			System.out.println("copyAssemblyTree: "+e.getMessage());
			throw e;	//Re-throw Exception
		}
		finally			//Close resources in any case
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();} catch (Exception e) {}
		}
	}

	public static String getAssemblyWithCostBook(int parent,int cbId)
	{
		String str="<Assembly>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select * from assembly where assembly_parent_id="+parent+") as a left join assemblycostbook as b  on b.assembly_id=a.assembly_id and b.costbook_id="+cbId);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<item>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				str+="<price>"+rst.getString(5)+"</price>";
				str+="<premium>"+rst.getString(6)+"</premium>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(7))+"</remarks>";
				str+="<parent>"+rst.getInt(8)+"</parent>";
				str+="<cbPrice>"+((rst.getString(14)!=null && !rst.getString(14).equalsIgnoreCase(""))?rst.getString(14):"-")+"</cbPrice>";
				str+="<cbPremium>"+((rst.getString(15)!=null && !rst.getString(15).equalsIgnoreCase(""))?rst.getString(15):"-")+"</cbPremium>";
				str+="<displayUnit>"+ServletUtils.filter(rst.getString(9))+"</displayUnit>";
				str+="<unitMultiplier>"+rst.getDouble(10)+"</unitMultiplier>";
				//str+="<>"++"</>";
				str+="</item>";

			}
			if(parent!=1)
			{
				//Close rst before reusing it
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select assembly_parent_id from assembly where assembly_id="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />\n";
			}
		}
		catch (Exception e) {
			System.out.println("getAssemblyWithCostBook: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</Assembly>";
		//System.out.println(str);
		return str;
	}

	public static String searchAssemblies(String key)
	{
		String str="<Assembly>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from assembly where assembly_name like '%"+key+"%' or assembly_specification like '%"+key+"%' or assembly_unit like '%"+key+"%' or assembly_price like '%"+key+"%' or assembly_premium like '%"+key+"%' or assembly_remarks like '%"+key+"%'");
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<item>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				str+="<price>"+rst.getString(5)+"</price>";
				str+="<premium>"+rst.getString(6)+"</premium>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(7))+"</remarks>";
				str+="<parent>"+rst.getInt(8)+"</parent>";
				str+="<displayUnit>"+ServletUtils.filter(rst.getString(9))+"</displayUnit>";
				str+="<unitMultiplier>"+rst.getDouble(10)+"</unitMultiplier>";
				//str+="<>"++"</>";
				str+="</item>";

			}

		}
		catch (Exception e) {
			System.out.println("searchAssemblies: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		//str+="<levelParent id='1' />\n";
		str+="</Assembly>";
		//System.out.println(str);
		return str;
	}

	public static String searchAssemblyWithCostBook(String key,int cbId)
	{
		System.out.println("ASSEMBLY SEARCH KEY: "+key);
		System.out.println("COSTBOOK: "+cbId);
		String str="<Assembly>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select * from assembly where assembly_name like '%"+key+"%' or assembly_specification like '%"+key+"%' or assembly_unit like '%"+key+"%' or assembly_price like '%"+key+"%' or assembly_premium like '%"+key+"%' or assembly_remarks like '%"+key+"%') as a left join assemblycostbook as b  on b.assembly_id=a.assembly_id and b.costbook_id="+cbId);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<item>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				str+="<price>"+rst.getString(5)+"</price>";
				str+="<premium>"+rst.getString(6)+"</premium>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(7))+"</remarks>";
				str+="<parent>"+rst.getInt(8)+"</parent>";
				str+="<cbPrice>"+((rst.getString(14)!=null && !rst.getString(14).equalsIgnoreCase(""))?rst.getString(14):"-")+"</cbPrice>";
				str+="<cbPremium>"+((rst.getString(15)!=null && !rst.getString(15).equalsIgnoreCase(""))?rst.getString(15):"-")+"</cbPremium>";
				str+="<displayUnit>"+ServletUtils.filter(rst.getString(9))+"</displayUnit>";
				str+="<unitMultiplier>"+rst.getDouble(10)+"</unitMultiplier>";
				//str+="<>"++"</>";
				str+="</item>";

			}

		}
		catch (Exception e) {
			System.out.println("searchAssemblyWithCostBook: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		//str+="<levelParent id='1' />\n";
		str+="</Assembly>";
		return str;
	}
}
