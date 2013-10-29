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
 * Cleaned up the report, changed the table headings
 * Indian Rupees no longer displayed as currency
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
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;


import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.wanhive.basic.db.DataSourceManager;
import com.wanhive.system.beans.BoqBean;
import com.wanhive.system.beans.CostBean;
import com.wanhive.system.beans.OverheadBean;
import com.wanhive.system.utils.DecimalFormat;



import java.awt.Graphics2D;
import java.awt.geom.Rectangle2D;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.title.TextTitle;

import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;


public class ProjectReport {
	public static ByteArrayOutputStream getProjectSummary(HttpServletRequest request) throws Exception
	{
		//Get the project id for which we are going to prepare the summary
		int projectId=Integer.parseInt(request.getParameter("projectId"));
		//System.out.println("PROJECT_ID="+projectId);

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
			conn=DataSourceManager.newConnection();
			
			Map<Integer, Double> projectMap=new HashMap<Integer, Double>();
			Map<Integer, Double> estimateMap=new HashMap<Integer, Double>();

			double total=getProjectTotal(projectId, projectMap,estimateMap,conn);

			docWriter=PdfWriter.getInstance(doc, pdfOut);
			landscapePdf(doc);
			docWriter.setPageEvent(new WaterMark());
			doc.open();
			
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select project_name,project_specification from project where project_id="+projectId);
			String projectName="";
			String projectDescription="";
			while(rst.next())
			{
				projectName=rst.getString(1);
				projectDescription=rst.getString(2);
			}
			p=new Paragraph("Summary for: ["+projectName+"] "+projectDescription);
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());

