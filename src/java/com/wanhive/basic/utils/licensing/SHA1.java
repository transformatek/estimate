package com.wanhive.basic.utils.licensing;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class SHA1 {
	public static String encrypt(String s) {
		String str = "";
		MessageDigest algorithm = null;
		try {
			algorithm = MessageDigest.getInstance("SHA-1");
		} catch (NoSuchAlgorithmException e) {
			System.out.println("encrypt: " + e.getMessage());
			return str;
		}
		byte[] defaultBytes = s.getBytes();
		algorithm.reset();
		algorithm.update(defaultBytes);
		byte messageDigest[] = algorithm.digest();
		StringBuffer hexString = new StringBuffer();

		for (int i = 0; i < messageDigest.length; i++) {
			String hex = Integer.toHexString(0xFF & messageDigest[i]);
			if (hex.length() == 1) {
				hexString.append('0');
			}
			hexString.append(hex);
		}
		str = hexString.toString();
		// System.out.println("SHA-1 (" + s + ") = " + str);
		return str;
	}
}
