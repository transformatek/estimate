package com.wanhive.basic.utils.logger;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.FileHandler;
import java.util.logging.Formatter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

import com.wanhive.basic.utils.ServletUtils;

public class SystemLogger {
	static public void setup(String textFile, String htmlFile) throws IOException {
		// Create Logger
		Logger logger = Logger.getLogger("");
		logger.setLevel(Level.INFO);
		fileTxt = new FileHandler(textFile);
		fileHTML = new FileHandler(htmlFile);

		// Create txt Formatter
		formatterTxt = new SimpleFormatter();
		fileTxt.setFormatter(formatterTxt);
		logger.addHandler(fileTxt);

		// Create HTML Formatter
		formatterHTML = new MyHtmlFormatter();
		fileHTML.setFormatter(formatterHTML);
		logger.addHandler(fileHTML);
	}



	static private FileHandler fileTxt;
	static private SimpleFormatter formatterTxt;

	static private FileHandler fileHTML;
	static private Formatter formatterHTML;
	
	public static final int INFO=0;
	public static final int WARN=1;
	public static final int SEVERE=2;
}

//This custom formatter formats parts of a log record to a single line
class MyHtmlFormatter extends Formatter
{
	// This method is called for every log records
	public String format(LogRecord rec)
	{
		StringBuffer buf = new StringBuffer(1000);
		// Bold any levels >= WARNING
		buf.append("<tr>");
		buf.append("<td>");

		if (rec.getLevel().intValue() >= Level.SEVERE.intValue())
		{
			buf.append("<b><font color='#ff0000'>");
			buf.append(rec.getLevel());
			buf.append("</font></b>");
		}

		else if (rec.getLevel().intValue() == Level.WARNING.intValue())
		{
			buf.append("<b>");
			buf.append(rec.getLevel());
			buf.append("</b>");
		}
		else
		{
			buf.append(rec.getLevel());
		}
		buf.append("</td>");
		buf.append("<td>");
		buf.append(calcDate(rec.getMillis()));
		buf.append(' ');
		rec.setMessage(ServletUtils.filter(rec.getMessage()));
		buf.append(formatMessage(rec));
		buf.append('\n');
		buf.append("<td>");
		buf.append("</tr>\n");
		return buf.toString();
	}

	private String calcDate(long millisecs)
	{
		SimpleDateFormat date_format = new SimpleDateFormat("MMM dd,yyyy HH:mm");
		Date resultdate = new Date(millisecs);
		return date_format.format(resultdate);
	}

	// This method is called just after the handler using this
	// formatter is created
	public String getHead(Handler h)
	{
		return "<HTML>\n<HEAD>\n" + (new Date()) + "\n</HEAD>\n<BODY>\n<PRE>\n"
		+ "<table border=1 width=100%>\n  "
		+ "<tr><th>Type</th><th>Log Message</th></tr>\n";
	}

	// This method is called just after the handler using this
	// formatter is closed
	public String getTail(Handler h)
	{
		return "</table>\n  </PRE></BODY>\n</HTML>\n";
	}
}