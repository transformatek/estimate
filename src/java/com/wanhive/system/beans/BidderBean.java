package com.wanhive.system.beans;

import java.util.HashMap;

public class BidderBean {
	private String name;
	private String description;
	private int contactId;
	private int bidderId;
	private int tenderId;
	private boolean valid;
	private HashMap<Integer, QuotationBean> quotations;
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
	public int getContactId() {
		return contactId;
	}
	public void setContactId(int contactId) {
		this.contactId = contactId;
	}
	public int getBidderId() {
		return bidderId;
	}
	public void setBidderId(int bidderId) {
		this.bidderId = bidderId;
	}
	public int getTenderId() {
		return tenderId;
	}
	public void setTenderId(int tenderId) {
		this.tenderId = tenderId;
	}
	public boolean isValid() {
		return valid;
	}
	public void setValid(boolean valid) {
		this.valid = valid;
	}
	public HashMap<Integer, QuotationBean> getQuotations() {
		return quotations;
	}
	public void setQuotations(HashMap<Integer, QuotationBean> quotations) {
		this.quotations = quotations;
	}
}
