/**********************************************************
 * Routines for database-pooling and initialization
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
package com.wanhive.basic.db;

import java.io.File;
import java.sql.Connection;
//import java.sql.DriverManager;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

import org.apache.commons.io.FileUtils;

import com.wanhive.basic.beans.LicenseBean;
import com.wanhive.basic.utils.licensing.Application;

//import javax.sql.PooledConnection;


public class DataSourceManager {
	/*
	 * newConnection: Fetches a new Connection from Connection Pool
	 */
	public static Connection newConnection() throws SQLException, ClassNotFoundException, Exception
	{
		return Application.getConnection();
	}
	
	public static boolean testConnection()
	{
		Connection conn=null;
		Statement stmt=null;
		boolean connectionError=false;
		try
		{
			conn=newConnection();
			stmt=conn.createStatement();
			stmt.execute("select 1");
		}
		catch (Exception e) {
			System.out.println("testConnection: "+e.getMessage());
			connectionError=true;
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
			Application.destroyConnectionPool();
		}
		
		if(!connectionError)
			System.out.println("testConnection: SUCECSS");
		return connectionError;
	}
	public static int initializeDatabase(LicenseBean license)
	{
		Connection conn=null;
		Statement stmt=null;
		int errorCode=0;
		//If we are working with mysql database,
		//we might attempt to create a new database through this application
		//but if the attempt fails, we will try to continue
		if(license.getDbPropertyName().equalsIgnoreCase("mysql"))
		{
			Connection dbConn=null;
			Statement dbStmt=null;
			try
			{
				System.out.println("Trying to create a new Database if doesn't exist");
				Class.forName(license.getDbDriverName());
				dbConn=DriverManager.getConnection(license.getDbUrl()+"/mysql", license.getDbUserName(), license.getDbUserPassword());
				dbStmt=dbConn.createStatement();
				dbStmt.executeUpdate("create database if not exists "+license.getDbName());
			}
			catch (Exception e) {
				System.out.println("initializeDatabase: "+e.getMessage());
				System.out.println("initializeDatabase: Databse could not be created");
				//errorCode=1;
			}
			finally {
				try{if(dbStmt!=null)dbStmt.close();}catch(Exception e){}
				try{if(dbConn!=null)dbConn.close();}catch(Exception e){}
			}
			
			//In case of error, no need to go any further
			//if(errorCode!=0) return errorCode;
		}
		
		try
		{
			conn=newConnection();
		}
		catch (Exception e) {
			System.out.println("initializeDatabase: "+e.getMessage());
			errorCode=1;
			Application.destroyConnectionPool();
		}
		//In case of error, no need to go any further
		if(errorCode!=0) return errorCode;
		
		try
		{
			File schemaFile=new File(Application.SCHEMAFILENAME);
			String schema=FileUtils.readFileToString(schemaFile);
			schema=schema.replaceAll("`", "");
			String[] schemas=schema.split(";");
			
			File dataFile=new File(Application.DATAFILENAME);
			String data=FileUtils.readFileToString(dataFile);
			data=data.replaceAll("`", "");
			//data=data.replaceAll(";", replacement)
			String[] datas=data.split("\\$");
			stmt=conn.createStatement();
			for(int i=0;i<schemas.length-1;i++)
			{
				stmt.execute(schemas[i]);
			}
			
			for(int i=0;i<datas.length-1;i++)
			{
				stmt.execute(datas[i]);
			}
		}
		catch (Exception e) {
			System.out.println("initializeDatabase: "+e.getMessage());
			errorCode=2;
		}
		finally
		{
			try {if(stmt!=null)stmt.close();} catch (Exception e) {}
			try {if(conn!=null)conn.close();} catch (Exception e) {}
			Application.destroyConnectionPool();
		}
		if(errorCode==0)
			System.out.println("Success: DATABASE INITIALIZED SUCCESFULLY");
		return errorCode;
	}
}