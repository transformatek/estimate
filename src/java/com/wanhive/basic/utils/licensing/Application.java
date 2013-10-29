/**
 * ********************************************************
 * Application setup, configuration and management(database, user-interface,
 * properties) Copyright (C) 2010 Amit Kumar(amitkriit@gmail.com)
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * *2013-10-29 Amit Kumar amitkriit@gmail.com
 * Added RELEASENAME field to separate the name of the current release
 * from the product name.
 **********************************************************
 */
package com.wanhive.basic.utils.licensing;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.wanhive.basic.beans.LicenseBean;
import com.wanhive.basic.utils.ServletUtils;
import com.wanhive.basic.utils.logger.SystemLogger;


import snaq.db.ConnectionPoolManager;

public class Application {

    public static void init(String path, String dbSchema, String dbData) {
        Config conf = new Config(path);
        ENVVARNAME = conf.getValue("ENVVAR");
        DBFILENAME = conf.getValue("DBFILE");
        LICFILENAME = conf.getValue("LICFILE");
        DBPOOLNAME = conf.getValue("DBPOOL");
        PRODUCTNAME = conf.getValue("PRODUCTNAME");
        RELEASENAME = conf.getValue("RELEASENAME");
        PRODUCTID = conf.getValue("PRODUCTID");
        PRODUCTVERSION = conf.getValue("PRODUCTVERSION");
        RELEASEYEAR = conf.getValue("RELEASEYEAR");
        COMPANYNAME = conf.getValue("COMPANY");
        COMPANYWEBSITE = conf.getValue("COMPANYWEBSITE");
        PRODUCTWEBSITE = conf.getValue("PRODUCTWEBSITE");
        LICENSESERVER = conf.getValue("LICENSESERVER");
        SCHEMAFILENAME = dbSchema;
        DATAFILENAME = dbData;
        MACHINEID = getMachineId();
        try {
            SESSIONTIMEOUT = Integer.parseInt(conf.getValue("SESSIONTIMEOUT"));
        } catch (Exception e) {
            SESSIONTIMEOUT = 5;
        }


        //Configure max number of allowed sessions
        SessionCounter.limitMaxSessions();
        try {
            if (connectionPool != null) {
                connectionPool.release();
            }
            connectionPool = null;
        } catch (Exception e) {
            System.out.println("Application.init: " + e.getMessage());
        }
        System.out.println("INITIALIZATION COMPLETE");
    }

    public static String getApplicationEnv(String key) {
        if (environment != null) {
            return environment.get(key);
        } else {
            environment = System.getenv();
            return environment.get(key);
        }
    }

    public static ConnectionPoolManager getConnectionPool() throws FileNotFoundException, Exception {
        if (connectionPool != null) {
            return connectionPool;
        }

        String dbPath = Application.getApplicationEnv(ENVVARNAME);
        dbPath = dbPath + File.separator + DBFILENAME;
        //System.out.println("DBPATH: "+dbPath);
        try {
            File dbPropertiesFile = new File(dbPath);
            //System.out.println("$$$Default Charset: "+Charset.defaultCharset().name());
            connectionPool = ConnectionPoolManager.getInstance(dbPropertiesFile);
        } catch (Exception e) {
            System.out.println("getConnectionPool: " + e.getMessage());
        }
        if (connectionPool == null) {
            throw new Exception("getConnectionPool: Connection Pool not created");
        }
        return connectionPool;
    }

    public static void destroyConnectionPool() {
        try {
            if (connectionPool != null) {
                connectionPool.release();
            }
            connectionPool = null;
        } catch (Exception e) {
            System.out.println("destroyConnectionPool: " + e.getMessage());
        }
    }

    public static Connection getConnection() throws SQLException, Exception {
        //SessionCounter.limitMaxSessions();
        //if(SessionCounter.limitReached()) return null;
        Connection conn = null;
        try {
            if (connectionPool == null) {
                connectionPool = getConnectionPool();
            }
            if (connectionPool != null) {
                conn = connectionPool.getConnection(DBPOOLNAME);
            }
            if (conn == null) {
                System.out.println("###Releasing the Pool");
                if (connectionPool != null) {
                    connectionPool.release();
                }
                connectionPool = null;
                System.out.println("getConnection: connection could not be estabilished");
            }
        } catch (Exception e) {
            System.out.println("getConnection: " + e.getMessage());
            System.out.println("getConnection: Releasing the Pool");
            destroyConnectionPool();
            //System.out.println("CONENCTION EXCEPTION");
            throw e;
        }
        return conn;
    }

