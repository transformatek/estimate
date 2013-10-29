package com.wanhive.basic.utils.licensing;

import java.net.*;
import java.util.ArrayList;
import java.util.Enumeration;
public class NetAddress {
	public static ArrayList<String> getMacAddresses () {
		ArrayList<String> macs = new ArrayList<String>();
		try {
			Enumeration<NetworkInterface> nis = NetworkInterface.getNetworkInterfaces();
			while (nis.hasMoreElements()) {
				//getHardwareAddress() returns the hardware address (usually MAC) of the interface if it has one
				//and if it can be accessed given the current privileges.
				//Since: JDK1.6
				NetworkInterface nextElem=nis.nextElement();
				if(nextElem.isVirtual()) continue;
				if(nextElem.isLoopback()) continue;
				byte[] mac = nextElem.getHardwareAddress();
				if (mac == null) {
					continue;
				}
				//System.out.println("$$$$$$"+nextElem);
				StringBuilder sb = new StringBuilder();
				for (byte b : mac) {
					sb.append(toHexByte(b));
					sb.append("-");
				}
				if(sb.length()>0) sb.deleteCharAt(sb.length() - 1);
				macs.add(sb.toString());
			}
		} catch (SocketException ex) {
			ex.printStackTrace();
		}
		return macs;
	}

	public static ArrayList<String> getIPs () {
		ArrayList<String> ips = new ArrayList<String>();
		try {
			Enumeration<NetworkInterface> nis = NetworkInterface.getNetworkInterfaces();
			while (nis.hasMoreElements()) {
				Enumeration<InetAddress> ias = nis.nextElement().getInetAddresses();
				while (ias.hasMoreElements()) {
					InetAddress ia = ias.nextElement();
					ips.add(ia.getHostAddress());
					//System.out.println("**************");
					//System.out.println(ia.getHostAddress());
					//System.out.println(ia.getHostName());
					//System.out.println(ia.getCanonicalHostName());
				}
			}
		} catch (SocketException ex) {
			ex.printStackTrace();
		}
		return ips;
	}
	public static String toHexByte(byte b) {
		String hex = "0000" + Integer.toHexString(b);
		return hex.substring(hex.length() - 2);
	}

	public static void printNetworkInfo() {
		System.out.println("Mac Address:");
		ArrayList<String> macs = NetAddress.getMacAddresses();
		for (String m : macs) {
			System.out.println(m);
		}
		System.out.println("\nInternet Protocol Addresses:");
		ArrayList<String> ips = NetAddress.getIPs();
		for (String ip : ips) {
			System.out.println(ip);
		}
	}
	
	public static void main(String[] args)
	{
		printNetworkInfo();
	}

}
