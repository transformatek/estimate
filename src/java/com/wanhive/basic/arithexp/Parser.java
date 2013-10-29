/* Generated By:JJTree&JavaCC: Do not edit this line. Parser.java */
package com.wanhive.basic.arithexp;

//import java.util.*;
import java.io.*;

import com.wanhive.system.utils.DecimalFormat;


@SuppressWarnings("all")
public class Parser/* @bgen(jjtree) */implements ParserTreeConstants,
		ParserConstants {/* @bgen(jjtree) */
	private static Object sync = new Object();

	public static double returnResult(String s) throws ParseException,
			TokenMgrError, NumberFormatException, Exception {
		synchronized (sync) {
			InputStream in = new ByteArrayInputStream(s.getBytes());
			// If the parser is not initialized, then initialize it
			// Parser must be initialized only once
			initializeParser();
			ReInit(in);
			double result = 1;
			try {
				SimpleNode n = start(System.out);
				if (n == null)
					;
				else
					result = last_result;
			} catch (ParseException e) {
				System.out.println("PARSE ERROR: " + e.getMessage());
				throw e;
			} catch (TokenMgrError e) {
				System.out.println("SYNTAX ERROR: " + e.getMessage());
				throw new Exception("Syntax Error in the expression");
			} catch (NumberFormatException e) {
				System.out.println("NAN: " + e.getMessage());
				throw e;
			} catch (Exception e) {
				System.out.println("EXCEPTION: " + e.getMessage());
			} finally {
				try {
					if (in != null)
						in.close();
				} catch (Exception e) {
				}
			}
			return result;
		}
	}

	// for Calculator
	public static String calculatorResult(String s) {
		synchronized (sync) {
			InputStream in = new ByteArrayInputStream(s.getBytes());
			// If the parser is not initialized, then initialize it
			// Parser must be initialized only once
			initializeParser();
			ReInit(in);
			String result = "";
			try {
				SimpleNode n = start(System.out);
				if (n == null)
					;
				else
					result = DecimalFormat.format(last_result);
			} catch (ParseException e) {
				System.out.println("PARSE ERROR: " + e.getMessage());
				result = "PARSE ERROR: " + e.getMessage();
				// throw e;
			} catch (TokenMgrError e) {
				System.out.println("SYNTAX ERROR: " + e.getMessage());
				result = "SYNTAX ERROR: " + e.getMessage();
				// throw e;
			} catch (NumberFormatException e) {
				System.out.println("NAN: " + e.getMessage());
				// throw e;
			} catch (Exception e) {
				System.out.println("EXCEPTION: " + e.getMessage());
			} finally {
				try {
					if (in != null)
						in.close();
				} catch (Exception e) {
				}
			}
			return result;
		}
	}

	private static void initializeParser() {
		if (!isInitialized)
			new Parser(System.in);
		isInitialized = true;
	}

	private static boolean isInitialized = false;

	protected static JJTParserState jjtree = new JJTParserState();

	public static void main(String args[]) {
		System.out.println("Reading from standard input...");
		System.out
				.print("Enter an expression like \u005c"1+(2+3)*var;\u005c" :");
		new Parser(System.in);
		try {
			SimpleNode n = Parser.start(System.out);
			n.dump("");
			System.out.println("Thank you.");
		} catch (ParseException e) {
			System.out.println("PARSE ERROR: " + e.getMessage());
		} catch (TokenMgrError e) {
			System.out.println("SYNTAX ERROR: " + e.getMessage());
		} catch (NumberFormatException e) {
			System.out.println("NAN: " + e.getMessage());
		} catch (Exception e) {
			System.out.println("EXCEPTION: " + e.getMessage());
		}
	}

	static double last_result = 0.0;

	// END: LEXER SPEC
	static final public SimpleNode start(PrintStream out)
			throws ParseException, NumberFormatException {
		/* @bgen(jjtree) start */
		SimpleNode jjtn000 = new SimpleNode(JJTSTART);
		boolean jjtc000 = true;
		jjtree.openNodeScope(jjtn000);
		double result;
		try {
			switch ((jj_ntk == -1) ? jj_ntk() : jj_ntk) {
			case LP:
			case NUMBER:
			case PLUS:
			case MINUS:
			case MEM:
				result = expression();
				jj_consume_token(SC);
				jjtree.closeNodeScope(jjtn000, true);
				jjtc000 = false;
				out.println(result);
				System.out
						.println("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
				{
					if (true)
						return jjtn000;
				}
				break;
			case QUIT:
				jj_consume_token(QUIT);
				jjtree.closeNodeScope(jjtn000, true);
				jjtc000 = false;
				System.out.println("Exiting...");
				{
					if (true)
						return null;
				}
				break;
			default:
				jj_la1[0] = jj_gen;
				jj_consume_token(-1);
				throw new ParseException();
			}
		} catch (Throwable jjte000) {
			if (jjtc000) {
				jjtree.clearNodeScope(jjtn000);
				jjtc000 = false;
			} else {
				jjtree.popNode();
			}
			if (jjte000 instanceof NumberFormatException) {
				{
					if (true)
						throw (NumberFormatException) jjte000;
				}
			}
			if (jjte000 instanceof RuntimeException) {
				{
					if (true)
						throw (RuntimeException) jjte000;
				}
			}
			if (jjte000 instanceof ParseException) {
				{
					if (true)
						throw (ParseException) jjte000;
				}
			}
			{
				if (true)
					throw (Error) jjte000;
			}
		} finally {
			if (jjtc000) {
				jjtree.closeNodeScope(jjtn000, true);
			}
		}
		throw new Error("Missing return statement in function");
	}

	static final public double expression() throws ParseException,
			NumberFormatException {
		/* @bgen(jjtree) #Add(> 1) */
		SimpleNode jjtn000 = new SimpleNode(JJTADD);
		boolean jjtc000 = true;
		jjtree.openNodeScope(jjtn000);
		double result;
		double temp;
		try {
			result = term();
			label_1: while (true) {
				switch ((jj_ntk == -1) ? jj_ntk() : jj_ntk) {
				case PLUS:
				case MINUS:
					;
					break;
				default:
					jj_la1[1] = jj_gen;
					break label_1;
				}
				switch ((jj_ntk == -1) ? jj_ntk() : jj_ntk) {
				case PLUS:
					jj_consume_token(PLUS);
					temp = term();
					result += temp;
					break;
				case MINUS:
					jj_consume_token(MINUS);
					temp = term();
					result -= temp;
					break;
				default:
					jj_la1[2] = jj_gen;
					jj_consume_token(-1);
					throw new ParseException();
				}
			}
			jjtree.closeNodeScope(jjtn000, jjtree.nodeArity() > 1);
			jjtc000 = false;
			Parser.last_result = result;
			{
				if (true)
					return result;
			}
		} catch (Throwable jjte000) {
			if (jjtc000) {
				jjtree.clearNodeScope(jjtn000);
				jjtc000 = false;
			} else {
				jjtree.popNode();
			}
			if (jjte000 instanceof NumberFormatException) {
				{
					if (true)
						throw (NumberFormatException) jjte000;
				}
			}
			if (jjte000 instanceof RuntimeException) {
				{
					if (true)
						throw (RuntimeException) jjte000;
				}
			}
			if (jjte000 instanceof ParseException) {
				{
					if (true)
						throw (ParseException) jjte000;
				}
			}
			{
				if (true)
					throw (Error) jjte000;
			}
		} finally {
			if (jjtc000) {
				jjtree.closeNodeScope(jjtn000, jjtree.nodeArity() > 1);
			}
		}
		throw new Error("Missing return statement in function");
	}

	static final public double term() throws ParseException,
			NumberFormatException {
		/* @bgen(jjtree) #Mult(> 1) */
		SimpleNode jjtn000 = new SimpleNode(JJTMULT);
		boolean jjtc000 = true;
		jjtree.openNodeScope(jjtn000);
		double result;
		double temp;
		try {
			result = factor();
			label_2: while (true) {
				switch ((jj_ntk == -1) ? jj_ntk() : jj_ntk) {
				case MULT:
				case DIV:
					;
					break;
				default:
					jj_la1[3] = jj_gen;
					break label_2;
				}
				switch ((jj_ntk == -1) ? jj_ntk() : jj_ntk) {
				case MULT:
					jj_consume_token(MULT);
					temp = factor();
					result *= temp;
					break;
				case DIV:
					jj_consume_token(DIV);
					temp = factor();
					result /= temp;
					break;
				default:
					jj_la1[4] = jj_gen;
					jj_consume_token(-1);
					throw new ParseException();
				}
			}
			jjtree.closeNodeScope(jjtn000, jjtree.nodeArity() > 1);
			jjtc000 = false;
			{
				if (true)
					return result;
			}
		} catch (Throwable jjte000) {
			if (jjtc000) {
				jjtree.clearNodeScope(jjtn000);
				jjtc000 = false;
			} else {
				jjtree.popNode();
			}
			if (jjte000 instanceof NumberFormatException) {
				{
					if (true)
						throw (NumberFormatException) jjte000;
				}
			}
			if (jjte000 instanceof RuntimeException) {
				{
					if (true)
						throw (RuntimeException) jjte000;
				}
			}
			if (jjte000 instanceof ParseException) {
				{
					if (true)
						throw (ParseException) jjte000;
				}
			}
			{
				if (true)
					throw (Error) jjte000;
			}
		} finally {
			if (jjtc000) {
				jjtree.closeNodeScope(jjtn000, jjtree.nodeArity() > 1);
			}
		}
		throw new Error("Missing return statement in function");
	}

	static final public double factor() throws ParseException,
			NumberFormatException {
		/* @bgen(jjtree) Factor */
		SimpleNode jjtn000 = new SimpleNode(JJTFACTOR);
		boolean jjtc000 = true;
		jjtree.openNodeScope(jjtn000);
		double result;
		try {
			switch ((jj_ntk == -1) ? jj_ntk() : jj_ntk) {
			case NUMBER:
				result = number();
				jjtree.closeNodeScope(jjtn000, true);
				jjtc000 = false;
				{
					if (true)
						return result;
				}
				break;
			case MEM:
				jj_consume_token(MEM);
				jjtree.closeNodeScope(jjtn000, true);
				jjtc000 = false;
				{
					if (true)
						return Parser.last_result;
				}
				break;
			case LP:
				jj_consume_token(LP);
				result = expression();
				jj_consume_token(RP);
				jjtree.closeNodeScope(jjtn000, true);
				jjtc000 = false;
				{
					if (true)
						return result;
				}
				break;
			case MINUS:
				jj_consume_token(MINUS);
				result = factor();
				jjtree.closeNodeScope(jjtn000, true);
				jjtc000 = false;
				{
					if (true)
						return -result;
				}
				break;
			case PLUS:
				jj_consume_token(PLUS);
				result = factor();
				jjtree.closeNodeScope(jjtn000, true);
				jjtc000 = false;
				{
					if (true)
						return result;
				}
				break;
			default:
				jj_la1[5] = jj_gen;
				jj_consume_token(-1);
				throw new ParseException();
			}
		} catch (Throwable jjte000) {
			if (jjtc000) {
				jjtree.clearNodeScope(jjtn000);
				jjtc000 = false;
			} else {
				jjtree.popNode();
			}
			if (jjte000 instanceof NumberFormatException) {
				{
					if (true)
						throw (NumberFormatException) jjte000;
				}
			}
			if (jjte000 instanceof RuntimeException) {
				{
					if (true)
						throw (RuntimeException) jjte000;
				}
			}
			if (jjte000 instanceof ParseException) {
				{
					if (true)
						throw (ParseException) jjte000;
				}
			}
			{
				if (true)
					throw (Error) jjte000;
			}
		} finally {
			if (jjtc000) {
				jjtree.closeNodeScope(jjtn000, true);
			}
		}
		throw new Error("Missing return statement in function");
	}

	static final public double number() throws ParseException,
			NumberFormatException {
		/* @bgen(jjtree) number */
		SimpleNode jjtn000 = new SimpleNode(JJTNUMBER);
		boolean jjtc000 = true;
		jjtree.openNodeScope(jjtn000);// Token t;
		double result = 0;
		double temp = 0;
		try {
			if (jj_2_1(3)) {
				result = ISnumber();
				jj_consume_token(QUOTE);
				switch ((jj_ntk == -1) ? jj_ntk() : jj_ntk) {
				case NUMBER:
					temp = ISnumber();
					jj_consume_token(DQUOTE);
					break;
				default:
					jj_la1[6] = jj_gen;
					;
				}
				jjtree.closeNodeScope(jjtn000, true);
				jjtc000 = false;
				{
					if (true)
						return (result * 12 + temp) * 0.0254;
				}
			} else if (jj_2_2(2)) {
				temp = ISnumber();
				jj_consume_token(DQUOTE);
				jjtree.closeNodeScope(jjtn000, true);
				jjtc000 = false;
				{
					if (true)
						return temp * 0.0254;
				}
			} else {
				switch ((jj_ntk == -1) ? jj_ntk() : jj_ntk) {
				case NUMBER:
					result = ISnumber();
					jjtree.closeNodeScope(jjtn000, true);
					jjtc000 = false;
					{
						if (true)
							return result;
					}
					break;
				default:
					jj_la1[7] = jj_gen;
					jj_consume_token(-1);
					throw new ParseException();
				}
			}
		} catch (Throwable jjte000) {
			if (jjtc000) {
				jjtree.clearNodeScope(jjtn000);
				jjtc000 = false;
			} else {
				jjtree.popNode();
			}
			if (jjte000 instanceof NumberFormatException) {
				{
					if (true)
						throw (NumberFormatException) jjte000;
				}
			}
			if (jjte000 instanceof RuntimeException) {
				{
					if (true)
						throw (RuntimeException) jjte000;
				}
			}
			if (jjte000 instanceof ParseException) {
				{
					if (true)
						throw (ParseException) jjte000;
				}
			}
			{
				if (true)
					throw (Error) jjte000;
			}
		} finally {
			if (jjtc000) {
				jjtree.closeNodeScope(jjtn000, true);
			}
		}
		throw new Error("Missing return statement in function");
	}

	static final public double ISnumber() throws ParseException,
			NumberFormatException {
		/* @bgen(jjtree) ISnumber */
		SimpleNode jjtn000 = new SimpleNode(JJTISNUMBER);
		boolean jjtc000 = true;
		jjtree.openNodeScope(jjtn000);
		Token t;
		double result;
		try {
			t = jj_consume_token(NUMBER);
			jjtree.closeNodeScope(jjtn000, true);
			jjtc000 = false;
			result = Double.parseDouble(t.image);
			System.out.println("Found: " + result);
			{
				if (true)
					return result;
			}
		} finally {
			if (jjtc000) {
				jjtree.closeNodeScope(jjtn000, true);
			}
		}
		throw new Error("Missing return statement in function");
	}

	static private boolean jj_2_1(int xla) {
		jj_la = xla;
		jj_lastpos = jj_scanpos = token;
		try {
			return !jj_3_1();
		} catch (LookaheadSuccess ls) {
			return true;
		} finally {
			jj_save(0, xla);
		}
	}

	static private boolean jj_2_2(int xla) {
		jj_la = xla;
		jj_lastpos = jj_scanpos = token;
		try {
			return !jj_3_2();
		} catch (LookaheadSuccess ls) {
			return true;
		} finally {
			jj_save(1, xla);
		}
	}

	static private boolean jj_3_1() {
		if (jj_3R_3())
			return true;
		if (jj_scan_token(QUOTE))
			return true;
		Token xsp;
		xsp = jj_scanpos;
		if (jj_3R_4())
			jj_scanpos = xsp;
		return false;
	}

	static private boolean jj_3R_4() {
		if (jj_3R_3())
			return true;
		return false;
	}

	static private boolean jj_3R_3() {
		if (jj_scan_token(NUMBER))
			return true;
		return false;
	}

	static private boolean jj_3_2() {
		if (jj_3R_3())
			return true;
		if (jj_scan_token(DQUOTE))
			return true;
		return false;
	}

	static private boolean jj_initialized_once = false;
	/** Generated Token Manager. */
	static public ParserTokenManager token_source;
	static SimpleCharStream jj_input_stream;
	/** Current token. */
	static public Token token;
	/** Next token. */
	static public Token jj_nt;
	static private int jj_ntk;
	static private Token jj_scanpos, jj_lastpos;
	static private int jj_la;
	static private int jj_gen;
	static final private int[] jj_la1 = new int[8];
	static private int[] jj_la1_0;
	static {
		jj_la1_init_0();
	}

	private static void jj_la1_init_0() {
		jj_la1_0 = new int[] { 0x93500, 0x3000, 0x3000, 0xc000, 0xc000,
				0x13500, 0x400, 0x400, };
	}

	static final private JJCalls[] jj_2_rtns = new JJCalls[2];
	static private boolean jj_rescan = false;
	static private int jj_gc = 0;

	/** Constructor with InputStream. */
	public Parser(java.io.InputStream stream) {
		this(stream, null);
	}

	/** Constructor with InputStream and supplied encoding */
	public Parser(java.io.InputStream stream, String encoding) {
		if (jj_initialized_once) {
			System.out
					.println("ERROR: Second call to constructor of static parser.  ");
			System.out
					.println("       You must either use ReInit() or set the JavaCC option STATIC to false");
			System.out.println("       during parser generation.");
			throw new Error();
		}
		jj_initialized_once = true;
		try {
			jj_input_stream = new SimpleCharStream(stream, encoding, 1, 1);
		} catch (java.io.UnsupportedEncodingException e) {
			throw new RuntimeException(e);
		}
		token_source = new ParserTokenManager(jj_input_stream);
		token = new Token();
		jj_ntk = -1;
		jj_gen = 0;
		for (int i = 0; i < 8; i++)
			jj_la1[i] = -1;
		for (int i = 0; i < jj_2_rtns.length; i++)
			jj_2_rtns[i] = new JJCalls();
	}

	/** Reinitialise. */
	static public void ReInit(java.io.InputStream stream) {
		ReInit(stream, null);
	}

	/** Reinitialise. */
	static public void ReInit(java.io.InputStream stream, String encoding) {
		try {
			jj_input_stream.ReInit(stream, encoding, 1, 1);
		} catch (java.io.UnsupportedEncodingException e) {
			throw new RuntimeException(e);
		}
		token_source.ReInit(jj_input_stream);
		token = new Token();
		jj_ntk = -1;
		jjtree.reset();
		jj_gen = 0;
		for (int i = 0; i < 8; i++)
			jj_la1[i] = -1;
		for (int i = 0; i < jj_2_rtns.length; i++)
			jj_2_rtns[i] = new JJCalls();
	}

	/** Constructor. */
	public Parser(java.io.Reader stream) {
		if (jj_initialized_once) {
			System.out
					.println("ERROR: Second call to constructor of static parser. ");
			System.out
					.println("       You must either use ReInit() or set the JavaCC option STATIC to false");
			System.out.println("       during parser generation.");
			throw new Error();
		}
		jj_initialized_once = true;
		jj_input_stream = new SimpleCharStream(stream, 1, 1);
		token_source = new ParserTokenManager(jj_input_stream);
		token = new Token();
		jj_ntk = -1;
		jj_gen = 0;
		for (int i = 0; i < 8; i++)
			jj_la1[i] = -1;
		for (int i = 0; i < jj_2_rtns.length; i++)
			jj_2_rtns[i] = new JJCalls();
	}

	/** Reinitialise. */
	static public void ReInit(java.io.Reader stream) {
		jj_input_stream.ReInit(stream, 1, 1);
		token_source.ReInit(jj_input_stream);
		token = new Token();
		jj_ntk = -1;
		jjtree.reset();
		jj_gen = 0;
		for (int i = 0; i < 8; i++)
			jj_la1[i] = -1;
		for (int i = 0; i < jj_2_rtns.length; i++)
			jj_2_rtns[i] = new JJCalls();
	}

	/** Constructor with generated Token Manager. */
	public Parser(ParserTokenManager tm) {
		if (jj_initialized_once) {
			System.out
					.println("ERROR: Second call to constructor of static parser. ");
			System.out
					.println("       You must either use ReInit() or set the JavaCC option STATIC to false");
			System.out.println("       during parser generation.");
			throw new Error();
		}
		jj_initialized_once = true;
		token_source = tm;
		token = new Token();
		jj_ntk = -1;
		jj_gen = 0;
		for (int i = 0; i < 8; i++)
			jj_la1[i] = -1;
		for (int i = 0; i < jj_2_rtns.length; i++)
			jj_2_rtns[i] = new JJCalls();
	}

	/** Reinitialise. */
	public void ReInit(ParserTokenManager tm) {
		token_source = tm;
		token = new Token();
		jj_ntk = -1;
		jjtree.reset();
		jj_gen = 0;
		for (int i = 0; i < 8; i++)
			jj_la1[i] = -1;
		for (int i = 0; i < jj_2_rtns.length; i++)
			jj_2_rtns[i] = new JJCalls();
	}

	static private Token jj_consume_token(int kind) throws ParseException {
		Token oldToken;
		if ((oldToken = token).next != null)
			token = token.next;
		else
			token = token.next = token_source.getNextToken();
		jj_ntk = -1;
		if (token.kind == kind) {
			jj_gen++;
			if (++jj_gc > 100) {
				jj_gc = 0;
				for (int i = 0; i < jj_2_rtns.length; i++) {
					JJCalls c = jj_2_rtns[i];
					while (c != null) {
						if (c.gen < jj_gen)
							c.first = null;
						c = c.next;
					}
				}
			}
			return token;
		}
		token = oldToken;
		jj_kind = kind;
		throw generateParseException();
	}

	static private final class LookaheadSuccess extends java.lang.Error {
	}

	static final private LookaheadSuccess jj_ls = new LookaheadSuccess();

	static private boolean jj_scan_token(int kind) {
		if (jj_scanpos == jj_lastpos) {
			jj_la--;
			if (jj_scanpos.next == null) {
				jj_lastpos = jj_scanpos = jj_scanpos.next = token_source
						.getNextToken();
			} else {
				jj_lastpos = jj_scanpos = jj_scanpos.next;
			}
		} else {
			jj_scanpos = jj_scanpos.next;
		}
		if (jj_rescan) {
			int i = 0;
			Token tok = token;
			while (tok != null && tok != jj_scanpos) {
				i++;
				tok = tok.next;
			}
			if (tok != null)
				jj_add_error_token(kind, i);
		}
		if (jj_scanpos.kind != kind)
			return true;
		if (jj_la == 0 && jj_scanpos == jj_lastpos)
			throw jj_ls;
		return false;
	}

	/** Get the next Token. */
	static final public Token getNextToken() {
		if (token.next != null)
			token = token.next;
		else
			token = token.next = token_source.getNextToken();
		jj_ntk = -1;
		jj_gen++;
		return token;
	}

	/** Get the specific Token. */
	static final public Token getToken(int index) {
		Token t = token;
		for (int i = 0; i < index; i++) {
			if (t.next != null)
				t = t.next;
			else
				t = t.next = token_source.getNextToken();
		}
		return t;
	}

	static private int jj_ntk() {
		if ((jj_nt = token.next) == null)
			return (jj_ntk = (token.next = token_source.getNextToken()).kind);
		else
			return (jj_ntk = jj_nt.kind);
	}

	static private java.util.List<int[]> jj_expentries = new java.util.ArrayList<int[]>();
	static private int[] jj_expentry;
	static private int jj_kind = -1;
	static private int[] jj_lasttokens = new int[100];
	static private int jj_endpos;

	static private void jj_add_error_token(int kind, int pos) {
		if (pos >= 100)
			return;
		if (pos == jj_endpos + 1) {
			jj_lasttokens[jj_endpos++] = kind;
		} else if (jj_endpos != 0) {
			jj_expentry = new int[jj_endpos];
			for (int i = 0; i < jj_endpos; i++) {
				jj_expentry[i] = jj_lasttokens[i];
			}
			jj_entries_loop: for (java.util.Iterator<?> it = jj_expentries
					.iterator(); it.hasNext();) {
				int[] oldentry = (int[]) (it.next());
				if (oldentry.length == jj_expentry.length) {
					for (int i = 0; i < jj_expentry.length; i++) {
						if (oldentry[i] != jj_expentry[i]) {
							continue jj_entries_loop;
						}
					}
					jj_expentries.add(jj_expentry);
					break jj_entries_loop;
				}
			}
			if (pos != 0)
				jj_lasttokens[(jj_endpos = pos) - 1] = kind;
		}
	}

	/** Generate ParseException. */
	static public ParseException generateParseException() {
		jj_expentries.clear();
		boolean[] la1tokens = new boolean[20];
		if (jj_kind >= 0) {
			la1tokens[jj_kind] = true;
			jj_kind = -1;
		}
		for (int i = 0; i < 8; i++) {
			if (jj_la1[i] == jj_gen) {
				for (int j = 0; j < 32; j++) {
					if ((jj_la1_0[i] & (1 << j)) != 0) {
						la1tokens[j] = true;
					}
				}
			}
		}
		for (int i = 0; i < 20; i++) {
			if (la1tokens[i]) {
				jj_expentry = new int[1];
				jj_expentry[0] = i;
				jj_expentries.add(jj_expentry);
			}
		}
		jj_endpos = 0;
		jj_rescan_token();
		jj_add_error_token(0, 0);
		int[][] exptokseq = new int[jj_expentries.size()][];
		for (int i = 0; i < jj_expentries.size(); i++) {
			exptokseq[i] = jj_expentries.get(i);
		}
		return new ParseException(token, exptokseq, tokenImage);
	}

	/** Enable tracing. */
	static final public void enable_tracing() {
	}

	/** Disable tracing. */
	static final public void disable_tracing() {
	}

	static private void jj_rescan_token() {
		jj_rescan = true;
		for (int i = 0; i < 2; i++) {
			try {
				JJCalls p = jj_2_rtns[i];
				do {
					if (p.gen > jj_gen) {
						jj_la = p.arg;
						jj_lastpos = jj_scanpos = p.first;
						switch (i) {
						case 0:
							jj_3_1();
							break;
						case 1:
							jj_3_2();
							break;
						}
					}
					p = p.next;
				} while (p != null);
			} catch (LookaheadSuccess ls) {
			}
		}
		jj_rescan = false;
	}

	static private void jj_save(int index, int xla) {
		JJCalls p = jj_2_rtns[index];
		while (p.gen > jj_gen) {
			if (p.next == null) {
				p = p.next = new JJCalls();
				break;
			}
			p = p.next;
		}
		p.gen = jj_gen + xla - jj_la;
		p.first = token;
		p.arg = xla;
	}

	static final class JJCalls {
		int gen;
		Token first;
		int arg;
		JJCalls next;
	}

}
