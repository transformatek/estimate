package com.wanhive.system.beans;

public class QuotationBean {
	private int itemId;
	private int BidderId;
	private int basis;
	private double qoutation;
	public int getItemId() {
		return itemId;
	}
	public void setItemId(int itemId) {
		this.itemId = itemId;
	}
	public int getBidderId() {
		return BidderId;
	}
	public void setBidderId(int bidderId) {
		BidderId = bidderId;
	}
	public int getBasis() {
		return basis;
	}
	public void setBasis(int basis) {
		this.basis = basis;
	}
	public double getQoutation() {
		return qoutation;
	}
	public void setQoutation(double qoutation) {
		this.qoutation = qoutation;
	}
}
