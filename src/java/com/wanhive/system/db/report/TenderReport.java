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
 * minor re-formatting of the top summary in the report.
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
import java.util.Date;

import javax.servlet.http.HttpServletRequest;


import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.HeaderFooter;
import com.lowagie.text.List;
import com.lowagie.text.ListItem;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.wanhive.basic.db.DataSourceManager;
import com.wanhive.basic.indexer.IdIndexer;
import com.wanhive.system.beans.AssemblyBean;
import com.wanhive.system.utils.DecimalFormat;

public class TenderReport {
	/*----------------------------- Start For DNIT ------------------------------------------------ */

	public static ByteArrayOutputStream getDNIT(HttpServletRequest request) throws Exception
	{
		//Get the Tender id for which we are going to prepare the summary
		int tenderId=Integer.parseInt(request.getParameter("tenderId"));

		Document doc=new Document();
		ByteArrayOutputStream pdfOut=new ByteArrayOutputStream();
		PdfWriter docWriter=null;
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		PdfPTable table=null;
		PdfPTable table1=null;
		PdfPTable table2=null;
		Paragraph p=null;
		//PdfPCell cell=null;
		try
		{
			conn=DataSourceManager.newConnection();
			docWriter=PdfWriter.getInstance(doc, pdfOut);
			landscapePdf(doc);
			docWriter.setPageEvent(new WaterMark());
			doc.open();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from tender where tender_id="+tenderId);
			String tenderName="";
			String amount="";
			String earnestMoney="";
			String time="";
			String openDate="";

			while(rst.next())
			{
				tenderName=rst.getString(3);
				amount=rst.getString(4);
				earnestMoney=rst.getString(5);
				time=rst.getString(6);
				openDate=rst.getString(7);
			}
			ArrayList<AssemblyBean> results=new ArrayList<AssemblyBean>();

			results=getTenderDetails(tenderId, conn);
			ArrayList<ArrayList<AssemblyBean>> filteredList=filterAssemblyList(results);
			p=new Paragraph(tenderName);
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);

			table=new PdfPTable(100);
			table.setWidthPercentage(100);
			headLines(table,"Tender Amount: ",""+amount);
			headLines(table,"Earnest Money: ",""+earnestMoney);
			headLines(table,"Time Limit: ",time);
			headLines(table,"Tender Opening Date: ",openDate);
			table.setSpacingAfter(PdfPTable.ROW);
			doc.add(table);

			if(filteredList!=null)
			{
				if(filteredList.get(0)!=null){
					table1=new PdfPTable(100);
					table1.setWidthPercentage(100);
					printDNIT(filteredList.get(0),table1);
					table1.setSpacingAfter(PdfPTable.ROW);
					doc.add(table1);
				}
				if(filteredList.get(1)!=null){
					table2=new PdfPTable(100);
					table2.setWidthPercentage(100);
					table2.setSpacingAfter(PdfPTable.ROW);
					printNsDNIT(filteredList.get(1),table2);
					doc.add(table2);
				}
			}


			p=new Paragraph("Notes :-",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.UNDERLINE, new Color(0,0,0)));
			p.setAlignment(Element.ALIGN_LEFT);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);
			printTenderNotes(tenderId,doc);

			/*doc.add(new Paragraph(" ",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 30, Font.BOLD, new Color(0,0,0))));
			table=new PdfPTable(100);
			table.setWidthPercentage(100);
			cell=new PdfPCell(new Paragraph("D/MAN",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(20);
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			disableBorders(cell);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("HDM",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(20);
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			disableBorders(cell);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("CHD",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(20);
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			disableBorders(cell);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("SDE(D)",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(20);
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			disableBorders(cell);
			table.addCell(cell);

			cell=new PdfPCell(new Paragraph("XEN(HQ)",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(20);
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			disableBorders(cell);
			table.addCell(cell);
			doc.add(table);*/

			doc.add(new Paragraph(" ",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, Font.BOLD, new Color(0,0,0))));

			p=new Paragraph("Approved by          ",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD, new Color(0,0,0)));
			p.setAlignment(Element.ALIGN_RIGHT);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);

			doc.add(new Paragraph(" ",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Font.BOLD, new Color(0,0,0))));

			/*p=new Paragraph("Superintending Engineer",FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD, new Color(0,0,0)));
			p.setAlignment(Element.ALIGN_RIGHT);
			p.setSpacingAfter(p.getLeading());
			doc.add(p)*/;

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
	private static void printTenderNotes(int tenderId,Document doc)
	{
		boolean connectionCreated=false;
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		try
		{
			if(conn==null)
			{
				conn=DataSourceManager.newConnection();
				connectionCreated=true;
			}

			stmt=conn.createStatement();
			rst=stmt.executeQuery("select note_description from tender_notes where tender_id="+tenderId);
			List list=new List(true,30);
			while(rst.next())
			{
				list.add(new ListItem(rst.getString(1)));
			}
			doc.add(list);
		}
		catch (Exception e) {
			System.out.println("printTenderNotes: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			if(connectionCreated)
				try {if(conn!=null)conn.close();} catch (Exception e) {}
		}

	}

	private static ArrayList<AssemblyBean> getTenderDetails(int tenderId, Connection connection)
	{
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		ArrayList<AssemblyBean> results= new ArrayList<AssemblyBean>();
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from tender_items where tender_id="+tenderId);
			while(rst.next())
			{
				AssemblyBean bean=new AssemblyBean();
				bean.setName(rst.getString(2));
				bean.setDescription(rst.getString(3));
				bean.setDisplayUnit(rst.getString(4));
				bean.setUnit(rst.getString(5));
				bean.setPrice(rst.getDouble(6));
				bean.setPriceMultiplier(rst.getDouble(7));
				bean.setPremium(rst.getDouble(8));
				bean.setQuantity(rst.getDouble(9));
				results.add(bean);
			}
		}catch (Exception e) {
			System.out.println("getTenderDetails: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			//try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		return results;
	}

	private static ArrayList<ArrayList<AssemblyBean>> filterAssemblyList(ArrayList<AssemblyBean> assemblies)
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
		ArrayList<ArrayList<AssemblyBean>> res=new ArrayList<ArrayList<AssemblyBean>>();
		//res=sortAssembly(hsr);

		//res.addAll(ns);
		/*ArrayList out=new ArrayList();
		out.add(res);
		out.add(ns); */
		res.add(hsr);
		res.add(ns);
		return res;
	}
	
	private static void printDNIT(ArrayList<AssemblyBean> results,PdfPTable table)
	{
		PdfPCell cell=null;
		
		Color color=new Color(0,0,0);
		Font fontTH=FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, color);
		Font fontTD=FontFactory.getFont(FontFactory.TIMES, 10, Font.NORMAL, color);
		cell=new PdfPCell(new Paragraph("Sl.No.",fontTH));
		cell.setColspan(5);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph("SOR No.",fontTH));
		cell.setColspan(8);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph("Description of Items",fontTH));
		cell.setColspan(45);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph("Quantity",fontTH));
		cell.setColspan(10);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph("Unit",fontTH));
		cell.setColspan(8);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph("Rate",fontTH));
		cell.setColspan(10);
		table.addCell(cell);
		
		/*PdfPTable table3 = new PdfPTable(18);
		PdfPCell cell3 = new PdfPCell(new Paragraph("Rate to be quoted by the Tenderer (SOR+C.P.) � in % above or below on both",FontFactory.getFont(FontFactory.HELVETICA_BOLD,7, Font.NORMAL, color)));
		cell3.setColspan(18);
		table3.addCell(cell3);

		cell3=new PdfPCell(new Paragraph("In Fig.",fontTH));
		cell3.setColspan(8);
		table3.addCell(cell3);
		cell3=new PdfPCell(new Paragraph("In Word",fontTH));
		cell3.setColspan(10);
		table3.addCell(cell3);*/
		
		//cell=new PdfPCell(table3);
		cell=new PdfPCell(new Paragraph("Rate to be quoted by the Tenderer (SOR+C.P.) in % above or below on both",FontFactory.getFont(FontFactory.HELVETICA_BOLD,7, Font.NORMAL, color)));
		cell.setColspan(14);
		table.addCell(cell);
		
		
		cell=new PdfPCell(new Paragraph("(i)SCHEDULED ITEMS",fontTH));
		cell.setColspan(100);
		table.addCell(cell);
		
		int count=1;
		try{
			
			for(int j=0;j<results.size();j++)
				{
					AssemblyBean asm=(AssemblyBean)results.get(j);
					String unit=(asm.getDisplayUnit()==null || asm.getDisplayUnit().equalsIgnoreCase("") || asm.getDisplayUnit().equalsIgnoreCase("-"))?asm.getUnit():asm.getDisplayUnit();
					double price=(asm.getDisplayUnit()==null || asm.getDisplayUnit().equalsIgnoreCase("") || asm.getDisplayUnit().equalsIgnoreCase("-"))?asm.getPrice():asm.getPrice()*asm.getPriceMultiplier();
					cell=new PdfPCell(new Paragraph(""+count++,fontTD));
					cell.setColspan(5);
					table.addCell(cell);
					cell=new PdfPCell(new Paragraph(asm.getName(),fontTD));
					cell.setColspan(8);
					table.addCell(cell);
					cell=new PdfPCell(new Paragraph(asm.getDescription(),fontTD));
					cell.setColspan(45);
					table.addCell(cell);
					cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(asm.getQuantity())+" "+asm.getUnit(),fontTD));
					cell.setColspan(10);
					cell.setHorizontalAlignment(PdfPCell.ALIGN_RIGHT);
					table.addCell(cell);
					cell=new PdfPCell(new Paragraph(unit,fontTD));
					cell.setColspan(8);
					table.addCell(cell);
					cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(price),fontTD));
					cell.setColspan(10);
					cell.setHorizontalAlignment(PdfPCell.ALIGN_RIGHT);
					table.addCell(cell);
					cell=new PdfPCell(new Paragraph("",fontTD));
					cell.setColspan(14);
					cell.setHorizontalAlignment(PdfPCell.ALIGN_RIGHT);
					table.addCell(cell);
					/*cell=new PdfPCell(new Paragraph("",fontTD));
					cell.setColspan(10);
					cell.setHorizontalAlignment(cell.ALIGN_RIGHT);
					table.addCell(cell);*/
				}
		}catch(Exception e){e.printStackTrace();}
	}
	
	private static void printNsDNIT(ArrayList<AssemblyBean> results,PdfPTable table)
	{
		PdfPCell cell=null;
		
		Color color=new Color(0,0,0);
		Font fontTH=FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, color);
		Font fontTD=FontFactory.getFont(FontFactory.TIMES, 10, Font.NORMAL, color);
		cell=new PdfPCell(new Paragraph("Sl.No.",fontTH));
		cell.setColspan(5);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph("SOR No.",fontTH));
		cell.setColspan(8);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph("Description of Items",fontTH));
		cell.setColspan(45);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph("Quantity",fontTH));
		cell.setColspan(10);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph("Unit",fontTH));
		cell.setColspan(8);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph("Departmental Rate",fontTH));
		cell.setColspan(10);
		table.addCell(cell);
		
		/*PdfPTable table3 = new PdfPTable(18);
		PdfPCell cell3 = new PdfPCell(new Paragraph("Rate to be quoted by the Tenderer",FontFactory.getFont(FontFactory.HELVETICA_BOLD,7, Font.NORMAL, color)));
		cell3.setColspan(18);
		table3.addCell(cell3);

		cell3=new PdfPCell(new Paragraph("In Fig.",fontTH));
		cell3.setColspan(8);
		table3.addCell(cell3);
		cell3=new PdfPCell(new Paragraph("In Word",fontTH));
		cell3.setColspan(10);
		table3.addCell(cell3);*/
		
		//cell=new PdfPCell(table3);
		cell=new PdfPCell(new Paragraph("Rate to be quoted by the Tenderer",FontFactory.getFont(FontFactory.HELVETICA_BOLD,8, Font.NORMAL, color)));
		cell.setColspan(14);
		table.addCell(cell);
		
		cell=new PdfPCell(new Paragraph("(ii)NON-SCHEDULED ITEMS",fontTH));
		cell.setColspan(100);
		table.addCell(cell);
		
		int count=1;
		try{
			
			for(int j=0;j<results.size();j++)
				{
					AssemblyBean asm=(AssemblyBean)results.get(j);
					String unit=(asm.getDisplayUnit()==null || asm.getDisplayUnit().equalsIgnoreCase("") || asm.getDisplayUnit().equalsIgnoreCase("-"))?asm.getUnit():asm.getDisplayUnit();
					//double price=(asm.getDisplayUnit()==null || asm.getDisplayUnit().equalsIgnoreCase("-"))?asm.getPrice():asm.getPrice()*asm.getPriceMultiplier();
					cell=new PdfPCell(new Paragraph(""+count++,fontTD));
					cell.setColspan(5);
					table.addCell(cell);
					cell=new PdfPCell(new Paragraph(asm.getName(),fontTD));
					cell.setColspan(8);
					table.addCell(cell);
					cell=new PdfPCell(new Paragraph(asm.getDescription(),fontTD));
					cell.setColspan(45);
					table.addCell(cell);
					cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(asm.getQuantity()),fontTD));
					cell.setColspan(10);
					cell.setHorizontalAlignment(PdfPCell.ALIGN_RIGHT);
					table.addCell(cell);
					cell=new PdfPCell(new Paragraph(unit,fontTD));
					cell.setColspan(8);
					table.addCell(cell);
					// For Not Showing NS Price  
					//cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(asm.getPrice()),fontTD));
					cell=new PdfPCell(new Paragraph("",fontTD));
					cell.setColspan(10);
					cell.setHorizontalAlignment(PdfPCell.ALIGN_RIGHT);
					table.addCell(cell);
					cell=new PdfPCell(new Paragraph("",fontTD));
					cell.setColspan(14);
					cell.setHorizontalAlignment(PdfPCell.ALIGN_RIGHT);
					table.addCell(cell);
					/*cell=new PdfPCell(new Paragraph("",fontTD));
					cell.setColspan(10);
					cell.setHorizontalAlignment(cell.ALIGN_RIGHT);
					table.addCell(cell);*/
				}
		}catch(Exception e){e.printStackTrace();}
	}
	/* --------------------------------  End for DNIT -------------------------------------------------*/
	private static void headLines(PdfPTable table,String title,String value)
	{

		PdfPCell cell=new PdfPCell(new Paragraph(""));
		cell.setColspan(20);
		disableBorders(cell);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph(""));
		cell.setColspan(20);
		disableBorders(cell);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph(""));
		cell.setColspan(20);
		disableBorders(cell);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph(title,FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new Color(0,0,0))));
		cell.setColspan(20);
		cell.setHorizontalAlignment(Element.ALIGN_LEFT);
		disableBorders(cell);
		table.addCell(cell);
		cell=new PdfPCell(new Paragraph(value,FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.NORMAL, new Color(0,0,0))));
		cell.setColspan(20);
		cell.setHorizontalAlignment(Element.ALIGN_LEFT);
		disableBorders(cell);
		table.addCell(cell);
	}

	private static void disableBorders(PdfPCell cell)
	{
		cell.disableBorderSide(PdfPCell.LEFT);
		cell.disableBorderSide(PdfPCell.RIGHT);
		cell.disableBorderSide(PdfPCell.TOP);
		cell.disableBorderSide(PdfPCell.BOTTOM);
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
}
