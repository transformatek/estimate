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
 * minor clean-up of the table headings
 * 
 ***********************************************************/
package com.wanhive.system.db.report;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Date;
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
import com.wanhive.system.utils.DecimalFormat;


public class MaterialReport {
	public static ByteArrayOutputStream getMaterialList(HttpServletRequest request) throws Exception
	{
		int catId=Integer.parseInt(request.getParameter("catId"));
		int cbId=Integer.parseInt(request.getParameter("cbId"));
		String cbName=request.getParameter("cbName");
		//System.out.println("CATEGORY_ID="+catId);
		//System.out.println("COSTBOOK"+cbId);
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
			rst=stmt.executeQuery("select category_name,specifications from category where category_id="+catId);
			String categoryName="";
			String categoryDescription="";
			while(rst.next())
			{
				categoryName=rst.getString(1);
				categoryDescription=rst.getString(2);
			}
			p=new Paragraph("Details for Category: ["+categoryName+"] "+categoryDescription+"\nCostBook: ["+cbName+"]");
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);
			
			Color color=new Color(0,0,0);
			Font font=FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, color);
			table=new PdfPTable(100);
			table.setWidthPercentage(95);
			cell=new PdfPCell(new Paragraph("Sl",font));
			cell.setColspan(10);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Name",font));
			cell.setColspan(20);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Specification",font));
			cell.setColspan(30);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Price",font));
			cell.setColspan(15);
			table.addCell(cell);
			
			cell=new PdfPCell(new Paragraph("Remarks",font));
			cell.setColspan(25);
			table.addCell(cell);
			table.setHeaderRows(1);
			printCategoryList(catId,table,cbId,0);
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
	
	private static void printCategoryList(int parentId,PdfPTable table,int cbId,int indent)
	{
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		PdfPCell cell=null;
		Color color=new Color(0,0,0);
		Font font=FontFactory.getFont(FontFactory.COURIER, 9, Font.NORMAL, color);
		try
		{
			printMaterialList(parentId,cbId,table);
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from category where category_parent_id="+parentId);
			int sl=1;
			while(rst.next())
			{
				cell=new PdfPCell(new Paragraph(""+indentString(indent, "*")+(sl++),font));
				cell.setColspan(10);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(""+rst.getString(2),font));
				cell.setColspan(20);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(""+rst.getString(3),font));
				cell.setColspan(30);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph("--",font));
				cell.setColspan(15);
				table.addCell(cell);
				
				cell=new PdfPCell(new Paragraph(""+rst.getString(4),font));
				cell.setColspan(25);
				table.addCell(cell);
				//$$$$: Do not recurse
				//printCategoryList(rst.getInt(1),table,cbId,indent+1);
			}
		}
		catch (Exception e) {
			System.out.println("printCategoryList: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
	}
	
	
	private static void printMaterialList(int parentId,int cbId,PdfPTable table)
	{
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;
		PdfPCell cell=null;
		Color color=new Color(0,0,0);
		Font font=FontFactory.getFont(FontFactory.TIMES, 8, Font.ITALIC, color);
		try
		{
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select * from item where category_id="+parentId+") as a left join materialcostbook as b  on b.item_id=a.item_id and b.costbook_id="+cbId);
			int sl=1;
			while(rst.next())
			{
				cell=new PdfPCell(new Paragraph(""+(sl++),font));
				cell.setColspan(10);
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(""+rst.getString(2),font));
				cell.setColspan(20);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(""+rst.getString(3),font));
				cell.setColspan(30);
				table.addCell(cell);
				
				String unit=rst.getString(4);
				double stdPrice=rst.getDouble(5);
				String cbPrice=((rst.getString(12)!=null && !rst.getString(12).equalsIgnoreCase(""))?rst.getString(12):"-");
				if(!cbPrice.equalsIgnoreCase("-")) cbPrice=DecimalFormat.format(Double.parseDouble(cbPrice));
				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(stdPrice)+" ["+cbPrice+"]/"+unit,font));
				cell.setColspan(15);
				table.addCell(cell);
				
				cell=new PdfPCell(new Paragraph(""+rst.getString(6),font));
				cell.setColspan(25);
				table.addCell(cell);
			}
		}
		catch (Exception e) {
			System.out.println("printMaterialList: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
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
	
	private static String indentString(int indent,String s)
	{
		StringBuffer sbuf=new StringBuffer("");
		for(int i=0;i<indent;i++)
		{
			sbuf.append(s);
		}
		return sbuf.toString();
	}
}