    public static int isLicDirectoryConfigured() {
        int errorCode = 0;
        String dirName = getApplicationEnv(ENVVARNAME);
        if (dirName == null || dirName.equalsIgnoreCase("")) {
            //No need to go beyond this point
            errorCode = 1;
            return errorCode;
        }
        File f = new File(dirName);
        if (!f.exists()) {
            errorCode = 2;
        } else if (!f.isDirectory()) {
            errorCode = 3;
        } else if (!f.canWrite()) {
            errorCode = 4;
        }
        //System.out.println("LIC ERRORCODE: "+errorCode);
        return errorCode;
    }

    public static LicenseBean loadLicense() {
        LicenseBean bean = new LicenseBean();
        String pathToLicFile = getApplicationEnv(ENVVARNAME) + File.separator + LICFILENAME;
        String pathToDbFile = getApplicationEnv(ENVVARNAME) + File.separator + DBFILENAME;
        //pathToLicFile = pathToLicFile.toLowerCase();
       // pathToDbFile = pathToDbFile.toLowerCase();
        String dbPoolName = DBPOOLNAME;
        //System.out.println("LICENSE PATH: "+pathToLicFile);
        //System.out.println("DB PATH: "+pathToDbFile);
        //System.out.println("DB POOL: "+dbPoolName);
        Config licenseConf = new Config(pathToLicFile);
        Config dbConf = new Config(pathToDbFile);

        String tmp = "";
        int tmp1 = 0;
        /*
         * DB Config Part
         */
        String poolExt = dbPoolName + ".";

        tmp = dbConf.getValue("name");
        tmp = (tmp == null || tmp.equalsIgnoreCase("")) ? "mysql" : tmp;
        bean.setDbPropertyName(tmp);

        tmp = dbConf.getValue("drivers");
        tmp = (tmp == null || tmp.equalsIgnoreCase("")) ? "com.mysql.jdbc.Driver" : tmp;
        bean.setDbDriverName(tmp);

        bean.setDbPoolName(dbPoolName);

        //"jdbc:mysql://localhost:3306/costmaster?autoReconnect=true"
        tmp = dbConf.getValue(poolExt + "url");
        if (tmp == null) {
            tmp = "";
        }
        String dbUrl = (tmp.equalsIgnoreCase("")) ? "jdbc:mysql://localhost:3306" : tmp.substring(0, tmp.lastIndexOf("/"));
        //dbUrl=dbUrl.substring(0, dbUrl.lastIndexOf("/"));
        bean.setDbUrl(dbUrl);

        int dbNameIndex = tmp.lastIndexOf("/");
        int optionsIndex = tmp.lastIndexOf("?");
        String dbName = "";
        if (optionsIndex != -1 && dbNameIndex != -1) {
            dbName = tmp.substring(dbNameIndex + 1, optionsIndex);
        } else if (dbNameIndex != -1) {
            dbName = tmp.substring(dbNameIndex + 1);
        }
        dbName = (dbName == null || dbName == "") ? "community" : dbName;
        bean.setDbName(dbName);

        tmp = dbConf.getValue(poolExt + "user");
        tmp = (tmp == null || tmp.equalsIgnoreCase("")) ? "root" : tmp;
        bean.setDbUserName(tmp);

        tmp = dbConf.getValue(poolExt + "password");
        tmp = (tmp == null ? "" : tmp);
        bean.setDbUserPassword(tmp);

        tmp = dbConf.getValue(poolExt + "minpool");
        try {
            tmp1 = Integer.parseInt(tmp);
        } catch (Exception e) {
            tmp1 = 1;
        }
        bean.setDbMinPool(tmp1);

        tmp = dbConf.getValue(poolExt + "maxpool");
        try {
            tmp1 = Integer.parseInt(tmp);
        } catch (Exception e) {
            tmp1 = 5;
        }
        bean.setDbMaxPool(tmp1);

        tmp = dbConf.getValue(poolExt + "maxsize");
        try {
            tmp1 = Integer.parseInt(tmp);
        } catch (Exception e) {
            tmp1 = 10;
        }
        bean.setDbMaxSize(tmp1);

        tmp = dbConf.getValue(poolExt + "idleTimeout");
        try {
            tmp1 = Integer.parseInt(tmp);
        } catch (Exception e) {
            tmp1 = 0;
        }
        bean.setDbIdleTimeOut(tmp1);


        /*
         * License Config Part
         */

        //License Key and parameters
        getLicenseParameters(licenseConf, bean);


        //User Data
        tmp = licenseConf.getValue("licensedTo");
        //tmp=(tmp==null || tmp.equalsIgnoreCase(""))?"-":tmp;
        bean.setUserName(ServletUtils.filter(tmp));

        tmp = licenseConf.getValue("organization");
        //tmp=(tmp==null || tmp.equalsIgnoreCase(""))?"-":tmp;
        bean.setOrganization(ServletUtils.filter(tmp));

        tmp = licenseConf.getValue("email");
        //tmp=(tmp==null || tmp.equalsIgnoreCase(""))?"-":tmp;
        bean.setEmail(ServletUtils.filter(tmp));

        tmp = licenseConf.getValue("contactNumber");
        //tmp=(tmp==null || tmp.equalsIgnoreCase(""))?"-":tmp;
        bean.setPhone(ServletUtils.filter(tmp));

        tmp = licenseConf.getValue("contactAddress");
        //tmp=(tmp==null || tmp.equalsIgnoreCase(""))?"-":tmp;
        bean.setAddress(ServletUtils.filter(tmp));

        tmp = licenseConf.getValue("website");
        //tmp=(tmp==null || tmp.equalsIgnoreCase(""))?"-":tmp;
        bean.setWebsite(ServletUtils.filter(tmp));

        System.out.println("LOADING LICENSE....");
        return bean;
    }

