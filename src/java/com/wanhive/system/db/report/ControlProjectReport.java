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
 * Clean-up of the report format, 
 * report no longer uses INR as currency
 * 
 ***********************************************************/
package com.wanhive.system.db.report;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.geom.Rectangle2D;
import java.io.ByteArrayOutputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.title.TextTitle;
import org.jfree.data.category.DefaultCategoryDataset;



import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.HeaderFooter;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.DefaultFontMapper;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfTemplate;
import com.lowagie.text.pdf.PdfWriter;
import com.wanhive.basic.db.DataSourceManager;
import com.wanhive.system.beans.BillBean;
import com.wanhive.system.beans.ControlBillEntryBean;
import com.wanhive.system.beans.ControlCostBean;
import com.wanhive.system.beans.ItemAssemblyBean;
import com.wanhive.system.beans.JobStatusBean;
import com.wanhive.system.beans.MaterialBean;
import com.wanhive.system.utils.DecimalFormat;

public class ControlProjectReport {
	public static ByteArrayOutputStream getProjectStatus(HttpServletRequest request) throws Exception
	{
		//Get the project id for which we are going to prepare the summary
		int projectId=Integer.parseInt(request.getParameter("projectId"));
		String from=request.getParameter("sdate");
		String to=request.getParameter("fdate");
		
		if(to!=null && (to.equalsIgnoreCase("") || to.equalsIgnoreCase("-")))
			to=null;
		if(from!=null && (from.equalsIgnoreCase("") || from.equalsIgnoreCase("-")))
			from=null;
		//System.out.println("Status Report for: PROJECT: "+projectId);
		//System.out.println("From: "+from+ "To: "+to);
		
		Document doc=new Document();
		ByteArrayOutputStream pdfOut=new ByteArrayOutputStream();
		PdfWriter docWriter=null;
		Connection conn=null;
		Statement stmt=null;
		ResultSet rst=null;

		PdfPTable table=null;
		PdfPTable materialTable=null;
		Paragraph p=null;
		//PdfPCell cell=null;
		
		try
		{	
			docWriter=PdfWriter.getInstance(doc, pdfOut);
			landscapePdf(doc);
			docWriter.setPageEvent(new WaterMark());
			doc.open();
			
			conn=DataSourceManager.newConnection();
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select control_project_name,control_project_specification from control_project where control_project_id="+projectId);
			String projectName="";
			String projectDescription="";
			while(rst.next())
			{
				projectName=rst.getString(1);
				projectDescription=rst.getString(2);
			}
			
			p=new Paragraph("Work Status for: ["+projectName+"] "+projectDescription);
			p.setAlignment(Element.ALIGN_CENTER);
			doc.add(p);
			p=new Paragraph("From Date:["+(from==null?"-":from)+"]"+" To Date:["+(to==null?"-":to)+"]",FontFactory.getFont(FontFactory.COURIER_BOLD, 10, Font.NORMAL, new Color(0,0,0)));
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);
			
			table=populateTableHeaderForProjectStatus();
			materialTable=populateMaterialTableHeaderForProjectStatus();
			
			JFreeChart[] charts=printProjectStatusDetails(projectId,projectName,table,materialTable,conn,from,to);
			int width=(Math.round(doc.getPageSize().getWidth()));
			int height=(Math.round(doc.getPageSize().getHeight()));
			
			PdfContentByte ctb = docWriter.getDirectContent();
    		PdfTemplate tp = ctb.createTemplate(width, height);
    		Graphics2D g2d = tp.createGraphics(width, height, new DefaultFontMapper());
    		Rectangle2D r2d = new Rectangle2D.Double(0, 0, width-100, height-150);
    		charts[0].draw(g2d, r2d);
    		g2d.dispose();
    		//doc.add(p);
    		ctb.addTemplate(tp, 50, -75);	//Left Margin, Top Margin
    		doc.newPage();
    		
    		p=new Paragraph("Summary of Cost",FontFactory.getFont(FontFactory.COURIER_BOLD, 12, Font.UNDERLINE, new Color(0,0,0)));
    		p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);
    		doc.add(table);
			doc.newPage();
			
