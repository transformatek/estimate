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

public class JobStatusBean {
	private double planned;	//Total Planned
	private double finished;	//Finished till query end date
	private double completed;	//Total completed
	private double target;		//Target withing timeframe
	private double achieved;	//Acieved within timeframe
	private double pending;		//Pending withing timeframe
	private long start;
	private long finish;
	private int status;
	private boolean valid;
	
	private String description;
	private long actualStart;
	private long actualFinish;
	public double getPlanned() {
		return planned;
	}
	public void setPlanned(double planned) {
		this.planned = planned;
	}
	public double getFinished() {
		return finished;
	}
	public void setFinished(double finished) {
		this.finished = finished;
	}
	public double getCompleted() {
		return completed;
	}
	public void setCompleted(double completed) {
		this.completed = completed;
	}
	public double getTarget() {
		return target;
	}
	public void setTarget(double target) {
		this.target = target;
	}
	public double getAchieved() {
		return achieved;
	}
	public void setAchieved(double achieved) {
		this.achieved = achieved;
	}
	public double getPending() {
		return pending;
	}
	public void setPending(double pending) {
		this.pending = pending;
	}
	public long getStart() {
		return start;
	}
	public void setStart(long start) {
		this.start = start;
	}
	public long getFinish() {
		return finish;
	}
	public void setFinish(long finish) {
		this.finish = finish;
	}
	public int getStatus() {
		return status;
	}
	public void setStatus(int status) {
		this.status = status;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public long getActualStart() {
		return actualStart;
	}
	public void setActualStart(long actualStart) {
		this.actualStart = actualStart;
	}
	public long getActualFinish() {
		return actualFinish;
	}
	public void setActualFinish(long actualFinish) {
		this.actualFinish = actualFinish;
	}
	public boolean isValid() {
		return valid;
	}
	public void setValid(boolean valid) {
		this.valid = valid;
	}
}
