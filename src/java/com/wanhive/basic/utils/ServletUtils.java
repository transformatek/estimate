/**********************************************************
 * Converts special characters into HTML before sending to client
 * Copyright (C) 2009, 2010  Amit Kumar(amitkriit@gmail.com)
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
package com.wanhive.basic.utils;

public class ServletUtils {
	
	public static String filter(String input) {
		if(input==null || input.equalsIgnoreCase("")) return "-";
	    if (!hasSpecialChars(input)) {
	      return(input);
	    }
	    StringBuffer filtered = new StringBuffer(input.length());
	    char c;
	    for(int i=0; i<input.length(); i++) {
	      c = input.charAt(i);
	      switch(c) {
	        case '<': filtered.append("&lt;"); break;
	        case '>': filtered.append("&gt;"); break;
	        case '"': filtered.append("&quot;"); break;
	        case '&': filtered.append("&amp;"); break;
	        default: filtered.append(c);
	      }
	    }
	    return(filtered.toString());
	  }

	  private static boolean hasSpecialChars(String input) {
	    boolean flag = false;
	    if ((input != null) && (input.length() > 0)) {
	      char c;
	      for(int i=0; i<input.length(); i++) {
	        c = input.charAt(i);
	        switch(c) {
	          case '<': flag = true; break;
	          case '>': flag = true; break;
	          case '"': flag = true; break;
	          case '&': flag = true; break;
	        }
	      }
	    }
	    return(flag);
	  }
	  
	  public static String filterSingleQuote(String input)
	  {
		  return null;
	  }
}
