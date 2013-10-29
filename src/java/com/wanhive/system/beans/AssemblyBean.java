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


public class AssemblyBean {
	private int id;
	private String name;
	private String description;
	private String remarks;
	private String unit;
	private double price;
	private double premium;
	private int parent;
	
	private String cbPrice;
	private String cbPremium;

	private String displayUnit;
	private double priceMultiplier;
	// variable chapter is used for sorting 
	private int[] chapterIndex;
	//For use in Tender Mgt.
	private double quantity;
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
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
	public String getRemarks() {
		return remarks;
	}
	public void setRemarks(String remarks) {
		this.remarks = remarks;
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
	public int getParent() {
		return parent;
	}
	public void setParent(int parent) {
		this.parent = parent;
	}
	public String getCbPrice() {
		return cbPrice;
	}
	public void setCbPrice(String cbPrice) {
		this.cbPrice = cbPrice;
	}
	public String getCbPremium() {
		return cbPremium;
	}
	public void setCbPremium(String cbPremium) {
		this.cbPremium = cbPremium;
	}
	public String getDisplayUnit() {
		return displayUnit;
	}
	public void setDisplayUnit(String displayUnit) {
		this.displayUnit = displayUnit;
	}
	public double getPriceMultiplier() {
		return priceMultiplier;
	}
	public void setPriceMultiplier(double priceMultiplier) {
		this.priceMultiplier = priceMultiplier;
	}
	public int[] getChapterIndex() {
		return chapterIndex;
	}
	public void setChapterIndex(int[] chapterIndex) {
		this.chapterIndex = chapterIndex;
	}
	public double getQuantity() {
		return quantity;
	}
	public void setQuantity(double quantity) {
		this.quantity = quantity;
	}
	
}
