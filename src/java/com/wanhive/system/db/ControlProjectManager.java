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
import java.text.SimpleDateFormat;
import java.util.Date;

import com.wanhive.basic.arithexp.Parser;
import com.wanhive.basic.db.DataSourceManager;
import com.wanhive.basic.utils.ServletUtils;
import com.wanhive.system.utils.DecimalFormat;



public class ControlProjectManager {
	public static String getControlProject(int parent)
	{
		String str="<ControlProject>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from control_project where control_project_parent_id="+parent);
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
			rst=stmt.executeQuery("select * from (select * from control_estimate where control_project_id='"+parent+"') as cest left join (select * from estimate) as est on cest.estimate_id=est.estimate_id");

			while(rst.next())
			{
				str+="<estimate>";
				str+="<ctrlId>"+rst.getInt(1)+"</ctrlId>";
				str+="<ctrlParent>"+rst.getInt(3)+"</ctrlParent>";
				str+="<id>"+rst.getInt(4)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(5))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(6))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(7))+"</remarks>";
				str+="<parent>"+rst.getInt(8)+"</parent>";
				//str+="<>"++"</>";
				str+="</estimate>";

			}
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select control_project_parent_id from control_project where control_project_id ="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />";
			}
		}
		catch (Exception e) {
			System.out.println("getControlProject: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</ControlProject>";
		return str;
	}
	
	public static String deleteControlProject(String proIds,String estIds)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			if(proIds!=null && proIds.length()>0)
				stmt.execute("delete from control_project where control_project_id in ("+proIds+")");
			if(estIds!=null && estIds.length()>0)
				stmt.execute("delete from control_estimate where control_estimate_id in ("+estIds+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteControlProject: "+e.getMessage());
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
	
	public static String updateControlProject(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();

			stmt=conn.prepareStatement("update control_project set control_project_name=? , control_project_specification=? , control_project_remarks=? where control_project_id=?");
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();

			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateControlProject: "+e.getMessage());
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
	
	public static String addControlProject(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into control_project (control_project_name,control_project_specification,control_project_remarks,control_project_parent_id) values (?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
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
	
	public static String addEstimateToControl(int id,int controlProjectId)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("insert into control_estimate (estimate_id,control_project_id) values ('"+id+"', '"+controlProjectId+"')", Statement.RETURN_GENERATED_KEYS);
			
			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addEstimateToControl: "+e.getMessage());
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
	
	public static String moveControlEstimate(int id,int from,int to)
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
			stmt.execute("update control_estimate set control_project_id="+to+" where control_estimate_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveControlEstimate: "+e.getMessage());
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
	public static String moveControlProject(int id,int from,int to)
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
			if(isInnerTree(id,to,conn,"control_project","control_project_id","control_project_parent_id"))		//If destination is part of inner tree, abort
				return str+"</Action>";
			stmt=conn.createStatement();
			stmt.execute("update control_project set control_project_parent_id="+to+" where control_project_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveControlProject: "+e.getMessage());
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
			rst=stmt.executeQuery("select * from control_project where control_project_name like '%"+key+"%' or control_project_specification like '%"+key+"%' or control_project_remarks like '%"+key+"%'");
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
			rst=stmt.executeQuery("select * from control_estimate left join (select * from estimate) as est on control_estimate.estimate_id=est.estimate_id where estimate_name like '%"+key+"%' or estimate_specification like '%"+key+"%' or estimate_remarks like '%"+key+"%'");

			while(rst.next())
			{
				str+="<estimate>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(5))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(6))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(7))+"</remarks>";
				str+="<parent>"+rst.getInt(3)+"</parent>";
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
	/*                        MANAGE SCHEDULES                     */
	/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
	public static String getControlBill(String estimateId)
	{
		String str="<ControlBill>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select bill_id,assembly_name,assembly_specification from bill left join assembly using (assembly_id) where estimate_id="+estimateId);
			while(rst.next())
			{
				str+="<bill>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="</bill>";
			}
		}
		catch (Exception e) {
			System.out.println("getControlBill: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</ControlBill>";
		return str;
	}
	
	public static String getControlBillDetail(String billId)
	{
		String str="<PlannedJobs>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy"); 
		str+="<Key id='"+billId+"'/>";
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from billentry where bill_id="+billId);
			while(rst.next())
			{
				str+="<entry>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<number>"+ServletUtils.filter(rst.getString(4))+"</number>";
				str+="<length>"+ServletUtils.filter(rst.getString(5))+"</length>";
				str+="<breadth>"+ServletUtils.filter(rst.getString(6))+"</breadth>";
				str+="<height>"+ServletUtils.filter(rst.getString(7))+"</height>";
				str+="<weight>"+ServletUtils.filter(rst.getString(8))+"</weight>";
				str+="<total>"+DecimalFormat.format(rst.getDouble(9))+"</total>";
				//str+="<pstart>"+ServletUtils.filter(rst.getLong(10)==0?"-":formatter.format((rst.getLong(10))))+"</pstart>";
				//str+="<pfinish>"+ServletUtils.filter(rst.getLong(11)==0?"-":formatter.format((rst.getLong(11))))+"</pfinish>";
				str+="<pstart>"+ServletUtils.filter(formatter.format((rst.getLong(10))))+"</pstart>";
				str+="<pfinish>"+ServletUtils.filter(formatter.format((rst.getLong(11))))+"</pfinish>";
				str+="<pstatus>"+rst.getInt(12)+"</pstatus>";
				str+="</entry>";
			}
		}
		catch (Exception e) {
			System.out.println("getControlBillDetail: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</PlannedJobs>";
		return str;
	}
	
	public static String updatePlanSchedule(int id,String sdate,String fdate,int status)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
		long startDate=0,finishDate=0;
		
		try
		{
			
			if(sdate!=null && !sdate.equalsIgnoreCase("") && !sdate.equalsIgnoreCase("-"))
			{
				Date date=(Date)formatter.parse(sdate);
				startDate=date.getTime();
			}
			if(fdate!=null && !fdate.equalsIgnoreCase("") && !fdate.equalsIgnoreCase("-"))
			{
				Date date=(Date)formatter.parse(fdate);
				finishDate=date.getTime();
			}
			if(startDate>finishDate)
				throw new Exception("Invalid Date range");
			
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.executeUpdate("update billentry set start='"+startDate+"' ,finish='"+finishDate+"', status='"+status+"' where entry_id='"+id+"'");
			
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updatePlanSchedule: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}


		str+="</Action>";
		return str;
	}
	
	public static String getWorkDoneList(int entryId,int controlEstimateId)
	{
		String str="<WorkList>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");     
	      
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from workdone where entry_id="+entryId+" and control_estimate_id="+controlEstimateId+" order by 1 desc");
			str+="<entry id='"+entryId+"' />";
			while(rst.next())
			{
				str+="<works>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<entryId>"+rst.getInt(2)+"</entryId>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<number>"+ServletUtils.filter((rst.getString(4)==null?"-":rst.getString(4)))+"</number>";
				str+="<length>"+ServletUtils.filter(((rst.getString(5)==null || rst.getString(5).equalsIgnoreCase(""))?"-":rst.getString(5)))+"</length>";
				str+="<breadth>"+ServletUtils.filter(((rst.getString(6)==null || rst.getString(6).equalsIgnoreCase(""))?"-":rst.getString(6)))+"</breadth>";
				str+="<height>"+ServletUtils.filter(((rst.getString(7)==null || rst.getString(7).equalsIgnoreCase(""))?"-":rst.getString(7)))+"</height>";
				str+="<weight>"+ServletUtils.filter(((rst.getString(8)==null || rst.getString(8).equalsIgnoreCase(""))?"-":rst.getString(8)))+"</weight>";
				str+="<total>"+DecimalFormat.format(rst.getDouble(9))+"</total>";
				str+="<start>"+ServletUtils.filter(formatter.format((rst.getLong(10))))+"</start>";
				str+="<finish>"+ServletUtils.filter(formatter.format((rst.getLong(11))))+"</finish>";
				str+="</works>";
			}
		}
		catch (Exception e) {
			System.out.println("getWorkList: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</WorkList>";
		return str;
	}
	
	public static String deleteWorks(String ids)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("delete from workdone where work_id in ("+ids+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteJobs: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>";

		return str;
	}
	
	public static synchronized String addWork(int entryId,String description,String number,String length,String breadth,String height,String weight,String start,String finish,int controlEstimateId)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy"); 

		try
		{
			//String expression1="1+2;";
			String expression="";
			String varArray[]=new String[5];
			int varCount=0;
			long startDate=0,finishDate=0; 
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
			if(start!=null && !start.equalsIgnoreCase("") && !start.equalsIgnoreCase("-"))
			{
				Date date=(Date)formatter.parse(start);
				startDate=date.getTime();
			}
			if(finish!=null && !finish.equalsIgnoreCase("") && !finish.equalsIgnoreCase("-"))
			{
				Date date=(Date)formatter.parse(finish);
				finishDate=date.getTime();
			}
			
			if(startDate>finishDate)
				throw new Exception("Invalid Date range");
			
			double total=Parser.returnResult(expression);
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into workdone (entry_id,description,number,length,breadth,height,weight,total,start,finish,control_estimate_id) values (?,?,?,?,?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setInt(1, entryId);
			stmt.setString(2, description);
			stmt.setString(3, number);
			stmt.setString(4, length);
			stmt.setString(5, breadth);
			stmt.setString(6, height);
			stmt.setString(7, weight);
			stmt.setDouble(8, total);
			stmt.setLong(9,startDate);
			stmt.setLong(10,finishDate);
			stmt.setDouble(11, controlEstimateId);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key value='"+rst.getInt(1)+"' total='"+DecimalFormat.format(total)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addWork: "+e.getMessage());
			str="<Action>";
		}
		catch(Error e) {
			System.out.println("addWork: "+e.getMessage());
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
}
