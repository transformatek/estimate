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
package com.wanhive.system.db.report;


import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;


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
import com.wanhive.basic.indexer.IdIndexer;
import com.wanhive.system.beans.BillBean;
import com.wanhive.system.beans.BillEntryBean;
import com.wanhive.system.beans.BoqBean;
import com.wanhive.system.beans.OverheadBean;
import com.wanhive.system.utils.DecimalFormat;


public class BillReport {
	public static ByteArrayOutputStream getEstimateBook(HttpServletRequest request) throws Exception
	{
		//Get the estimate id for which we are going to prepare the summary
		int estimateId=Integer.parseInt(request.getParameter("estimateId"));
		//System.out.println("ESTIMATE_ID="+estimateId);

		Document doc=new Document();
		ByteArrayOutputStream pdfOut=new ByteArrayOutputStream();
		PdfWriter docWriter=null;
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		PdfPTable table=null;
		Paragraph p=null;
		PdfPCell cell=null;
		try
		{	
			docWriter=PdfWriter.getInstance(doc, pdfOut);
			landscapePdf(doc);
			docWriter.setPageEvent(new WaterMark());
			doc.open();

			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select estimate_name,estimate_specification,costbook_id,contingency,rounded_figure from estimate where estimate_id="+estimateId+") as a left join (select costbook.costbook_id,costbook.costbook_name from costbook) as b on b.costbook_id=a.costbook_id");
			//String estimateName="";
			String estimateDescription="";
			int costBookId=0;
			String costBookName="";
			//double contingency=0;
			String roundedOffFigure="";
			while(rst.next())
			{
				//estimateName=rst.getString(1);
				estimateDescription=rst.getString(2);
				costBookId=rst.getInt(3);
				//contingency=rst.getDouble(4);
				roundedOffFigure=rst.getString(5);
				costBookName=rst.getString(7);
				costBookName=(costBookName==null || costBookName.equalsIgnoreCase(""))?"-":costBookName;
			}
			p=new Paragraph("Detailed Estimate for: "/*+"["+estimateName+"] "*/+estimateDescription/*+"\n{CostBook: \""+costBookName+"\"}"*/);
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);
			Color color=new Color(0,0,0);
			Font font=FontFactory.getFont(FontFactory.COURIER_BOLD, 9, Font.BOLD,color);