    public static boolean getLicenseParameters(Config licenseConf, LicenseBean bean) {
        String tmp = "";
        int tmp1 = 0;

        tmp = licenseConf.getValue("machineId");
        bean.setMachineId(tmp);

        tmp = licenseConf.getValue("numLic");
        try {
            tmp1 = Integer.parseInt(tmp);
        } catch (Exception e) {
            tmp1 = 0;
        }
        bean.setNumberOfLicenses(tmp1);

        tmp = licenseConf.getValue("licenseKey");
        bean.setLicenseKey(ServletUtils.filter(tmp).toUpperCase());

        tmp = licenseConf.getValue("installationId");
        bean.setInstallationId(ServletUtils.filter(tmp));

        return true;
    }

    public static boolean setupDbParameters(LicenseBean bean, String name, String driver, String url, String dbName, String user, String password, String minPool, String maxPool, String maxSize, String idleTimeOut) {
        if (bean == null) {
            return true;
        }
        String pathToDbFile = getApplicationEnv(ENVVARNAME) + File.separator + DBFILENAME;
        String dbPoolName = DBPOOLNAME;
        //Config dbConf=new Config(pathToDbFile);
        boolean errorFlag = true;
        String outStr = "";
        String newLine = System.getProperty("line.separator");
        try {
            FileWriter fstream = new FileWriter(pathToDbFile);
            BufferedWriter out = new BufferedWriter(fstream);

            name = (name == null || name.equalsIgnoreCase("")) ? bean.getDbPropertyName() : name;
            outStr += "name=" + name + newLine;

            driver = (driver == null || driver.equalsIgnoreCase("")) ? bean.getDbDriverName() : driver;
            outStr += "drivers=" + driver + newLine + newLine;

            dbName = (dbName == null || dbName.equalsIgnoreCase("")) ? bean.getDbName() : dbName;

            url = (url == null || url.equalsIgnoreCase("")) ? bean.getDbUrl() : url;
            outStr += dbPoolName + ".url=" + url + "/" + dbName + "?autoReconnect=true" + newLine;

            user = (user == null || user.equalsIgnoreCase("")) ? bean.getDbUserName() : user;
            outStr += dbPoolName + ".user=" + user + newLine;

            password = (password == null) ? bean.getDbUserPassword() : password;
            outStr += dbPoolName + ".password=" + password + newLine;

            int tmp = 0;
            try {
                tmp = Integer.parseInt(minPool);
            } catch (Exception e) {
                tmp = bean.getDbMinPool();
            }
            //System.out.println("$$Minpool: "+minPool+" $$INT: "+tmp);
            outStr += dbPoolName + ".minpool=" + tmp + newLine;

            int tmp1 = 0;
            try {
                tmp1 = Integer.parseInt(maxPool);
            } catch (Exception e) {
                tmp1 = bean.getDbMaxPool();
            }
            outStr += dbPoolName + ".maxpool=" + tmp1 + newLine;

            int tmp2 = 0;
            try {
                tmp2 = Integer.parseInt(maxSize);
            } catch (Exception e) {
                tmp2 = bean.getDbMaxSize();
            }
            outStr += dbPoolName + ".maxsize=" + tmp2 + newLine;

            int tmp3 = 0;
            try {
                tmp3 = Integer.parseInt(idleTimeOut);
            } catch (Exception e) {
                tmp3 = bean.getDbIdleTimeOut();
            }
            outStr += dbPoolName + ".idleTimeout=" + tmp3 + newLine;

            outStr += dbPoolName + ".validator=" + "snaq.db.Select1Validator" + newLine;

            out.write(outStr);
            out.close();
            bean.setDbPropertyName(name);
            bean.setDbDriverName(driver);
            bean.setDbUrl(url);
            bean.setDbName(dbName);
            bean.setDbUserName(user);
            bean.setDbUserPassword(password);
            bean.setDbMinPool(tmp);
            bean.setDbMaxPool(tmp1);
            bean.setDbMaxSize(tmp2);
            bean.setDbIdleTimeOut(tmp3);
            //System.out.println("$$$$MINPOOL: "+bean.getDbMinPool());
            destroyConnectionPool();
            errorFlag = false;
        } catch (Exception e) {
            System.out.println("setupDbParameters: " + e.getMessage());
            //errorFlag=true;
        }
        return errorFlag;
    }

