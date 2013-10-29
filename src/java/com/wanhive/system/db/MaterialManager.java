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



public class MaterialManager {
	public static String getMaterial(int parent)
	{
		String str="<Material>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from category where category_parent_id="+parent);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<category>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</category>";
			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from item where category_id="+parent);
			while(rst.next())
			{
				str+="<item>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				str+="<price>"+rst.getString(5)+"</price>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(6))+"</remarks>";
				str+="<parent>"+rst.getInt(7)+"</parent>";
				str+="<itemType>"+rst.getString(8)+"</itemType>";
				//str+="<>"++"</>";
				str+="</item>";
			}
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select category_parent_id from category where category_id ="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />";
			}
		}
		catch (Exception e) {
			System.out.println("getMaterial: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}	

		str+="</Material>";
		return str;
	}

	public static String deleteMaterial(String catIds,String itIds)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			if(catIds!=null && catIds.length()>0)
				stmt.execute("delete from category where category_id in ("+catIds+")");
			if(itIds!=null && itIds.length()>0)
				stmt.execute("delete from item where item_id in ("+itIds+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteMaterial: "+e.getMessage());
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

	public static String updateItem(String id,String name,String description,String unit,String price,String remarks,String itemType)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();

			stmt=conn.prepareStatement("update item set item_name=? , item_specification=? , item_unit=? , item_price=? , remarks=? , item_type=? where item_id=?");
			stmt.setString(1,name);
			stmt.setString(2,description);
			stmt.setString(3,unit);
			stmt.setString(4,price);
			stmt.setString(5,remarks);
			stmt.setString(6, itemType);
			stmt.setString(7, id);

			stmt.execute();
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateItem: "+e.getMessage());
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

	public static String updateCategory(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update category set category_name=? , specifications=? , remarks=? where category_id=?");
			stmt.setString(1,name);
			stmt.setString(2,description);
			stmt.setString(3,remarks);
			stmt.setString(4, id);
			stmt.execute();
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateCategory: "+e.getMessage());
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

	//add and copy calls must be synchronized
	public static String addItem(String id,String name,String description,String unit,String price,String remarks,String itemType)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			//stmt.execute("insert into item (item_name,item_specification,item_unit,item_price,remarks,category_id) values ('"+name+"', '"+description+"', '"+unit+"', '"+price+"', '"+remarks+"', '"+id+"')");
			stmt=conn.prepareStatement("insert into item (item_name,item_specification,item_unit,item_price,remarks,category_id,item_type) values (?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);

			stmt.setString(1,name);
			stmt.setString(2,description);
			stmt.setString(3,unit);
			stmt.setString(4,price);
			stmt.setString(5,remarks);
			stmt.setString(6,id);
			stmt.setString(7,itemType);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key type='item' value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addItem: "+e.getMessage());
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
	public static String addCategory(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into category (category_name,specifications,remarks,category_parent_id) values (?,?,?,?)", Statement.RETURN_GENERATED_KEYS);

			stmt.setString(1,name);
			stmt.setString(2,description);
			stmt.setString(3,remarks);
			stmt.setString(4,id);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key type='category' value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addCategory: "+e.getMessage());
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
	public static String moveItem(int id,int from,int to)
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
			stmt.execute("update item set category_id="+to+" where item_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveItem: "+e.getMessage());
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
	public static String moveCategory(int id,int from,int to)
	{
		String str="<Action>\n";
		//We cannot make assembly part of it's own subtree
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
			if(isInnerTree(id,to,conn,"category","category_id","category_parent_id"))		//If destination is part of inner tree, abort
				return str+"</Action>";
			stmt=conn.createStatement();
			stmt.execute("update category set category_parent_id="+to+" where category_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveCategory: "+e.getMessage());
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
	public static String getMaterialWithCostBook(int parent,int cbId)
	{
		String str="<Material>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from category where category_parent_id="+parent);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<category>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</category>";
			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from (select * from item where category_id="+parent+") as a left join materialcostbook as b  on b.item_id=a.item_id and b.costbook_id="+cbId);
			while(rst.next())
			{
				str+="<item>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				str+="<price>"+rst.getString(5)+"</price>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(6))+"</remarks>";
				str+="<parent>"+rst.getInt(7)+"</parent>";
				str+="<cbPrice>"+((rst.getString(12)==null || rst.getString(12).equalsIgnoreCase(""))?"-":rst.getString(12))+"</cbPrice>";
				//str+="<>"++"</>";
				str+="</item>";
			}
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select category_parent_id from category where category_id ="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />";
			}
		}
		catch (Exception e) {
			System.out.println("getMaterialWithCostBook: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}	

		str+="</Material>";
		return str;
	}

	public static String searchMaterial(String key)
	{
		String str="<Material>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from category where category_name like '%"+key+"%' or specifications like '%"+key+"%' or remarks like '%"+key+"%'");
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<category>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</category>";
			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from item where item_name like '%"+key+"%' or item_specification like '%"+key+"%' or item_unit like '%"+key+"%' or item_price like '%"+key+"%' or remarks like '%"+key+"%' or item_type like '%"+key+"%'");
			while(rst.next())
			{
				str+="<item>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				str+="<price>"+rst.getString(5)+"</price>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(6))+"</remarks>";
				str+="<parent>"+rst.getInt(7)+"</parent>";
				str+="<itemType>"+rst.getString(8)+"</itemType>";
				//str+="<>"++"</>";
				str+="</item>";
			}
		}
		catch (Exception e) {
			System.out.println("searchMaterial: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}	
		//str+="<levelParent id='1' />";
		str+="</Material>";
		return str;
	}

	public static String searchMaterialWithCostBook(String key,int cbId)
	{
		String str="<Material>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from category where category_name like '%"+key+"%' or specifications like '%"+key+"%' or remarks like '%"+key+"%'");
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<category>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</category>";
			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from (select * from item where item_name like '%"+key+"%' or item_specification like '%"+key+"%' or item_unit like '%"+key+"%' or item_price like '%"+key+"%' or remarks like '%"+key+"%' or item_type like '%"+key+"%') as a left join materialcostbook as b  on b.item_id=a.item_id and b.costbook_id="+cbId);
			while(rst.next())
			{
				str+="<item>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				str+="<price>"+rst.getString(5)+"</price>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(6))+"</remarks>";
				str+="<parent>"+rst.getInt(7)+"</parent>";
				str+="<cbPrice>"+((rst.getString(12)==null || rst.getString(12).equalsIgnoreCase(""))?"-":rst.getString(12))+"</cbPrice>";
				//str+="<>"++"</>";
				str+="</item>";
			}
		}
		catch (Exception e) {
			System.out.println("searchMaterialWithCostBook: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}	
		//str+="<levelParent id='1' />";
		str+="</Material>";
		return str;
	}
}
