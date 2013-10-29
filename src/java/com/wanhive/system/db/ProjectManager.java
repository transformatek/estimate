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

import com.wanhive.basic.arithexp.Parser;
import com.wanhive.basic.db.DataSourceManager;
import com.wanhive.basic.utils.ServletUtils;
import com.wanhive.system.utils.DecimalFormat;




public class ProjectManager {
	public static String getProject(int parent)
	{
		String str="<Project>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from project where project_parent_id="+parent);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<project>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</project>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from (select * from estimate where project_id='"+parent+"')as est left join (select costbook_id as cb_id,costbook_name from costbook) as cb on cb.cb_id=est.costbook_id");

			while(rst.next())
			{
				str+="<estimate>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				str+="<cbId>"+rst.getInt(6)+"</cbId>";
				str+="<cbName>"+ServletUtils.filter((rst.getString(10)==null?"--":rst.getString(10)))+"</cbName>";
				str+="<contingency>"+rst.getDouble(7)+"</contingency>";
				str+="<roundedAmount>"+ServletUtils.filter(rst.getString(8))+"</roundedAmount>";
				//str+="<>"++"</>";
				str+="</estimate>";

			}
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select project_parent_id from project where project_id ="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />";
			}
		}
		catch (Exception e) {
			System.out.println("getProject: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</Project>";
		return str;
	}

	public static String deleteProject(String proIds,String estIds)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			if(proIds!=null && proIds.length()>0)
				stmt.execute("delete from project where project_id in ("+proIds+")");
			if(estIds!=null && estIds.length()>0)
				stmt.execute("delete from estimate where estimate_id in ("+estIds+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteProject: "+e.getMessage());
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

	public static String updateEstimate(String id,String name,String description,String remarks,String contingency,String rndOffFigure)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			Integer.parseInt(id);
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update estimate set estimate_name=? , estimate_specification=? , estimate_remarks=? , contingency=? , rounded_figure=? where estimate_id=?");
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, contingency);
			stmt.setString(5, rndOffFigure);
			stmt.setString(6, id);
			stmt.execute();
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateEstimate: "+e.getMessage());
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

	public static String updateProject(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();

			stmt=conn.prepareStatement("update project set project_name=? , project_specification=? , project_remarks=? where project_id=?");
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();

			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateProject: "+e.getMessage());
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

	public static String addEstimate(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;
		try
		{
			Integer.parseInt(id);
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into estimate (estimate_name,estimate_specification,estimate_remarks,project_id) values (?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key type='estimate' value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addEstimate: "+e.getMessage());
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
	public static String addProject(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into project (project_name,project_specification,project_remarks,project_parent_id) values (?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key type='project' value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addProject: "+e.getMessage());
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

	public static String updateEstimateCostBook(int id,int estimateId)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.executeUpdate("update estimate set costbook_id="+id+" where estimate_id="+estimateId);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateCostBook: "+e.getMessage());
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

	public static String moveEstimate(int id,int from,int to)
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
			stmt.execute("update estimate set project_id="+to+" where estimate_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveEstimate: "+e.getMessage());
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
	public static String moveProject(int id,int from,int to)
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
			if(isInnerTree(id,to,conn,"project","project_id","project_parent_id"))		//If destination is part of inner tree, abort
				return str+"</Action>";
			stmt=conn.createStatement();
			stmt.execute("update project set project_parent_id="+to+" where project_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveProject: "+e.getMessage());
		}
		finally
		{
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
	public static String copyEstimate(int id,int from,int to)
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
			stmt1=conn.prepareStatement("insert into estimate (estimate_name,estimate_specification,estimate_remarks,project_id,costbook_id) values (?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			rst=stmt.executeQuery("select *from estimate where estimate_id="+id);
			while(rst.next())
			{
				stmt1.setString(1, rst.getString(2));
				stmt1.setString(2, rst.getString(3));
				stmt1.setString(3, rst.getString(4));
				stmt1.setString(4, ""+to);
				stmt1.setString(5, rst.getString(6));
				stmt1.execute();
				conn.commit();
				rst1=stmt1.getGeneratedKeys();
				while(rst1.next())
				{
					newKey=rst1.getInt(1);
					str+="<key type='estimate' value='"+newKey+"' />";
					copyBills(id,newKey,conn);
				}
				try {if(rst1!=null)rst1.close();} catch (Exception e) {}
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			try{conn.rollback();}catch (Exception e1) {}
			System.out.println("copyEstimate: "+e.getMessage());
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

	private static void copyBills(int estimateId,int newId,Connection conn) throws Exception
	{
		Statement stmt=null;
		PreparedStatement stmt1=null;
		Statement stmt2=null;
		ResultSet rst=null;
		ResultSet rst2=null;
		try
		{
			stmt=conn.createStatement();
			stmt1=conn.prepareStatement("insert into bill (estimate_id,assembly_id,premium,remarks) values (?,?,?,?)");
			stmt2=conn.createStatement();
			rst=stmt.executeQuery("select * from bill where estimate_id="+estimateId);
			while(rst.next())
			{
				stmt1.setInt(1, newId);
				stmt1.setInt(2, rst.getInt(3));
				stmt1.setString(3, rst.getString(4));
				stmt1.setString(4, rst.getString(5));
				stmt1.execute();

				int newBillKey=0;
				rst2=stmt2.executeQuery("select max(bill_id) from bill");
				while(rst2.next())
				{
					newBillKey=rst2.getInt(1);
				}
				try {if(rst2!=null)rst2.close();rst2=null;} catch (Exception e) {}
				copyBillEntries(rst.getInt(1),newBillKey,conn);
			}
		}
		catch (Exception e) {
			System.out.println("copyBills: "+e.getMessage());
			throw e;	//Re-throw Exception
		}
		finally			//Close resources in any case
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();} catch (Exception e) {}
			try {if(stmt2!=null)stmt2.close();} catch (Exception e) {}
		}
	}

	private static void copyBillEntries(int from,int to,Connection conn) throws Exception
	{
		Statement stmt=null;
		PreparedStatement stmt1=null;
		ResultSet rst=null;
		try
		{
			stmt=conn.createStatement();
			stmt1=conn.prepareStatement("insert into billentry (bill_id,specification,entry_number,entry_length,entry_breadth,entry_height,entry_weight,entry_total) values (?,?,?,?,?,?,?,?)");
			rst=stmt.executeQuery("select * from billentry where bill_id="+from);

			while(rst.next())
			{
				stmt1.setInt(1, to);
				stmt1.setString(2, rst.getString(3));
				stmt1.setString(3, rst.getString(4));
				stmt1.setString(4, rst.getString(5));
				stmt1.setString(5, rst.getString(6));
				stmt1.setString(6, rst.getString(7));
				stmt1.setString(7, rst.getString(8));
				stmt1.setString(8, rst.getString(9));
				stmt1.execute();
			}
		}
		catch (Exception e) {
			System.out.println("copyBillEntries: "+e.getMessage());
			throw e;	//Re-throw Exception
		}
		finally			//Close resources in any case
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();} catch (Exception e) {}
		}
	}

	// overheads

	public static String getOverheadList(int estimateId)
	{
		String str="<OverheadList>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from overhead where estimate_id="+estimateId);
			str+="<estimate id='"+estimateId+"' />";
			while(rst.next())
			{
				str+="<entry>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<overheadTitle>"+ServletUtils.filter(((rst.getString(2)==null || rst.getString(2).equalsIgnoreCase(""))?"-":rst.getString(2)))+"</overheadTitle>";
				str+="<overheadPercent>"+ServletUtils.filter(((rst.getString(3)==null || rst.getString(3).equalsIgnoreCase(""))?"-":rst.getString(3)))+"</overheadPercent>";
				str+="<overheadType>"+rst.getString(4)+"</overheadType>";
				str+="<overheadAmount>"+ServletUtils.filter(((rst.getString(5)==null || rst.getString(5).equalsIgnoreCase(""))?"-":rst.getString(5)))+"</overheadAmount>";
				str+="<estimateId>"+rst.getInt(6)+"</estimateId>";
				str+="</entry>";
			}
		}
		catch (Exception e) {
			System.out.println("getOverheadList: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</OverheadList>";
		return str;
	}

	public static String deleteOverheads(String ids)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("delete from overhead where overhead_id in ("+ids+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteOverheads: "+e.getMessage());
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

	public static String addOverhead(int estimateId,String description,String percent,String type,String amount)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into overhead (overhead_title,overhead_percent,overhead_type,overhead_amount,estimate_id) values (?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, description);
			stmt.setString(2, percent);
			stmt.setString(3, type);
			stmt.setString(4, amount);
			stmt.setInt(5, estimateId);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			if(rst.first())
			{
				str+="<key value='"+rst.getInt(1)+"'/>";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addOverhead: "+e.getMessage());
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
	public static String updateOverhead(int id,String description,String percent,String type,String amount)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update overhead set overhead_title=? , overhead_percent=? , overhead_type=? , overhead_amount=? where overhead_id=?");
			stmt.setString(1, description);
			stmt.setString(2, percent);
			stmt.setString(3, type);
			stmt.setString(4, amount);
			stmt.setInt(5, id);
			stmt.execute();

			str+="<status flag='OK' />";

		}
		catch (Exception e) {
			System.out.println("updateOverhead:"+e.getMessage());
		}
		catch (Error e) {
			System.out.println("updateOverhead:ER "+e.getMessage());
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

	public static String searchProject(String key)
	{
		String str="<Project>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from project where project_name like '%"+key+"%' or project_specification like '%"+key+"%' or project_remarks like '%"+key+"%'");
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<project>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				//str+="<>"++"</>";
				str+="</project>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from estimate where estimate_name like '%"+key+"%' or estimate_specification like '%"+key+"%' or estimate_remarks like '%"+key+"%'");
			rst=stmt.executeQuery("select * from (select * from estimate where estimate_name like '%"+key+"%' or estimate_specification like '%"+key+"%' or estimate_remarks like '%"+key+"%')as est left join (select costbook_id as cb_id,costbook_name from costbook) as cb on cb.cb_id=est.costbook_id");
			while(rst.next())
			{
				str+="<estimate>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(3))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(4))+"</remarks>";
				str+="<parent>"+rst.getInt(5)+"</parent>";
				str+="<cbId>"+rst.getInt(6)+"</cbId>";
				str+="<cbName>"+ServletUtils.filter((rst.getString(10)==null?"--":rst.getString(10)))+"</cbName>";
				str+="<contingency>"+rst.getDouble(7)+"</contingency>";
				str+="<roundedAmount>"+ServletUtils.filter(rst.getString(8))+"</roundedAmount>";
				//str+="<>"++"</>";
				str+="</estimate>";

			}

		}
		catch (Exception e) {
			System.out.println("searchProject: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		//str+="<levelParent id='1' />";
		str+="</Project>";
		return str;
	}

	/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
	/*                       CREATE COST SHEET                     */
	/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

	public static String getBill(int estimateId)
	{
		String str="<Bill>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select * from bill where estimate_id="+estimateId+") as bill left join " +
					"(select * from (select * from assembly) as asm left join (select assemblycostbook.costbook_id as cb_id, assembly_id as asm_id,price,premium, estimate.costbook_id from " +
					"assemblycostbook,estimate where  assemblycostbook.costbook_id=estimate.costbook_id and estimate.estimate_id="+estimateId+") " +
			"as cb on asm.assembly_id=cb.asm_id) as asmb on bill.assembly_id=asmb.assembly_id");
			while(rst.next())
			{
				str+="<bill>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<estimate>"+rst.getInt(2)+"</estimate>";
				str+="<assembly>"+rst.getInt(3)+"</assembly>";
				str+="<premium>"+rst.getString(4)+"</premium>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(5))+"</remarks>";
				str+="<name>"+ServletUtils.filter(rst.getString(7))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(8))+"</description>";
				str+="<unit>"+ServletUtils.filter(rst.getString(9))+"</unit>";
				str+="<stdPrice>"+rst.getString(10)+"</stdPrice>";
				str+="<stdPremium>"+rst.getString(11)+"</stdPremium>";
				str+="<cbPrice>"+(rst.getString(18)==null?"-":rst.getString(18))+"</cbPrice>";
				str+="<cbPremium>"+(rst.getString(19)==null?"-":rst.getString(19))+"</cbPremium>";
				str+="<cbId>"+rst.getString(20)+"</cbId>";
				str+="</bill>";
			}
		}
		catch (Exception e) {
			System.out.println("getBill: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</Bill>";
		return str;
	}

	public static String deleteBill(String ids)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("delete from bill where bill_id in ("+ids+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteBill: "+e.getMessage());
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

	public static String updatePremium(int id,String premium,String flag)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			if(flag!=null)
			{
				String billPremium="";
				try
				{
					Double.parseDouble(premium);
					billPremium=premium;
				}
				catch (Exception e) {
				}
				rst=stmt.executeQuery("select premium from bill where bill_id='"+id+"'");
				String refreshPremium="";
				while(rst.next())
				{
					refreshPremium=rst.getString(1);
				}
				if(flag.equalsIgnoreCase("update"))
				{
					if(billPremium!=null && !billPremium.equalsIgnoreCase(""))
					{
						stmt.executeUpdate("update bill set premium='"+billPremium+"' where bill_id='"+id+"'");
						refreshPremium=billPremium;
					}

				}

				str+="<refreshValue premium='"+refreshPremium+"' />";
				str+="<status flag='OK' />";
			}

		}
		catch (Exception e) {
			System.out.println("updatePremium: "+e.getMessage());
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

	public static String getAssembly(int costBookId,int parent)
	{
		String str="<Assembly>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select * from assembly where assembly_parent_id="+parent+")as asm left join assemblycostbook on asm.assembly_id=assemblycostbook.assembly_id and costbook_id="+costBookId);
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
				str+="<parent>"+rst.getInt(8)+"</parent>";
				str+="<costbook>"+(rst.getString(13)==null?"-":rst.getString(13))+"</costbook>";
				str+="<cbPrice>"+(rst.getString(14)==null?"-":rst.getString(14))+"</cbPrice>";
				str+="<cbPremium>"+(rst.getString(15)==null?"-":rst.getString(15))+"</cbPremium>";
				str+="</item>";
			}
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select assembly_parent_id from assembly where assembly_id="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />";
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

	public static String addAssemblyToBill(int id,int estimateId,String premium)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("insert into bill (estimate_id,assembly_id,premium) values ('"+estimateId+"', '"+id+"', '"+premium+"')", Statement.RETURN_GENERATED_KEYS);
			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addAssemblyToBill: "+e.getMessage());
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

	public static String getJobList(int billId)
	{
		String str="<JobList>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from billentry where bill_id="+billId);
			str+="<bill id='"+billId+"' />";
			while(rst.next())
			{
				str+="<entry>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<billId>"+rst.getInt(2)+"</billId>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<number>"+ServletUtils.filter((rst.getString(4)==null?"-":rst.getString(4)))+"</number>";
				str+="<length>"+ServletUtils.filter(((rst.getString(5)==null || rst.getString(5).equalsIgnoreCase(""))?"-":rst.getString(5)))+"</length>";

				str+="<breadth>"+ServletUtils.filter(((rst.getString(6)==null || rst.getString(6).equalsIgnoreCase(""))?"-":rst.getString(6)))+"</breadth>";
				str+="<height>"+ServletUtils.filter(((rst.getString(7)==null || rst.getString(7).equalsIgnoreCase(""))?"-":rst.getString(7)))+"</height>";
				str+="<weight>"+ServletUtils.filter(((rst.getString(8)==null || rst.getString(8).equalsIgnoreCase(""))?"-":rst.getString(8)))+"</weight>";
				str+="<total>"+DecimalFormat.format(rst.getDouble(9))+"</total>";
				str+="</entry>";
			}
		}
		catch (Exception e) {
			System.out.println("getJobList: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</JobList>";
		return str;
	}

	public static String deleteJobs(String ids)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("delete from billentry where entry_id in ("+ids+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteJobs: "+e.getMessage());
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

	public static String addJob(int billId,String description,String number,String length,String breadth,String height,String weight)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;


		try
		{
			//String expression1="1+2;";
			String expression="";
			String varArray[]=new String[5];
			int varCount=0;

			if(number!=null && !number.equalsIgnoreCase("") && !number.equalsIgnoreCase("-"))
			{
				varArray[varCount++]=number;
			}
			if(length!=null && !length.equalsIgnoreCase("") && !length.equalsIgnoreCase("-"))
			{
				varArray[varCount++]=length;
			}
			if(breadth!=null && !breadth.equalsIgnoreCase("") && !breadth.equalsIgnoreCase("-"))
			{
				varArray[varCount++]=breadth;
			}
			if(height!=null && !height.equalsIgnoreCase("") && !height.equalsIgnoreCase("-"))
			{
				varArray[varCount++]=height;
			}
			if(weight!=null && !weight.equalsIgnoreCase("") && !weight.equalsIgnoreCase("-"))
			{
				varArray[varCount++]=weight;
			}

			if(varCount==0)
				throw new Exception("At least one field must be filled");
			else
			{
				for(int i=0;i<varCount;i++)
				{
					expression+="("+varArray[i]+")";
					if(i<varCount-1)
						expression+="*";
				}
				expression+=";";
			}
			double total=Parser.returnResult(expression);
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into billentry (bill_id,specification,entry_number,entry_length,entry_breadth,entry_height,entry_weight,entry_total) values (?,?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setInt(1, billId);
			stmt.setString(2, description);
			stmt.setString(3, number);
			stmt.setString(4, length);
			stmt.setString(5, breadth);
			stmt.setString(6, height);
			stmt.setString(7, weight);
			stmt.setDouble(8, total);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key value='"+rst.getInt(1)+"' total='"+DecimalFormat.format(total)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addJob: "+e.getMessage());
		}
		catch(Error e) {
			System.out.println("addJob: "+e.getMessage());
			str="<Action>";
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
	public static String updateJob(int id,String description,String number,String length,String breadth,String height,String weight)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			//String expression1="1+2;";
			String expression="";
			String varArray[]=new String[5];
			int varCount=0;

			if(number!=null && !number.equalsIgnoreCase("") && !number.equalsIgnoreCase("-"))
			{
				varArray[varCount++]=number;
			}
			if(length!=null && !length.equalsIgnoreCase("") && !length.equalsIgnoreCase("-"))
			{
				varArray[varCount++]=length;
			}
			if(breadth!=null && !breadth.equalsIgnoreCase("") && !breadth.equalsIgnoreCase("-"))
			{
				varArray[varCount++]=breadth;
			}
			if(height!=null && !height.equalsIgnoreCase("") && !height.equalsIgnoreCase("-"))
			{
				varArray[varCount++]=height;
			}
			if(weight!=null && !weight.equalsIgnoreCase("") && !weight.equalsIgnoreCase("-"))
			{
				varArray[varCount++]=weight;
			}

			if(varCount==0)
				throw new Exception("At least one field must be filled");
			else
			{
				for(int i=0;i<varCount;i++)
				{
					expression+="("+varArray[i]+")";
					if(i<varCount-1)
						expression+="*";
				}
				expression+=";";
			}
			double total=Parser.returnResult(expression);
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update billentry set specification=? , entry_number=? , entry_length=? , entry_breadth=? , entry_height=? , entry_weight=? , entry_total=? where entry_id=?");


			stmt.setString(1, description);
			stmt.setString(2, number);
			stmt.setString(3, length);
			stmt.setString(4, breadth);
			stmt.setString(5, height);
			stmt.setString(6, weight);
			stmt.setDouble(7, total);
			stmt.setInt(8, id);
			stmt.execute();

			str+="<status flag='OK' />";
			str+="<total value='"+DecimalFormat.format(total)+"' />";
		}
		catch (Exception e) {
			System.out.println("updateJob: "+e.getMessage());
		}
		catch (Error e) {
			System.out.println("updateJob: "+e.getMessage());
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
}