			p=new Paragraph("Summary of BOQ",FontFactory.getFont(FontFactory.COURIER_BOLD, 12, Font.UNDERLINE, new Color(0,0,0)));
    		p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);
			doc.add(materialTable);
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
	
	private static PdfPTable populateTableHeaderForProjectStatus()
	{
		PdfPTable table;
		Color color=new Color(0,0,0);
		Font font=FontFactory.getFont(FontFactory.COURIER_BOLD, 9, Font.BOLD,color);
		
		table=new PdfPTable(135);
		table.setWidthPercentage(100);
		createPhraseCell(table, new Paragraph("Sl",font), 10, -1, -1);
		createPhraseCell(table, new Paragraph("Name/ID",font), 20, -1, -1);
		createPhraseCell(table, new Paragraph("Description",font), 40, -1, -1);
		createPhraseCell(table, new Paragraph("Planned",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("Completed",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("Target",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("Achieved",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("Pending",font), 13, -1, -1);
		return table;
	}
	private static PdfPTable populateMaterialTableHeaderForProjectStatus()
	{
		PdfPTable table;
		Color color=new Color(0,0,0);
		Font font=FontFactory.getFont(FontFactory.COURIER_BOLD, 9, Font.BOLD,color);
		
		table=new PdfPTable(200);
		table.setWidthPercentage(100);
		createPhraseCell(table, new Paragraph("Sl",font), 5, -1, -1);
		createPhraseCell(table, new Paragraph("Name",font), 25, -1, -1);
		createPhraseCell(table, new Paragraph("Description",font), 55, -1, -1);
		createPhraseCell(table, new Paragraph("Unit",font), 10, -1, -1);
		createPhraseCell(table, new Paragraph("Planned",font), 21, -1, -1);
		createPhraseCell(table, new Paragraph("Consumed",font), 21, -1, -1);
		createPhraseCell(table, new Paragraph("Target",font), 21, -1, -1);
		createPhraseCell(table, new Paragraph("Spent",font), 21, -1, -1);
		createPhraseCell(table, new Paragraph("Required",font), 21, -1, -1);
		return table;
	}
	private static JFreeChart[] printProjectStatusDetails(int projectId,String projectName,PdfPTable table,PdfPTable materialTable,Connection conn,String from,String to)
	{
		Map<Integer, JobStatusBean> projectMap=new HashMap<Integer, JobStatusBean>();
		Map<Integer, JobStatusBean> estimateMap=new HashMap<Integer, JobStatusBean>();
		Map<Integer, JobStatusBean[]> materialMap=new HashMap<Integer, JobStatusBean[]>();
		JobStatusBean projectTotal=getProjectTotal(projectId, projectMap,estimateMap,materialMap,conn,from,to);
		ArrayList<MaterialBean> usedMaterial=getUsedMaterialForProject(estimateMap,conn);
		ArrayList<ControlCostBean> cBean=projectSummaryTable(projectId, table,projectMap,estimateMap,0,conn,true);
		printProjectTotal(projectTotal,table);
		printMaterialTable(usedMaterial,materialMap,materialTable);
		JFreeChart barChart=getProjectSummaryBarChart(cBean,projectName,projectTotal);
		JFreeChart[] jfcArray=new JFreeChart[1];
		jfcArray[0]=barChart;
		return jfcArray;
	}
	private static JFreeChart getProjectSummaryBarChart(ArrayList<ControlCostBean> cBean,String projectName,JobStatusBean projectTotal)
	{
		DefaultCategoryDataset dataset = new DefaultCategoryDataset();
		// row keys...
        final String series1 = "Planned";
        final String series2 = "Completed";
        final String series3 = "Target";
        final String series4 = "Achieved";
        final String series5 = "Pending";

        dataset.addValue(projectTotal.getPlanned(), series1, projectName);
    	dataset.addValue(projectTotal.getCompleted(), series2, projectName);
    	dataset.addValue(projectTotal.getTarget(), series3, projectName);
    	dataset.addValue(projectTotal.getAchieved(), series4, projectName);
    	dataset.addValue(projectTotal.getPending(), series5, projectName);
    	
        for(int i=0;i<cBean.size();i++)
        {
        	ControlCostBean bean=cBean.get(i);
        	dataset.addValue(bean.getTotal().getPlanned(), series1, bean.getName());
        	dataset.addValue(bean.getTotal().getCompleted(), series2, bean.getName());
        	dataset.addValue(bean.getTotal().getTarget(), series3, bean.getName());
        	dataset.addValue(bean.getTotal().getAchieved(), series4, bean.getName());
        	dataset.addValue(bean.getTotal().getPending(), series5, bean.getName());
        }
        
    	JFreeChart jfc=ChartFactory.createBarChart3D("",
    			"Estimate/Project", "Amount", dataset,
				PlotOrientation.VERTICAL, true, true, false);
    	jfc.setTitle(new TextTitle("Cost Breakup",new java.awt.Font(java.awt.Font.MONOSPACED,java.awt.Font.PLAIN,15)));
        return jfc;
	}
	private static JobStatusBean getProjectTotal(int projectParentId,Map<Integer, JobStatusBean> projectMap,Map<Integer, JobStatusBean> estimateMap,Map<Integer, JobStatusBean[]> materialMap,Connection connection,String from,String to)
	{
		JobStatusBean total=new JobStatusBean();
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
			rst1=stmt1.executeQuery("select control_estimate.estimate_id,control_estimate.control_estimate_id,estimate.costbook_id from control_estimate,estimate where estimate.estimate_id=control_estimate.estimate_id and control_estimate.control_project_id="+projectParentId);
			while(rst1.next())
			{
				JobStatusBean estimateTotal=null;
				int estimateId=rst1.getInt(1);
				int controlEstimateId=rst1.getInt(2);
				int costBookId=rst1.getInt(3);
				//System.out.println("Getting Estimate Summary for: C#"+controlEstimateId+ ", E#"+estimateId);
				estimateTotal=getEstimateTotal(controlEstimateId,estimateId,costBookId,estimateMap,materialMap,conn,from,to);
				
				//System.out.print("Put into ESTIMATE: "+controlEstimateId+"[");
				//System.out.print("PLANNED: "+estimateTotal.getPlanned()+", ");
				//System.out.println("COMPLETED: "+estimateTotal.getCompleted()+"]");
				estimateMap.put(new Integer(controlEstimateId), estimateTotal);
				
				total.setPlanned(total.getPlanned()+estimateTotal.getPlanned());
				total.setCompleted(total.getCompleted()+estimateTotal.getCompleted());
				total.setTarget(total.getTarget()+estimateTotal.getTarget());
				total.setAchieved(total.getAchieved()+estimateTotal.getAchieved());
				total.setPending(total.getPending()+estimateTotal.getPending());
			}

			stmt=conn.createStatement();
			rst=stmt.executeQuery("select control_project_id from control_project where control_project_parent_id="+projectParentId);
			while(rst.next())
			{
				int id=rst.getInt(1);
				//We recursively add into total, the total cost
				//of sub-projects
				JobStatusBean projectTotal=getProjectTotal(id,projectMap,estimateMap,materialMap,conn,from,to);
				
				total.setPlanned(total.getPlanned()+projectTotal.getPlanned());
				total.setCompleted(total.getCompleted()+projectTotal.getCompleted());
				total.setTarget(total.getTarget()+projectTotal.getTarget());
				total.setAchieved(total.getAchieved()+projectTotal.getAchieved());
				total.setPending(total.getPending()+projectTotal.getPending());
			}
			
			projectMap.put(new Integer(projectParentId), total);
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
		//return total;
		return total;
	}
	
	private static ArrayList<MaterialBean> getUsedMaterialForProject(Map<Integer, JobStatusBean> estimateMap,Connection connection)
	{
		ArrayList<MaterialBean> al=new ArrayList<MaterialBean>();
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		try
		{
			String estimateIds="";
			Iterator<Entry<Integer, JobStatusBean>> it=estimateMap.entrySet().iterator();
			int i=0;
			int size=estimateMap.size();
			if(size==0) return al;
			while(it.hasNext())
			{

				Map.Entry<Integer, JobStatusBean> pair=(Map.Entry<Integer, JobStatusBean>)it.next();
				if(i==size-1)
					estimateIds+=pair.getKey().intValue();
				else
					estimateIds+=pair.getKey().intValue()+", ";
				i++;
			}
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select item_id,item_name,item_specification,item_unit,item_type from item where item_id in(select item_id from itemassembly where assembly_id in(select assembly_id from bill where estimate_id in (select estimate_id from control_estimate where control_estimate_id in("+estimateIds+"))) and costbook_id in(select costbook_id from estimate where estimate_id in(select estimate_id from control_estimate where control_estimate_id in("+estimateIds+"))))");
			
			while(rst.next())
			{
				MaterialBean mb=new MaterialBean();
				mb.setId(rst.getInt(1));
				mb.setName(rst.getString(2));
				mb.setDescription(rst.getString(3));
				mb.setUnit(rst.getString(4));
				mb.setType(rst.getString(5));
				al.add(mb);
			}
			//System.out.println("EstimateIds: "+estimateIds);
			//System.out.println("Total Nos of Material found: "+al.size()+1);
		}
		catch (Exception e) {
			System.out.println("getUsedMaterialForProject: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return al;
	}
	
	private static JobStatusBean getEstimateTotal(int controlEstimateId,int estimateId,int costBookId,Map<Integer, JobStatusBean> estimateMap,Map<Integer, JobStatusBean[]> materialMap,Connection connection,String from,String to)
	{
		JobStatusBean jsb=new JobStatusBean();
		try
		{
			ArrayList<BillBean> bill=assemblyTotalForEstimateStatus(estimateId, costBookId,connection);
			Map<Integer, ArrayList<ControlBillEntryBean>> entries=billEntriesForEstimateStatus(estimateId,connection);
			Map<Integer, ArrayList<ControlBillEntryBean>> works=workDoneForEstimateStatus(controlEstimateId,connection);
			bill=getUsedMaterialList(bill,costBookId,connection);
			//System.out.println("MAL: "+usedMaterial.toString());
			//int sl=1;
			for(int h=0;h<bill.size();h++)
			{
				BillBean bean=bill.get(h);
				//Initialize JobStatusBean For selected Assembly
				if(bean.getJobStatus()==null)
					bean.setJobStatus(new JobStatusBean());
				//double totalPrice=bean.getPrice()*(1.0+bean.getPremium()/100.0);
				//renderAssembliesForEstimateStatus(bean,table,sl++);
				
				Integer key=new Integer(bean.getId());
				ArrayList<ControlBillEntryBean> al=entries.get(key);
				//double total=0;
				long start=0;
				long finish=0;
				long actualStart=0;
				long actualFinish=0;
				if(al!=null)
				{
					int length=al.size();
					for(int i=0;i<length;i++)
					{
						ControlBillEntryBean bean1=al.get(i);
						//total+=bean1.getTotal();
						JobStatusBean jobStatus=getWorkStatusForEstimateStatusDetails(bean1, works,from,to);
						if(bean.getJobStatus()==null)
							bean.setJobStatus(new JobStatusBean());
						
						//Set total JobStatus for particular assembly
						bean.getJobStatus().setPlanned(bean.getJobStatus().getPlanned()+jobStatus.getPlanned());
						bean.getJobStatus().setCompleted(bean.getJobStatus().getCompleted()+jobStatus.getCompleted());
						bean.getJobStatus().setTarget(bean.getJobStatus().getTarget()+jobStatus.getTarget());
						bean.getJobStatus().setAchieved(bean.getJobStatus().getAchieved()+jobStatus.getAchieved());
						bean.getJobStatus().setPending(bean.getJobStatus().getPending()+jobStatus.getPending());
						if(i==0)
						{
							start=jobStatus.getStart();
							finish=jobStatus.getFinish();
							actualStart=jobStatus.getActualStart();
							actualFinish=jobStatus.getActualFinish();
						}
						else
						{
							if(start>jobStatus.getStart())start=jobStatus.getStart();
							if(actualStart>jobStatus.getActualStart())actualStart=jobStatus.getActualStart();
							if(finish<jobStatus.getFinish())finish=jobStatus.getFinish();
							if(actualFinish<jobStatus.getActualFinish())actualFinish=jobStatus.getActualFinish();
							
						}
						//renderJobEntriesForEstimateStatusDetails(jobStatus,table,i+1,bean);
					}
					bean.getJobStatus().setStart(start);
					bean.getJobStatus().setActualStart(actualStart);
					bean.getJobStatus().setFinish(finish);
					bean.getJobStatus().setActualFinish(actualFinish);
					jsb=getTotalEstimateStatus(bean,jsb);
				}
				
			}
			getBOQforProject(materialMap,bill);
		}
		catch (Exception e) {
			System.out.println("printEstimateStatusDetails: "+e.getMessage());
		}
		return jsb;
	}
	private static JobStatusBean getTotalEstimateStatus(BillBean bean,JobStatusBean jsb)
	{
		double price=bean.getPrice()*(1.0+bean.getPremium()/100);
		//int price=1;
		jsb.setPlanned(jsb.getPlanned()+bean.getJobStatus().getPlanned()*price);
		jsb.setCompleted(jsb.getCompleted()+bean.getJobStatus().getCompleted()*price);
		jsb.setTarget(jsb.getTarget()+bean.getJobStatus().getTarget()*price);
		jsb.setAchieved(jsb.getAchieved()+bean.getJobStatus().getAchieved()*price);
		jsb.setPending(jsb.getPending()+bean.getJobStatus().getPending()*price);
		return jsb;
	}
	private static ArrayList<BillBean> assemblyTotalForEstimateStatus(int estimateId,int costbookId,Connection connection)
	{
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		ArrayList<BillBean> al=new ArrayList<BillBean>();
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select * from (select bill.bill_id,bill.assembly_id, bill.premium,assembly.assembly_name,assembly.assembly_specification,assembly.assembly_unit,assembly.assembly_price,assembly.assembly_display_unit,assembly.assembly_price_multiplier from bill,assembly where bill.estimate_id="+estimateId+" and assembly.assembly_id=bill.assembly_id) as a left join (select assembly_id,costbook_id,price from assemblycostbook) as b on a.assembly_id=b.assembly_id and b.costbook_id="+costbookId);
			
			while(rst.next())
			{
				BillBean bean=new BillBean();
				bean.setId(rst.getInt(1));
				bean.setAssemblyId(rst.getInt(2));
				bean.setPremium(rst.getDouble(3));
				bean.setName(rst.getString(4));
				bean.setDescription(rst.getString(5));
				bean.setUnit(rst.getString(6));
				String priceStr=rst.getString(12)!=null?rst.getString(12):rst.getString(7);
				
				bean.setPrice(Double.parseDouble(priceStr));
				bean.setDisplayUnit(rst.getString(8));
				bean.setUnitMultiplier(rst.getDouble(9));
				al.add(bean);
			}
		}
		catch (Exception e) {
			System.out.println("assemblyTotalForEstimateStatus: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return al;
	}
	
	private static Map<Integer, ArrayList<ControlBillEntryBean>> billEntriesForEstimateStatus(int estimateId,Connection connection)
	{
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		Map<Integer, ArrayList<ControlBillEntryBean>> hm=new HashMap<Integer, ArrayList<ControlBillEntryBean>>();
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select entry_id,bill_id,specification,entry_total,start,finish,status from billentry where bill_id in (select bill_id from bill where estimate_id="+estimateId+")");
			
			while(rst.next())
			{
				ControlBillEntryBean bean=new ControlBillEntryBean();
				bean.setId(rst.getInt(1));
				bean.setEntryId(rst.getInt(2));
				bean.setDescription(rst.getString(3));
				
				bean.setTotal(rst.getDouble(4));
				bean.setStart(rst.getLong(5));
				bean.setFinish(rst.getLong(6));
				bean.setStatus(rst.getInt(7));
				if(hm.containsKey(new Integer(bean.getEntryId())))
				{
					ArrayList<ControlBillEntryBean> al=hm.get(new Integer(bean.getEntryId()));
					al.add(bean);
				}
				else
				{
					ArrayList<ControlBillEntryBean> al=new ArrayList<ControlBillEntryBean>();
					al.add(bean);
					hm.put(new Integer(bean.getEntryId()), al);
				}
			}
		}
		catch (Exception e) {
			System.out.println("billEntriesForEstimateStatus: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return hm;
	}
	private static Map<Integer, ArrayList<ControlBillEntryBean>> workDoneForEstimateStatus(int controlEstimateId,Connection connection)
	{
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		Map<Integer, ArrayList<ControlBillEntryBean>> hm=new HashMap<Integer, ArrayList<ControlBillEntryBean>>();
		try
		{
			stmt=conn.createStatement();
			rst=stmt.executeQuery("select work_id,entry_id,description,total,start,finish from workdone where control_estimate_id='"+controlEstimateId+"'");
			
			while(rst.next())
			{
				ControlBillEntryBean bean=new ControlBillEntryBean();
				bean.setId(rst.getInt(1));
				bean.setEntryId(rst.getInt(2));
				bean.setDescription(rst.getString(3));
				bean.setTotal(rst.getDouble(4));
				//System.out.println(bean.getDescription()+" :"+bean.getTotal());
				bean.setStart(rst.getLong(5));
				bean.setFinish(rst.getLong(6));
				if(hm.containsKey(new Integer(bean.getEntryId())))
				{
					ArrayList<ControlBillEntryBean> al=hm.get(new Integer(bean.getEntryId()));
					al.add(bean);
				}
				else
				{
					ArrayList<ControlBillEntryBean> al=new ArrayList<ControlBillEntryBean>();
					al.add(bean);
					hm.put(new Integer(bean.getEntryId()), al);
				}
			}
		}
		catch (Exception e) {
			System.out.println("workDoneForEstimateStatus: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return hm;
	}
	private static ArrayList<BillBean> getUsedMaterialList(ArrayList<BillBean> bill,int costBookId,Connection connection)
	{
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		//ArrayList<MaterialBean> usedMaterial=new ArrayList<MaterialBean>();
		Map<Integer, HashMap<Integer, ItemAssemblyBean>> items=new HashMap<Integer, HashMap<Integer, ItemAssemblyBean>>();
		String assemblyIds="";
		for(int i=0;i<bill.size();i++)
		{
			int assemblyId=bill.get(i).getAssemblyId();
			if(i!=bill.size()-1)
				assemblyIds+=""+assemblyId+", ";
			else
				assemblyIds+=assemblyId;
		}
		if(assemblyIds.equalsIgnoreCase("")) return bill;
		try
		{
			stmt=conn.createStatement();
			//Associate List of Items with Assembly
			rst=stmt.executeQuery("select * from(select * from (select itemassembly.assembly_id,itemassembly.item_id,itemassembly.fraction,item.item_price from itemassembly,item where itemassembly.assembly_id in("+assemblyIds+") and item.item_id=itemassembly.item_id and itemassembly.costbook_id="+costBookId+") as a left join (select item_id as itm_id,price from materialcostbook where costbook_id="+costBookId+") as b on b.itm_id=a.item_id) as x left join(select assembly_id as asm_id, multiplier from assemblycostbook where costbook_id="+costBookId+") as y on x.assembly_id=y.asm_id");
			while(rst.next())
			{
				Integer asmId=new Integer(rst.getInt(1));
				int itemId=rst.getInt(2);
				double fraction=rst.getDouble(3);
				double price=Double.parseDouble(rst.getString(6)==null || rst.getString(6).equalsIgnoreCase("")?rst.getString(4):rst.getString(6));
				double rateMultiplier=Double.parseDouble(rst.getString(8)==null?"1":rst.getString(8));
				fraction=fraction/rateMultiplier;
				ItemAssemblyBean iaBean=new ItemAssemblyBean();
				iaBean.setAssemblyId(asmId.intValue());
				iaBean.setItemId(itemId);
				iaBean.setFraction(fraction);
				iaBean.setPrice(price);
				if(items.get(asmId)==null)
					items.put(asmId, new HashMap<Integer, ItemAssemblyBean>());
				items.get(asmId).put(new Integer(itemId), iaBean);
			}
			for(int i=0;i<bill.size();i++)
			{
				bill.get(i).setItemList(items.get(new Integer(bill.get(i).getAssemblyId())));
			}
		}
		catch (Exception e) {
			System.out.println("getUsedMaterialList: "+e.getMessage());
		}
		finally
		{
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
		}
		return bill;
	}
	private static Map<Integer, JobStatusBean[]> getBOQforProject(Map<Integer, JobStatusBean[]> materialMap,ArrayList<BillBean> bill)
	{
		for(int i=0;i<bill.size();i++)
		{
			JobStatusBean jsBean=bill.get(i).getJobStatus();
			//System.out.println(""+bill.get(i).getName()+" :"+jsBean.getPlanned());
			Map<Integer, ItemAssemblyBean> map=bill.get(i).getItemList();
			if(map==null)
				continue;
			Iterator<Entry<Integer, ItemAssemblyBean>> it=map.entrySet().iterator();
			while(it.hasNext())
			{
				Map.Entry<Integer, ItemAssemblyBean> pair=(Map.Entry<Integer, ItemAssemblyBean>)it.next();
				ItemAssemblyBean iaBean=pair.getValue();
				double planned=0;
				double completed=0;
				double target=0;
				double achieved=0;
				double pending=0;
				double fraction=0;
				if(iaBean!=null)
				{
					fraction=iaBean.getFraction();
					planned=jsBean.getPlanned()*fraction;
					completed=jsBean.getCompleted()*fraction;
					target=jsBean.getTarget()*fraction;
					achieved=jsBean.getAchieved()*fraction;
					pending=jsBean.getPending()*fraction;
					//System.out.println("Pending: "+pending);
					double price=iaBean.getPrice();
					Integer key=new Integer(iaBean.getItemId());
					//System.out.println("Pending for M#:"+key.toString()+" "+pending);
					if(materialMap.containsKey(key))
					{
						double tmp=materialMap.get(key)[0].getPlanned();
						materialMap.get(key)[0].setPlanned(planned+tmp);
						tmp=materialMap.get(key)[1].getPlanned();
						materialMap.get(key)[1].setPlanned(planned*price+tmp);
						
						tmp=materialMap.get(key)[0].getCompleted();
						materialMap.get(key)[0].setCompleted(completed+tmp);
						tmp=materialMap.get(key)[1].getCompleted();
						materialMap.get(key)[1].setCompleted(completed*price+tmp);
						
						tmp=materialMap.get(key)[0].getTarget();
						materialMap.get(key)[0].setTarget(target+tmp);
						tmp=materialMap.get(key)[1].getTarget();
						materialMap.get(key)[1].setTarget(target*price+tmp);
						
						tmp=materialMap.get(key)[0].getAchieved();
						materialMap.get(key)[0].setAchieved(achieved+tmp);
						tmp=materialMap.get(key)[1].getAchieved();
						materialMap.get(key)[1].setAchieved(achieved*price+tmp);
						
						tmp=materialMap.get(key)[0].getPending();
						materialMap.get(key)[0].setPending(pending+tmp);
						tmp=materialMap.get(key)[1].getPending();
						materialMap.get(key)[1].setPending(pending*price+tmp);
					}
					else
					{
						JobStatusBean[] jsb=new JobStatusBean[2];
						jsb[0]=new JobStatusBean();
						jsb[1]=new JobStatusBean();
						jsb[0].setPlanned(planned);
						jsb[0].setCompleted(completed);
						jsb[0].setTarget(target);
						jsb[0].setAchieved(achieved);
						jsb[0].setPending(pending);
						
						jsb[1].setPlanned(planned*price);
						jsb[1].setCompleted(completed*price);
						jsb[1].setTarget(target*price);
						jsb[1].setAchieved(achieved*price);
						jsb[1].setPending(pending*price);
						
						materialMap.put(key, jsb);
					}
						
				}
			}
		}
		return materialMap;
	}
	private static JobStatusBean getWorkStatusForEstimateStatusDetails(ControlBillEntryBean job,Map<Integer, ArrayList<ControlBillEntryBean>> works,String from,String to) throws Exception
	{
		JobStatusBean jobStatus=new JobStatusBean();
		ArrayList<ControlBillEntryBean> workDone=works.get(new Integer(job.getId()));
		//boolean selected=false;
		long startDate=0,finishDate=0;
		if(from!=null)
		{
			Date date=(Date)formatter.parse(from);
			startDate=date.getTime();
		}
		
		if(to!=null)
		{
			Date date=(Date)formatter.parse(to);
			finishDate=date.getTime();
		}
		
		//long first=startDate;
		//long last=finishDate;
		double total=0;
		double jobCompleted=0;	//Job completed before query period
		double target=job.getTotal();
		double achieved=0;
		long actualStart=0;
		long actualFinish=0;
		if(workDone!=null)
		{
			for(int i=0;i<workDone.size();i++)
			{
				ControlBillEntryBean jobDone=workDone.get(i);
				total+=jobDone.getTotal();
				double alreadyCompletedJob=getAlreadyCompletedJob(startDate,finishDate,from,to,jobDone);
				jobCompleted+=alreadyCompletedJob;
				achieved+=getTargetCompleted(startDate,finishDate,from,to,jobDone,alreadyCompletedJob);
				if(i==0)
				{
					actualStart=workDone.get(i).getStart();
					actualFinish=workDone.get(i).getFinish();
				}
				else
				{
					if(actualStart>workDone.get(i).getStart())
						actualStart=workDone.get(i).getStart();
					if(actualFinish<workDone.get(i).getFinish())
						actualFinish=workDone.get(i).getFinish();
				}
			}
		}
		
		target=target-jobCompleted;
		//Adjust the target
		target=adjustTargetJob(startDate,finishDate,from,to,job,target);
		
		jobStatus.setDescription(job.getDescription());
		jobStatus.setPlanned(job.getTotal());
		jobStatus.setCompleted(total);
		jobStatus.setTarget(target);
		jobStatus.setAchieved(achieved);
		jobStatus.setPending(target-achieved);
		jobStatus.setStart(job.getStart());
		jobStatus.setFinish(job.getFinish());
		jobStatus.setStatus(job.getStatus());
		jobStatus.setActualStart(actualStart);
		jobStatus.setActualFinish(actualFinish);
		return jobStatus;
		
	}
	private static double getAlreadyCompletedJob(long start,long finish,String from,String to,ControlBillEntryBean jobDone)
	{
		double total=jobDone.getTotal();
		long jobStart=jobDone.getStart();
		long jobFinish=jobDone.getFinish();
		if(from==null || start<jobDone.getStart())
			return 0;
		else if(start>jobDone.getFinish())
			return total;
		else
		{
			int num=getDaysBetweenDates(start, jobStart)-1;
			int denom=getDaysBetweenDates(jobFinish, jobStart);
			//System.out.println("NUM: "+num+" DEN: "+denom);
			total=total*num/denom;
		}
		//System.out.println("Completed before:"+ total);
		return total;
	}
	private static double getTargetCompleted(long start,long finish,String from,String to,ControlBillEntryBean jobDone,double alreadyCompleted)
	{
		//double alreadyCompleted=getAlreadyCompletedJob(start, finish, from, to, jobDone);
		double target=jobDone.getTotal()-alreadyCompleted;
		
		long jobStart=jobDone.getStart();
		long jobFinish=jobDone.getFinish();
		//System.out.println("JOB: "+formatter.format(jobStart)+"$$$"+formatter.format(jobFinish));
		if(from==null || start<jobStart) start=jobStart;
		if(to==null || finish>jobFinish) finish=jobFinish;
		if(jobStart>finish) return 0;
		int num=getDaysBetweenDates(start,finish);
		int denom=getDaysBetweenDates(start,jobFinish);
		//System.out.println("##NUM: "+num+" DEN: "+denom);
		double newTarget=target*num/denom;
		if(newTarget<=target)
			target=newTarget;
		return target;
	}
	private static double adjustTargetJob(long start,long finish,String from,String to,ControlBillEntryBean job,double target)
	{
		double total=target;
		long jobStart=job.getStart();
		long jobFinish=job.getFinish();
		//System.out.println("JOB: "+formatter.format(jobStart)+"$$$"+formatter.format(jobFinish));
		
		if(from==null || start<jobStart) start=jobStart;
		if(to==null || finish>jobFinish) finish=jobFinish;
		//If timeline selected is before job's planned start, target was ZERO
		if(finish<jobStart) return 0;
		int num=getDaysBetweenDates(start,finish);
		int denom=getDaysBetweenDates(start,jobFinish);
		//System.out.println("##NUM: "+num+" DEN: "+denom);
		double newTarget=total*num/denom;
		if(newTarget<=total)
			total=newTarget;
		return total;
	}
	
	private static ArrayList<ControlCostBean> projectSummaryTable(int projectParentId,PdfPTable table,Map<Integer, JobStatusBean>projectMap,Map<Integer, JobStatusBean>estimateMap,int indent,Connection connection,boolean isFirstLevel)
	{
		JobStatusBean total=null;
		boolean connectionCreated=false;
		Connection conn=connection;
		Statement stmt=null;
		Statement stmt1=null;
		ResultSet rst=null;
		ResultSet rst1=null;
		String name="";
		String description="";
		ArrayList<ControlCostBean> al=null;
		//CostBean cb=null;
		ControlCostBean cb=null;
		float fontSize=10;
		String val="";
		int rightAlignFlag=Element.ALIGN_RIGHT;
		
		try
		{
			if(isFirstLevel)
				al=new ArrayList<ControlCostBean>();
			if(conn==null)
			{
				conn=DataSourceManager.newConnection();
				connectionCreated=true;
			}
			stmt1=conn.createStatement();
			rst1=stmt1.executeQuery("select control_estimate.control_estimate_id,estimate.estimate_name,estimate.estimate_specification from control_estimate, estimate where control_estimate.estimate_id=estimate.estimate_id and control_estimate.control_project_id="+projectParentId);
			int sl=1;
			float billFontSize=fontSize-1;
			while(rst1.next())
			{
				JobStatusBean estimateTotal=null;
				int estimateId=rst1.getInt(1);
				String estimateName=rst1.getString(2);
				String estimateDescription=rst1.getString(3);
				estimateTotal=estimateMap.get(new Integer(estimateId));
				//total+=estimateTotal;
				
				if(isFirstLevel)
				{
					cb=new ControlCostBean();
					cb.setId(estimateId);
					cb.setName(estimateName);
					cb.setType("Estimate");
					cb.setTotal(estimateTotal);
					al.add(cb);
				}
				Color color=new Color(0,0,0);
				Font font=FontFactory.getFont(FontFactory.TIMES, billFontSize, Font.ITALIC, color);
				
				createPhraseCell(table, new Paragraph(""+(sl++),font), 10, rightAlignFlag, -1);
				createPhraseCell(table, new Paragraph(estimateName,font), 20, -1, -1);
				createPhraseCell(table, new Paragraph(estimateDescription,font), 40, -1, -1);
				val=DecimalFormat.format(estimateTotal.getPlanned());
				createPhraseCell(table, new Paragraph(val,font), 13, rightAlignFlag, -1);
				val=DecimalFormat.format(estimateTotal.getCompleted());
				createPhraseCell(table, new Paragraph(val,font), 13, rightAlignFlag, -1);
				val=DecimalFormat.format(estimateTotal.getTarget());
				createPhraseCell(table, new Paragraph(val,font), 13, rightAlignFlag, -1);
				val=DecimalFormat.format(estimateTotal.getAchieved());
				createPhraseCell(table, new Paragraph(val,font), 13, rightAlignFlag, -1);
				val=DecimalFormat.format(estimateTotal.getPending());
				createPhraseCell(table, new Paragraph(val,font), 13, rightAlignFlag, -1);
			}

			stmt=conn.createStatement();
			rst=stmt.executeQuery("select control_project_id,control_project_name,control_project_specification from control_project where control_project_parent_id="+projectParentId);
			sl=1;
			while(rst.next())
			{
				float projectFontSize=fontSize;
				int id=rst.getInt(1);
				name=rst.getString(2);
				description=rst.getString(3);
				total=projectMap.get(new Integer(id));
				Color color=new Color(0,0,0);
				Font font=FontFactory.getFont(FontFactory.COURIER, projectFontSize, Font.NORMAL, color);
				
				createPhraseCell(table, new Paragraph(""+indentString(indent, "*")+(sl++)+".",font), 10, -1, -1);
				createPhraseCell(table, new Paragraph(name,font), 20, -1, -1);
				createPhraseCell(table, new Paragraph(description,font), 40, -1, -1);
				font=FontFactory.getFont(FontFactory.HELVETICA_BOLD, projectFontSize, Font.NORMAL, new Color(0,0,0));
				val=DecimalFormat.format(total.getPlanned());
				createPhraseCell(table, new Paragraph(val,font), 13, rightAlignFlag, -1);
				val=DecimalFormat.format(total.getCompleted());
				createPhraseCell(table, new Paragraph(val,font), 13, rightAlignFlag, -1);
				val=DecimalFormat.format(total.getTarget());
				createPhraseCell(table, new Paragraph(val,font), 13, rightAlignFlag, -1);
				val=DecimalFormat.format(total.getAchieved());
				createPhraseCell(table, new Paragraph(val,font), 13, rightAlignFlag, -1);
				val=DecimalFormat.format(total.getPending());
				createPhraseCell(table, new Paragraph(val,font), 13, rightAlignFlag, -1);

				if(isFirstLevel)
				{
					cb=new ControlCostBean();
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
	private static void printProjectTotal(JobStatusBean projectTotal,PdfPTable table)
	{
		Color color=new Color(0,0,0);
		Font font=FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, color);
		int rightAlign=Element.ALIGN_RIGHT;
		createPhraseCell(table, new Paragraph("",font), 10, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 20, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 40, -1, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(projectTotal.getPlanned()),font), 13, rightAlign, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(projectTotal.getCompleted()),font), 13, rightAlign, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(projectTotal.getTarget()),font), 13, rightAlign, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(projectTotal.getAchieved()),font), 13, rightAlign, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(projectTotal.getPending()),font), 13, rightAlign, -1);
		
	}
	private static void printMaterialTable(ArrayList<MaterialBean> usedMaterial,Map<Integer, JobStatusBean[]> materialMap,PdfPTable materialTable)
	{
		Color color=new Color(0,0,0);
		//Color color1=Color.BLUE;
		Font font=FontFactory.getFont(FontFactory.COURIER, 10, Font.NORMAL, color);
		int rightAlign=Element.ALIGN_RIGHT;
		double total[]=new double[5];
		for(int i=0;i<usedMaterial.size();i++)
		{
			Integer key=new Integer(usedMaterial.get(i).getId());
			createPhraseCell(materialTable, new Paragraph(""+(i+1),font), 5, -1, -1);
			createPhraseCell(materialTable, new Paragraph(usedMaterial.get(i).getName(),font), 25, -1, -1);
			createPhraseCell(materialTable, new Paragraph(usedMaterial.get(i).getDescription(),font), 55, -1, -1);
			createPhraseCell(materialTable, new Paragraph(usedMaterial.get(i).getUnit(),font), 10, -1, -1);
			
			total[0]+=materialMap.get(key)[1].getPlanned();
			String s=DecimalFormat.format(materialMap.get(key)[0].getPlanned())+"\n["+DecimalFormat.format(materialMap.get(key)[1].getPlanned())+"]";
			createPhraseCell(materialTable, new Paragraph(s,font), 21, rightAlign, -1);
			
			total[1]+=materialMap.get(key)[1].getCompleted();
			s=DecimalFormat.format(materialMap.get(key)[0].getCompleted())+"\n["+DecimalFormat.format(materialMap.get(key)[1].getCompleted())+"]";
			createPhraseCell(materialTable, new Paragraph(s,font), 21, rightAlign, -1);
			
			total[2]+=materialMap.get(key)[1].getTarget();
			s=DecimalFormat.format(materialMap.get(key)[0].getTarget())+"\n["+DecimalFormat.format(materialMap.get(key)[1].getTarget())+"]";
			createPhraseCell(materialTable, new Paragraph(s,font), 21, rightAlign, -1);
			
			total[3]+=materialMap.get(key)[1].getAchieved();
			s=DecimalFormat.format(materialMap.get(key)[0].getAchieved())+"\n["+DecimalFormat.format(materialMap.get(key)[1].getAchieved())+"]";
			createPhraseCell(materialTable, new Paragraph(s,font), 21, rightAlign, -1);
			
			total[4]+=materialMap.get(key)[1].getPending();
			s=DecimalFormat.format(materialMap.get(key)[0].getPending())+"\n["+DecimalFormat.format(materialMap.get(key)[1].getPending())+"]";
			createPhraseCell(materialTable, new Paragraph(s,font), 21, rightAlign, -1);
		}
		
		font=FontFactory.getFont(FontFactory.HELVETICA, 12, Font.BOLD, color);
		createPhraseCell(materialTable, new Paragraph("",font), 5, -1, -1);
		createPhraseCell(materialTable, new Paragraph("",font), 25, -1, -1);
		createPhraseCell(materialTable, new Paragraph("Total (in Amount)",font), 55, -1, -1);
		createPhraseCell(materialTable, new Paragraph("",font), 10, -1, -1);
		
		String s=DecimalFormat.format(total[0]);
		createPhraseCell(materialTable, new Paragraph(s,font), 21, rightAlign, -1);
		s=DecimalFormat.format(total[1]);
		createPhraseCell(materialTable, new Paragraph(s,font), 21, rightAlign, -1);
		s=DecimalFormat.format(total[2]);
		createPhraseCell(materialTable, new Paragraph(s,font), 21, rightAlign, -1);
		s=DecimalFormat.format(total[3]);
		createPhraseCell(materialTable, new Paragraph(s,font), 21, rightAlign, -1);
		s=DecimalFormat.format(total[4]);
		createPhraseCell(materialTable, new Paragraph(s,font), 21, rightAlign, -1);
		
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
		doc.addCreator("ControlProjectReport");
		doc.addTitle("Title");
		doc.setPageSize(PageSize.LEGAL.rotate());
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
	
	/*private static int getDaysBetweenDates(Date startDate, Date endDate) {
		long diff = endDate.getTime() - startDate.getTime();
		int days = (int) Math.floor(diff / DAY_MS);
		return Math.abs(days)+1;
		}*/
	private static int getDaysBetweenDates(long startDate, long endDate) {
		long diff = endDate - startDate;
		int days = (int) Math.floor(diff / DAY_MS);
		return Math.abs(days)+1;
	}
	private static SimpleDateFormat formatter=new SimpleDateFormat("dd/MM/yyyy");
	private static final long DAY_MS = 1000 * 60 * 60 * 24;
}
