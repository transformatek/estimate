/* Generated By:JJTree&JavaCC: Do not edit this line. ParserConstants.java */
package com.wanhive.basic.arithexp;


/**
 * Token literal values and constants.
 * Generated by org.javacc.parser.OtherFilesGen#start()
 */
public interface ParserConstants {

  /** End of File. */
  int EOF = 0;
  /** RegularExpression Id. */
  int SINGLE_LINE_COMMENT = 6;
  /** RegularExpression Id. */
  int SC = 7;
  /** RegularExpression Id. */
  int LP = 8;
  /** RegularExpression Id. */
  int RP = 9;
  /** RegularExpression Id. */
  int NUMBER = 10;
  /** RegularExpression Id. */
  int DIGITS = 11;
  /** RegularExpression Id. */
  int PLUS = 12;
  /** RegularExpression Id. */
  int MINUS = 13;
  /** RegularExpression Id. */
  int MULT = 14;
  /** RegularExpression Id. */
  int DIV = 15;
  /** RegularExpression Id. */
  int MEM = 16;
  /** RegularExpression Id. */
  int QUOTE = 17;
  /** RegularExpression Id. */
  int DQUOTE = 18;
  /** RegularExpression Id. */
  int QUIT = 19;

  /** Lexical state. */
  int DEFAULT = 0;

  /** Literal token values. */
  String[] tokenImage = {
    "<EOF>",
    "\" \"",
    "\"\\t\"",
    "\"\\r\"",
    "\"\\f\"",
    "\"\\n\"",
    "<SINGLE_LINE_COMMENT>",
    "\";\"",
    "\"(\"",
    "\")\"",
    "<NUMBER>",
    "<DIGITS>",
    "\"+\"",
    "\"-\"",
    "\"*\"",
    "\"/\"",
    "\"$\"",
    "\"\\\'\"",
    "\"\\\"\"",
    "\"q\"",
  };

}
