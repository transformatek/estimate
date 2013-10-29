package com.wanhive.basic.web;

import java.io.IOException;
import java.util.Date;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.wanhive.basic.utils.licensing.Application;
import com.wanhive.basic.utils.logger.SystemLogger;


/**
 * Servlet Filter implementation class AccessControlFilter
 */
public class AccessControlFilter implements Filter {

    /**
     * Default constructor. 
     */
    public AccessControlFilter() {
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see Filter#destroy()
	 */
	public void destroy() {
		// TODO Auto-generated method stub
	}

	/**
	 * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
	 */
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest req=(HttpServletRequest) request;
		HttpServletResponse res=(HttpServletResponse) response;
		String message=req.getRemoteHost() + " tried to access " + req.getRequestURL() + " on "+new Date() + ".";
		Application.writeLog(message, SystemLogger.WARN);
		//Block direct Access
		res.sendRedirect("defaultContent.jsp");
		// pass the request along the filter chain
		chain.doFilter(request, response);
	}

	/**
	 * @see Filter#init(FilterConfig)
	 */
	public void init(FilterConfig fConfig) throws ServletException {
		// TODO Auto-generated method stub
	}

}
