package com.wanhive.basic.utils.licensing;

import java.io.UnsupportedEncodingException;
import java.util.Random;

public class RandomStringGenerator {
	
	static final String domain = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	static Random rnd = new Random();

	public static String randomString( int len ) 
	{
	   StringBuilder sb = new StringBuilder( len );
	   for( int i = 0; i < len; i++ ) 
	      sb.append( domain.charAt( rnd.nextInt(domain.length()) ) );
	   return sb.toString();
	}
	
	public static String generateCheckSum(String value) throws UnsupportedEncodingException {

	    byte[] data = value.getBytes("US-ASCII");        
	    long checksum = 0L;

	    for( byte b : data )  {
	        checksum += b; 
	    }

	    checksum = checksum % 256;

	    //return new Long( checksum ).intValue();
	    return Long.toHexString(checksum);
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		try
		{
			for(int i=0;i<10;i++)
			{
				//RandomStringGenerator gen=new RandomStringGenerator();
				String str=RandomStringGenerator.randomString(23);
				String checkSum=RandomStringGenerator.generateCheckSum(str);
				System.out.println(str+checkSum.toUpperCase());
				
				String key="";
				key+=str.substring(0, 5)+"-";
				key+=str.substring(5, 10)+"-";
				key+=str.substring(10, 15)+"-";
				key+=str.substring(15, 20)+"-";
				key+=str.substring(20, 23)+checkSum.toUpperCase();
				System.out.println(key);
			}
		}
		catch (Exception e) {
			System.out.println(e.getMessage());
		}

	}

}