    public static boolean setupLicenseParameters(LicenseBean bean, String licenseKey, String numLic, String licensedTo, String email, String organization, String contactAddress, String contactNumber, String website, boolean registrationAllowed) {
        if (bean == null) {
            return true;
        }
        String pathToLicenseFile = getApplicationEnv(ENVVARNAME) + File.separator + LICFILENAME;
        //Config dbConf=new Config(pathToDbFile);
        boolean errorFlag = false;
        Config licConf = new Config(pathToLicenseFile);

        //Generate Machine and InstallationId
        String machineId = MACHINEID;

        ArrayList<String> params = new ArrayList<String>();
        params.add(0, machineId);
        params.add(1, licenseKey);
        params.add(2, numLic);
        params.add(3, PRODUCTID);
        String internalInstallationId = generateInstallationId(params);

        //String internalInstallationId=generateInstallationId(machineId, licenseKey, numLic, PRODUCTID);

        if (internalInstallationId == null || internalInstallationId.equalsIgnoreCase("")) {
            return true;
        }
        if (!isValidKey(licenseKey)) {
            return true;
        }
        String installationId = "";
        if (registrationAllowed) {
            installationId = importInstallationId(licenseKey, numLic, machineId, PRODUCTID, licensedTo, email, organization, contactAddress, contactNumber, website);
        } else {
            installationId = importInstallationId(licenseKey, numLic, machineId, PRODUCTID, "-", "-", "-", "-", "-", "-");
        }
        //If there is a mismatch, an error has occurred
        if (installationId == null || installationId.length() <= 0 || !installationId.equalsIgnoreCase(internalInstallationId)) {
            System.out.println("LICENSE PARAMETERS: Validation Server returned invalid response");
            return true;
        }
        //Install Licensing Parameters
        errorFlag = installLicense(licConf, bean, licenseKey, numLic, installationId);
        if (errorFlag) {
            return true;
        }

        licensedTo = (licensedTo == null || licensedTo.equalsIgnoreCase("")) ? bean.getUserName() : licensedTo;
        errorFlag = licConf.setValue("licensedTo", licensedTo);
        if (errorFlag) {
            return true;
        }
        bean.setUserName(licensedTo);

        email = (email == null || email.equalsIgnoreCase("")) ? bean.getEmail() : email;
        errorFlag = licConf.setValue("email", email);
        if (errorFlag) {
            return true;
        }
        bean.setEmail(email);

        organization = (organization == null || organization.equalsIgnoreCase("")) ? bean.getOrganization() : organization;
        errorFlag = licConf.setValue("organization", organization);
        if (errorFlag) {
            return true;
        }
        bean.setOrganization(organization);

        contactAddress = (contactAddress == null || contactAddress.equalsIgnoreCase("")) ? bean.getAddress() : contactAddress;
        errorFlag = licConf.setValue("contactAddress", contactAddress);
        if (errorFlag) {
            return true;
        }
        bean.setAddress(contactAddress);

        contactNumber = (contactNumber == null || contactNumber.equalsIgnoreCase("")) ? bean.getPhone() : contactNumber;
        errorFlag = licConf.setValue("contactNumber", contactNumber);
        if (errorFlag) {
            return true;
        }
        bean.setPhone(contactNumber);

        website = (website == null || website.equalsIgnoreCase("")) ? bean.getWebsite() : website;
        errorFlag = licConf.setValue("website", website);
        if (errorFlag) {
            return true;
        }
        bean.setWebsite(website);

        SessionCounter.resetSessionCounter();
        System.out.println("LICENSE CONFIGURATION COMPLETED SUCCESFULLY");
        return errorFlag;
    }