			Color color=new Color(0,0,0);
			Font font=FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, color);
			table=new PdfPTable(105);
			table.setWidthPercentage(95);
			cell=new PdfPCell(new Paragraph("Sl",font));
			cell.setColspan(8);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Name",font));
			cell.setColspan(23);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Specification",font));
			cell.setColspan(55);
			table.addCell(cell);
			cell=new PdfPCell(new Paragraph("Total (Amount)",font));
			cell.setColspan(19);
			table.addCell(cell);

			table.setHeaderRows(1);
			//getProjectSummary(projectId, table);
			ArrayList<CostBean> al=projectSummaryTable(projectId, table,projectMap,estimateMap,0,conn,true);
			cell=new PdfPCell(new Paragraph("Total (Amount): "+DecimalFormat.format(total),FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, color)));
			cell.setColspan(105);
			table.addCell(cell);
			
			JFreeChart pieChart=getProjectSummaryPieChart(al,"["+projectName+"] "+projectDescription,total);
			JFreeChart barChart=getProjectSummaryBarChart(al, projectName, total);
			int width=(Math.round(doc.getPageSize().getWidth()));
			int height=(Math.round(doc.getPageSize().getHeight()));
			
			PdfContentByte ctb = docWriter.getDirectContent();
    		PdfTemplate tp = ctb.createTemplate(width, height);
    		Graphics2D g2d = tp.createGraphics(width, height, new DefaultFontMapper());
    		Rectangle2D r2d = new Rectangle2D.Double(0, 0, width-100, height-150);
    		pieChart.draw(g2d, r2d);
    		g2d.dispose();
    		doc.add(p);
    		ctb.addTemplate(tp, 50, -75);	//Left Margin, Top Margin
    		
    		doc.newPage();
    		tp = ctb.createTemplate(width, height);
    		g2d = tp.createGraphics(width, height, new DefaultFontMapper());
    		r2d = new Rectangle2D.Double(0, 0, width-100, height-150);
    		barChart.draw(g2d, r2d);
    		g2d.dispose();
    		doc.add(p);
    		ctb.addTemplate(tp, 50, -75);	//Left Margin, Top Margin
    		
    		doc.newPage();
    		doc.add(p);
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

	private static double getProjectTotal(int projectParentId,Map<Integer, Double> projectMap,Map<Integer, Double> estimateMap,Connection connection)
	{
		double total=0;
		boolean connectionCreated=false;
		Connection conn=connection;
		Statement stmt=null;
		Statement stmt1=null;
		ResultSet rst=null;
		ResultSet rst1=null;
		try
		{
			if(conn==null)
			{
				conn=DataSourceManager.newConnection();
				connectionCreated=true;
			}

			stmt1=conn.createStatement();
			rst1=stmt1.executeQuery("select estimate_id,costbook_id from estimate where project_id="+projectParentId);
			while(rst1.next())
			{
				double estimateTotal=0;
				int estimateId=rst1.getInt(1);
				int costBookId=rst1.getInt(2);
				estimateTotal=getEstimateTotal(estimateId,costBookId,estimateMap,conn);
				total+=estimateTotal;
			}

			stmt=conn.createStatement();
			rst=stmt.executeQuery("select project_id from project where project_parent_id="+projectParentId);
			while(rst.next())
			{
				int id=rst.getInt(1);
				//We recursively add into total, the total cost
				//of sub-projects
				total+=getProjectTotal(id,projectMap,estimateMap,conn);
			}

		}
		catch (Exception e) {
			System.out.println("getProjectTotal: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(rst1!=null)rst1.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();} catch (Exception e) {}
			if(connectionCreated)
				try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		//System.out.println("FOR: "+projectParentId+" Total:"+total);
		projectMap.put(new Integer(projectParentId), new Double(total));
		return total;
	}

	private static double getEstimateTotal(int estimateId,int costbookId,Map<Integer, Double> estimateMap,Connection connection)
	{
		//double total=0;
		double priceTotal=0;
		boolean connectionCreated=false;
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		ArrayList<OverheadBean> ohb=null;
		try
		{
			if(conn==null)
			{
				conn=DataSourceManager.newConnection();
				connectionCreated=true;
				//System.out.println("getEstimateTotal: New Connection Created");
			}
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select entry_id,bill_id,entry_total from billentry where bill_id in (select bill_id from bill where estimate_id="+estimateId+")) as entry left join (select * from (select bill.bill_id,bill.assembly_id,bill.premium,assembly.assembly_price from bill, assembly where estimate_id="+estimateId+" and assembly.assembly_id=bill.assembly_id) as a left join (select assembly_id as asm_id,price as pr,multiplier from assemblycostbook where costbook_id="+costbookId+") as b on b.asm_id=a.assembly_id) as bill on entry.bill_id=bill.bill_id");

			while(rst.next())
			{
				double premium=rst.getDouble(6);
				String stdPrice=rst.getString(7);
				String cbPrice=rst.getString(9);
				
				String billPrice=(cbPrice==null || cbPrice.equalsIgnoreCase(""))?stdPrice:cbPrice;
				
				double rateMultiplier=Double.parseDouble(rst.getString(10)!=null?rst.getString(10):"1");
				rateMultiplier=1;
				double numPrice=Double.parseDouble(billPrice)/rateMultiplier;
				double qtty=rst.getDouble(3);
				//total+=qtty;
				priceTotal+=qtty*(numPrice*(1.0+premium/100));
			}
			ohb=getOverheads(estimateId, conn);
		}
		catch (Exception e) {
			System.out.println("getEstimateTotal: "+e.getMessage());
			//throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			if(connectionCreated)
				try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		OverheadBean bean=null;
		//System.out.println("Total Price before adding Overhead: "+priceTotal);
		double netTotal=priceTotal;
		for(int i=0;i<ohb.size();i++)
		{
			bean=ohb.get(i);
			//String overheadStr="";
			double fraction=0;
			if(bean.getType().equalsIgnoreCase("Actual"))
			{
				//overheadStr="Add "+bean.getName()+" ["+DecimalFormat.format(bean.getPercentage())+"%]";
				fraction=priceTotal*(bean.getPercentage()/100);
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
			//System.out.println("$$$$"+overheadStr+" :"+netTotal);
		}
		
		//System.out.println("ESTIMATE QTTY TOTAL: for "+estimateId+" ["+total+"]");
		estimateMap.put(new Integer(estimateId), new Double(netTotal));
		return netTotal;
		
	}

	private static ArrayList<OverheadBean> getOverheads(int estimateId,Connection conn)
	{
		//System.out.println("Getting Overheads for ESTIMATE_ID:"+estimateId);
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
			System.out.println("getOverheads: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		
		return ohb;
	}
	
	private static ArrayList<CostBean> projectSummaryTable(int projectParentId,PdfPTable table,Map<Integer, Double> projectMap,Map<Integer, Double> estimateMap,int indent,Connection connection,boolean isFirstLevel)
	{
		double total=0;
		boolean connectionCreated=false;
		Connection conn=connection;
		Statement stmt=null;
		Statement stmt1=null;
		ResultSet rst=null;
		ResultSet rst1=null;
		String name="";
		String description="";
		PdfPCell cell=null;
		ArrayList<CostBean> al=null;
		CostBean cb=null;
		float fontSize=10;
		try
		{
			if(isFirstLevel)
				al=new ArrayList<CostBean>();
			if(conn==null)
			{
				conn=DataSourceManager.newConnection();
				connectionCreated=true;
			}
			stmt1=conn.createStatement();
			rst1=stmt1.executeQuery("select estimate_id,estimate_name,estimate_specification from estimate where project_id="+projectParentId);
			int sl=1;
			float billFontSize=fontSize-1;
			while(rst1.next())
			{
				double estimateTotal=0;
				int estimateId=rst1.getInt(1);
				String estimateName=rst1.getString(2);
				String estimateDescription=rst1.getString(3);
				estimateTotal=estimateMap.get(new Integer(estimateId)).doubleValue();
				total+=estimateTotal;
				
				if(isFirstLevel)
				{
					cb=new CostBean();
					cb.setId(estimateId);
					cb.setName(estimateName);
					cb.setType("Estimate");
					cb.setTotal(estimateTotal);
					al.add(cb);
				}
				Color color=new Color(0,0,0);
				Font font=FontFactory.getFont(FontFactory.TIMES, billFontSize, Font.ITALIC, color);
				cell=new PdfPCell(new Paragraph(""+(sl++),font));
				cell.setColspan(8);
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(estimateName,font));
				cell.setColspan(23);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(estimateDescription,font));
				cell.setColspan(55);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(estimateTotal),font));
				cell.setColspan(19);
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				table.addCell(cell);
			}

			stmt=conn.createStatement();
			rst=stmt.executeQuery("select project_id,project_name,project_specification from project where project_parent_id="+projectParentId);
			sl=1;
			while(rst.next())
			{
				float projectFontSize=fontSize;
				int id=rst.getInt(1);
				name=rst.getString(2);
				description=rst.getString(3);
				total=projectMap.get(new Integer(id)).doubleValue();
				Color color=new Color(0,0,0);
				Font font=FontFactory.getFont(FontFactory.COURIER, projectFontSize, Font.NORMAL, color);
				cell=new PdfPCell(new Paragraph(""+indentString(indent, "*")+(sl++)+".",font));
				//cell.setIndent(indent);
				cell.setColspan(8);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(name,font));
				cell.setColspan(23);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(description,font));
				cell.setColspan(55);
				table.addCell(cell);
				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(total),FontFactory.getFont(FontFactory.HELVETICA_BOLD, projectFontSize, Font.NORMAL, new Color(0,0,0))));
				cell.setColspan(19);
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				table.addCell(cell);
				if(isFirstLevel)
				{
					cb=new CostBean();
					cb.setId(id);
					cb.setName(name);
					cb.setTotal(total);
					cb.setType("Project");
					al.add(cb);
				}
				projectSummaryTable(id,table,projectMap,estimateMap,indent+1,conn,false);
			}
		}
		catch (Exception e) {
			System.out.println("projectSummaryTable: "+e.getMessage());
			//throw e;
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(rst1!=null)rst1.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(stmt1!=null)stmt1.close();} catch (Exception e) {}
			if(connectionCreated)
				try {if(conn!=null)conn.close();} catch (Exception e) {}
		}
		return al;
	}
	
	private static JFreeChart getProjectSummaryPieChart(ArrayList<CostBean> al,String projectName,double projectTotal) {
    	DefaultPieDataset dataset = new DefaultPieDataset();
    	String projectTotalStr=DecimalFormat.format(projectTotal);
    	for(int i=0;i<al.size();i++)
    	{
    		String name=al.get(i).getName();
    		double total=al.get(i).getTotal();
    		double fraction=total/projectTotal*100;
    		String legend=name+" ("+DecimalFormat.format(fraction)+"%)";
    		dataset.setValue(legend, total);
    	}
    	JFreeChart jfc=ChartFactory.createPieChart3D("",dataset,true,true,false);
    	jfc.setTitle(new TextTitle("Estimated Total(Amount):[ "+projectTotalStr+" ]",new java.awt.Font(java.awt.Font.MONOSPACED,java.awt.Font.PLAIN,12)));
    	return jfc;
    }
	
	private static JFreeChart getProjectSummaryBarChart(ArrayList<CostBean> al,String projectName,double projectTotal) {
		DefaultCategoryDataset dataset = new DefaultCategoryDataset();
    	String projectTotalStr=DecimalFormat.format(projectTotal);
		for(int i=0;i<al.size();i++)
    	{
    		String name=al.get(i).getName();
    		double total=al.get(i).getTotal();
    		//dataset.setValue(total, name, name);
    		dataset.setValue(total, name, projectName+" [(Amount) "+projectTotalStr+"]");
    	}
    	JFreeChart jfc=ChartFactory.createBarChart3D("",
    			"Estimate/Project", "Amount", dataset,
				PlotOrientation.VERTICAL, true, true, false);
    	jfc.setTitle(new TextTitle("Cost Breakup",new java.awt.Font(java.awt.Font.MONOSPACED,java.awt.Font.PLAIN,15)));
    	return jfc;
    }

	/***********************************************************/
	public static ByteArrayOutputStream getBillOfQuantityBook(HttpServletRequest request) throws Exception
	{
		//Get the estimate id for which we are going to prepare the summary
		int projectId=Integer.parseInt(request.getParameter("projectId"));
		//System.out.println("PROJECT_ID="+projectId);
		
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
			rst=stmt.executeQuery("select project_name,project_specification from project where project_id="+projectId);
			//rst=stmt.executeQuery("select * from (select estimate_name,estimate_specification,costbook_id from estimate where estimate_id="+projectId+") as a left join (select costbook.costbook_id,costbook.costbook_name from costbook) as b on b.costbook_id=a.costbook_id");
			String projectName="";
			String projectDescription="";
			while(rst.next())
			{
				projectName=rst.getString(1);
				projectDescription=rst.getString(2);
			}
			p=new Paragraph("BOQ for: ["+projectName+"] "+projectDescription);
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
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
			cell=new PdfPCell(new Paragraph("Average Unit Price",font));
			cell.setColspan(12);
			table.addCell(cell);
			
			cell=new PdfPCell(new Paragraph("Amount",font));
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			cell.setColspan(13);
			table.addCell(cell);
			table.setHeaderRows(1);
			Map<Integer, BoqBean> map=getBillOfQuantityForProject(projectId,conn,null);
			double total=0;
			total=renderBillOfQuantity(table,map);
			cell=new PdfPCell(new Paragraph("Total (Amount): "+DecimalFormat.format(total),FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, new Color(0,0,0))));
			cell.setColspan(100);
			table.addCell(cell);
			
			JFreeChart pieChart=getProjectBOQPieChart(map, projectName, total);
			JFreeChart barChart=getProjectBOQBarChart(map, projectName, total);
			int width=(Math.round(doc.getPageSize().getWidth()));
			int height=(Math.round(doc.getPageSize().getHeight()));

			PdfContentByte ctb = docWriter.getDirectContent();
    		PdfTemplate tp = ctb.createTemplate(width, height);
    		Graphics2D g2d = tp.createGraphics(width, height, new DefaultFontMapper());
    		Rectangle2D r2d = new Rectangle2D.Double(0, 0, width-100, height-150);
    		pieChart.draw(g2d, r2d);
    		g2d.dispose();
    		doc.add(p);
    		ctb.addTemplate(tp, 50, -75);
    		
    		doc.newPage();
    		tp = ctb.createTemplate(width, height);
    		g2d = tp.createGraphics(width, height, new DefaultFontMapper());
    		r2d = new Rectangle2D.Double(0, 0, width-100, height-150);
    		barChart.draw(g2d, r2d);
    		g2d.dispose();
    		doc.add(p);
    		ctb.addTemplate(tp, 50, -75);	//Left Margin, Top Margin
    		
    		doc.newPage();
    		doc.add(p);
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
	
	
	
	private static double renderBillOfQuantity(PdfPTable table,Map<Integer, BoqBean> map)
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
				
				String averagePrice=DecimalFormat.format(bean.getGross()/bean.getVolume());
				cell=new PdfPCell(new Paragraph(""+averagePrice+"/"+bean.getUnit(),font));
				cell.setColspan(12);
				table.addCell(cell);
				
				cell=new PdfPCell(new Paragraph(""+DecimalFormat.format(bean.getGross()),font));
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				cell.setColspan(13);
				table.addCell(cell);
				
				total+=bean.getGross();
			}
		}
		catch (Exception e) {
			System.out.println("renderBillOfQuantity: "+e.getMessage());
		}
		return total;
	}
	
	private static Map<Integer, BoqBean> getBillOfQuantityForProject(int projectId,Connection connection,Map<Integer, BoqBean> map)
	{
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		if(map==null)
			map=new HashMap<Integer, BoqBean>();
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select estimate_id,costbook_id from estimate where project_id="+projectId);
			
			while(rst.next())
			{
				int estimateId=rst.getInt(1);
				int costBookId=rst.getInt(2);
				map=getBillOfQuantity(estimateId, costBookId,map,conn);
			}
			
			//Recursively evaluate lower levels
			try {if(rst!=null)rst.close();rst=null;} catch (Exception e) {}
			rst=stmt.executeQuery("select project_id from project where project_parent_id="+projectId);
			
			while(rst.next())
			{
				int id=rst.getInt(1);
				map=getBillOfQuantityForProject(id, connection, map);
			}
		}
		catch (Exception e) {
			System.out.println("getBillOfQuantityForProject: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return map;
	}
	
	private static Map<Integer, BoqBean> getBillOfQuantity(int estimateId,int costBookId,Map<Integer, BoqBean> map,Connection connection)
	{
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select ref_id,asm_id,item_id,fraction,item_name,item_specification,item_unit,item_price,price,sum(total) as sumtotal,item_type, (select assemblycostbook.multiplier from assemblycostbook where assemblycostbook.costbook_id="+costBookId+" and assemblycostbook.assembly_id=final.asm_id) as multiplier from " +
					"(select * from (select * from (select itemassembly.ref_id, itemassembly.assembly_id as asm_id,itemassembly.item_id,itemassembly.fraction,item.item_name,item.item_specification,item.item_unit,item.item_price,item.item_type from itemassembly,item where item.item_id=itemassembly.item_id and itemassembly.costbook_id="+costBookId+") as atas" +
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
					bean.setType(rst.getString(11));
					double fraction=rst.getDouble(4);
					double rateMultiplier=Double.parseDouble(rst.getString(12)!=null?rst.getString(12):"1");
					double total=sumTotal*fraction/rateMultiplier;
					
					bean.setVolume(total);
					//bean.setPrice(price);
					bean.setGross(total*price);
					map.put(key, bean);
				}
				else
				{
					String priceStr=(rst.getString(9)==null || rst.getString(9).equalsIgnoreCase(""))?rst.getString(8):rst.getString(9);
					double price=Double.parseDouble(priceStr);
					double sumTotal=(rst.getString(10)!=null && !rst.getString(10).equalsIgnoreCase(""))?Double.parseDouble(rst.getString(10)):0;
					double fraction=rst.getDouble(4);
					double rateMultiplier=Double.parseDouble(rst.getString(12)!=null?rst.getString(12):"1");
					double total=sumTotal*fraction/rateMultiplier;
					bean.setVolume(bean.getVolume()+total);
					bean.setGross(bean.getGross()+total*price);
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
	

	private static JFreeChart getProjectBOQPieChart(Map<Integer, BoqBean> map,String projectName,double projectTotal) {
    	DefaultPieDataset dataset = new DefaultPieDataset();
    	Map<String, CostBean> cbMap=new HashMap<String, CostBean>();
    	Iterator<Entry<Integer, BoqBean>> it=map.entrySet().iterator();
		while(it.hasNext())
		{
			Map.Entry<Integer, BoqBean> pair=(Map.Entry<Integer, BoqBean>)it.next();
			BoqBean bean=pair.getValue();
			
			CostBean cb=cbMap.get(bean.getType());
			if(cb==null)
			{
				cb=new CostBean();
				cb.setTotal(bean.getGross());
				cb.setType(bean.getType());
				cbMap.put(bean.getType(), cb);
			}
			else
			{
				cb.setTotal(cb.getTotal()+bean.getGross());
			}
		}
		
		Iterator<Entry<String, CostBean>> cbIt=cbMap.entrySet().iterator();
		while(cbIt.hasNext())
		{
			Map.Entry<String, CostBean> cbPair=(Map.Entry<String, CostBean>)cbIt.next();
			CostBean cbBean=cbPair.getValue();
			
			String name=cbBean.getType();
    		double total=cbBean.getTotal();
    		double fraction=total/projectTotal*100;
    		//double fraction=total;
    		String legend=name+" ("+DecimalFormat.format(fraction)+"%)";
    		dataset.setValue(legend, total);
		}
    	JFreeChart jfc=ChartFactory.createPieChart3D("",dataset,true,true,false);
    	jfc.setTitle(new TextTitle("Item-Type-Wise Breakup for : "+projectName+" [(Amount)"+DecimalFormat.format(projectTotal)+" ]",new java.awt.Font(java.awt.Font.MONOSPACED,java.awt.Font.PLAIN,15)));
    	return jfc;
    }
	private static JFreeChart getProjectBOQBarChart(Map<Integer, BoqBean> map,String projectName,double projectTotal) {
		DefaultCategoryDataset dataset = new DefaultCategoryDataset();
		
		Map<String, CostBean> cbMap=new HashMap<String, CostBean>();
    	Iterator<Entry<Integer, BoqBean>> it=map.entrySet().iterator();
		while(it.hasNext())
		{
			Map.Entry<Integer, BoqBean> pair=(Map.Entry<Integer, BoqBean>)it.next();
			BoqBean bean=pair.getValue();
			
			CostBean cb=cbMap.get(bean.getType());
			if(cb==null)
			{
				cb=new CostBean();
				cb.setTotal(bean.getGross());
				cb.setType(bean.getType());
				cbMap.put(bean.getType(), cb);
			}
			else
			{
				cb.setTotal(cb.getTotal()+bean.getGross());
			}
		}
		String projectTotalStr=DecimalFormat.format(projectTotal);
		Iterator<Entry<String, CostBean>> cbIt=cbMap.entrySet().iterator();
		while(cbIt.hasNext())
		{
			Map.Entry<String, CostBean> cbPair=(Map.Entry<String, CostBean>)cbIt.next();
			CostBean cbBean=cbPair.getValue();
			
			String name=cbBean.getType();
    		double total=cbBean.getTotal();
    		//double fraction=total/projectTotal*100;
    		//double fraction=total;
    		//String legend=name+" ("+DecimalFormat.format(fraction)+"%)";
    		dataset.setValue(total, name, projectName+" [(Amount)"+projectTotalStr+" ]");
    		//dataset.setValue(name, total);
		}
		
    	JFreeChart jfc=ChartFactory.createBarChart3D("",
    			"Cost Breakup", "Amount", dataset,
				PlotOrientation.VERTICAL, true, true, false);
    	//jfc.setTitle(new TextTitle("Job Breakup",new java.awt.Font(java.awt.Font.MONOSPACED,java.awt.Font.PLAIN,15)));
    	return jfc;
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
