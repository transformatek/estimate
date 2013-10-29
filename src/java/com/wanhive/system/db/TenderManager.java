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


import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import com.wanhive.basic.db.DataSourceManager;
import com.wanhive.basic.indexer.IdIndexer;
import com.wanhive.basic.utils.ServletUtils;
import com.wanhive.system.beans.*;

public class TenderManager {
	public static String getTenderDocuments(int parent)
	{
		String str="<Tender>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from tender_directory where tender_dir_parent_id="+parent);
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<tenderDir>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(3))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(4))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(5))+"</remarks>";
				str+="<parent>"+rst.getInt(2)+"</parent>";
				//str+="<>"++"</>";
				str+="</tenderDir>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from tender where tender_dir_id="+parent);
			while(rst.next())
			{
				str+="<tender>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(9))+"</remarks>";
				str+="<amount>"+ServletUtils.filter(rst.getString(4))+"</amount>";
				str+="<earnestMoney>"+ServletUtils.filter(rst.getString(5))+"</earnestMoney>";
				str+="<timeLimit>"+ServletUtils.filter(rst.getString(6))+"</timeLimit>";
				str+="<openDate>"+ServletUtils.filter(rst.getString(7))+"</openDate>";
				str+="<status>"+ServletUtils.filter(rst.getString(8))+"</status>";
				str+="<parent>"+rst.getInt(10)+"</parent>";
				//str+="<>"++"</>";
				str+="</tender>";

			}
			if(parent!=1)
			{
				try {if(rst!=null)rst.close();} catch (Exception e) {}
				rst=stmt.executeQuery("select tender_dir_parent_id from tender_directory where tender_dir_id ="+parent);
				while(rst.next())
					str+="<levelParent id='"+rst.getInt(1)+"' />";
			}
		}
		catch (Exception e) {
			System.out.println("getTenderDocuments: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Tender>";
		return str;
	}

	public static String deleteTenders(String tenderDirIds,String tenderIds)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			if(tenderDirIds!=null && tenderDirIds.length()>0)
				stmt.execute("delete from tender_directory where tender_dir_id in ("+tenderDirIds+")");
			if(tenderIds!=null && tenderIds.length()>0)
				stmt.execute("delete from tender where tender_id in ("+tenderIds+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteTenders: "+e.getMessage());
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

	public static String updateTenderDocument(String id,String name,String description,String remarks,String tenderAmount,String earnestMoney,String timeLimit,String openDate,String tenderStatus)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update tender set tender_name=? , tender_description=? , tender_amount=? , tender_earnest_money=? , tender_time_limit=? , tender_open_date=? , tender_status=? , tender_remarks=? where tender_id=?");
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, tenderAmount);
			stmt.setString(4, earnestMoney);
			stmt.setString(5, timeLimit);
			stmt.setString(6, openDate);
			stmt.setString(7, tenderStatus);
			stmt.setString(8, remarks);
			stmt.setString(9, id);
			stmt.execute();

			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateTenderDocument: "+e.getMessage());
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

	public static String updateTenderDirectory(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update tender_directory set tender_dir_name=? , tender_dir_description=? , tender_dir_remarks=? where tender_dir_id=?");
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateTenderDirectory: "+e.getMessage());
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
	public static String addTenderDirectory(String id,String name,String description,String remarks)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into tender_directory (tender_dir_name,tender_dir_description,tender_dir_remarks,tender_dir_parent_id) values (?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, remarks);
			stmt.setString(4, id);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key type='tenderDir' value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addTenderDirectory: "+e.getMessage());
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

	public static String addTenderDocument(String id,String name,String description,String remarks,String tenderAmount,String earnestMoney,String timeLimit,String openDate,String projectId)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;
		boolean commitFlag=true;

		try
		{
			conn=DataSourceManager.newConnection();
			commitFlag=conn.getAutoCommit();
			conn.setAutoCommit(false);
			stmt=conn.prepareStatement("insert into tender (tender_name,tender_description,tender_amount,tender_earnest_money,tender_time_limit,tender_open_date,tender_remarks,tender_dir_id) values (?,?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, name);
			stmt.setString(2, description);
			stmt.setString(3, tenderAmount);
			stmt.setString(4, earnestMoney);
			stmt.setString(5, timeLimit);
			stmt.setString(6, openDate);
			stmt.setString(7, remarks);
			stmt.setString(8, id);
			stmt.execute();

			int project=Integer.parseInt(projectId);
			conn.commit();
			rst=stmt.getGeneratedKeys();
			int newTenderId=0;
			while(rst.next())
			{
				newTenderId=rst.getInt(1);
			}
			prepareTenderDocument(project, newTenderId, conn);

			str+="<status flag='OK' />";
			str+="<key type='tender' value='"+newTenderId+"' />";
		}
		catch (Exception e) {
			try{conn.rollback();}catch (Exception e1) {}
			System.out.println("addTenderDocument: "+e.getMessage());
		}
		finally
		{
			try {conn.setAutoCommit(commitFlag);} catch (Exception e) {}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>";
		return str;
	}

	private static boolean prepareTenderDocument(int projectId,int tenderId,Connection connection)
	{
		boolean success=false;
		Connection conn=connection;
		PreparedStatement stmt=null;

		ArrayList<AssemblyBean> assemblies=new ArrayList<AssemblyBean>();
		Map<Integer, AssemblyBean> assemblyMap=getProjectSummary(projectId,null,conn);
		Iterator<Entry<Integer, AssemblyBean>> it=assemblyMap.entrySet().iterator();
		while(it.hasNext())
		{
			Map.Entry<Integer, AssemblyBean> pair=(Map.Entry<Integer, AssemblyBean>)it.next();
			assemblies.add(pair.getValue());
		}

		assemblies=filterAndMergeAssembly(assemblies);	//Filter and Sort
		try
		{
			stmt=conn.prepareStatement("insert into tender_items(assembly_name,assembly_description,assembly_display_unit,assembly_unit,assembly_price,assembly_price_multiplier,assembly_premium,quantity,tender_id) values(?,?,?,?,?,?,?,?,?)");
			for(int i=0;i<assemblies.size();i++){
				AssemblyBean asm=(AssemblyBean)assemblies.get(i);
				stmt.setString(1, asm.getName());
				stmt.setString(2, asm.getDescription());
				stmt.setString(3, asm.getDisplayUnit());
				stmt.setString(4, asm.getUnit());
				//What we got was the total price, convert it into average unit price
				double averagePrice=asm.getPrice()/asm.getQuantity();
				if(Double.isNaN(averagePrice))averagePrice=asm.getPrice();
				
				try{}catch(Exception e){averagePrice=asm.getPrice();}
				stmt.setDouble(5, averagePrice);
				stmt.setDouble(6, asm.getPriceMultiplier());
				stmt.setDouble(7, asm.getPremium());
				stmt.setDouble(8, asm.getQuantity());
				stmt.setInt(9, tenderId);
				stmt.execute();
				success=true;
			}
		}
		catch (Exception e) {
			System.out.println("prepareTenderDocument:"+e.getMessage());
		}
		catch (Error e) {
			System.out.println("prepareTenderDocument:"+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return success;
	}

	private static Map<Integer, AssemblyBean> getProjectSummary(int projectParentId,Map<Integer, AssemblyBean> asm,Connection connection)
	{
		Connection conn=connection;
		Statement stmt=null;
		Statement stmt1=null;
		ResultSet rst=null;
		ResultSet rst1=null;
		if(asm==null)
			asm=new HashMap<Integer, AssemblyBean>();
		try
		{
			stmt1=conn.createStatement();
			rst1=stmt1.executeQuery("select estimate_id,costbook_id from estimate where project_id="+projectParentId);
			while(rst1.next())
			{
				int estimateId=rst1.getInt(1);
				int costBookId=rst1.getInt(2);
				ArrayList<AssemblyBean> assemblies=getEstimateSummary(estimateId,costBookId,conn);
				for(int i=0;i<assemblies.size();i++)
				{
					Integer key=new Integer(assemblies.get(i).getId());
					if(asm.containsKey(key))
					{
						AssemblyBean bean=asm.get(key);
						bean.setQuantity(bean.getQuantity()+assemblies.get(i).getQuantity());
						//This is the total price and not the unit price
						bean.setPrice(bean.getPrice()+assemblies.get(i).getPrice());
					}
					else
						asm.put(key, assemblies.get(i));
				}
			}

			stmt=conn.createStatement();
			rst=stmt.executeQuery("select project_id from project where project_parent_id="+projectParentId);
			while(rst.next())
			{
				int id=rst.getInt(1);
				//We recursively add into total, the total cost
				//of sub-projects
				getProjectSummary(id,asm,conn);
			}

		}
		catch (Exception e) {
			System.out.println("getProjectDNIT: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(rst1!=null)rst1.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();} catch (Exception e) {}
		}

		return asm;
	}

	private static ArrayList<AssemblyBean> getEstimateSummary(int estimateId,int costbookId,Connection connection)
	{
		ArrayList<AssemblyBean> results= new ArrayList<AssemblyBean>();  
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select assembly_id,assembly_name,assembly_specification,assembly_display_unit,assembly_unit as unit,ifnull((select price from assemblycostbook where assemblycostbook.assembly_id=assembly.assembly_id and costbook_id="+costbookId+"),assembly_price) as price,assembly_price_multiplier,premium,(select sum(entry_total) from billentry where billentry.bill_id=bill.bill_id group by bill_id)as qtty from bill join assembly using (assembly_id) where estimate_id="+estimateId);

			while(rst.next())
			{
				AssemblyBean bean=new AssemblyBean();
				bean.setId(rst.getInt(1));
				bean.setName(rst.getString(2));
				bean.setDescription(rst.getString(3));
				bean.setDisplayUnit(rst.getString(4));
				bean.setUnit(rst.getString(5));
				//Calculate total Price, and not the unit price
				bean.setPrice(rst.getDouble(6)*rst.getDouble(9));
				bean.setPriceMultiplier(rst.getDouble(7));
				bean.setPremium(rst.getDouble(8));
				bean.setQuantity(rst.getDouble(9));
				results.add(bean);
			}
		}
		catch (Exception e) {
			System.out.println("getEstimateSummary: "+e.getMessage());
			//throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return results;
	}
	private static ArrayList<AssemblyBean> filterAndMergeAssembly(ArrayList<AssemblyBean> assemblies)
	{
		// filter assemblies
		ArrayList<AssemblyBean> hsr=new ArrayList<AssemblyBean>();
		ArrayList<AssemblyBean> ns=new ArrayList<AssemblyBean>();
		for(int i=0;i<assemblies.size();i++)
		{
			AssemblyBean asm=assemblies.get(i);
			String name=asm.getName().trim()+";";
			InputStream in=new ByteArrayInputStream(name.getBytes());

			ArrayList<String> al=IdIndexer.getChapterNumber(in);
			if(al!=null && al.size()>0)
			{
				int[] indexArray=new int[al.size()];
				for(int x=0;x<al.size();x++)
				{
					indexArray[x]=(Integer.parseInt(al.get(x)));
				}

				asm.setChapterIndex(indexArray);
			}

			if(asm.getChapterIndex()==null)
				ns.add(asm);	
			else
				hsr.add(asm);
		}
		// Arrange Chapter wise using Indexer
		ArrayList<AssemblyBean> res=new ArrayList<AssemblyBean>();
		res=sortAssembly(hsr);

		res.addAll(ns);
		return res;
	}
	private static ArrayList<AssemblyBean> sortAssembly(ArrayList<AssemblyBean> assembly)
	{
		ArrayList<AssemblyBean> result=new ArrayList<AssemblyBean>();
		for(int l=0;l<assembly.size();l++)
		{
			AssemblyBean asm=(AssemblyBean)assembly.get(l);
			result.add(asm);
		}
		Collections.sort(result, new Comparator<AssemblyBean>(){
			public int compare(AssemblyBean p1, AssemblyBean p2) {
				int order=0;
				int[] index1=p1.getChapterIndex();
				int[] index2=p2.getChapterIndex();
				//Get the smaller sized-array's length
				int minIndexLength=(index1.length<index2.length)?index1.length:index2.length;
				//move forward, and record the first difference
				for(int i=0;i<minIndexLength;i++)
				{
					//Loop until we get to a point where there is a difference
					if(index1[i]==index2[i]){
						continue;
					}
					//Record the first difference and Break
					else {
						order=(index1[i]<index2[i])?-1:1;
						break;
					}

				}
				if(order==0) order=1;
				return order;
			}
		});

		return result;
	}

	public static String moveTenderDoc(int id,int from,int to)
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
			stmt.execute("update tender set tender_dir_id="+to+" where tender_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveTenderDoc: "+e.getMessage());
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
	public static String moveTenderDirectory(int id,int from,int to)
	{
		String str="<Action>\n";
		//We cannot make the Directory part of it's own subtree
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
			if(isInnerTree(id,to,conn,"tender_directory","tender_dir_id","tender_dir_parent_id"))		//If destination is part of inner tree, abort
				return str+"</Action>";
			stmt=conn.createStatement();
			stmt.execute("update tender_directory set tender_dir_parent_id="+to+" where tender_dir_id="+id);
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("moveTenderDirectory: "+e.getMessage());
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
	public static String searchTender(String key)
	{
		String str="<Tender>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from tender_directory where tender_dir_name like '%"+key+"%' or tender_dir_description like '%"+key+"%' or tender_dir_remarks like '%"+key+"%'");
			//Get all children at this level
			while(rst.next())
			{
				if(rst.getInt(1)==1)
					continue;
				str+="<tenderDir>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(3))+"</name>";
				str+="<specification>"+ServletUtils.filter(rst.getString(4))+"</specification>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(5))+"</remarks>";
				str+="<parent>"+rst.getInt(2)+"</parent>";
				//str+="<>"++"</>";
				str+="</tenderDir>";

			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=stmt.executeQuery("select * from tender where tender_name like '%"+key+"%' or tender_description like '%"+key+"%' or tender_name like '%"+key+"%' or tender_remarks like '%"+key+"%'");
			while(rst.next())
			{
				str+="<tender>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<remarks>"+ServletUtils.filter(rst.getString(9))+"</remarks>";
				str+="<amount>"+ServletUtils.filter(rst.getString(4))+"</amount>";
				str+="<earnestMoney>"+ServletUtils.filter(rst.getString(5))+"</earnestMoney>";
				str+="<timeLimit>"+ServletUtils.filter(rst.getString(6))+"</timeLimit>";
				str+="<openDate>"+ServletUtils.filter(rst.getString(7))+"</openDate>";
				str+="<status>"+ServletUtils.filter(rst.getString(8))+"</status>";
				str+="<parent>"+rst.getInt(10)+"</parent>";
				//str+="<>"++"</>";
				str+="</tender>";

			}
		}
		catch (Exception e) {
			System.out.println("searchTender: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		//str+="<levelParent id='"+rst.getInt(1)+"' />";
		str+="</Tender>";
		return str;
	}

	/*
	 * NOTES
	 */
	public static String getTenderNotes(int tenderId)
	{
		String str="<TenderNotes>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from tender_notes where tender_id="+tenderId);
			str+="<tender id='"+tenderId+"' />";
			while(rst.next())
			{
				str+="<entry>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<description>"+ServletUtils.filter(((rst.getString(2)==null || rst.getString(2).equalsIgnoreCase(""))?"-":rst.getString(2)))+"</description>";
				str+="<tenderId>"+rst.getInt(3)+"</tenderId>";
				str+="</entry>";
			}
		}
		catch (Exception e) {
			System.out.println("getTenderNotes: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		str+="</TenderNotes>";
		return str;
	}
	public static String deleteTenderNotes(String ids)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("delete from tender_notes where note_id in ("+ids+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteTenderNotes: "+e.getMessage());
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

	public static String addTenderNote(int tenderId,String description)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into tender_notes (note_description,tender_id) values (?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setString(1, description);
			stmt.setInt(2, tenderId);
			stmt.execute();
			rst=stmt.getGeneratedKeys();
			if(rst.first())
			{
				str+="<key value='"+rst.getInt(1)+"'/>";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addTenderNote: "+e.getMessage());
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
	public static String updateTenderNote(int id,String description)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("update tender_notes set note_description=? where note_id=?");
			stmt.setString(1, description);
			stmt.setInt(2, id);
			stmt.execute();

			str+="<status flag='OK' />";

		}
		catch (Exception e) {
			System.out.println("updateTenderNote: "+e.getMessage());
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