    private static boolean isValidKey(String licenseKey) {
        if (licenseKey == null || licenseKey.length() != 25) {
            System.out.println("KEY VALIDATION: Key length must be 25 characters");
            return false;
        }
        /*String checksumStr = licenseKey.substring(23, 25);
        try {
            if (!RandomStringGenerator.generateCheckSum(licenseKey.substring(0, 23)).equalsIgnoreCase(checksumStr)) {
                System.out.println("KEY VALIDATION: Not an authentic key");
                return false;
            }
        } catch (Exception e) {
            return false;
        }*/
        //System.out.println("KEY: "+licenseKey+" is Valid");
        return true;
    }

    //Creates an installation ID, doesn't validate the key
    private static String generateInstallationId(ArrayList<String> params) {
        //String str=machineId+licenseKey+numLic+productId;
        String str = "";
        for (int i = 0; i < params.size(); i++) {
            str += params.get(i);
        }
        str += "$" + Integer.toHexString(str.length());
        str = SHA1.encrypt(str);
        str = MD5.encrypt(str + Integer.toHexString(str.length()));
        return str;


    }

    private static String importInstallationId(String licenseKey, String numLic, String machineId, String productId, String licensedTo, String email, String organization, String contactAddress, String contactNumber, String website) {
        //TODO: Modify this method for license validation in a production environment
        ArrayList<String> params = new ArrayList<String>();
        params.add(0, machineId);
        params.add(1, licenseKey);
        params.add(2, numLic);
        params.add(3, PRODUCTID);
        String str = generateInstallationId(params);
        return str;
    }

    //Installs License, Returns true on error
    private static boolean installLicense(Config licConf, LicenseBean bean, String licenseKey, String numLic, String installationId) {
        boolean errorFlag = false;

        //Set License Key
        licenseKey = licenseKey.toUpperCase();
        errorFlag = licConf.setValue("licenseKey", "" + licenseKey);
        if (errorFlag) {
            return true;
        }
        bean.setLicenseKey(licenseKey);

        //Set the number of licenses
        int tmp = 0;
        try {
            tmp = Integer.parseInt(numLic);
        } catch (Exception e) {
            tmp = bean.getNumberOfLicenses();
        }
        errorFlag = licConf.setValue("numLic", "" + tmp);
        if (errorFlag) {
            return true;
        }
        bean.setNumberOfLicenses(tmp);

        //Set Machine ID
        String machineId = getMachineId();
        errorFlag = licConf.setValue("machineId", machineId);
        if (errorFlag) {
            return true;
        }
        bean.setMachineId(machineId);

        //Set Installation ID
        errorFlag = licConf.setValue("installationId", installationId);
        if (errorFlag) {
            return true;
        }
        bean.setInstallationId(installationId);

        //If we have reached here, the license was installed successfully
        return false;
    }

