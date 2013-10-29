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
 ***********************************************************/
package com.wanhive.basic.beans;

public class LicenseBean {
	private String licenseKey;
	private boolean validLicenseKey;
	private String userName;
	private String organization;
	private String email;
	private String phone;
	private String address;
	private String website;
	private int numberOfLicenses;
	private String verificationCode;
	private String responseCode;
	private boolean validLicence;
	private String machineId;
	private String installationId;
	
	private String dbPropertyName;
	private String dbDriverName;
	private String dbPoolName;
	private String dbUrl;
	private String dbName;
	private String dbUserName;
	private String dbUserPassword;
	private int dbMinPool;
	private int dbMaxPool;
	private int dbMaxSize;
	private int dbIdleTimeOut;
	
	public String getDbPropertyName() {
		return dbPropertyName;
	}
	public void setDbPropertyName(String dbPropertyName) {
		this.dbPropertyName = dbPropertyName;
	}
	public String getDbDriverName() {
		return dbDriverName;
	}
	public void setDbDriverName(String dbDriverName) {
		this.dbDriverName = dbDriverName;
	}
	public String getLicenseKey() {
		return licenseKey;
	}
	public void setLicenseKey(String licenseKey) {
		this.licenseKey = licenseKey;
	}
	public boolean isValidLicenseKey() {
		return validLicenseKey;
	}
	public void setValidLicenseKey(boolean validLicenseKey) {
		this.validLicenseKey = validLicenseKey;
	}
	public String getMachineId() {
		return machineId;
	}
	public void setMachineId(String machineId) {
		this.machineId = machineId;
	}
	public String getInstallationId() {
		return installationId;
	}
	public void setInstallationId(String installationId) {
		this.installationId = installationId;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getOrganization() {
		return organization;
	}
	public void setOrganization(String organization) {
		this.organization = organization;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getWebsite() {
		return website;
	}
	public void setWebsite(String website) {
		this.website = website;
	}
	public int getNumberOfLicenses() {
		return numberOfLicenses;
	}
	public void setNumberOfLicenses(int numberOfLicenses) {
		this.numberOfLicenses = numberOfLicenses;
	}
	public String getVerificationCode() {
		return verificationCode;
	}
	public void setVerificationCode(String verificationCode) {
		this.verificationCode = verificationCode;
	}
	public String getResponseCode() {
		return responseCode;
	}
	public void setResponseCode(String responseCode) {
		this.responseCode = responseCode;
	}
	public boolean isValidLicence() {
		return validLicence;
	}
	public void setValidLicence(boolean validLicence) {
		this.validLicence = validLicence;
	}
	public String getDbPoolName() {
		return dbPoolName;
	}
	public void setDbPoolName(String dbPoolName) {
		this.dbPoolName = dbPoolName;
	}
	public String getDbUrl() {
		return dbUrl;
	}
	public void setDbUrl(String dbUrl) {
		this.dbUrl = dbUrl;
	}
	public String getDbName() {
		return dbName;
	}
	public void setDbName(String dbName) {
		this.dbName = dbName;
	}
	public String getDbUserName() {
		return dbUserName;
	}
	public void setDbUserName(String dbUserName) {
		this.dbUserName = dbUserName;
	}
	public String getDbUserPassword() {
		return dbUserPassword;
	}
	public void setDbUserPassword(String dbUserPassword) {
		this.dbUserPassword = dbUserPassword;
	}
	public int getDbMinPool() {
		return dbMinPool;
	}
	public void setDbMinPool(int dbMinPool) {
		this.dbMinPool = dbMinPool;
	}
	public int getDbMaxPool() {
		return dbMaxPool;
	}
	public void setDbMaxPool(int dbMaxPool) {
		this.dbMaxPool = dbMaxPool;
	}
	public int getDbMaxSize() {
		return dbMaxSize;
	}
	public void setDbMaxSize(int dbMaxSize) {
		this.dbMaxSize = dbMaxSize;
	}
	public int getDbIdleTimeOut() {
		return dbIdleTimeOut;
	}
	public void setDbIdleTimeOut(int dbIdleTimeOut) {
		this.dbIdleTimeOut = dbIdleTimeOut;
	}
}
