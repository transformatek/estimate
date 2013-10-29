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


import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.GrayColor;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.wanhive.basic.utils.licensing.Application;

class WaterMark extends PdfPageEventHelper {
 
        Font FONT = new Font(Font.HELVETICA, 52, Font.BOLD, new GrayColor(0.75f));
 
        public void onEndPage(PdfWriter writer, Document document) {
        	if(Application.ISVALIDLICENSE) return;
            ColumnText.showTextAligned(writer.getDirectContentUnder(),
                    Element.ALIGN_CENTER, new Phrase("ESTIMATE", FONT),
                    297.5f, 421, writer.getPageNumber() % 2 == 1 ? 45 : -45);
        }
    }