    //Validates InstallationId, returns false on error
    public static boolean isValidLicense(String machineId, String licenseKey, String numLic, String installationId) {
        if (!isValidKey(licenseKey)) {
            System.out.println("LICENSE VALIDATION: Invalid key");
            return false;
        }
        //License file has been moved to another machine, or machine ID field has been tampered with
        if (machineId == null || !machineId.equalsIgnoreCase(MACHINEID)) {
            System.out.println("LICENSE VALIDATION: System Configuration has changed, license is invalid");
            return false;
        }


        ArrayList<String> params = new ArrayList<String>();
        params.add(0, machineId);
        params.add(1, licenseKey);
        params.add(2, numLic);
        params.add(3, PRODUCTID);
        //String installationId=generateInstallationId(params);

        String str = generateInstallationId(params);
        if (installationId == null || installationId.equalsIgnoreCase("") || !str.equalsIgnoreCase(installationId)) {
            System.out.println("LICENSE VALIDATION: Invalid installation ID");
            return false;
        }

        //If we are here, then the license is valid
        System.out.println("License validated succesfully");
        return true;
    }

    private static String getMachineId() {
        ArrayList<String> macAddresses = NetAddress.getMacAddresses();

        String str = "";
        for (int i = 0; i < macAddresses.size(); i++) {
            str += macAddresses.get(i);
        }

        str += "$" + Integer.toHexString(macAddresses.size());
        str = SHA1.encrypt(str);
        str = MD5.encrypt(str + Integer.toHexString(str.length()));
        //System.out.println("MACHINE ID:"+str);
        return str;
    }

    private static void initLogger() {
        //If logger is already initialized, return
        if (loggerInitialized) {
            return;
        }

        //Else, setup the logger
        if (isLicDirectoryConfigured() != 0) {
            System.out.println("Application.initLogger: Application has not been configured");
            loggerInitialized = false;
            return;
        }
        String logPath = Application.getApplicationEnv(ENVVARNAME);
        //logPath=logPath;

        String textFile = logPath + File.separator + "log.txt";
        String htmlFile = logPath + File.separator + "log.html";

        try {
            SystemLogger.setup(textFile, htmlFile);
            loggerInitialized = true;
            LOGGER.setLevel(Level.ALL);
        } catch (Exception e) {
            System.out.println("Application.initLogger: " + e.getMessage());
            loggerInitialized = false;
        }
    }

    public static void writeLog(String msg, int type) {
        initLogger();
        if (!loggerInitialized) {
            System.out.println("writeLog: Logger could not be initialized");
            return;
        }
        switch (type) {
            case SystemLogger.INFO:
                LOGGER.info(msg);
                break;
            case SystemLogger.WARN:
                LOGGER.warning(msg);
                break;
            case SystemLogger.SEVERE:
                LOGGER.severe(msg);
                break;
            default:
                LOGGER.info(msg);
                break;
        }

    }

    public static void writeLog(String msg) {
        initLogger();
        if (!loggerInitialized) {
            System.out.println("writeLog: Logger could not be initialized");
            return;
        }
        LOGGER.info(msg);
    }
    private static ConnectionPoolManager connectionPool = null;
    private static Map<String, String> environment = null;
    public static String ENVVARNAME;
    public static String DBFILENAME;
    public static String LICFILENAME;
    public static String DBPOOLNAME;
    public static String SCHEMAFILENAME;
    public static String DATAFILENAME;
    public static int lastStage = 0;
    public static boolean eulaAccepted = false;
    public static boolean licErrorFlag = false;
    public static String PRODUCTNAME;
    public static String RELEASENAME;
    public static String PRODUCTID;
    public static String PRODUCTVERSION;
    public static String RELEASEYEAR;
    public static String COMPANYNAME;
    public static String COMPANYWEBSITE;
    public static String PRODUCTWEBSITE;
    //For License Configuration
    public static String MACHINEID;
    public static boolean ISVALIDLICENSE;
    public static String ORGANIZATION;
    public static String LICENSESERVER;
    //For logging Application events
    private final static Logger LOGGER = Logger.getLogger(Application.class.getName());
    private static boolean loggerInitialized = false;
    //Other settings
    public static int SESSIONTIMEOUT;
}
