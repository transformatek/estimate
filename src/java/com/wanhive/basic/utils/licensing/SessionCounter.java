/**********************************************************
 * Session Manager
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
package com.wanhive.basic.utils.licensing;
import java.io.File;

import javax.servlet.http.*;

import com.wanhive.basic.beans.LicenseBean;

public final class SessionCounter implements HttpSessionListener{
	
	private static int activeSessions=0;
	private static int maxActiveSessions=0;
	private static boolean sessionConfigured=false;
	
	 public synchronized void sessionCreated(HttpSessionEvent se) {
		 activeSessions++;
		 System.out.println("Active Sessions: "+activeSessions);
	 }
	 public synchronized void sessionDestroyed(HttpSessionEvent se) {
		 if(activeSessions>0) activeSessions--;
		 System.out.println("Active Sessions: "+activeSessions);
	 }
	 
	 public static boolean limitReached() {
		 return activeSessions > maxActiveSessions;
	 }
	 
	 public static int getActiveSessionCount() {
		 return activeSessions;
	 }
	 
	public static int getMaxActiveSessions() {
		return maxActiveSessions;
	}
	
	public static void setMaxActiveSessions(int maxActiveSessions) {
		SessionCounter.maxActiveSessions = maxActiveSessions;
	}
	
	public static void limitMaxSessions()
	{
		if(sessionConfigured) return;
		
			maxActiveSessions=getMaxAllowedSessions();
			System.out.println("Max number of Sessions configured to: "+maxActiveSessions);
			sessionConfigured=true;
	}
	
	private static int getMaxAllowedSessions()
	{
		String env=Application.getApplicationEnv(Application.ENVVARNAME);
		Config conf=new Config(env+File.separator+Application.LICFILENAME);
		
		//Load License File
		LicenseBean bean=new LicenseBean();
		Application.getLicenseParameters(conf, bean);
		if(!Application.isValidLicense(bean.getMachineId(), bean.getLicenseKey(), ""+bean.getNumberOfLicenses(), bean.getInstallationId()))
		{
			Application.ISVALIDLICENSE=false;
			return 1;
		}
		else
		{
			Application.ISVALIDLICENSE=true;
			return bean.getNumberOfLicenses();
		}
	}
	
	public static void resetSessionCounter()
	{
		sessionConfigured=false;
		limitMaxSessions();
	}
	 

}
