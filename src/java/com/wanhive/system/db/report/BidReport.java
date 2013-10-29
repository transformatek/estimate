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
 * *2013-10-28 Amit Kumar (amitkriit@gmail.com)
 * Added copyright notice
 * 
 ***********************************************************/
package com.wanhive.system.db.report;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;


import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.HeaderFooter;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.wanhive.basic.db.DataSourceManager;
import com.wanhive.system.beans.AssemblyBean;
import com.wanhive.system.beans.BidderBean;
import com.wanhive.system.beans.QuotationBean;
import com.wanhive.system.db.BidManager;
import com.wanhive.system.utils.DecimalFormat;

public class BidReport {
	public static ByteArrayOutputStream getBidAnalysisReport(HttpServletRequest request) throws Exception
	{

		//Get the Vendor ids for which we are going to prepare the Bid summary

		Document doc=new Document();
		ByteArrayOutputStream pdfOut=new ByteArrayOutputStream();
		PdfWriter docWriter=null;
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		Paragraph p=null;
		PdfPTable table=null;

		//int count=0;
		int items=0;
		try
		{
			String bidderIds=(request.getParameter("Ids"));
			int tenderId=Integer.parseInt((request.getParameter("tenderId")));
			//Check the formatting of Bidders List
			String [] temp = null;
			temp = bidderIds.split(",");
			if(temp.length==0)
				throw new Exception("Bidders list not formatted properly");
			//Verify that bidderIds are all integers
			for(int i=0;i<temp.length;i++)
			{
				temp[i].trim();
				Integer.parseInt(temp[i]);
			}

			//Now we are ready for the Bid Analysis
			conn=DataSourceManager.newConnection();
			docWriter=PdfWriter.getInstance(doc, pdfOut);
			landscapePdf(doc);
			docWriter.setPageEvent(new WaterMark());
			doc.open();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select count(*) from tender_items where tender_id="+tenderId+") as a join (select tender_description from tender where tender_id="+tenderId+") as b");
			String tenderName="";
			while(rst.next())
			{
				items=rst.getInt(1);
				tenderName=rst.getString(2);
			}

			Color color=new Color(0,0,0);
			Font font=FontFactory.getFont(FontFactory.COURIER_BOLD, 10, Font.NORMAL,color);

			p=new Paragraph("Bid Analysis for \n"+tenderName,font);
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);

			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=null;
			rst=stmt.executeQuery("select contacts.contact_id, contacts.contact_name, tender_contractor.tender_contractor_id from contacts,tender_contractor " +
					"where tender_contractor.tender_id="+tenderId+" and contacts.contact_id=tender_contractor.contact_id and tender_contractor.tender_contractor_id in ("+bidderIds+") order by 3 asc");

			ArrayList<BidderBean> bidders=new ArrayList<BidderBean>();
			while(rst.next())
			{
				BidderBean bidder=new BidderBean();
				bidder.setContactId(rst.getInt(1));
				bidder.setName(rst.getString(2));
				bidder.setBidderId(rst.getInt(3));
				bidder.setTenderId(tenderId);
				if(BidManager.checkIncompleteQuote(bidder.getBidderId(), tenderId, items, conn))
				{
					bidders.add(bidder);
				}	
			}
			ArrayList<AssemblyBean> tenderItems=getTenderItems(tenderId,conn);
			getVendorsQuote(tenderId,bidders,conn);	//Internally manipulates bidders


			//font=FontFactory.getFont(FontFactory.HELVETICA, 9, Font.UNDERLINE,color);
			table=getBidSummary(tenderItems,bidders);
			doc.add(table);

