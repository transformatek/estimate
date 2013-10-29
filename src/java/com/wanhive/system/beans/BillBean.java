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
package com.wanhive.system.beans;

import java.util.HashMap;


public class BillBean {
	private int id;
	private int assemblyId;
	private String name;
	private String description;
	private String unit;
	private double price;
	private double premium;
	private String displayUnit;
	private double unitMultiplier;
	private JobStatusBean jobStatus;
	private HashMap<Integer, ItemAssemblyBean> itemList;
	// variable chapter is used for sorting 
	private int[] chapterIndex;
	private double rateMultiplier;
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public int getAssemblyId() {
		return assemblyId;
	}
	public void setAssemblyId(int assemblyId) {
		this.assemblyId = assemblyId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getUnit() {
		return unit;
	}
	public void setUnit(String unit) {
		this.unit = unit;
	}
	public double getPrice() {
		return price;
	}
	public void setPrice(double price) {
		this.price = price;
	}
	public double getPremium() {
		return premium;
	}
	public void setPremium(double premium) {
		this.premium = premium;
	}
	public String getDisplayUnit() {
		return displayUnit;
	}
	public void setDisplayUnit(String displayUnit) {
		this.displayUnit = displayUnit;
	}
	public double getUnitMultiplier() {
		return unitMultiplier;
	}
	public void setUnitMultiplier(double unitMultiplier) {
		this.unitMultiplier = unitMultiplier;
	}
	public JobStatusBean getJobStatus() {
		return jobStatus;
	}
	public void setJobStatus(JobStatusBean jobStatus) {
		this.jobStatus = jobStatus;
	}
	public HashMap<Integer, ItemAssemblyBean> getItemList() {
		return itemList;
	}
	public void setItemList(HashMap<Integer, ItemAssemblyBean> itemList) {
		this.itemList = itemList;
	}
	public int[] getChapterIndex() {
		return chapterIndex;
	}
	public void setChapterIndex(int[] chapterIndex) {
		this.chapterIndex = chapterIndex;
	}
	public double getRateMultiplier() {
		return rateMultiplier;
	}
	public void setRateMultiplier(double rateMultiplier) {
		this.rateMultiplier = rateMultiplier;
	}
}