			table=new PdfPTable(200);
			table.setWidthPercentage(100);
			cell=new PdfPCell(new Paragraph("Sn",font));
			cell.setColspan(5);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("SOR No.",font));
			cell.setColspan(10);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Description",font));
			cell.setColspan(40);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Number",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Length",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Breadth",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Height",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Weight",font));
			cell.setColspan(10);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Quantity",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Rate",font));
			cell.setColspan(12);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("Unit",font));
			cell.setColspan(8);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("Basic Amount",font));
			cell.setColspan(15);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("Premium(%)",font));
			cell.setColspan(10);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Net Amount",font));
			cell.setColspan(15);
			table.addCell(cell);
			table.setHeaderRows(1);
			double total=printBillDetails(estimateId, costBookId, table,conn);
			cell=new PdfPCell(new Paragraph("Total : "+DecimalFormat.format(total),FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(200);
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			table.addCell(cell);
			doc.add(table);

			/* Add Summary */
			doc.add(new Paragraph(" ",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, new Color(0,0,0))));
			table=new PdfPTable(100);
			table.setWidthPercentage(35);
			table.setHorizontalAlignment(Element.ALIGN_RIGHT);
			String rndoffTotal=(roundedOffFigure==null || roundedOffFigure.equalsIgnoreCase("") || roundedOffFigure.equalsIgnoreCase("-"))?null:roundedOffFigure;
			printBillSummary(estimateId, total, rndoffTotal, table,conn);
			doc.add(table);

			doc.add(new Paragraph(" ",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, Font.BOLD, new Color(0,0,0))));

			table=new PdfPTable(100);
			table.setWidthPercentage(100);
			cell=new PdfPCell(new Paragraph("\n\n\n\n",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(25);
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("\n\n\n\n",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(25);
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("\n\n\n\n",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(25);
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("\n\n\n\n",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(25);
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			table.addCell(cell);

			doc.add(table);
			//p=new Paragraph("Total Price: "+DecimalFormat.format(total));
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

	private static double printBillDetails(int estimateId,int costBookId,PdfPTable table,Connection connection)
	{
		double gross=0;
		try
		{
			ArrayList<BillBean> bill=billTotal(estimateId, costBookId,connection);
			bill=filterAndMergeAssembly(bill);
			Map<Integer, ArrayList<BillEntryBean>> entries=billEntries(estimateId,connection);
			int sl=1;
			for(int h=0;h<bill.size();h++)
			{
				BillBean bean=bill.get(h);
				double totalPrice=bean.getPrice()*(1.0+bean.getPremium()/100.0);
				renderAssemblies(bean,table,sl++);
				Integer key=new Integer(bean.getId());
				ArrayList<BillEntryBean> al=entries.get(key);
				double total=0;
				if(al!=null)
				{
					int length=al.size();
					for(int i=0;i<length;i++)
					{
						BillEntryBean bean1=al.get(i);
						total+=bean1.getTotal();
						renderEntries(bean1,table,i+1,bean.getUnit());
					}
				}
				double totalAmount=total*totalPrice;
				gross+=totalAmount;
				renderTotal(total,bean.getPrice(),bean.getUnit(),bean.getPremium(),bean.getDisplayUnit(),bean.getUnitMultiplier(),totalAmount,table);
			}
		}
		catch (Exception e) {
			System.out.println("printBillDetails: "+e.getMessage());
		}
		return gross;
	}

	private static ArrayList<BillBean> filterAndMergeAssembly(ArrayList<BillBean> assemblies)
	{
		// filter assemblies
		ArrayList<BillBean> hsr=new ArrayList<BillBean>();
		ArrayList<BillBean> ns=new ArrayList<BillBean>();
		for(int i=0;i<assemblies.size();i++)
		{
			BillBean asm=assemblies.get(i);
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
		ArrayList<BillBean> res=new ArrayList<BillBean>();
		res=sortAssembly(hsr);

		res.addAll(ns);
		return res;
	}

	private static ArrayList<BillBean> sortAssembly(ArrayList<BillBean> assembly)
	{
		ArrayList<BillBean> result=new ArrayList<BillBean>();
		for(int l=0;l<assembly.size();l++)
		{
			BillBean asm=(BillBean)assembly.get(l);
			result.add(asm);
		}
		Collections.sort(result, new Comparator<BillBean>(){
			public int compare(BillBean p1, BillBean p2) {
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
	private static void renderAssemblies(BillBean bean,PdfPTable table,int sl)
	{
		PdfPCell cell=null;
		try
		{
			float fontsize=10;
			Color color=new Color(0,0,0);
			Font font=FontFactory.getFont(FontFactory.COURIER, fontsize, Font.NORMAL, color);
			cell=new PdfPCell(new Paragraph(""+(sl++),font));
			cell.setColspan(5);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph(bean.getName(),font));
			cell.setColspan(10);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph(bean.getDescription(),font));
			cell.setColspan(40);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(10);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph(""/*+bean.getPrice()+"/"+bean.getUnit()*/,font));
			cell.setColspan(12);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph(""/*Unit*/,font));
			cell.setColspan(8);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph(""/*Amount*/,font));
			cell.setColspan(15);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph(""/*+bean.getPremium()*/,font));
			cell.setColspan(10);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("--",font));
			cell.setColspan(15);
			table.addCell(cell);
		}
		catch (Exception e) {
			System.out.println("renderAssemblies: "+e.getMessage());
		}
	}

	private static void renderEntries(BillEntryBean bean,PdfPTable table,int sl,String unit)
	{
		PdfPCell cell=null;
		try
		{
			float fontsize=9;
			Color color=new Color(0,0,0);
			Font font=FontFactory.getFont(FontFactory.COURIER, fontsize, Font.NORMAL, color);
			cell=new PdfPCell(new Paragraph(""+(sl++),font));
			cell.setColspan(5);
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(10);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph(bean.getDescription(),font));
			cell.setColspan(40);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph(bean.getNumbers(),font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph(bean.getLength(),font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph(bean.getBreadth(),font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph(bean.getHeight(),font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph(bean.getWeight(),font));
			cell.setColspan(10);
			table.addCell(cell);

			//double entryTotal=bean.getTotal();
			/*if(unit.equalsIgnoreCase("cum"))
			{
				//entryTotal=35.31467*entryTotal;
				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(bean.getTotal()*35.31466672)+" "+"cft",font));
			}
			else if(unit.equalsIgnoreCase("sqm"))
			{
				//entryTotal=10.76391*entryTotal;
				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(bean.getTotal()*10.76391042)+" "+"sft",font));
			}
			else if(unit.equalsIgnoreCase("m"))
			{
				//entryTotal=10.76391*entryTotal;
				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(bean.getTotal()*3.280839895)+" "+"ft",font));
			}
			else*/
			cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(bean.getTotal())+" "+unit,font));
			//cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(bean.getTotal())+" "+unit,font));
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(12);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(8);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(15);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(10);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("--",font));
			cell.setColspan(15);
			table.addCell(cell);
		}
		catch (Exception e) {
			System.out.println("renderEntries: "+e.getMessage());
		}
	}

	private static void renderTotal(double total,double price,String unit,double premium,String displayUnit,double unitMultiplier,double totalAmount,PdfPTable table)
	{
		PdfPCell cell;
		float fontsize=9;
		try
		{
			Color color=new Color(0,0,0);
			Font font=FontFactory.getFont(FontFactory.COURIER_BOLD, fontsize, Font.NORMAL, color);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(5);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(10);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(40);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(15);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("",font));
			cell.setColspan(10);
			table.addCell(cell);

			/*if(unit.equalsIgnoreCase("cum"))
			{
				//entryTotal=35.31467*entryTotal;
				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(total*35.31466672)+" "+"cft"
						+"\n"+DecimalFormat.format(total)+" "+unit,font));
			}
			else if(unit.equalsIgnoreCase("sqm"))
			{
				//entryTotal=10.76391*entryTotal;
				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(total*10.76391042)+" "+"sft"
						+"\n"+DecimalFormat.format(total)+" "+unit,font));
			}
			else if(unit.equalsIgnoreCase("m"))
			{
				//entryTotal=10.76391*entryTotal;
				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(total*3.280839895)+" "+"ft"
						+"\n"+DecimalFormat.format(total)+" "+unit,font));
			}
			else*/
			cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(total)+" "+unit,font));
			//cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(total)+" "+unit,font));
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			cell.setColspan(15);
			table.addCell(cell);

			double displayedPrice=price;
			String displayedUnit=unit;
			if(displayUnit!=null && !displayUnit.equalsIgnoreCase("") && !displayUnit.equalsIgnoreCase("-"))
			{
				displayedPrice=price*unitMultiplier;
				displayedUnit=displayUnit;
			}
			cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(displayedPrice)/*+"/"+unit*/,font));
			cell.setColspan(12);
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph(""+displayedUnit,font));
			cell.setColspan(8);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(total*price),font));
			cell.setColspan(15);
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph(""+premium,font));
			cell.setColspan(10);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(totalAmount),font));
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			cell.setColspan(15);
			table.addCell(cell);
		}
		catch (Exception e) {
			System.out.println("renderTotal: "+e.getMessage());
		}
	}

	private static ArrayList<BillBean> billTotal(int estimateId,int costbookId,Connection connection)
	{
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		ArrayList<BillBean> al=new ArrayList<BillBean>();
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select bill.bill_id,bill.assembly_id, bill.premium,assembly.assembly_name,assembly.assembly_specification,assembly.assembly_unit,assembly.assembly_price,assembly.assembly_display_unit,assembly.assembly_price_multiplier from bill,assembly where bill.estimate_id="+estimateId+" and assembly.assembly_id=bill.assembly_id) as a left join (select assembly_id,costbook_id,price,multiplier from assemblycostbook) as b on a.assembly_id=b.assembly_id and b.costbook_id="+costbookId);

			while(rst.next())
			{
				BillBean bean=new BillBean();
				bean.setId(rst.getInt(1));
				bean.setPremium(rst.getDouble(3));
				bean.setName(rst.getString(4));
				bean.setDescription(rst.getString(5));
				bean.setUnit(rst.getString(6));
				//Basis of Rate Analysis
				double rateMultiplier=Double.parseDouble(rst.getString(13)!=null?rst.getString(13):"1");
				rateMultiplier=1;
				String priceStr=rst.getString(12)!=null?rst.getString(12):rst.getString(7);

				bean.setPrice(Double.parseDouble(priceStr)/rateMultiplier);
				bean.setDisplayUnit(rst.getString(8));
				bean.setUnitMultiplier(rst.getDouble(9));
				al.add(bean);
			}
		}
		catch (Exception e) {
			System.out.println("billTotal: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return al;
	}

	private static Map<Integer, ArrayList<BillEntryBean>> billEntries(int estimateId,Connection connection)
	{
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		Map<Integer, ArrayList<BillEntryBean>> hm=new HashMap<Integer, ArrayList<BillEntryBean>>();
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from billentry where bill_id in (select bill_id from bill where estimate_id="+estimateId+")");

			while(rst.next())
			{
				BillEntryBean bean=new BillEntryBean();
				bean.setId(rst.getInt(1));
				bean.setBillId(rst.getInt(2));
				bean.setDescription(rst.getString(3));
				bean.setNumbers(rst.getString(4));
				bean.setLength(rst.getString(5));
				bean.setBreadth(rst.getString(6));
				bean.setHeight(rst.getString(7));
				bean.setWeight(rst.getString(8));
				bean.setTotal(rst.getDouble(9));

				if(hm.containsKey(new Integer(bean.getBillId())))
				{
					ArrayList<BillEntryBean> al=hm.get(new Integer(bean.getBillId()));
					al.add(bean);
				}
				else
				{
					ArrayList<BillEntryBean> al=new ArrayList<BillEntryBean>();
					al.add(bean);
					hm.put(new Integer(bean.getBillId()), al);
				}
			}
		}
		catch (Exception e) {
			System.out.println("billTotal: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return hm;
	}

	private static void printBillSummary(int estimateId, double total,String rndoffTotal, PdfPTable table,Connection conn)
	{
		ArrayList<OverheadBean> ohb=getOverheads(estimateId,conn);
		PdfPCell cell;
		//float fontsize=9;
		OverheadBean bean=null;
		double netTotal=total;
		cell=new PdfPCell(new Paragraph("Estimated Total: ",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
		cell.setColspan(45);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph(DecimalFormat.format(total),FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, new Color(0,0,0))));
		cell.setColspan(55);
		cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
		table.addCell(cell);

		for(int i=0;i<ohb.size();i++)
		{
			bean=ohb.get(i);
			String overheadStr="";
			double fraction=0;
			overheadStr=bean.getName();
			if(bean.getType().equalsIgnoreCase("Actual"))
			{
				//overheadStr="Add "+bean.getName()+" ["+DecimalFormat.format(bean.getPercentage())+"%]";

				fraction=total*(bean.getPercentage()/100);
				netTotal+=fraction;
			}
			else if(bean.getType().equalsIgnoreCase("DR"))
			{
				//overheadStr="Add "+bean.getName()+" ["+DecimalFormat.format(bean.getPercentage())+"% on Derived]";
				fraction=netTotal*(bean.getPercentage()/100);
				netTotal+=fraction;
			}
			else
			{
				//overheadStr="Add "+bean.getName()+" ["+DecimalFormat.format(bean.getPercentage())+"% on "+DecimalFormat.format(bean.getAmount())+"]";
				fraction=bean.getAmount()*(bean.getPercentage()/100);
				netTotal+=fraction;
			}
			cell=new PdfPCell(new Paragraph(overheadStr,FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(45);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(fraction),FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, new Color(0,0,0))));
			cell.setColspan(55);
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			table.addCell(cell);
		}

		cell=new PdfPCell(new Paragraph("Net Total: ",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
		cell.setColspan(45);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(netTotal),FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, new Color(0,0,0))));
		cell.setColspan(55);
		cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
		table.addCell(cell);

		cell=new PdfPCell(new Paragraph("Approx. Total Amount: ",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
		cell.setColspan(45);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph(""+(rndoffTotal==null || rndoffTotal.equalsIgnoreCase("") || rndoffTotal.equalsIgnoreCase("-")?DecimalFormat.format(netTotal):rndoffTotal),FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, new Color(0,0,0))));
		cell.setColspan(55);
		cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
		table.addCell(cell);

	}

	private static ArrayList<OverheadBean> getOverheads(int estimateId,Connection conn)
	{
		Statement stmt=null;
		ResultSet rst=null;
		ArrayList<OverheadBean> ohb=new ArrayList<OverheadBean>();
		OverheadBean bean=null;
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from overhead where estimate_id="+estimateId);
			while(rst.next())
			{
				bean=new OverheadBean();
				bean.setId(rst.getInt(1));
				bean.setName(rst.getString(2));
				bean.setPercentage(rst.getDouble(3));
				bean.setType(rst.getString(4));
				bean.setAmount(rst.getDouble(5));
				ohb.add(bean);
			}
		}
		catch (Exception e) {
			System.out.println("billTotal: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}

		return ohb;
	}


	/***********************************************************/
	public static ByteArrayOutputStream getBillOfQuantityBook(HttpServletRequest request) throws Exception
	{
		//Get the estimate id for which we are going to prepare the summary
		int estimateId=Integer.parseInt(request.getParameter("estimateId"));
		//System.out.println("ESTIMATE_ID="+estimateId);

		Document doc=new Document();
		ByteArrayOutputStream pdfOut=new ByteArrayOutputStream();
		PdfWriter docWriter=null;
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		PdfPTable table=null;
		Paragraph p=null;
		PdfPCell cell=null;
		try
		{	
			docWriter=PdfWriter.getInstance(doc, pdfOut);
			landscapePdf(doc);
			docWriter.setPageEvent(new WaterMark());
			doc.open();

			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select estimate_name,estimate_specification,costbook_id from estimate where estimate_id="+estimateId+") as a left join (select costbook.costbook_id,costbook.costbook_name from costbook) as b on b.costbook_id=a.costbook_id");
			String estimateName="";
			String estimateDescription="";
			int costBookId=0;
			String costBookName="";
			while(rst.next())
			{
				estimateName=rst.getString(1);
				estimateDescription=rst.getString(2);
				costBookId=rst.getInt(3);
				costBookName=rst.getString(5);
				costBookName=(costBookName==null || costBookName.equalsIgnoreCase(""))?"-":costBookName;
			}
			p=new Paragraph("Details for: ["+estimateName+"] "+estimateDescription+"\n{CostBook: \""+costBookName+"\"}");
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);
			Color color=new Color(0,0,0);
			Font font=FontFactory.getFont(FontFactory.COURIER_BOLD, 9, Font.BOLD,color);

			table=new PdfPTable(100);
			table.setWidthPercentage(99);
			cell=new PdfPCell(new Paragraph("Sl",font));
			cell.setColspan(5);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Name",font));
			cell.setColspan(18);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Specification",font));
			cell.setColspan(40);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("Quantity",font));
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			cell.setColspan(12);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Unit Price",font));
			cell.setColspan(12);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("Amount",font));
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			cell.setColspan(13);
			table.addCell(cell);
			table.setHeaderRows(1);

			Map<Integer, BoqBean> map=getBillOfQuantity(estimateId, costBookId,conn);
			double total=renderBillOfQuantity(estimateId, costBookId, table,map);
			cell=new PdfPCell(new Paragraph("Total (Amount): "+DecimalFormat.format(total),FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(100);
			table.addCell(cell);

			doc.add(table);
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

	private static double renderBillOfQuantity(int estimateId,int costBookId,PdfPTable table,Map<Integer, BoqBean> map)
	{
		double total=0;
		PdfPCell cell;
		try
		{
			Iterator<Entry<Integer, BoqBean>> it=map.entrySet().iterator();
			//System.out.println("NO OF ITEMS: "+map.size());
			int sl=1;
			while(it.hasNext())
			{
				Map.Entry<Integer, BoqBean> pair=(Map.Entry<Integer, BoqBean>)it.next();
				BoqBean bean=pair.getValue();

				Color color=new Color(0,0,0);
				Font font=FontFactory.getFont(FontFactory.TIMES_ROMAN, 8, Font.NORMAL,color);

				cell=new PdfPCell(new Paragraph(""+(sl++),font));
				cell.setColspan(5);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(""+bean.getName(),font));
				cell.setColspan(18);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(""+bean.getDescription(),font));
				cell.setColspan(40);
				table.addCell(cell);

				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(bean.getVolume()),font));
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				cell.setColspan(12);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(""+bean.getPrice()+"/"+bean.getUnit(),font));
				cell.setColspan(12);
				table.addCell(cell);

				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(bean.getPrice()*bean.getVolume()),font));
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				cell.setColspan(13);
				table.addCell(cell);

				total+=bean.getPrice()*bean.getVolume();
			}
		}
		catch (Exception e) {
			System.out.println("renderBillOfQuantity: "+e.getMessage());
		}
		return total;
	}

	private static Map<Integer, BoqBean> getBillOfQuantity(int estimateId,int costBookId,Connection connection)
	{
		Map<Integer, BoqBean> map=new HashMap<Integer, BoqBean>();
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select ref_id,asm_id,item_id,fraction,item_name,item_specification,item_unit,item_price,price,sum(total) as sumtotal, (select assemblycostbook.multiplier from assemblycostbook where assemblycostbook.costbook_id="+costBookId+" and assemblycostbook.assembly_id=final.asm_id) as multiplier from " +
					"(select * from (select * from (select itemassembly.ref_id, itemassembly.assembly_id as asm_id,itemassembly.item_id,itemassembly.fraction,item.item_name,item.item_specification,item.item_unit,item.item_price from itemassembly,item where item.item_id=itemassembly.item_id and itemassembly.costbook_id="+costBookId+") as atas" +
					" left join (select item_id as it_id,price from materialcostbook where costbook_id="+costBookId+") as mtcb on atas.item_id=mtcb.it_id) as c " +
					"cross join (select * from (select bill_id,assembly_id from bill where estimate_id="+estimateId+") as b left join " +
			"(select sum(entry_total) as total,bill_id as b_id from billentry group by(b_id)) as a on a.b_id=b.bill_id) as d on c.asm_id=d.assembly_id)as final group by(ref_id)");
			while(rst.next())
			{
				int itemId=rst.getInt(3);
				Integer key=new Integer(itemId);
				BoqBean bean=map.get(key);
				if(bean==null)
				{
					bean=new BoqBean();
					bean.setId(itemId);
					bean.setName(rst.getString(5));
					bean.setDescription(rst.getString(6));
					bean.setUnit(rst.getString(7));

					String priceStr=(rst.getString(9)==null || rst.getString(9).equalsIgnoreCase(""))?rst.getString(8):rst.getString(9);
					double price=Double.parseDouble(priceStr);
					double sumTotal=(rst.getString(10)!=null && !rst.getString(10).equalsIgnoreCase(""))?Double.parseDouble(rst.getString(10)):0;

					double fraction=rst.getDouble(4);
					double rateMultiplier=Double.parseDouble(rst.getString(11)!=null?rst.getString(11):"1");
					//System.out.println("MULTIPLIER: "+rateMultiplier);
					double total=sumTotal*fraction/rateMultiplier;
					bean.setVolume(total);
					bean.setPrice(price);
					map.put(key, bean);
				}
				else
				{
					double sumTotal=(rst.getString(10)!=null && !rst.getString(10).equalsIgnoreCase(""))?Double.parseDouble(rst.getString(10)):0;
					double rateMultiplier=Double.parseDouble(rst.getString(11)!=null?rst.getString(11):"1");
					double fraction=rst.getDouble(4);
					double total=sumTotal*fraction/rateMultiplier;
					bean.setVolume(bean.getVolume()+total);
				}
			}
		}
		catch (Exception e) {
			System.out.println("getBillOfQuantity: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return map;
	}


	private static void landscapePdf(Document doc)
	{
		doc.addAuthor("ESTICON");
		doc.addCreationDate();
		doc.addProducer();
		doc.addCreator("ProjectReport");
		doc.addTitle("Title");
		doc.setPageSize(PageSize.LEGAL.rotate());
		HeaderFooter footer=new HeaderFooter(new Phrase(""+new Date()+"    "),true);
		doc.setFooter(footer);
	}

}
