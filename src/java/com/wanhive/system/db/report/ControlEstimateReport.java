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
 * 
 * *2013-10-29 Amit Kumar amitkriit@gmail.com
 * Minor changes in reports, instead of printing single letters like R,P,H,F etc 
 * report now prints "Running", "Planned", "Halted", "Finished"
 * as the status of scheduled jobs for better clarity.
 ***********************************************************/
package com.wanhive.system.db.report;


import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
//import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

//import com.wanhive.system.beans.BillEntryBean;
//import com.wanhive.system.beans.BoqBean;

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
import com.wanhive.system.beans.ControlBillEntryBean;
import com.wanhive.system.beans.ItemAssemblyBean;
import com.wanhive.system.beans.JobStatusBean;
import com.wanhive.system.beans.MaterialBean;
import com.wanhive.system.utils.DecimalFormat;

public class ControlEstimateReport {
	public static ByteArrayOutputStream getEstimateStatus(HttpServletRequest request) throws Exception
	{
		int controlEstimateId=Integer.parseInt(request.getParameter("controlEstimateId"));
		int estimateId=Integer.parseInt(request.getParameter("estimateId"));
		String from=request.getParameter("sdate");
		String to=request.getParameter("fdate");

		if(to!=null && (to.equalsIgnoreCase("") || to.equalsIgnoreCase("-")))
			to=null;
		if(from!=null && (from.equalsIgnoreCase("") || from.equalsIgnoreCase("-")))
			from=null;
		//System.out.println("Status Report for: ESTIMATE: "+estimateId+" CONTROLESTIMATE: "+controlEstimateId);
		//System.out.println("From: "+(from==null?"--":from)+ " To: "+(to==null?"--":to));

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
			rst=stmt.executeQuery("select estimate_name,estimate_specification,costbook_id from estimate where estimate_id="+estimateId);
			//String estimateName="";
			String estimateDescription="";
			int costbookId=0;
			while(rst.next())
			{
				//estimateName=rst.getString(1);
				estimateDescription=rst.getString(2);
				costbookId=rst.getInt(3);
			}

			p=new Paragraph("Work Status for: "/*+"["+estimateName+"] "*/+estimateDescription);
			p.setAlignment(Element.ALIGN_CENTER);
			doc.add(p);
			p=new Paragraph("From Date:["+(from==null?"-":from)+"]"+" To Date:["+(to==null?"-":to)+"]",FontFactory.getFont(FontFactory.COURIER_BOLD, 10, Font.NORMAL, new Color(0,0,0)));
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);

			table=populateTableHeaderForEstimateStatus();
			materialTable=populateMaterialTableHeaderForEstimateStatus();
			printEstimateStatusDetails(estimateId,controlEstimateId,costbookId,table,materialTable,conn,from,to);

