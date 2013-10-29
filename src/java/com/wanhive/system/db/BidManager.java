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
import com.wanhive.system.utils.DecimalFormat;



public class BidManager {
	public static String getBidders(int tenderId)
	{
		String str="<Bidders>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select contacts.contact_id, contacts.contact_name, contacts.contact_description, tender_contractor.tender_contractor_id from contacts, tender_contractor where contacts.contact_id=tender_contractor.contact_id and tender_contractor.tender_id="+tenderId);
			while(rst.next())
			{
				str+="<bidder>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<bidderId>"+rst.getInt(4)+"</bidderId>";
				str+="</bidder>";
			}
		}
		catch (Exception e) {
			System.out.println("getBidders: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Bidders>";
		return str;
	}
	
	public static String deleteBidders(String ids)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			stmt.execute("delete from tender_contractor where tender_contractor_id in ("+ids+")");
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("deleteBidders: "+e.getMessage());
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Action>";

		return str;
	}
	
	public static String addBidder(int contactId,int tenderId)
	{
		String str="<Action>";
		Connection conn=null;
		PreparedStatement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.prepareStatement("insert into tender_contractor (tender_id, contact_id) values (?,?)", Statement.RETURN_GENERATED_KEYS);
			stmt.setInt(1, tenderId);
			stmt.setInt(2, contactId);
			stmt.execute();

			rst=stmt.getGeneratedKeys();
			while(rst.next())
			{
				str+="<key type='bidder' value='"+rst.getInt(1)+"' />";
			}
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("addBidder: "+e.getMessage());
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
		
	public static String getQutation(int tenderId,int bidderId)
	{
		String str="<Quotations>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select * from tender_items where tender_id="+tenderId+") as a left join (select * from tender_item_quote where tender_contractor_id="+bidderId+") as b on b.tender_item_id=a.tender_item_id");
			while(rst.next())
			{
				str+="<quotation>";
				str+="<item>"+rst.getInt(1)+"</item>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<displayUnit>"+ServletUtils.filter((rst.getString(4)==null || rst.getString(4).equalsIgnoreCase("") || rst.getString(4).equalsIgnoreCase("-"))?rst.getString(5):rst.getString(4))+"</displayUnit>";
				str+="<unit>"+ServletUtils.filter(rst.getString(5))+"</unit>";
				str+="<price>"+DecimalFormat.format(((rst.getString(4)==null || rst.getString(4).equalsIgnoreCase("") || rst.getString(4).equalsIgnoreCase("-"))?rst.getDouble(6):rst.getDouble(6)*rst.getDouble(7)))+"</price>";
				//str+="<priceMultiplier>"+rst.getDouble(7)+"</priceMultiplier>";
				str+="<premium>"+DecimalFormat.format(rst.getDouble(8))+"</premium>";
				str+="<quantity>"+DecimalFormat.format(rst.getDouble(9))+"</quantity>";
				
				str+="<quotationId>"+rst.getInt(11)+"</quotationId>";
				str+="<basis>"+rst.getInt(14)+"</basis>";
				str+="<quote>"+ServletUtils.filter(rst.getString(15))+"</quote>";
				str+="</quotation>";
			}
		}
		catch (Exception e) {
			System.out.println("getQutation: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Quotations>";
		return str;
	}
	
	public static String updateQuotation(int itemId,int bidderId,String quoteString,int basis)
	{
		String str="<Action>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			
			String bidderQuotation="";
			int quotationBasis=0;
			try
			{
				Double.parseDouble(quoteString);
				if(basis==0 || basis==1)
				{
					bidderQuotation=quoteString;
					quotationBasis=basis;
				}
			}
			catch (Exception e) {
			}
			
			if(bidderQuotation!=null && !bidderQuotation.equalsIgnoreCase(""))
			{
				int count;
				count=stmt.executeUpdate("update tender_item_quote set quote_price_basis='"+basis+"', quote='"+bidderQuotation+"' where tender_item_id='"+itemId+"' and tender_contractor_id='"+bidderId+"'");
				if(count==0)
					count=stmt.executeUpdate("insert into tender_item_quote (tender_item_id,tender_contractor_id,quote_price_basis,quote) values('"+itemId+"','"+bidderId+"','"+basis+"', '"+bidderQuotation+"')");
				
			}
			else
			{
				stmt.executeUpdate("delete from tender_item_quote where tender_item_id='"+itemId+"' and tender_contractor_id='"+bidderId+"'");
			}
			str+="<refreshValue quote='"+((bidderQuotation==null || bidderQuotation.equalsIgnoreCase(""))?"-":bidderQuotation)+"' basis='"+quotationBasis+"' />";
			str+="<status flag='OK' />";
		}
		catch (Exception e) {
			System.out.println("updateQuotation: "+e.getMessage());
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
	
	/*
	 * Bid Analysis
	 */
	public static String getApprovedBidders(int tenderId)
	{
		String str="<Bidders>";
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		int tenderItemCount=0;
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select count(*) from tender_items where tender_id="+tenderId);
			while(rst.next())
			{
				tenderItemCount=rst.getInt(1);
			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=null;
			
			rst=stmt.executeQuery("select contacts.contact_id, contacts.contact_name, contacts.contact_description, tender_contractor.tender_contractor_id from contacts, tender_contractor where contacts.contact_id=tender_contractor.contact_id and tender_contractor.tender_id="+tenderId+" order by 4 asc");
			while(rst.next())
			{
				str+="<bidder>";
				str+="<id>"+rst.getInt(1)+"</id>";
				str+="<name>"+ServletUtils.filter(rst.getString(2))+"</name>";
				str+="<description>"+ServletUtils.filter(rst.getString(3))+"</description>";
				str+="<bidderId>"+rst.getInt(4)+"</bidderId>";
				str+="<complete>"+checkIncompleteQuote(rst.getInt(4), tenderId, tenderItemCount, conn)+"</complete>";
				str+="</bidder>";
			}
		}
		catch (Exception e) {
			System.out.println("getApprovedBidders: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</Bidders>";
		return str;
	}
	
	public static boolean checkIncompleteQuote(int bidderId,int tenderId, int items,Connection connection) {
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		int counter=0;
		
		try
		{
			stmt=conn.createStatement();
			
			rst=stmt.executeQuery("select count(*) from tender_item_quote where tender_item_id in (select tender_item_id from tender_items where tender_id="+tenderId+") and tender_contractor_id="+bidderId);
			if(rst.next())
			{
				 counter=rst.getInt(1);
			}
			
		}
		catch (Exception e) {
			System.out.println("checkIncompleteQuote: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}

		if(items==counter)
			return true;
		
		else
			return false;
	}
}