			//p=new Paragraph("2. Line Price",font);
			//p.setAlignment(Element.ALIGN_LEFT);
			//p.setSpacingAfter(p.getLeading());
			//doc.add(p);

		}
		catch (Exception e) {
			pdfOut.reset();
			throw e;
		}
		finally
		{
			if(doc!=null)
				doc.close();
			if(docWriter!=null)
				docWriter.close();
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

		if(pdfOut.size()< 1)
		{
			throw new Exception("Document has ["+pdfOut.size()+"] Bytes");
		}
		return pdfOut;
	}
	private static PdfPTable getBidSummary(ArrayList<AssemblyBean> items,ArrayList<BidderBean> bidders)
	{
		float fontsize=9;
		Color color=new Color(0,0,0);
		Font font=FontFactory.getFont(FontFactory.COURIER_BOLD, fontsize, Font.BOLD,color);

		PdfPTable table=new PdfPTable(bidders.size()*3+1+2+7+2+3+2+3+3+3);
		table.setWidthPercentage(100);
		//Set Header
		createPhraseCell(table, new Paragraph("sl",font), 1, -1, -1);
		createPhraseCell(table, new Paragraph("Name",font), 2, -1, -1);
		createPhraseCell(table, new Paragraph("Description",font), 7, -1, -1);
		createPhraseCell(table, new Paragraph("Unit",font), 2, -1, -1);
		createPhraseCell(table, new Paragraph("Base Price",font), 3, -1, -1);
		createPhraseCell(table, new Paragraph("SP(%)",font), 2, -1, -1);
		createPhraseCell(table, new Paragraph("Quantity",font), 3, -1, -1);
		createPhraseCell(table, new Paragraph("Price",font), 3, -1, -1);

		for(int i=0;i<bidders.size();i++)
		{
			createPhraseCell(table, new Paragraph(bidders.get(i).getName(),font), 3, -1, -1);
		}
		createPhraseCell(table, new Paragraph("Lowest Bid",font), 3, -1, -1);


		fontsize=9;
		color=new Color(0,0,0);
		font=FontFactory.getFont(FontFactory.COURIER, fontsize, Font.NORMAL, color);

		Font font1=FontFactory.getFont(FontFactory.COURIER, fontsize, Font.BOLDITALIC,Color.BLUE);
		Font font2=FontFactory.getFont(FontFactory.HELVETICA, fontsize-1, Font.NORMAL,color);
		int rightAlignFlag=Element.ALIGN_RIGHT;
		//Analysis Part
		int numBidders=bidders.size();
		double[] bidTotals=new double[numBidders+2];	//One for base, one for lowest (Summary)
		double[] bidQuotsTotal=new double[numBidders+2];	//One for base, one for lowest (Table)
		int lowestBidIndex=1;								//Index to Lowest bid in bidTotals

		for(int i=0;i<items.size();i++)
		{
			AssemblyBean asm=items.get(i);
			bidQuotsTotal[0]=asm.getPrice()*(1+asm.getPremium()/100)*asm.getQuantity();
			bidTotals[0]+=bidQuotsTotal[0];

			Integer key=new Integer(asm.getId());
			for(int x=0;x<bidders.size();x++)
			{
				QuotationBean quot=bidders.get(x).getQuotations().get(key);

				if(quot.getBasis()==0)
				{
					bidQuotsTotal[x+1]=asm.getQuantity()*asm.getPrice()*(1+asm.getPremium()/100)*(1+quot.getQoutation()/100);
					bidTotals[x+1]+=bidQuotsTotal[x+1];
				}
				else
				{
					if(asm.getDisplayUnit()==null || asm.getDisplayUnit().equalsIgnoreCase("") || asm.getDisplayUnit().equalsIgnoreCase("-"))
					{
						bidQuotsTotal[x+1]=asm.getQuantity()*quot.getQoutation();
						bidTotals[x+1]+=bidQuotsTotal[x+1];
					}
					else
					{
						bidQuotsTotal[x+1]=asm.getQuantity()*quot.getQoutation()/asm.getPriceMultiplier();
						bidTotals[x+1]+=bidQuotsTotal[x+1];
					}
				}
			}
			int lastCol=bidTotals.length-1;
			int indexOfLowestBidCol=1;
			for(int y=1;y<lastCol;y++)
			{
				if(y==1)
				{
					bidTotals[lastCol]=bidTotals[y];
					bidQuotsTotal[lastCol]=bidQuotsTotal[y];
				}

				if(bidTotals[lastCol]>bidTotals[y] && y>1)
				{
					bidTotals[lastCol]=bidTotals[y];
					lowestBidIndex=y;
				}
				if(bidQuotsTotal[lastCol]>bidQuotsTotal[y] && y>1)
				{
					bidQuotsTotal[lastCol]=bidQuotsTotal[y];
					indexOfLowestBidCol=y;
				}
			}

			//Print the Quotes
			createPhraseCell(table, new Paragraph(""+i+1,font), 1, -1, -1);
			createPhraseCell(table, new Paragraph(asm.getName(),font), 2, -1, -1);
			createPhraseCell(table, new Paragraph(asm.getDescription(),font), 7, -1, -1);
			boolean unitConverted=!(asm.getDisplayUnit()==null || asm.getDisplayUnit().equalsIgnoreCase("") || asm.getDisplayUnit().equalsIgnoreCase("-"));
			String unit=unitConverted?asm.getDisplayUnit():asm.getUnit();
			double price=unitConverted?asm.getPrice()*asm.getPriceMultiplier():asm.getPrice(); 
			createPhraseCell(table, new Paragraph(unit,font), 2, -1, -1);
			createPhraseCell(table, new Paragraph(""+DecimalFormat.format(price),font), 3, rightAlignFlag, -1);
			createPhraseCell(table, new Paragraph(""+DecimalFormat.format(asm.getPremium()),font), 2, rightAlignFlag, -1);
			createPhraseCell(table, new Paragraph(""+DecimalFormat.format(asm.getQuantity())+" "+asm.getUnit(),font), 3, rightAlignFlag, -1);
			double totalPrice=price*(1+asm.getPremium()/100);
			double totalQuantity=totalPrice*asm.getQuantity()/(unitConverted?asm.getPriceMultiplier():1);
			createPhraseCell(table, new Paragraph(""+DecimalFormat.format(totalPrice)+"\n["+DecimalFormat.format(totalQuantity)+"]",font), 3, rightAlignFlag, -1);

			String lowestBidString="";
			for(int z=0;z<numBidders;z++)
			{
				String priceString="";
				QuotationBean quot=bidders.get(z).getQuotations().get(key);
				if(quot.getBasis()==0)
					priceString=DecimalFormat.format(quot.getQoutation())+"(%)\n["+DecimalFormat.format(bidQuotsTotal[z+1])+"]";
				else
					priceString=DecimalFormat.format(quot.getQoutation())+"\n["+DecimalFormat.format(bidQuotsTotal[z+1])+"]";
				if(z==indexOfLowestBidCol-1)
				{
					if(quot.getBasis()==0)
						lowestBidString=DecimalFormat.format(quot.getQoutation())+"(%)";
					else
						lowestBidString=DecimalFormat.format(quot.getQoutation());
					createPhraseCell(table, new Paragraph(priceString,font1), 3, rightAlignFlag, -1);
				}
				else
					createPhraseCell(table, new Paragraph(priceString,font), 3, rightAlignFlag, -1);
				//createPhraseCell(table, new Paragraph(bidders.get(z).getName(),font), 3, -1, -1);
			}

			createPhraseCell(table, new Paragraph(lowestBidString+"\n["+DecimalFormat.format(bidQuotsTotal[lastCol])+"]",font2), 3, rightAlignFlag, -1);
		}
		Font font3=FontFactory.getFont(FontFactory.COURIER_BOLD, fontsize, Font.BOLD,color);
		Font font4=FontFactory.getFont(FontFactory.COURIER_BOLD, fontsize, Font.BOLDITALIC,Color.BLUE);

		createPhraseCell(table, new Paragraph("Tender Base Price: "+DecimalFormat.format(bidTotals[0]),font3), 23, rightAlignFlag, -1);

		for(int i=1;i<bidTotals.length;i++)
		{
			String totalPrice=DecimalFormat.format(bidTotals[i]);
			String percentDeviation=DecimalFormat.format((bidTotals[i]-bidTotals[0])*100/bidTotals[0]);
			if(lowestBidIndex==i)
				createPhraseCell(table, new Paragraph(totalPrice+"\n("+percentDeviation+"%)",font4), 3, rightAlignFlag, -1);
			else
				createPhraseCell(table, new Paragraph(totalPrice+"\n("+percentDeviation+"%)",font3), 3, rightAlignFlag, -1);
		}
		return table;

	}
	private static ArrayList<AssemblyBean> getTenderItems(int tenderId,Connection connection) throws Exception
	{
		ResultSet rst=null;
		Statement stmt=null;
		ArrayList<AssemblyBean> asm=new ArrayList<AssemblyBean>();
		Connection conn=connection;
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from tender_items where tender_id="+tenderId);
			while(rst.next())
			{
				AssemblyBean bean=new AssemblyBean();
				bean.setId(rst.getInt(1));	//TenderItemId
				bean.setName(rst.getString(2));
				bean.setDescription(rst.getString(3));
				bean.setDisplayUnit(rst.getString(4));
				bean.setUnit(rst.getString(5));
				bean.setPrice(rst.getDouble(6));
				bean.setPriceMultiplier(rst.getDouble(7));
				bean.setPremium(rst.getDouble(8));
				bean.setQuantity(rst.getDouble(9));
				//System.out.println("FOUND: "+bean.getName()+" as ITEM:"+bean.getId()+" in Tender:"+tenderId);
				asm.add(bean);
			}
		}
		catch (Exception e) {
			System.out.println("getTenderItems: "+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return asm;
	}
	private static void getVendorsQuote(int tenderId,ArrayList<BidderBean> bidders,Connection connection) throws Exception
	{
		ResultSet rst=null;
		Statement stmt=null;
		Connection conn=connection;

		try
		{
			String bidderIds="";
			for(int i=0;i<bidders.size();i++)
			{
				int bidderId=bidders.get(i).getBidderId();
				if(i!=bidders.size()-1)
					bidderIds+=""+bidderId+", ";
				else
					bidderIds+=bidderId;
			}

			HashMap<Integer, ArrayList<QuotationBean>> bidderQuotations=new HashMap<Integer, ArrayList<QuotationBean>>();
			if(bidderIds=="")
				return;
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from tender_item_quote where tender_contractor_id in ("+bidderIds+") and tender_item_id in (select tender_item_id from tender_items where tender_id="+tenderId+")");

			//Now we get an Arraylist of Quotations for each bidder: Key is the bidderId
			while(rst.next())
			{
				QuotationBean quot=new QuotationBean();
				quot.setItemId(rst.getInt(2));
				quot.setBidderId(rst.getInt(3));
				quot.setBasis(rst.getInt(4));
				quot.setQoutation(rst.getDouble(5));

				Integer key=new Integer(quot.getBidderId());
				if(bidderQuotations.containsKey(key))
				{
					bidderQuotations.get(key).add(quot);
				}
				else
				{
					ArrayList<QuotationBean> al=new ArrayList<QuotationBean>();
					al.add(quot);
					bidderQuotations.put(key, al);
				}
			}

			//Now we add the quotation of bidders into right places so that they can be searched using Key: itemIds
			for(int i=0;i<bidders.size();i++)
			{
				Integer bidderKey=new Integer(bidders.get(i).getBidderId());
				ArrayList<QuotationBean> quots=bidderQuotations.get(bidderKey);
				HashMap<Integer, QuotationBean> quotations;
				for(int j=0;j<quots.size();j++)
				{
					Integer itemKey=new Integer(quots.get(j).getItemId());
					if(bidders.get(i).getQuotations()==null)
					{
						quotations=new HashMap<Integer, QuotationBean>();
						bidders.get(i).setQuotations(quotations);
					}
					bidders.get(i).getQuotations().put(itemKey, quots.get(j));	//Key is the TenderItemID
				}
			}
		}
		catch (Exception e) {
			System.out.println("getVendorsQuote: "+e.getMessage());
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
	}

	private static void createPhraseCell(PdfPTable table, Phrase ph, int colSpan, int hAlign, int vAlign)
	{
		PdfPCell cell=new PdfPCell(ph);
		//cell.addElement(elem);
		if(colSpan>0)
			cell.setColspan(colSpan);
		if(hAlign>=0)
			cell.setHorizontalAlignment(hAlign);
		if(vAlign>=0)
			cell.setVerticalAlignment(vAlign);
		table.addCell(cell);
	}

	private static void landscapePdf(Document doc)
	{
		doc.addAuthor("ESTICON");
		doc.addCreationDate();
		doc.addProducer();
		doc.addCreator("ProjectReport");
		doc.addTitle("Title");
		doc.setPageSize(PageSize.A4.rotate());
		HeaderFooter footer=new HeaderFooter(new Phrase(""+new Date()+"    "),true);
		doc.setFooter(footer);
	}

	/***************************************************************/
	/*
	 * Report in HTML
	 */

	public static String getBidAnalysisHtmlReport(HttpServletRequest request) throws Exception
	{
		String docType="<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 "+
		"Transitional//EN\">\n";
		String str="";

		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		int items=0;
		try
		{
			String bidderIds=(request.getParameter("Ids"));
			int tenderId=Integer.parseInt((request.getParameter("tenderId")));
			//Check the formatting of Bidders List
			String [] temp = null;
			temp = bidderIds.split(",");
			if(temp.length==0)
				throw new Exception("Bidders list not formatted properly");
			//Verify that bidderIds are all integers
			for(int i=0;i<temp.length;i++)
			{
				temp[i].trim();
				Integer.parseInt(temp[i]);
			}

			//Now we are ready for the Bid Analysis
			conn=DataSourceManager.newConnection();

			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select count(*) from tender_items where tender_id="+tenderId+") as a join (select tender_description from tender where tender_id="+tenderId+") as b");
			String tenderName="";
			while(rst.next())
			{
				items=rst.getInt(1);
				tenderName=rst.getString(2);
			}

			str=docType+"<html><head><title>BID Analysis:"+ tenderName+"</title>";
			str+="<link rel=\"stylesheet\" href=\"themes/css/report.css\" media=\"screen\" type=\"text/css\"></head>";
			str+="<body>";
			str+="<center><h4>Bid Analysis for:<br><u>"+tenderName+"</u></h4>";

			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=null;
			rst=stmt.executeQuery("select contacts.contact_id, contacts.contact_name, tender_contractor.tender_contractor_id from contacts,tender_contractor " +
					"where tender_contractor.tender_id="+tenderId+" and contacts.contact_id=tender_contractor.contact_id and tender_contractor.tender_contractor_id in ("+bidderIds+") order by 3 asc");

			ArrayList<BidderBean> bidders=new ArrayList<BidderBean>();
			while(rst.next())
			{
				BidderBean bidder=new BidderBean();
				bidder.setContactId(rst.getInt(1));
				bidder.setName(rst.getString(2));
				bidder.setBidderId(rst.getInt(3));
				bidder.setTenderId(tenderId);
				if(BidManager.checkIncompleteQuote(bidder.getBidderId(), tenderId, items, conn))
				{
					bidders.add(bidder);
				}	
			}
			ArrayList<AssemblyBean> tenderItems=getTenderItems(tenderId,conn);
			getVendorsQuote(tenderId,bidders,conn);	//Internally manipulates bidders
			str+=getHtmlBidSummary(tenderItems,bidders);
		}
		catch (Exception e) {
			throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		str+="</center></body></html>";
		return str;
	}

	private static String getHtmlBidSummary(ArrayList<AssemblyBean> items,ArrayList<BidderBean> bidders)
	{
		//Set Header
		String str="<table class='contentTable' border='1' cellpadding='1' cellspacing='0'><thead><tr>";
		str+="<th colspan='1' rowspan='2'>sl</th><th colspan='2' rowspan='2'>Name</th><th colspan='7' rowspan='2'>Description</th><th colspan='2' rowspan='2'>Unit</th>" +
		"<th colspan='3' rowspan='2'>Base Price</th><th colspan='2' rowspan='2'>Premium(%)</th><th colspan='3' rowspan='2'>Quantity</th><th colspan='3' rowspan='2'>Price</th><th colspan='3' rowspan='2'>Amount</th>";



		for(int i=0;i<bidders.size();i++)
		{
			str+="<th colspan='6' style='text-align: center;'>"+bidders.get(i).getName()+"</th>";
		}
		str+="<th colspan='3' rowspan='2'>Lowest Bid</th></tr><tr>";
		for(int i=0;i<bidders.size();i++)
		{
			str+="<th colspan='3'>Quotation</th>";
			str+="<th colspan='3'>Net amount</th>";
		}
		str+="</tr></thead><tbody>";

		//Analysis Part
		int numBidders=bidders.size();
		double[] bidTotals=new double[numBidders+2];	//One for base, one for lowest (Summary)
		double[] bidQuotsTotal=new double[numBidders+2];	//One for base, one for lowest (Table)
		double lowestBid=0;
		int lowestBidIndex=1;								//Index to Lowest bid in bidTotals

		for(int i=0;i<items.size();i++)
		{
			str+="<tr>";

			AssemblyBean asm=items.get(i);
			bidQuotsTotal[0]=asm.getPrice()*(1+asm.getPremium()/100)*asm.getQuantity();
			bidTotals[0]+=bidQuotsTotal[0];

			Integer key=new Integer(asm.getId());
			for(int x=0;x<bidders.size();x++)
			{
				QuotationBean quot=bidders.get(x).getQuotations().get(key);

				if(quot.getBasis()==0)
				{
					bidQuotsTotal[x+1]=asm.getQuantity()*asm.getPrice()*(1+asm.getPremium()/100)*(1+quot.getQoutation()/100);
					bidTotals[x+1]+=bidQuotsTotal[x+1];
				}
				else
				{
					if(asm.getDisplayUnit()==null || asm.getDisplayUnit().equalsIgnoreCase("") || asm.getDisplayUnit().equalsIgnoreCase("-"))
					{
						bidQuotsTotal[x+1]=asm.getQuantity()*quot.getQoutation();
						bidTotals[x+1]+=bidQuotsTotal[x+1];
					}
					else
					{
						bidQuotsTotal[x+1]=asm.getQuantity()*quot.getQoutation()/asm.getPriceMultiplier();
						bidTotals[x+1]+=bidQuotsTotal[x+1];
					}
				}
			}
			int lastCol=bidTotals.length-1;
			int indexOfLowestBidCol=1;
			for(int y=1;y<lastCol;y++)
			{
				if(y==1)
				{
					//bidTotals[lastCol]=bidTotals[y];
					lowestBid=bidTotals[y];
					bidQuotsTotal[lastCol]=bidQuotsTotal[y];
				}

				/*if(bidTotals[lastCol]>bidTotals[y] && y>1)
				{
					bidTotals[lastCol]=bidTotals[y];
					System.out.println("###$$###"+bidTotals[lastCol]);
					lowestBidIndex=y;
				}*/
				if(lowestBid>bidTotals[y] && y>1)
				{
					lowestBid=bidTotals[y];
					//System.out.println("###$$###"+bidTotals[lastCol]);
					lowestBidIndex=y;
				}
				if(bidQuotsTotal[lastCol]>bidQuotsTotal[y] && y>1)
				{
					bidQuotsTotal[lastCol]=bidQuotsTotal[y];
					indexOfLowestBidCol=y;
				}
			}
			bidTotals[lastCol]+=bidQuotsTotal[lastCol];
			//System.out.println("###$$###"+bidTotals[lastCol]);
			//Print the Quotes
			str+="<td colspan='1' class='slNoRow'>"+(i+1)+"</td>";
			str+="<td colspan='2' style='text-align: left;'>"+asm.getName()+"</td>";
			str+="<td colspan='7' style='text-align: left;'>"+asm.getDescription()+"</td>";
			boolean unitConverted=!(asm.getDisplayUnit()==null || asm.getDisplayUnit().equalsIgnoreCase("") || asm.getDisplayUnit().equalsIgnoreCase("-"));
			String unit=unitConverted?asm.getDisplayUnit():asm.getUnit();
			double price=unitConverted?asm.getPrice()*asm.getPriceMultiplier():asm.getPrice(); 
			str+="<td colspan='2' style='text-align: left;'>"+unit+"</td>";
			str+="<td colspan='3'>"+DecimalFormat.format(price)+"</td>";
			str+="<td colspan='2'>"+DecimalFormat.format(asm.getPremium())+"</td>";
			str+="<td colspan='3'>"+DecimalFormat.format(asm.getQuantity())+"&nbsp;"+asm.getUnit()+"</td>";
			double totalPrice=price*(1+asm.getPremium()/100);
			double totalBaseCost=totalPrice*asm.getQuantity()/(unitConverted?asm.getPriceMultiplier():1);
			str+="<td colspan='3'>"+DecimalFormat.format(totalPrice)+"</td>";
			str+="<td colspan='3'>"+DecimalFormat.format(totalBaseCost)+"</td>";

			String lowestBidString="";
			for(int z=0;z<numBidders;z++)
			{
				String priceString="";
				String qoutTotalPrice=DecimalFormat.format(bidQuotsTotal[z+1]);
				QuotationBean quot=bidders.get(z).getQuotations().get(key);
				if(quot.getBasis()==0)
				{
					priceString=DecimalFormat.format(quot.getQoutation())+"(%)";
				}
				else
					priceString=DecimalFormat.format(quot.getQoutation());
				if(z==indexOfLowestBidCol-1)
				{
					if(quot.getBasis()==0)
						lowestBidString=DecimalFormat.format(quot.getQoutation())+"(%)";
					else
						lowestBidString=DecimalFormat.format(quot.getQoutation());
					str+="<td colspan='3'><b><i>"+priceString+"</i></b></td>";
					str+="<td colspan='3'><b><i>"+qoutTotalPrice+"</i></b></td>";
				}
				else
				{
					str+="<td colspan='3'>"+priceString+"</td>";
					str+="<td colspan='3'>"+qoutTotalPrice+"</td>";
				}
				//createPhraseCell(table, new Paragraph(bidders.get(z).getName(),font), 3, -1, -1);
			}
			str+="<td colspan='3'>"+lowestBidString+"<br>["+DecimalFormat.format(bidQuotsTotal[lastCol])+"]"+"</td>";
			str+="</tr>";
		}
		str+="<tr>";
		str+="<td colspan='26'><b>Tender Base Price: "+DecimalFormat.format(bidTotals[0])+"</b></td>";

		for(int i=1;i<bidTotals.length;i++)
		{
			String totalPrice=DecimalFormat.format(bidTotals[i]);
			String percentDeviation=DecimalFormat.format((bidTotals[i]-bidTotals[0])*100/bidTotals[0]);

			if(i<bidTotals.length-1)
			{
				if(lowestBidIndex==i)
					str+="<td colspan='6'><b><i><u>"+totalPrice+"</u><br><u>("+percentDeviation+"%)"+"</u></i></b></td>";
				else
					str+="<td colspan='6'><b>"+totalPrice+"<br>("+percentDeviation+"%)"+"</b></td>";
			}	
			else
				str+="<td colspan='3'><b>"+totalPrice+"<br>("+percentDeviation+"%)"+"</b></td>";
		}
		str+="</tr>";
		str+="</tbody><tfoot><tr><td colspan='5000'>&nbsp;</td></tr></tfoot></table>";
		return str;

	}
}