			p=new Paragraph("Work Status Summary",FontFactory.getFont(FontFactory.COURIER_BOLD, 12, Font.UNDERLINE, new Color(0,0,0)));
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);
			doc.add(table);
			doc.newPage();

			p=new Paragraph("Bill of Quantity",FontFactory.getFont(FontFactory.COURIER_BOLD, 12, Font.UNDERLINE, new Color(0,0,0)));
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

	private static PdfPTable populateTableHeaderForEstimateStatus()
	{
		PdfPTable table;
		Color color=new Color(0,0,0);
		Font font=FontFactory.getFont(FontFactory.COURIER_BOLD, 9, Font.BOLD,color);

		table=new PdfPTable(200);
		table.setWidthPercentage(100);
		createPhraseCell(table, new Paragraph("Sl",font), 5, -1, -1);
		createPhraseCell(table, new Paragraph("ID",font), 10, -1, -1);
		createPhraseCell(table, new Paragraph("Description",font), 40, -1, -1);
		createPhraseCell(table, new Paragraph("Unit",font), 8, -1, -1);
		createPhraseCell(table, new Paragraph("Planned",font), 15, -1, -1);
		createPhraseCell(table, new Paragraph("Completed",font), 15, -1, -1);
		createPhraseCell(table, new Paragraph("Target",font), 15, -1, -1);
		createPhraseCell(table, new Paragraph("Achieved",font), 15, -1, -1);
		createPhraseCell(table, new Paragraph("Pending",font), 15, -1, -1);
		createPhraseCell(table, new Paragraph("Planned Start",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("Planned Finish",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("Actual Start",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("Actual Finish",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("Status",font), 10, -1, -1);
		return table;
	}

	private static PdfPTable populateMaterialTableHeaderForEstimateStatus()
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

	private static double printEstimateStatusDetails(int estimateId,int controlEstimateId,int costBookId,PdfPTable table,PdfPTable materialTable,Connection connection,String from,String to)
	{
		//double gross=0;
		try
		{
			ArrayList<BillBean> bill=assemblyTotalForEstimateStatus(estimateId, costBookId,connection);
			bill=filterAndMergeAssembly(bill);
			Map<Integer, ArrayList<ControlBillEntryBean>> entries=billEntriesForEstimateStatus(estimateId,connection);
			Map<Integer, ArrayList<ControlBillEntryBean>> works=workDoneForEstimateStatus(controlEstimateId,connection);
			ArrayList<MaterialBean> usedMaterial=getUsedMaterialList(bill,costBookId,connection);
			//System.out.println("MAL: "+usedMaterial.toString());
			int sl=1;
			for(int h=0;h<bill.size();h++)
			{
				BillBean bean=bill.get(h);
				//Initialize JobStatusBean For selected Assembly
				if(bean.getJobStatus()==null)
				{
					bean.setJobStatus(new JobStatusBean());
					//bean.getJobStatus().setValid(false);
				}
				//double totalPrice=bean.getPrice()*(1.0+bean.getPremium()/100.0);
				renderAssembliesForEstimateStatus(bean,table,sl++);

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
							if(jobStatus.isValid())
								bean.getJobStatus().setValid(true);
						}
						else
						{
							if(start>jobStatus.getStart())start=jobStatus.getStart();
							if(finish<jobStatus.getFinish())finish=jobStatus.getFinish();
							if(jobStatus.isValid())
							{
								if(actualStart>jobStatus.getActualStart())actualStart=jobStatus.getActualStart();
								if(actualFinish<jobStatus.getActualFinish())actualFinish=jobStatus.getActualFinish();
							}
						}
						renderJobEntriesForEstimateStatusDetails(jobStatus,table,i+1,bean);
					}
					bean.getJobStatus().setStart(start);
					bean.getJobStatus().setActualStart(actualStart);
					bean.getJobStatus().setFinish(finish);
					bean.getJobStatus().setActualFinish(actualFinish);
				}
				//double totalAmount=total*totalPrice;
				//gross+=totalAmount;
				//renderTotal(total,bean.getPrice(),bean.getUnit(),bean.getPremium(),bean.getDisplayUnit(),bean.getUnitMultiplier(),totalAmount,table);
				renderTotalForEstimateStatusDetails(bean,table);
			}
			renderMateralListForEstimateStatus(usedMaterial,bill,materialTable);
		}
		catch (Exception e) {
			System.out.println("printEstimateStatusDetails: "+e.getMessage());
		}
		return 0;
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
	private static ArrayList<BillBean> assemblyTotalForEstimateStatus(int estimateId,int costbookId,Connection connection)
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
				bean.setAssemblyId(rst.getInt(2));
				bean.setPremium(rst.getDouble(3));
				bean.setName(rst.getString(4));
				bean.setDescription(rst.getString(5));
				bean.setUnit(rst.getString(6));
				String priceStr=rst.getString(12)!=null?rst.getString(12):rst.getString(7);

				bean.setPrice(Double.parseDouble(priceStr));
				bean.setDisplayUnit(rst.getString(8));
				bean.setUnitMultiplier(rst.getDouble(9));
				bean.setRateMultiplier(Double.parseDouble(rst.getString(13)!=null?rst.getString(13):"1"));
				//System.out.println("Adding "+bean.getName()+"into Used Assemblies");
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
		if(workDone!=null && workDone.size()>0)
			jobStatus.setValid(true);
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

	private static ArrayList<MaterialBean> getUsedMaterialList(ArrayList<BillBean> bill,int costbookId,Connection connection)
	{
		//System.out.println("CBID:"+costbookId);
		Connection conn=connection;
		Statement stmt=null;
		ResultSet rst=null;
		ArrayList<MaterialBean> usedMaterial=new ArrayList<MaterialBean>();
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
		if(assemblyIds.equalsIgnoreCase("")) return usedMaterial;
		try
		{
			stmt=conn.createStatement();
			//Associate List of Items with Assembly
			rst=stmt.executeQuery("select assembly_id,item_id,fraction from itemassembly where assembly_id in("+assemblyIds+") and costbook_id="+costbookId);
			while(rst.next())
			{
				Integer asmId=new Integer(rst.getInt(1));
				int itemId=rst.getInt(2);
				double fraction=rst.getDouble(3);
				ItemAssemblyBean iaBean=new ItemAssemblyBean();
				iaBean.setAssemblyId(asmId.intValue());
				iaBean.setItemId(itemId);
				iaBean.setFraction(fraction);
				if(items.get(asmId)==null)
					items.put(asmId, new HashMap<Integer, ItemAssemblyBean>());
				items.get(asmId).put(new Integer(itemId), iaBean);
			}
			for(int i=0;i<bill.size();i++)
			{
				bill.get(i).setItemList(items.get(new Integer(bill.get(i).getAssemblyId())));
			}
			try {if(rst!=null)rst.close();} catch (Exception e) {}
			rst=null;
			rst=stmt.executeQuery("select * from item where item_id in(select item_id from itemassembly where assembly_id in("+assemblyIds+"))");

			while(rst.next())
			{
				MaterialBean bean=new MaterialBean();
				bean.setId(rst.getInt(1));
				bean.setName(rst.getString(2));
				bean.setDescription(rst.getString(3));
				bean.setUnit(rst.getString(4));
				usedMaterial.add(bean);
				//System.out.println("M: "+bean.getName());
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
		return usedMaterial;
	}


	private static void renderAssembliesForEstimateStatus(BillBean bean,PdfPTable table,int sl)
	{

		float fontsize=10;
		Color color=new Color(0,0,0);
		Font font=FontFactory.getFont(FontFactory.COURIER, fontsize, Font.NORMAL, color);

		createPhraseCell(table, new Paragraph(""+(sl++),font), 5, -1, -1);
		createPhraseCell(table, new Paragraph(bean.getName(),font), 10, -1, -1);
		createPhraseCell(table, new Paragraph(bean.getDescription(),font), 40, -1, -1);

		String displayedUnit=bean.getUnit();
		String displayUnit=bean.getDisplayUnit();
		if(displayUnit!=null && !displayUnit.equalsIgnoreCase("") && !displayUnit.equalsIgnoreCase("-"))
		{
			displayedUnit=displayUnit;
		}
		createPhraseCell(table, new Paragraph(displayedUnit,font), 8, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 15, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 15, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 15, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 15, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 15, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 10, -1, -1);
	}

	private static void renderMateralListForEstimateStatus(ArrayList<MaterialBean> usedMaterial,ArrayList<BillBean> bill,PdfPTable table)
	{
		float fontsize=10;
		Color color=new Color(0,0,0);
		Font font=FontFactory.getFont(FontFactory.COURIER, fontsize, Font.NORMAL, color);
		int rightAlignFlag=Element.ALIGN_RIGHT;
		for(int i=0;i<usedMaterial.size();i++)
		{
			MaterialBean bean=usedMaterial.get(i);
			createPhraseCell(table, new Paragraph(""+(i+1),font), 5, -1, -1);
			createPhraseCell(table, new Paragraph(bean.getName(),font), 25, -1, -1);
			createPhraseCell(table, new Paragraph(bean.getDescription(),font), 55, -1, -1);
			createPhraseCell(table, new Paragraph(bean.getUnit(),font), 10, -1, -1);

			double planned=0;
			double completed=0;
			double target=0;
			double achieved=0;
			double pending=0;
			double fraction=0;

			for(int j=0;j<bill.size();j++)
			{
				if(bill.get(j).getItemList()==null)
					continue;
				ItemAssemblyBean iaBean=bill.get(j).getItemList().get(new Integer(bean.getId()));
				double rateMultiplier=bill.get(j).getRateMultiplier();

				if(iaBean!=null)
				{
					JobStatusBean jsBean=bill.get(j).getJobStatus();
					fraction=iaBean.getFraction()/rateMultiplier;
					//System.out.println(""+bill.get(j).getName()+" :"+jsBean.getPlanned());
					planned+=jsBean.getPlanned()*fraction;
					completed+=jsBean.getCompleted()*fraction;
					target+=jsBean.getTarget()*fraction;
					achieved+=jsBean.getAchieved()*fraction;
					pending+=jsBean.getPending()*fraction;
				}
			}
			createPhraseCell(table, new Paragraph(""+DecimalFormat.format(planned),font), 21, rightAlignFlag, -1);
			createPhraseCell(table, new Paragraph(""+DecimalFormat.format(completed),font), 21, rightAlignFlag, -1);
			createPhraseCell(table, new Paragraph(""+DecimalFormat.format(target),font), 21, rightAlignFlag, -1);
			createPhraseCell(table, new Paragraph(""+DecimalFormat.format(achieved),font), 21, rightAlignFlag, -1);
			createPhraseCell(table, new Paragraph(""+DecimalFormat.format(pending),font), 21, rightAlignFlag, -1);
		}
	}

	private static void renderJobEntriesForEstimateStatusDetails(JobStatusBean bean,PdfPTable table,int sl,BillBean assemblyBean)
	{
		float fontsize=9;
		Color color=new Color(0,0,0);
		int rightAlignFlag=Element.ALIGN_RIGHT;
		Font font=FontFactory.getFont(FontFactory.COURIER, fontsize, Font.NORMAL, color);
		createPhraseCell(table, new Paragraph(""+(sl++),font), 5, rightAlignFlag, -1);
		createPhraseCell(table, new Paragraph("",font), 10, -1, -1);
		createPhraseCell(table, new Paragraph(bean.getDescription(),font), 40, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 8, -1, -1);

		String displayUnit=assemblyBean.getDisplayUnit();
		double totalPlanned=bean.getPlanned();
		double totalCompleted=bean.getCompleted();
		double target=bean.getTarget();
		double achieved=bean.getAchieved();
		double pending=bean.getPending();
		double unitMultiplier=assemblyBean.getUnitMultiplier();
		if(displayUnit!=null && !displayUnit.equalsIgnoreCase("") && !displayUnit.equalsIgnoreCase("-"))
		{
			totalPlanned=totalPlanned/unitMultiplier;
			totalCompleted=totalCompleted/unitMultiplier;
			target=target/unitMultiplier;
			achieved=achieved/unitMultiplier;
			pending=pending/unitMultiplier;
		}
		createPhraseCell(table, new Paragraph(DecimalFormat.format(totalPlanned),font), 15, rightAlignFlag, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(totalCompleted),font), 15, rightAlignFlag, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(target),font), 15, rightAlignFlag, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(achieved),font), 15, rightAlignFlag, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(pending),font), 15, rightAlignFlag, -1);

		String plannedStartDate=formatter.format(bean.getStart());;
		String plannedFinishDate=formatter.format(bean.getFinish());
		String actualStartDate="-";
		String actualFinishDate="-";
		if(bean.isValid())
		{
			actualStartDate=formatter.format(bean.getActualStart());
			actualFinishDate=formatter.format(bean.getActualFinish());
		}
		createPhraseCell(table, new Paragraph(plannedStartDate,font), 13, -1, -1);
		createPhraseCell(table, new Paragraph(plannedFinishDate,font), 13, -1, -1);
		createPhraseCell(table, new Paragraph(actualStartDate,font), 13, -1, -1);
		createPhraseCell(table, new Paragraph(actualFinishDate,font), 13, -1, -1);
		String statusString="";
		switch(bean.getStatus())
		{
		case 0:
			statusString="Planned"; break;
		case 1:
			statusString="Running"; break;
		case 2:
			statusString="Halted"; break;
		case 3:
			statusString="Finished"; break;
		default:
			statusString="Unknown";
		}
		createPhraseCell(table, new Paragraph(statusString,font), 10, -1, -1);
	}

	private static void renderTotalForEstimateStatusDetails(BillBean bean,PdfPTable table)
	{
		//PdfPTable table;
		Color color=new Color(0,0,0);
		Font font=FontFactory.getFont(FontFactory.COURIER_BOLD, 9, Font.NORMAL,color);
		int rightAlignFlag=Element.ALIGN_RIGHT;
		createPhraseCell(table, new Paragraph("",font), 5, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 10, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 40, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 8, -1, -1);

		String displayUnit=bean.getDisplayUnit();
		double totalPlanned=bean.getJobStatus().getPlanned();
		double totalCompleted=bean.getJobStatus().getCompleted();
		double target=bean.getJobStatus().getTarget();
		double achieved=bean.getJobStatus().getAchieved();
		double pending=bean.getJobStatus().getPending();
		double unitMultiplier=bean.getUnitMultiplier();
		if(displayUnit!=null && !displayUnit.equalsIgnoreCase("") && !displayUnit.equalsIgnoreCase("-"))
		{
			totalPlanned=totalPlanned/unitMultiplier;
			totalCompleted=totalCompleted/unitMultiplier;
			target=target/unitMultiplier;
			achieved=achieved/unitMultiplier;
			pending=pending/unitMultiplier;
		}

		createPhraseCell(table, new Paragraph(DecimalFormat.format(totalPlanned),font), 15, rightAlignFlag, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(totalCompleted),font), 15, rightAlignFlag, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(target),font), 15, rightAlignFlag, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(achieved),font), 15, rightAlignFlag, -1);
		createPhraseCell(table, new Paragraph(DecimalFormat.format(pending),font), 15, rightAlignFlag, -1);

		String plannedStartDate=formatter.format(bean.getJobStatus().getStart());;
		String plannedFinishDate=formatter.format(bean.getJobStatus().getFinish());
		String actualStartDate="-";
		String actualFinishDate="-";
		if(bean.getJobStatus().isValid())
		{
			actualStartDate=formatter.format(bean.getJobStatus().getActualStart());
			actualFinishDate=formatter.format(bean.getJobStatus().getActualFinish());
		}
		createPhraseCell(table, new Paragraph(plannedStartDate,font), 13, -1, -1);
		createPhraseCell(table, new Paragraph(plannedFinishDate,font), 13, -1, -1);
		createPhraseCell(table, new Paragraph(actualStartDate,font), 13, -1, -1);
		createPhraseCell(table, new Paragraph(actualFinishDate,font), 13, -1, -1);
		createPhraseCell(table, new Paragraph("",font), 10, -1, -1);
		//return table;
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
