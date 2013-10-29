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
 * Cleaned up the report format and the headings
 * Indian Rupees no longer displayed as currency.
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
import com.wanhive.system.beans.AssemblyBean;
import com.wanhive.system.utils.DecimalFormat;


public class AssemblyReport {

	public static ByteArrayOutputStream assemblyTreePDF(
			HttpServletRequest request) throws Exception {
		int assemblyId = Integer.parseInt(request.getParameter("assemblyId"));

		int cbId = Integer.parseInt(request.getParameter("cbId"));
		String cbName = request.getParameter("cbName");
		Document doc = new Document();
		ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();
		PdfWriter docWriter = null;
		Connection conn = null;
		Statement stmt = null;
		ResultSet rst = null;

		PdfPTable table = null;
		Paragraph p = null;
		PdfPCell cell = null;
		try {
			docWriter = PdfWriter.getInstance(doc, pdfOut);
			landscapePdf(doc);
			docWriter.setPageEvent(new WaterMark());
			doc.open();

			conn = DataSourceManager.newConnection();
			stmt = conn.createStatement();
			rst = stmt
					.executeQuery("select * from (select * from assembly where assembly_id="
							+ assemblyId
							+ ") as a left join assemblycostbook as b  on b.assembly_id=a.assembly_id and b.costbook_id="
							+ cbId);

			AssemblyBean bean = new AssemblyBean();
			while (rst.next()) {
				bean.setId(rst.getInt(1));
				bean.setName(rst.getString(2));
				bean.setDescription(rst.getString(3));
				bean.setUnit(rst.getString(4));
				bean.setPrice(rst.getDouble(5));
				bean.setPremium(rst.getDouble(6));
				bean.setRemarks(rst.getString(7));
				bean.setDisplayUnit(rst.getString(9));
				bean.setPriceMultiplier(rst.getDouble(10));
				bean.setCbPrice(rst.getString(14) != null ? rst.getString(14)
						: "-");
				bean.setCbPremium(rst.getString(15) != null ? rst.getString(15)
						: "-");
			}
			p = new Paragraph("Assembly Report: [" + bean.getName() + "] "
					+ bean.getDescription() + "\n{CostBook: \"" + cbName
					+ "\"}");
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);
			Color color = new Color(0, 0, 0);
			Font font = FontFactory.getFont(FontFactory.COURIER_BOLD, 9,
					Font.BOLD, color);

			table = new PdfPTable(205);
			table.setWidthPercentage(99);
			cell = new PdfPCell(new Paragraph("Sl", font));
			cell.setColspan(10);
			table.addCell(cell);
			cell = new PdfPCell(new Paragraph("Name", font));
			cell.setColspan(25);
			table.addCell(cell);
			cell = new PdfPCell(new Paragraph("Specification", font));
			cell.setColspan(75);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Unit", font));
			cell.setColspan(20);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Price", font));
			cell.setColspan(20);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Premium(%)", font));
			cell.setColspan(20);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Remarks", font));
			cell.setColspan(35);
			table.addCell(cell);
			table.setHeaderRows(1);

			int indent = 0;
			color = new Color(0, 0, 0);
			font = FontFactory.getFont(FontFactory.HELVETICA, 8, Font.NORMAL,
					color);

			cell = new PdfPCell(new Paragraph("#", font));
			cell.setColspan(10);
			// cell.setIndent(indent);
			table.addCell(cell);
			cell = new PdfPCell(new Paragraph("" + bean.getName(), font));
			cell.setColspan(25);
			table.addCell(cell);
			cell = new PdfPCell(new Paragraph("" + bean.getDescription(), font));
			cell.setColspan(75);
			table.addCell(cell);

			String unit = bean.getUnit();
			double unitMultiplier = 1;

			if (!unit.equalsIgnoreCase("--")
					&& (bean.getDisplayUnit() != null
							&& !bean.getDisplayUnit().equalsIgnoreCase("") && !bean
							.getDisplayUnit().equalsIgnoreCase("-"))) {
				unit = bean.getDisplayUnit();
				unitMultiplier = bean.getPriceMultiplier();
			}
			cell = new PdfPCell(new Paragraph("" + unit, font));
			cell.setColspan(20);
			table.addCell(cell);

			double price = 0;
			if (!bean.getCbPrice().equalsIgnoreCase("-"))
				price = Double.parseDouble(bean.getCbPrice()) * unitMultiplier;
			else
				price = bean.getPrice() * unitMultiplier;
			if (bean.getUnit().equalsIgnoreCase("--"))
				cell = new PdfPCell(new Paragraph("-", font));
			else
				// cell=new PdfPCell(new
				// Paragraph(""+bean.getPrice()+" ["+bean.getCbPrice()+"]",font));
				cell = new PdfPCell(new Paragraph(""
						+ DecimalFormat.format(price), font));
			cell.setColspan(20);
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			table.addCell(cell);

			if (bean.getUnit().equalsIgnoreCase("--"))
				cell = new PdfPCell(new Paragraph("-", font));
			else {
				String displayPremium = bean.getCbPremium().equalsIgnoreCase(
						"-") ? "" + bean.getPremium() : bean.getCbPremium();
				cell = new PdfPCell(new Paragraph(DecimalFormat.format(Double
						.parseDouble(displayPremium)), font));
			}

			cell.setColspan(20);
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("" + bean.getRemarks(), font));
			cell.setColspan(35);
			table.addCell(cell);
			renderSubAssemblies(bean.getId(), cbId, table, indent);
			doc.add(table);
		} catch (Exception e) {
			pdfOut.reset();
			throw e;
		} finally {
			if (doc != null)
				doc.close();
			if (docWriter != null)
				docWriter.close();
			try {
				if (rst != null)
					rst.close();
			} catch (Exception e) {
			}
			try {
				if (stmt != null)
					stmt.close();
			} catch (Exception e) {
			}
			try {
				if (conn != null)
					conn.close();
			} catch (Exception e) {
			}
		}

		if (pdfOut.size() < 1) {
			throw new Exception("Document has [" + pdfOut.size() + "] Bytes");
		}
		return pdfOut;
	}

	private static void renderSubAssemblies(int parent, int cbId,
			PdfPTable table, int indent) {

		Connection conn = null;
		Statement stmt = null;
		ResultSet rst = null;
		PdfPCell cell = null;
		try {
			conn = DataSourceManager.newConnection();
			stmt = conn.createStatement();
			rst = stmt
					.executeQuery("select * from (select * from assembly where assembly_parent_id="
							+ parent
							+ ") as a left join assemblycostbook as b  on b.assembly_id=a.assembly_id and b.costbook_id="
							+ cbId);
			int sl = 1;
			while (rst.next()) {

				AssemblyBean bean = new AssemblyBean();
				bean.setId(rst.getInt(1));
				bean.setName(rst.getString(2));
				bean.setDescription(rst.getString(3));
				bean.setUnit(rst.getString(4));
				bean.setPrice(rst.getDouble(5));
				bean.setPremium(rst.getDouble(6));
				bean.setRemarks(rst.getString(7));
				bean.setDisplayUnit(rst.getString(9));
				bean.setPriceMultiplier(rst.getDouble(10));
				bean.setCbPrice(rst.getString(14) != null ? rst.getString(14)
						: "-");
				bean.setCbPremium(rst.getString(15) != null ? rst.getString(15)
						: "-");

				Color color = new Color(0, 0, 0);
				Font font = FontFactory.getFont(FontFactory.HELVETICA, 8,
						Font.NORMAL, color);

				cell = new PdfPCell(new Paragraph(""
						+ indentString(indent, "*") + (sl++), font));
				cell.setColspan(10);
				// cell.setIndent(indent);
				table.addCell(cell);
				cell = new PdfPCell(new Paragraph("" + bean.getName(), font));
				cell.setColspan(25);
				table.addCell(cell);
				cell = new PdfPCell(new Paragraph("" + bean.getDescription(),
						font));
				cell.setColspan(75);
				table.addCell(cell);

				String unit = bean.getUnit();
				double unitMultiplier = 1;

				if (!unit.equalsIgnoreCase("--")
						&& (bean.getDisplayUnit() != null
								&& !bean.getDisplayUnit().equalsIgnoreCase("") && !bean
								.getDisplayUnit().equalsIgnoreCase("-"))) {
					unit = bean.getDisplayUnit();
					unitMultiplier = bean.getPriceMultiplier();
				}
				cell = new PdfPCell(new Paragraph(unit, font));
				cell.setColspan(20);
				table.addCell(cell);

				double price = 0;
				if (!bean.getCbPrice().equalsIgnoreCase("-"))
					price = Double.parseDouble(bean.getCbPrice())
							* unitMultiplier;
				else
					price = bean.getPrice() * unitMultiplier;

				if (bean.getUnit().equalsIgnoreCase("--"))
					cell = new PdfPCell(new Paragraph("-", font));
				else
					cell = new PdfPCell(new Paragraph(""
							+ DecimalFormat.format(price), font));
				cell.setColspan(20);
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				table.addCell(cell);

				if (bean.getUnit().equalsIgnoreCase("--"))
					cell = new PdfPCell(new Paragraph("-", font));
				else {
					String displayPremium = bean.getCbPremium()
							.equalsIgnoreCase("-") ? "" + bean.getPremium()
							: bean.getCbPremium();
					cell = new PdfPCell(new Paragraph(
							DecimalFormat.format(Double
									.parseDouble(displayPremium)), font));
				}
				cell.setColspan(20);
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				table.addCell(cell);

				cell = new PdfPCell(new Paragraph("" + bean.getRemarks(), font));
				cell.setColspan(35);
				table.addCell(cell);
				//$$$$ No recursion
				//renderSubAssemblies(bean.getId(), cbId, table, indent + 1);
			}
		} catch (Exception e) {
			System.out.println("renderSubAssemblies: " + e.getMessage());
		} finally {
			try {
				if (rst != null)
					rst.close();
			} catch (Exception e) {
			}
			try {
				if (stmt != null)
					stmt.close();
			} catch (Exception e) {
			}
			try {
				if (conn != null)
					conn.close();
			} catch (Exception e) {
			}
		}
	}

	public static ByteArrayOutputStream assemblyMaterialPDF(
			HttpServletRequest request) throws Exception {
		int assemblyId = Integer.parseInt(request.getParameter("assemblyId"));
		int cbId = Integer.parseInt(request.getParameter("cbId"));
		double pickedVolume = Double
				.parseDouble(request.getParameter("volume"));
		String cbName = request.getParameter("cbName");
		Document doc = new Document();
		ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();
		PdfWriter docWriter = null;

		Connection conn = null;
		Statement stmt = null;
		ResultSet rst = null;

		PdfPTable table = null;
		Paragraph p = null;
		PdfPCell cell = null;
		try {
			docWriter = PdfWriter.getInstance(doc, pdfOut);
			landscapePdf(doc);
			docWriter.setPageEvent(new WaterMark());
			doc.open();

			conn = DataSourceManager.newConnection();
			stmt = conn.createStatement();
			rst = stmt
					.executeQuery("select * from (select * from assembly where assembly_id="
							+ assemblyId
							+ ") as a left join assemblycostbook as b  on b.assembly_id=a.assembly_id and b.costbook_id="
							+ cbId);

			String assemblyName = "";
			String assemblySpec = "";
			String assemblyUnit = "";
			double volumeMultiplier = 0.0;
			while (rst.next()) {
				assemblyName = rst.getString(2);
				assemblySpec = rst.getString(3);
				assemblyUnit = rst.getString(4);
				volumeMultiplier = rst.getDouble(16);
			}
			p = new Paragraph("Analysis of Rate for " + pickedVolume + " "
					+ assemblyUnit + " of: [" + assemblyName + "] "
					+ assemblySpec + "\n{CostBook: \"" + cbName + "\"}");
			p.setAlignment(Element.ALIGN_CENTER);
			p.setSpacingAfter(p.getLeading());
			doc.add(p);
			Color color = new Color(0, 0, 0);
			Font font = FontFactory.getFont(FontFactory.COURIER_BOLD, 9,
					Font.BOLD, color);

			table = new PdfPTable(200);
			table.setWidthPercentage(99);
			cell = new PdfPCell(new Paragraph("Sl", font));
			cell.setColspan(5);
			table.addCell(cell);
			cell = new PdfPCell(new Paragraph("Name", font));
			cell.setColspan(25);
			table.addCell(cell);
			cell = new PdfPCell(new Paragraph("Specification", font));
			cell.setColspan(75);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Unit", font));
			cell.setColspan(20);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Price", font));
			cell.setColspan(20);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Volume", font));
			cell.setColspan(20);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Amount", font));
			cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			cell.setColspan(35);
			table.addCell(cell);
			table.setHeaderRows(1);
			double total = renderAssemblyMaterials(assemblyId, cbId,
					volumeMultiplier, pickedVolume, table);

			cell = new PdfPCell(new Paragraph("Sl", font));
			cell.setColspan(5);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Specification", font));
			cell.setColspan(150);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Amount", font));
			cell.setColspan(45);
			table.addCell(cell);
			double total1 = renderAssemblyMaterialsOverHead(assemblyId, cbId,
					volumeMultiplier, pickedVolume, table);

			double finalTotal = total + total1;
			cell = new PdfPCell(new Paragraph("Sl", font));
			cell.setColspan(5);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Specification", font));
			cell.setColspan(150);
			table.addCell(cell);

			cell = new PdfPCell(new Paragraph("Amount", font));
			cell.setColspan(45);
			table.addCell(cell);
			renderAssemblyMaterialsWithMultiplier(assemblyId, assemblyUnit,
					volumeMultiplier, finalTotal, pickedVolume, table);
			doc.add(table);
		} catch (Exception e) {
			pdfOut.reset();
			throw e;
		} finally {
			if (doc != null)
				doc.close();
			if (docWriter != null)
				docWriter.close();
			try {
				if (rst != null)
					rst.close();
			} catch (Exception e) {
			}
			try {
				if (stmt != null)
					stmt.close();
			} catch (Exception e) {
			}
			try {
				if (conn != null)
					conn.close();
			} catch (Exception e) {
			}
		}

		if (pdfOut.size() < 1) {
			throw new Exception("Document has [" + pdfOut.size() + "] Bytes");
		}
		return pdfOut;
	}

	private static double renderAssemblyMaterials(int assemblyId, int cbId,
			double multiplier, double pickedVolume, PdfPTable table) {
		Connection conn = null;
		Statement stmt = null;
		ResultSet rst = null;
		PdfPCell cell = null;
		double total = 0;
		try {
			conn = DataSourceManager.newConnection();
			stmt = conn.createStatement();
			rst = stmt
					.executeQuery("select * from (select itemassembly.item_id as id,itemassembly.fraction,item.item_name,item.item_specification,item.item_unit,item.item_price from itemassembly,item where itemassembly.assembly_id="
							+ assemblyId
							+ " and itemassembly.costbook_id="
							+ cbId
							+ " and item.item_id=itemassembly.item_id) as a left join materialcostbook as b on a.id=b.item_id and b.costbook_id="
							+ cbId);
			int sl = 1;
			Color color = new Color(0, 0, 0);
			Font font = FontFactory.getFont(FontFactory.COURIER, 8,
					Font.NORMAL, color);
			while (rst.next()) {
				cell = new PdfPCell(new Paragraph("" + (sl++), font));
				cell.setColspan(5);
				table.addCell(cell);
				cell = new PdfPCell(new Paragraph("" + rst.getString(3), font));
				cell.setColspan(25);
				table.addCell(cell);
				cell = new PdfPCell(new Paragraph("" + rst.getString(4), font));
				cell.setColspan(75);
				table.addCell(cell);

				cell = new PdfPCell(new Paragraph("" + rst.getString(5), font));
				cell.setColspan(20);
				table.addCell(cell);

				double price = (rst.getString(10) != null && !rst.getString(10)
						.equalsIgnoreCase("")) ? Double.parseDouble(rst
						.getString(10)) : rst.getDouble(6);
				cell = new PdfPCell(new Paragraph(""
						+ DecimalFormat.format(price), font));
				cell.setColspan(20);
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				table.addCell(cell);

				double fraction = rst.getDouble(2) * pickedVolume / multiplier;
				cell = new PdfPCell(new Paragraph(""
						+ DecimalFormat.format(fraction), font));
				cell.setColspan(20);
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				table.addCell(cell);

				double subTotal = price * fraction;
				cell = new PdfPCell(new Paragraph(""
						+ DecimalFormat.format(subTotal), font));
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				cell.setColspan(35);
				table.addCell(cell);

				total += subTotal;
			}
			font = FontFactory.getFont(FontFactory.COURIER_BOLD, 9, Font.BOLD,
					color);
			cell = new PdfPCell(new Paragraph("Total(Amount): "
					+ DecimalFormat.format(total), font));
			cell.setColspan(200);
			table.addCell(cell);
			return total;
		} catch (Exception e) {
			System.out.println("renderAssemblyMaterials: " + e.getMessage());
		} finally {
			try {
				if (rst != null)
					rst.close();
			} catch (Exception e) {
			}
			try {
				if (stmt != null)
					stmt.close();
			} catch (Exception e) {
			}
			try {
				if (conn != null)
					conn.close();
			} catch (Exception e) {
			}
		}
		return total;
	}

	private static double renderAssemblyMaterialsOverHead(int assemblyId,
			int cbId, double multiplier, double pickedVolume, PdfPTable table) {
		Connection conn = null;
		Statement stmt = null;
		ResultSet rst = null;
		PdfPCell cell = null;
		double total = 0;
		try {
			conn = DataSourceManager.newConnection();
			stmt = conn.createStatement();
			rst = stmt
					.executeQuery("select oh_description,oh_amount from assemblyoverhead where assembly_id="
							+ assemblyId + " and costbook_id=" + cbId);
			int sl = 1;
			Color color = new Color(0, 0, 0);
			Font font = FontFactory.getFont(FontFactory.COURIER, 8,
					Font.NORMAL, color);
			while (rst.next()) {
				cell = new PdfPCell(new Paragraph("" + (sl++), font));
				cell.setColspan(5);
				table.addCell(cell);
				cell = new PdfPCell(new Paragraph("" + rst.getString(1), font));
				cell.setColspan(150);
				table.addCell(cell);
				cell = new PdfPCell(new Paragraph(""
						+ DecimalFormat.format(rst.getDouble(2) * pickedVolume
								/ multiplier), font));
				cell.setColspan(45);
				table.addCell(cell);
				total = total + rst.getDouble(2) * pickedVolume / multiplier;

			}
			font = FontFactory.getFont(FontFactory.COURIER_BOLD, 9, Font.BOLD,
					color);
			cell = new PdfPCell(new Paragraph("Total(Amount): "
					+ DecimalFormat.format(total), font));
			cell.setColspan(200);
			table.addCell(cell);
			return total;
		} catch (Exception e) {
			System.out.println("renderAssemblyMaterials: " + e.getMessage());
		} finally {
			try {
				if (rst != null)
					rst.close();
			} catch (Exception e) {
			}
			try {
				if (stmt != null)
					stmt.close();
			} catch (Exception e) {
			}
			try {
				if (conn != null)
					conn.close();
			} catch (Exception e) {
			}
		}
		return total;
	}

	private static void renderAssemblyMaterialsWithMultiplier(int assemblyId,
			String unit, double multiplier, double finalTotal,
			double pickedVolume, PdfPTable table) {
		PdfPCell cell = null;
		// int sl=1;
		Color color = new Color(0, 0, 0);
		Font font = FontFactory.getFont(FontFactory.COURIER, 8, Font.NORMAL,
				color);
		cell = new PdfPCell(new Paragraph("(a)", font));
		cell.setColspan(5);
		table.addCell(cell);

		cell = new PdfPCell(new Paragraph("Rate for " + multiplier + unit + "",
				font));
		cell.setColspan(150);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph(""
				+ DecimalFormat.format(finalTotal * multiplier / pickedVolume),
				font));
		cell.setColspan(45);
		table.addCell(cell);

		cell = new PdfPCell(new Paragraph("(b)", font));
		cell.setColspan(5);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph("Unit Rate", font));
		cell.setColspan(150);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph(""
				+ DecimalFormat.format(finalTotal / pickedVolume) + "/" + unit
				+ "", font));
		cell.setColspan(45);
		table.addCell(cell);

		cell = new PdfPCell(new Paragraph("(c)", font));
		cell.setColspan(5);
		table.addCell(cell);

		cell = new PdfPCell(new Paragraph("Rate for " + pickedVolume + unit
				+ "", font));
		cell.setColspan(150);
		table.addCell(cell);
		cell = new PdfPCell(new Paragraph("" + DecimalFormat.format(finalTotal)
				+ "", font));
		cell.setColspan(45);
		table.addCell(cell);

		// cell=new PdfPCell(new Paragraph("",font));
		// cell.setColspan(45);
		// table.addCell(cell);

	}

	private static void landscapePdf(Document doc) {
		doc.addAuthor("ESTICON");
		doc.addCreationDate();
		doc.addProducer();
		doc.addCreator("ProjectReport");
		doc.addTitle("Title");
		doc.setPageSize(PageSize.A4.rotate());
		HeaderFooter footer = new HeaderFooter(new Phrase("" + new Date()
				+ "    "), true);
		doc.setFooter(footer);
	}

	private static String indentString(int indent, String s) {
		StringBuffer sbuf = new StringBuffer("");
		for (int i = 0; i < indent; i++) {
			sbuf.append(s);
		}
		return sbuf.toString();
	}
}