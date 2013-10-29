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
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import com.wanhive.basic.arithexp.Parser;
import com.wanhive.basic.db.DataSourceManager;
import com.wanhive.basic.utils.ServletUtils;
import com.wanhive.system.beans.BoqBean;
import com.wanhive.system.beans.OverheadBean;
import com.wanhive.system.utils.DecimalFormat;





public class CostBookManager {
	public static String getCostBook(int parent)
	{
		String str="<CostBook>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from cbcategory where cbcat_parent_id="+parent);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<cbCat>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</cbCat>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from costbook where cbcat_id="+parent);
			while(rst.next())
			{
				str+="<cb>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</cb>";

			}
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select cbcat_parent_id from cbcategory where cbcat_id ="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />";
			}

		}
		catch (Exception e) {
			System.out.println("getCostBook: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</CostBook>";
		return str;
	}

	public static String deleteCostBook(String cbCatIds,String cbIds)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			if(cbCatIds!=null && cbCatIds.length()>0)
				stmt.execute("delete from cbcategory where cbcat_id in ("+cbCatIds+")");
			if(cbIds!=null && cbIds.length()>0)
				stmt.execute("delete from costbook where costbook_id in ("+cbIds+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteCostBook: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Action>";
		return str;
	}

	public static String updateCostBookItem(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update costbook set costbook_name=? , costbook_specification=? , costbook_remarks=? where costbook_id=?");
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();

			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateCostBookItem: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Action>";
		return str;
	}

	public static String updateCostBookCategory(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update cbcategory set cbcat_name=? , cbcat_specification=? , cbcat_remarks=? where cbcat_id=?");
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateCostBookCategory: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Action>";
		return str;
	}

	public static String addCostBookItem(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into costbook (costbook_name,costbook_specification,costbook_remarks,cbcat_id) values (?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();

			//Get PK of the newly added item
			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key type='cb' value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addCostBookItem: "+e.getMessage());
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
	public static String addCostBookCategory(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into cbcategory (cbcat_name,cbcat_specification,cbcat_remarks,cbcat_parent_id) values (?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();

			//Get PK of the newly added item
			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key type='cbCat' value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addCostBookCategory: "+e.getMessage());
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

	public static String getAssemblyAnalysis(String costBookId,String asmId)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		double sumTotal=0;
		double gross=0;
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select ref_id, multiplier, price from assemblycostbook where assembly_id="+asmId+" and costbook_id="+costBookId);
			String multiplier="1";
			String refId="0";
			while(rst.next())
			{
				refId=rst.getString(1);
				multiplier=rst.getString(2);
				gross=rst.getDouble(3);
			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select ref_id,assembly_id,(select item_specification from item where item.item_id=itemassembly.item_id)as name,(select item_unit from item where item.item_id=itemassembly.item_id)as unit,fraction,(select price from materialcostbook where materialcostbook.item_id=itemassembly.item_id and materialcostbook.costbook_id=itemassembly.costbook_id)as price,costbook_id,fraction_str from itemassembly where assembly_id="+asmId+" and costbook_id="+costBookId);

			while(rst.next())
			{
				str+="<entry>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<asmId>"+rst.getInt(2)+"</asmId>";
				str+="<costBookId>"+rst.getInt(7)+"</costBookId>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				String frac=rst.getString(5);
				String frac_str=rst.getString(8);
				str+="<fraction>"+ServletUtils.filter((frac_str==null?"-":frac_str))+"</fraction>";
				String price=rst.getString(6);
				str+="<price>"+ServletUtils.filter(((price==null || price.equalsIgnoreCase(""))?"-":price))+"</price>";
				double fraction=Double.parseDouble(frac);
				double cost=Double.parseDouble(price==null?"0":price);
				sumTotal+=(fraction*cost);
				str+="<total>"+DecimalFormat.format(fraction*cost)+"</total>";
				str+="</entry>";
			}
			str+="<assembly id='"+asmId+"' refId='"+refId+"' multiplier='"+multiplier+"' sumTotal='"+DecimalFormat.format(sumTotal)+"' gross='"+DecimalFormat.format(gross)+"' />";
		}
		catch (Exception e) {
			System.out.println("getAssemblyAnalysis: "+e.getMessage());
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

	public static String deleteMaterialCostbook(String ids)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		String cbId="0";
		String asmId="0";
		//double gross=0;
		double[] retVal=new double[3];
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select assembly_id,costbook_id from itemassembly where ref_id in("+ids+")");
			if(rst.first())
			{
				cbId=rst.getString(2);
				asmId=rst.getString(1);
				//retVal=getAssemblyAnalysisPrice(conn,rst.getString(2), rst.getString(1));
			}

			stmt.execute("delete from itemassembly where ref_id in ("+ids+")");
			retVal=updateAssemblyCostbookPrice(conn,cbId,asmId);
			String sumTotal=DecimalFormat.format(retVal[0]);
			String overheadTotal=DecimalFormat.format(retVal[1]);
			str+="<status flag='OK' sumTotal='"+sumTotal+"' overheadTotal='"+overheadTotal+"' gross= '"+retVal[2]+"' />";
		}
		catch (Exception e) {
			System.out.println("deleteMaterialCostbook: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>";
		return str;
	}
	public static String updateMaterialVolume(String id, String fraction,String price) {
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		String expression="";
		double total=0;
		double[] retVal=new double[3];
		try
		{
			if(fraction!=null && !fraction.equalsIgnoreCase("") && !fraction.equalsIgnoreCase("-"))
			{
				expression=fraction+";";
				total=Parser.returnResult(expression);
			}

			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("update itemassembly set fraction_str='"+fraction+"', fraction='"+total+"' where ref_id="+id);

			rst=stmt.executeQuery("select assembly_id,costbook_id from itemassembly  where ref_id="+id);
			if(rst.first())
			{
				retVal=updateAssemblyCostbookPrice(conn,rst.getString(2),rst.getString(1));
				//retVal=getAssemblyAnalysisPrice(conn,rst.getString(2), rst.getString(1));
			}

			double unitPrice=0;
			try{unitPrice=Double.parseDouble(price);}catch(Exception e){}
			double totalPrice=total*unitPrice;
			String sumTotal=DecimalFormat.format(retVal[0]);
			String overheadTotal=DecimalFormat.format(retVal[1]);
			str+="<status flag='OK' sumTotal='"+sumTotal+"' overheadTotal='"+overheadTotal+"' gross= '"+retVal[2]+"' />";
			str+="<total value='"+DecimalFormat.format(totalPrice)+"' />";
		}
		catch (Exception e) {
			System.out.println("updateMaterialVolume: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>";

		return str;
	}

	public static String addMaterialToAnalysis(String id,String cbId,String price,String asmId,String fraction)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;
		String expression="";
		double[] retVal=new double[3];
		double total=0;
		try
		{

			if(fraction!=null && !fraction.equalsIgnoreCase("") && !fraction.equalsIgnoreCase("-"))
			{
				expression=fraction+";";
				total=Parser.returnResult(expression);
			}
			// For Hibernate use Transaction for below 2 statements 

			conn=DataSourceManager.newConnection();
			conn.setAutoCommit(false);
			stmt=conn.prepareStatement("insert into itemassembly (assembly_id,item_id,fraction,costbook_id,fraction_str) values (?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, asmId);
			stmt.setString(2, id);
			stmt.setDouble(3, total);
			stmt.setString(4, cbId);
			stmt.setString(5, fraction);
			stmt.execute();

			// if item is not found in materialcostbook with this costbookId then Insert
			checkAndInsert(conn, id, cbId, price);

			// if item is not found in assemblycostbook with this costbookId and assemblyId then Insert
			checkAndInsertAssemblyCostbook(conn,cbId,asmId);
			retVal=updateAssemblyCostbookPrice(conn,cbId,asmId);
			conn.commit();

			double totalPrice=total*Double.parseDouble(price);

			//retVal=getAssemblyAnalysisPrice(conn,cbId, asmId);
			String sumTotal=DecimalFormat.format(retVal[0]);
			String overheadTotal=DecimalFormat.format(retVal[1]);

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key value='"+rst.getInt(1)+"' total='"+DecimalFormat.format(totalPrice)+"'/>";
			}
			str+="<status flag='OK' sumTotal='"+sumTotal+"' overheadTotal='"+overheadTotal+"' gross= '"+retVal[2]+"' />";

		}
		catch (Exception e) {
			System.out.println("addMaterialToAnalysis: "+e.getMessage());
			try{if(conn!=null)conn.rollback();}catch(SQLException se){System.out.println("addMaterialToAnalysis: Rollback Fails "+se.getMessage());};
		}
		finally
		{
			try {if(conn!=null)conn.setAutoCommit(true);} catch (Exception e) {}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>";
		return str;
	}
	private static void checkAndInsert(Connection conn,String id,String cbId,String price)throws Exception
	{
		PreparedStatement pstmt=null;
		Statement stmt=null;
		ResultSet rst=null;
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from materialcostbook where costbook_id="+cbId+" and item_id="+id);
			if(!rst.first()){  
				// if item is not found in materialcostbook with this costbookId then Insert
				pstmt=conn.prepareStatement("insert into materialcostbook (costbook_id,item_id,price) values (?,?,?)");
				pstmt.setString(1, cbId);
				pstmt.setString(2, id);
				pstmt.setString(3, price);
				pstmt.execute();
			}
		}
		catch (Exception e) {
			System.out.println("checkAndInsert:"+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}

	}

	private static void checkAndInsertAssemblyCostbook(Connection conn,String cbId,String asmId)throws Exception
	{
		PreparedStatement pstmt=null;
		Statement stmt=null;
		ResultSet rst=null;
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from assemblycostbook where costbook_id="+cbId+" and assembly_id="+asmId);
			if(!rst.first()){  
				// if entry is not found in assemblycostbook with this costbookId and assemblyId then Insert
				pstmt=conn.prepareStatement("insert into assemblycostbook (assembly_id,costbook_id,price,premium,multiplier) values (?,?,?,?,?)");
				pstmt.setString(1, asmId);
				pstmt.setString(2, cbId);
				pstmt.setString(3, "0");
				pstmt.setString(4, "0");
				pstmt.setString(5, "1");
				pstmt.execute();
			}
		}
		catch (Exception e) {
			System.out.println("checkAndInsertAssemblyCostbook"+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}

	}

	private static double[] updateAssemblyCostbookPrice(Connection conn,String cbId,String asmId)throws Exception
	{
		Statement stmt=null;
		ResultSet rst=null;
		double total=0;
		double[] retValue=new double[3];

		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select ifnull(sum(fraction*(select price from materialcostbook where materialcostbook.item_id=itemassembly.item_id and materialcostbook.costbook_id="+cbId+" group by(itemassembly.item_id))),0)as a from itemassembly where costbook_id="+cbId+" and assembly_id="+asmId);
			if(rst.first())
			{
				total+=rst.getDouble(1);
				retValue[0]=rst.getDouble(1);	//AnalysisPrice
			}
			try {
				if(rst!=null)rst.close();
				if(stmt!=null)stmt.close();
			} catch (Exception e) {}
			rst=null;
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select ifnull(sum(oh_amount),0) from assemblyoverhead where costbook_id="+cbId+" and assembly_id="+asmId);
			if(rst.first())
			{
				total+=rst.getDouble(1);
				retValue[1]=rst.getDouble(1);	//Overhead Price
			}
			try {
				if(rst!=null)rst.close();
				if(stmt!=null)stmt.close();
			} catch (Exception e) {}
			stmt=conn.createStatement();
			stmt.execute("update assemblycostbook set price="+total+"/multiplier where costbook_id="+cbId+" and assembly_id="+asmId);

			try {
				if(rst!=null)rst.close();
				if(stmt!=null)stmt.close();
			} catch (Exception e) {}
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select price from assemblycostbook where costbook_id="+cbId+" and assembly_id="+asmId);
			while(rst.next())
			{
				retValue[2]=rst.getDouble(1);
			}
		}finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return retValue;
	}



	public static String getCostBookAssemblyAnalysis(int parent,int asmId)
	{
		String str="<CostBook>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from cbcategory where cbcat_parent_id="+parent);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<cbCat>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</cbCat>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select *,exists(select * from assemblycostbook where assemblycostbook.costbook_id=costbook.costbook_id and assembly_id="+asmId+")as b from costbook where cbcat_id="+parent);
			while(rst.next())
			{
				str+="<cb>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				str+="<analysisAval>"+rst.getInt(6)+"</analysisAval>";
				//str+="<>"++"</>";
				str+="</cb>";

			}
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select cbcat_parent_id from cbcategory where cbcat_id ="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />";
			}
		}
		catch (Exception e) {
			System.out.println("getCostBookAssemblyAnalysis: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</CostBook>";
		return str;
	}

	public static String searchCostBookAssemblyAnalysis(String key,int asmId)
	{
		String str="<CostBook>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from cbcategory where cbcat_name like '%"+key+"%' or cbcat_specification like '%"+key+"%' or cbcat_remarks like '%"+key+"%'");
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<cbCat>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</cbCat>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select *,exists(select * from assemblycostbook where assemblycostbook.costbook_id=costbook.costbook_id and assembly_id="+asmId+")as b from costbook  where costbook_name like '%"+key+"%' or costbook_specification like '%"+key+"%' or costbook_remarks like '%"+key+"%'");
			while(rst.next())
			{
				str+="<cb>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				str+="<analysisAval>"+rst.getInt(6)+"</analysisAval>";
				//str+="<>"++"</>";
				str+="</cb>";

			}
		}
		catch (Exception e) {
			System.out.println("searchCostBookAssemblyAnalysis: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</CostBook>";
		return str;
	}

	public static String importFromCostBook(String cbId,String toCbId,String asmId, int flag)
	{
		String str="<Action>";
		Connection conn=null;
		double[] retVal=new double[3];
		String[] retVal1=new String[2];
		try
		{
			// For Hibernate use Transaction for below 2 statements 

			conn=DataSourceManager.newConnection();
			conn.setAutoCommit(false);

			//Import resources into the target assembly
			//if(flag==1)
			importResourcesFromCB(cbId, toCbId, asmId, conn);
			//Import Overheads from Costbook to the target assembly
			//else
			importOverheadsFromCB(cbId, toCbId, asmId, conn);

			// if item is not found in assemblycostbook with this costbookId and assemblyId then Insert
			checkAndInsertAssemblyCostbook(conn,toCbId,asmId);


			//Import the rate multiplier
			String multiplier="1";
			String refId="0";
			retVal1=importRateMultiplierFromCB(cbId, toCbId, asmId, conn);
			refId=retVal1[0];
			multiplier=retVal1[1];

			// update assemblecostbook assembly price
			retVal=updateAssemblyCostbookPrice(conn,toCbId,asmId);
			conn.commit();

			//Get the list of resources
			if(flag==1)
			{
				str+=returnListOfResources(toCbId, asmId, conn);
				str+="<assembly id='"+asmId+"' refId='"+refId+"' multiplier='"+multiplier+"' sumTotal='"+DecimalFormat.format(retVal[0])+"' gross='"+retVal[2]+"' />";
			}
			//get the list of overheads
			else
			{
				//Get the list of overheads
				str+=returnListOfOverheads(toCbId, asmId, conn);
				str+="<assembly id='"+asmId+"' refId='"+refId+"' multiplier='"+multiplier+"' overheadTotal='"+DecimalFormat.format(retVal[1])+"' gross='"+retVal[2]+"' />";
			}
		}
		catch (Exception e) {
			System.out.println("importFromCostBook: "+e.getMessage());
			str="<Action>";
			try{if(conn!=null)conn.rollback();}catch(SQLException se){System.out.println("importFromCostBook: Rollback Fails "+se.getMessage());};
		}
		finally
		{
			try {if(conn!=null)conn.setAutoCommit(true);} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>";
		return str;
	}

	private static void importResourcesFromCB(String cbId,String toCbId,String asmId,Connection conn) throws Exception
	{
		PreparedStatement stmt=null;
		ResultSet rst=null;
		Statement stmt1=null;
		try
		{
			stmt=conn.prepareStatement("insert into itemassembly (assembly_id,item_id,fraction,costbook_id,fraction_str) values (?,?,?,?,?)");
			stmt1=conn.createStatement();
			//Cleanse the database
			stmt1.execute("delete from itemassembly where assembly_id="+asmId+" and costbook_id="+toCbId);
			rst=stmt1.executeQuery("select itemassembly.item_id,fraction,price,fraction_str from itemassembly left join materialcostbook on itemassembly.costbook_id=materialcostbook.costbook_id and itemassembly.item_id=materialcostbook.item_id where itemassembly.costbook_id="+cbId+" and assembly_id="+asmId);

			while(rst.next()){
				stmt.setString(1, asmId);
				String itemId=rst.getString(1);
				stmt.setString(2, itemId);
				stmt.setString(3,rst.getString(2));
				stmt.setString(4, toCbId);
				stmt.setString(5, rst.getString(4));
				stmt.execute();

				// if item is not found in materialcostbook with this costbookId then Insert
				checkAndInsert(conn, itemId, toCbId, rst.getString(3));
			}
		}
		catch (Exception e) {
			System.out.println("importResourcesFromCB: "+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();stmt=null;} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();stmt1=null;} catch (Exception e) {}
		}
	}

	private static void importOverheadsFromCB(String cbId,String toCbId,String asmId,Connection conn) throws Exception
	{
		PreparedStatement stmt=null;
		ResultSet rst=null;
		Statement stmt1=null;
		try
		{
			stmt1=conn.createStatement();
			stmt1.execute("delete from assemblyoverhead where assembly_id="+asmId+" and costbook_id="+toCbId);
			rst=stmt1.executeQuery("select * from assemblyoverhead where assembly_id="+asmId+" and costbook_id="+cbId);
			stmt=conn.prepareStatement("insert into assemblyoverhead (oh_name,oh_description,oh_amount,assembly_id,costbook_id,oh_amount_str) values (?,?,?,?,?,?)");
			while(rst.next()){
				stmt.setString(1, rst.getString(2));
				stmt.setString(2, rst.getString(3));
				stmt.setString(3, rst.getString(4));
				stmt.setString(4, asmId);
				stmt.setString(5, toCbId);
				stmt.setString(6, rst.getString(7));
				stmt.execute();
			}
		}
		catch (Exception e) {
			System.out.println("importOverheadsFromCB: "+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();stmt=null;} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();stmt1=null;} catch (Exception e) {}
		}
	}

	private static String[] importRateMultiplierFromCB(String cbId,String toCbId,String asmId,Connection conn) throws Exception
	{
		Statement stmt=null;
		ResultSet rst=null;
		String retVal[]=new String[2];
		try
		{
			//Import Multiplier
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select ref_id, multiplier from assemblycostbook where assembly_id="+asmId+" and costbook_id="+cbId);
			while(rst.next())
			{
				retVal[0]=rst.getString(1);	//REF_ID
				retVal[1]=rst.getString(2); //MULTIPLIER
			}

			stmt.execute("update assemblycostbook set multiplier="+retVal[1]+" where assembly_id="+asmId+" and costbook_id="+toCbId);

		}
		catch (Exception e) {
			System.out.println("importRateMultiplierFromCB: "+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();stmt=null;} catch (Exception e) {}
		}
		return retVal;
	}

	private static String returnListOfResources(String toCbId,String asmId,Connection conn) throws Exception
	{
		String str="";
		PreparedStatement stmt=null;
		ResultSet rst=null;
		try
		{
			stmt=conn.prepareStatement("select ref_id,assembly_id,(select item_specification from item where item.item_id=itemassembly.item_id)as name,(select item_unit from item where item.item_id=itemassembly.item_id)as unit,fraction,(select price from materialcostbook where materialcostbook.item_id=itemassembly.item_id and materialcostbook.costbook_id=itemassembly.costbook_id)as price,costbook_id,fraction_str from itemassembly where assembly_id="+asmId+" and costbook_id="+toCbId);
			rst=stmt.executeQuery();
			while(rst.next())
			{
				str+="<entry>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<asmId>"+rst.getInt(2)+"</asmId>";
				str+="<costBookId>"+rst.getInt(7)+"</costBookId>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				Double fraction=rst.getDouble(5);
				String frac_str=rst.getString(8);
				str+="<fraction>"+ServletUtils.filter((frac_str==null?"-":frac_str))+"</fraction>";
				double price=rst.getDouble(6);
				str+="<price>"+price+"</price>";
				str+="<total>"+DecimalFormat.format(fraction*price)+"</total>";
				str+="</entry>";
			}
		}
		catch (Exception e) {
			System.out.println("returnListOfResources: "+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();stmt=null;} catch (Exception e) {}
		}
		return str;
	}

	private static String returnListOfOverheads(String toCbId,String asmId,Connection conn) throws Exception
	{
		String str="";
		PreparedStatement stmt=null;
		ResultSet rst=null;
		try
		{
			stmt=conn.prepareStatement("select * from assemblyoverhead where assembly_id="+asmId+" and costbook_id="+toCbId);
			rst=stmt.executeQuery();
			while(rst.next())
			{
				str+="<entry>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<amount>"+rst.getString(7)+"</amount>";
				str+="<total>"+DecimalFormat.format(rst.getDouble(4))+"</total>";
				str+="</entry>";
			}
		}
		catch (Exception e) {
			System.out.println("returnListOfOverheads: "+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();stmt=null;} catch (Exception e) {}
		}
		return str;
	}


	public static String updateRateMultiplier(String asmId, String cbId, String multiplier)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		double[] retVal=new double[3];
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select ref_id from assemblycostbook where assembly_id="+asmId+" and costbook_id="+cbId);
			if(rst.first())
			{
				stmt.execute("update assemblycostbook set multiplier="+multiplier+" where ref_id="+rst.getString(1));
			}
			else
			{
				stmt.execute("insert into assemblycostbook (assembly_id, costbook_id, multiplier) values("+asmId+", "+cbId+", "+multiplier+")");
			}

			// update assemblecostbook assembly price
			retVal=updateAssemblyCostbookPrice(conn,cbId,asmId);
			String sumTotal=DecimalFormat.format(retVal[0]);
			String overheadTotal=DecimalFormat.format(retVal[1]);
			//String gross=DecimalFormat.format(retVal[2]);
			str+="<status flag='OK' sumTotal='"+sumTotal+"' overheadTotal='"+overheadTotal+"' gross= '"+retVal[2]+"' />";
		}
		catch (Exception e) {
			System.out.println("updateRateMultiplier: "+e.getMessage());
		}
		finally
		{
			//try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
		}

		str+="</Action>\n";
		return str;
	}
	public static String getMaterialUsed(int cbId)
	{
		String str="<Material>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select item_id,item_name,item_specification,item_unit,price,remarks from materialcostbook left join item using(item_id)  where costbook_id="+cbId);
			while(rst.next())
			{
				str+="<item>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				str+="<price>"+rst.getString(5)+"</price>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(6))+"</remarks>";
				//str+="<>"++"</>";
				str+="</item>";
			}

		}
		catch (Exception e) {
			System.out.println("getMaterialUsed: "+e.getMessage());
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

	public static String updateMaterialCostbook(String id,String cbId,String price,String flag)
	{
		String str="<Action>";

		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		ArrayList<String> asmIds=new ArrayList<String>(); 

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			if(flag!=null)
			{
				String cbPrice="";
				try
				{
					Double.parseDouble(price);
					cbPrice=price;
				}
				catch (Exception e) {
				}
				rst=stmt.executeQuery("select ref_id, price from materialcostbook where item_id='"+id+"' and costbook_id='"+cbId+"'");
				int refId=0;
				String refreshPrice="-";
				while(rst.next())
				{
					refId=rst.getInt(1);
					refreshPrice=(rst.getString(2)==null || rst.getString(2).equalsIgnoreCase(""))?"-":rst.getString(2);
				}
				if(flag.equalsIgnoreCase("update"))
				{
					if(refId!=0)
					{
						if(cbPrice!=null && !cbPrice.equalsIgnoreCase(""))
						{
							stmt.executeUpdate("update materialcostbook set price='"+cbPrice+"' where ref_id='"+refId+"'");
							refreshPrice=cbPrice;
						}

						else
						{
							stmt.executeUpdate("delete from materialcostbook where ref_id='"+refId+"'");
							refreshPrice="-";
						}
					}
					else if(cbPrice!=null && !cbPrice.equalsIgnoreCase(""))
					{
						stmt.execute("insert into materialcostbook (item_id,costbook_id,price) values ('"+id+"', '"+cbId+"', '"+cbPrice+"')");
						refreshPrice=cbPrice;
					}
				}

				rst=stmt.executeQuery("select assembly_id from itemassembly where item_id='"+id+"' and costbook_id='"+cbId+"'");
				while(rst.next())
				{
					asmIds.add(rst.getString(1));
				}

				// update assemblecostbook assembly price
				for(int i=0;i<asmIds.size();i++)
					updateAssemblyCostbookPrice(conn,cbId,asmIds.get(i));

				str+="<refreshValue cbPrice='"+refreshPrice+"' />";
				str+="<status flag='OK' />";
			}

		}
		catch (Exception e) {
			System.out.println("updateMaterialCostbook: "+e.getMessage());
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

	public static String getAssemblyOverheads(String costBookId,String asmId)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		double overheadTotal=0;
		double gross=0;
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select ref_id, multiplier,price from assemblycostbook where assembly_id="+asmId+" and costbook_id="+costBookId);
			String multiplier="1";
			String refId="0";
			while(rst.next())
			{
				refId=rst.getString(1);
				multiplier=rst.getString(2);
				gross=rst.getDouble(3);
			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from assemblyoverhead where assembly_id="+asmId+" and costbook_id="+costBookId);

			while(rst.next())
			{
				str+="<entry>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<amount>"+rst.getString(7)+"</amount>";
				overheadTotal+=rst.getDouble(4);
				str+="<total>"+DecimalFormat.format(rst.getDouble(4))+"</total>";
				str+="</entry>";
			}
			str+="<assembly id='"+asmId+"' refId='"+refId+"' multiplier='"+multiplier+"' overheadTotal='"+DecimalFormat.format(overheadTotal)+"' gross='"+gross+"' />";
		}
		catch (Exception e) {
			System.out.println("getAssemblyOverheads: "+e.getMessage());
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

	public static String deleteAssemblyOverhead(String ids)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		double[] retVal=new double[3];
		String cbId="0";
		String asmId="0";
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select assembly_id,costbook_id from assemblyoverhead where ref_id in("+ids+")");
			if(rst.first())
			{
				cbId=rst.getString(2);
				asmId=rst.getString(1);
				//retVal=updateAssemblyCostbookPrice(conn,rst.getString(2),rst.getString(1));
			}
			stmt.execute("delete from assemblyoverhead where ref_id in ("+ids+")");

			retVal=updateAssemblyCostbookPrice(conn,cbId,asmId);
			String sumTotal=DecimalFormat.format(retVal[0]);
			String overheadTotal=DecimalFormat.format(retVal[1]);
			str+="<status flag='OK' sumTotal='"+sumTotal+"' overheadTotal='"+overheadTotal+"' gross= '"+retVal[2]+"'/>";
		}
		catch (Exception e) {
			System.out.println("deleteAssemblyOverhead: "+e.getMessage());
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

	public static String addAssemblyOverhead(int asmId,int cbId,String name,String description, String amount)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		String expression="";
		double total=0;
		double[] retVal=new double[3];
		try
		{
			if(amount!=null && !amount.equalsIgnoreCase("") && !amount.equalsIgnoreCase("-"))
			{
				expression=amount+";";
				total=Parser.returnResult(expression);
			}

			conn=DataSourceManager.newConnection();
			conn.setAutoCommit(false);
			stmt=conn.prepareStatement("insert into assemblyoverhead (oh_name,oh_description,oh_amount,assembly_id,costbook_id,oh_amount_str) values (?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setDouble(3,total);
			stmt.setInt(4, asmId);
			stmt.setInt(5, cbId);
			stmt.setString(6, amount);
			stmt.execute();
			// if item is not found in assemblycostbook with this costbookId and assemblyId then Insert
			checkAndInsertAssemblyCostbook(conn,""+cbId,""+asmId);

			retVal=updateAssemblyCostbookPrice(conn,""+cbId,""+asmId);

			conn.commit();
			String sumTotal=DecimalFormat.format(retVal[0]);
			String overheadTotal=DecimalFormat.format(retVal[1]);
			rst=stmt.getGeneratedKeys();
			if(rst.first())
			{
				str+="<key value='"+rst.getInt(1)+"' total='"+DecimalFormat.format(total)+"'/>";
			}
			str+="<status flag='OK' sumTotal='"+sumTotal+"' overheadTotal='"+overheadTotal+"' gross= '"+retVal[2]+"'/>";
		}
		catch (Exception e) {
			System.out.println("addAssmeblyOverhead: "+e.getMessage());
			str="<Action>";
			try{if(conn!=null)conn.rollback();}catch(SQLException se){System.out.println("addAssmeblyOverhead: Rollback Fails "+se.getMessage());};
		}
		finally
		{
			try {if(conn!=null)conn.setAutoCommit(true);} catch (Exception e) {}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</Action>";
		return str;
	}
	public static String updateAssemblyOverhead(int id,String name,String description,String amount)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		String expression="";
		double total=0;
		double[] retVal=new double[3];
		try
		{
			if(amount!=null && !amount.equalsIgnoreCase("") && !amount.equalsIgnoreCase("-"))
			{
				expression=amount+";";
				total=Parser.returnResult(expression);
			}

			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update assemblyoverhead set oh_name=? , oh_description=? , oh_amount=?, oh_amount_str=? where ref_id=?");
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setDouble(3, total);
			stmt.setString(4, amount);
			stmt.setInt(5, id);
			stmt.execute();

			rst=stmt.executeQuery("select assembly_id,costbook_id from assemblyoverhead  where ref_id="+id);
			while(rst.next())
			{
				retVal=updateAssemblyCostbookPrice(conn,rst.getString(2),rst.getString(1));
			}
			String sumTotal=DecimalFormat.format(retVal[0]);
			String overheadTotal=DecimalFormat.format(retVal[1]);
			str+="<status flag='OK' sumTotal='"+sumTotal+"' overheadTotal='"+overheadTotal+"' gross= '"+retVal[2]+"'/>";
			str+="<total value='"+DecimalFormat.format(total)+"' />";
		}
		catch (Exception e) {
			System.out.println("updateAssemblyOverhead:Ex "+e.getMessage());
			e.printStackTrace();
		}
		catch (Error e) {
			System.out.println("updateAssemblyOverhead:ER "+e.getMessage());
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

	public static String getCostBookAssemblyOverhead(int parent,int asmId)
	{
		String str="<CostBook>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from cbcategory where cbcat_parent_id="+parent);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<cbCat>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</cbCat>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select *,exists(select * from assemblyoverhead where assemblyoverhead.costbook_id=costbook.costbook_id and assembly_id="+asmId+")as b from costbook where cbcat_id="+parent);
			while(rst.next())
			{
				str+="<cb>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				str+="<analysisAval>"+rst.getInt(6)+"</analysisAval>";
				//str+="<>"++"</>";
				str+="</cb>";

			}
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select cbcat_parent_id from cbcategory where cbcat_id ="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />";
			}
		}
		catch (Exception e) {
			System.out.println("getCostBookAssemblyOverhead: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</CostBook>";
		return str;
	}

	public static String searchCostBookAssemblyOverhead(String key,int asmId)
	{
		String str="<CostBook>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from cbcategory where cbcat_name like '%"+key+"%' or cbcat_specification like '%"+key+"%' or cbcat_remarks like '%"+key+"%'");
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<cbCat>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</cbCat>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select *,exists(select * from assemblyoverhead where assemblyoverhead.costbook_id=costbook.costbook_id and assembly_id="+asmId+")as b from costbook where costbook_name like '%"+key+"%' or costbook_specification like '%"+key+"%' or costbook_remarks like '%"+key+"%'");
			while(rst.next())
			{
				str+="<cb>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				str+="<analysisAval>"+rst.getInt(6)+"</analysisAval>";
				//str+="<>"++"</>";
				str+="</cb>";

			}
		}
		catch (Exception e) {
			System.out.println("searchCostBookAssemblyOverhead: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</CostBook>";
		return str;
	}

	public static String moveCostBook(int id,int from,int to)
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
			stmt.execute("update costbook set cbcat_id="+to+" where costbook_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveCostBook: "+e.getMessage());
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
	public static String moveCostBookCategory(int id,int from,int to)
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
			if(isInnerTree(id,to,conn,"cbcategory","cbcat_id","cbcat_parent_id"))		//If destination is part of inner tree, abort
				return str+"</Action>";
			stmt=conn.createStatement();
			stmt.execute("update cbcategory set cbcat_parent_id="+to+" where cbcat_id="+id);
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
	public static String searchCostBook(String key)
	{
		String str="<CostBook>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from cbcategory where cbcat_name like '%"+key+"%' or cbcat_specification like '%"+key+"%' or cbcat_remarks like '%"+key+"%'");
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<cbCat>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</cbCat>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from costbook where costbook_name like '%"+key+"%' or costbook_specification like '%"+key+"%' or costbook_remarks like '%"+key+"%'");
			while(rst.next())
			{
				str+="<cb>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</cb>";

			}

		}
		catch (Exception e) {
			System.out.println("searchCostBook: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		//str+="<levelParent id='1' />";
		str+="</CostBook>";
		return str;
	}

	public static String getAssembliesUsed(int cbId)
	{
		String str="<Assembly>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select assembly_id,assembly_name,assembly_specification,assembly_unit,price,multiplier from assemblycostbook left join assembly using(assembly_id)  where costbook_id="+cbId);
			while(rst.next())
			{
				str+="<item>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<unit>"+ServletUtils.filter(rst.getString(4))+"</unit>";
				str+="<price>"+rst.getString(5)+"</price>";
				str+="<multiplier>"+rst.getString(6)+"</multiplier>";
				//str+="<>"++"</>";
				str+="</item>";
			}

		}
		catch (Exception e) {
			System.out.println("getAssembliesUsed: "+e.getMessage());
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

	public static String importFromAssemblies(String cbId, String asmId, String ids, String volumes,int flag)
	{
		String str="<Action>";
		Connection conn=null;
		double retVal[];
		String retVal1[];
		try
		{
			//Type checking and housekeeping
			String assembliesStr[]=ids.split(",");
			String amountsStr[]=volumes.split(",");
			if(assembliesStr.length!=amountsStr.length) throw new Exception("Illegal parameters: ids and volumes");
			int[] assemblies=new int[assembliesStr.length];
			double[] amounts=new double[assembliesStr.length];
			for(int i=0;i<assembliesStr.length;i++)
			{
				assemblies[i]=Integer.parseInt(assembliesStr[i]);
				amounts[i]=Double.parseDouble(amountsStr[i]);
			}
			// For Hibernate use Transaction for below 2 statements 

			conn=DataSourceManager.newConnection();
			conn.setAutoCommit(false);

			//Import resources into the target assembly
			//if(flag==1)
			importResourcesFromAssemblies(cbId, asmId, assemblies, amounts, conn);
			//Import Overheads from Costbook to the target assembly
			//else
			importOverheadsFromAssemblies(cbId, asmId, assemblies, amounts, conn);

			// if item is not found in assemblycostbook with this costbookId and assemblyId then Insert
			checkAndInsertAssemblyCostbook(conn,cbId,asmId);


			//Import the rate multiplier
			String multiplier="1";
			String refId="0";
			retVal1=importRateMultiplierFromCB(cbId, cbId, asmId, conn);
			refId=retVal1[0];
			multiplier=retVal1[1];

			// update assemblecostbook assembly price
			retVal=updateAssemblyCostbookPrice(conn,cbId,asmId);
			conn.commit();

			//Get the list of resources
			if(flag==1)
			{
				str+=returnListOfResources(cbId, asmId, conn);
				str+="<assembly id='"+asmId+"' refId='"+refId+"' multiplier='"+multiplier+"' sumTotal='"+DecimalFormat.format(retVal[0])+"' gross='"+retVal[2]+"' />";
			}
			//get the list of overheads
			else
			{
				//Get the list of overheads
				str+=returnListOfOverheads(cbId, asmId, conn);
				str+="<assembly id='"+asmId+"' refId='"+refId+"' multiplier='"+multiplier+"' overheadTotal='"+DecimalFormat.format(retVal[1])+"' gross='"+retVal[2]+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("importFromAssemblies: "+e.getMessage());
			e.printStackTrace();
			try{if(conn!=null)conn.rollback();}catch(SQLException se){System.out.println("importFromAssemblies: Rollback Fails "+se.getMessage());};
		}
		finally
		{
			try {if(conn!=null)conn.setAutoCommit(true);} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>";
		return str;
	}

	private static void importResourcesFromAssemblies(String cbId, String asmId, int[] ids, double[] volumes,Connection conn) throws Exception
	{
		PreparedStatement stmt=null;
		ResultSet rst=null;
		Statement stmt1=null;
		Map<Integer, BoqBean> resources=new HashMap<Integer, BoqBean>();
		BoqBean bean=null;
		try
		{
			stmt=conn.prepareStatement("insert into itemassembly (assembly_id,item_id,fraction,costbook_id,fraction_str) values (?,?,?,?,?)");
			stmt1=conn.createStatement();
			//Cleanse the database
			stmt1.execute("delete from itemassembly where assembly_id="+asmId+" and costbook_id="+cbId);
			//Iterate through all assemblies
			for(int i=0;i<ids.length;i++)
			{
				rst=stmt1.executeQuery("select itemassembly.item_id,fraction,price,fraction_str from itemassembly left join materialcostbook on itemassembly.costbook_id=materialcostbook.costbook_id and itemassembly.item_id=materialcostbook.item_id where itemassembly.costbook_id="+cbId+" and assembly_id="+ids[i]);

				//Create list of resources which will be exported
				while(rst.next())
				{
					Integer itemId=new Integer(rst.getInt(1));
					if(resources.containsKey(itemId))
					{
						bean=resources.get(itemId);
						bean.setVolume(bean.getVolume()+rst.getDouble(2)*volumes[i]);
					}
					else
					{
						bean=new BoqBean();
						bean.setId(itemId.intValue());
						bean.setVolume(rst.getDouble(2)*volumes[i]);
						bean.setPrice(rst.getDouble(3));
						resources.put(itemId, bean);
					}
				}
				try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}
			}

			//Insert Resources into the assembly
			Iterator<Entry<Integer, BoqBean>> it=resources.entrySet().iterator();
			while(it.hasNext())
			{
				Map.Entry<Integer, BoqBean> pair=(Map.Entry<Integer, BoqBean>)it.next();
				bean=pair.getValue();

				stmt.setString(1, asmId);
				String itemId=""+bean.getId();
				stmt.setString(2, itemId);
				stmt.setString(3,""+bean.getVolume());
				stmt.setString(4, cbId);
				stmt.setString(5, ""+bean.getVolume());
				stmt.execute();
				//We don't need to check and insert, as items are already there
				// if item is not found in materialcostbook with this costbookId then Insert
				//checkAndInsert(conn, ""+itemId, ""+cbId, itemId);
			}
		}
		catch (Exception e) {
			System.out.println("importResourcesFromAssemblies: "+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();stmt=null;} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();stmt1=null;} catch (Exception e) {}
		}
	}
	private static void importOverheadsFromAssemblies(String cbId, String asmId, int[] ids, double[] volumes,Connection conn) throws Exception
	{
		PreparedStatement stmt=null;
		ResultSet rst=null;
		Statement stmt1=null;
		OverheadBean bean=new OverheadBean();
		bean.setAmount(0);
		bean.setName("Imported Overheads Total");
		try
		{
			stmt=conn.prepareStatement("insert into assemblyoverhead (oh_name,oh_description,oh_amount,assembly_id,costbook_id,oh_amount_str) values (?,?,?,?,?,?)");
			stmt1=conn.createStatement();
			stmt1.execute("delete from assemblyoverhead where assembly_id="+asmId+" and costbook_id="+cbId);
			//Iterate through all assemblies
			for(int i=0;i<ids.length;i++)
			{
				rst=stmt1.executeQuery("select ifnull(sum(oh_amount),0) from assemblyoverhead where costbook_id="+cbId+" and assembly_id="+ids[i]);
				while(rst.next())
					bean.setAmount(bean.getAmount()+rst.getDouble(1)*volumes[i]);
				try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}
			}


			stmt.setString(1, bean.getName());
			stmt.setString(2, bean.getName());
			stmt.setString(3, ""+bean.getAmount());
			stmt.setString(4, asmId);
			stmt.setString(5, cbId);
			stmt.setString(6, ""+bean.getAmount());
			stmt.execute();
		}
		catch (Exception e) {
			System.out.println("importOverheadsFromAssemblies: "+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();stmt=null;} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();stmt1=null;} catch (Exception e) {}
		}
	}
}