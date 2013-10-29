/**
 * ********************************************************
 * Routines for User-Interface management Copyright (C) 2009, 2010 Amit
 * Kumar(amitkriit@gmail.com)
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * ----------------------------- 
 * *2013-10-28 Amit Kumar (amitkriit@gmail.com)
 * changed verifyUser, it no longer prints user's password on login
 * -----------------------------
 **********************************************************
 */
package com.wanhive.basic.db;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

import com.wanhive.basic.beans.User;
import com.wanhive.basic.utils.licensing.MD5;

public class MenuManager {
    /*
     * verifyUser: verify user's ID and Password returns -1 on failure, user id
     * on success
     */

    public static User verifyUser(String name, String password) {
        User user = null;
        Connection conn = null;
        Statement stmt = null;
        ResultSet rst = null;
        try {
            /*
             * Do not print the password
             */
            System.out.println("Verifying User: " + name + ", Pass: ****");
            conn = DataSourceManager.newConnection();
            stmt = conn.createStatement();
            String encryptedPassword = MD5.encrypt(password);
            rst = stmt.executeQuery("select * from user where user_name='"
                    + name + "' and password='" + encryptedPassword + "'");
            while (rst.next()) {
                user = new User();
                user.setId(rst.getInt(1));
                user.setName(name);
                user.setFullName(rst.getString(4));
                user.setPassword(password);
                user.setTheme(rst.getString(7));
            }
        } catch (Exception e) {
            // e.printStackTrace();
            System.out.println("verifyUser: " + e.getMessage());
        } finally {
            // Close resources
            try {
                if (rst != null) {
                    rst.close();
                }
            } catch (Exception e) {
            }
            try {
                if (stmt != null) {
                    stmt.close();
                }
            } catch (Exception e) {
            }
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (Exception e) {
            }
        }
        return user;
    }

    /*-------------------------------------------------------------*/
    /*
     * Get the CallBack to be Loaded for a particular request
     */
    public static String appLink(int id, int userId) {
        String str = "";
        Connection conn = null;
        Statement stmt = null;
        ResultSet rst = null;
        System.out.println("Checking permissions for User: " + userId
                + " Menu Item:" + id);
        try {
            conn = DataSourceManager.newConnection();
            stmt = conn.createStatement();
            rst = stmt
                    .executeQuery("select appLink from menu where menu_id="
                    + id
                    + " and menu_id not in(select menu_id from menu_permission where user_id="
                    + userId + " and menu_id=" + id + ")");
            while (rst.next()) {
                str = rst.getString(1);
            }
        } catch (Exception e) {
            System.out.println("appLink: " + e.getMessage());
        } finally {
            // Close resources
            try {
                if (rst != null) {
                    rst.close();
                }
            } catch (Exception e) {
            }
            try {
                if (stmt != null) {
                    stmt.close();
                }
            } catch (Exception e) {
            }
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (Exception e) {
            }
        }
        System.out.println("appLink: " + str);
        return str;
    }

    /* ============================================================= */
    /*
     * Get Main Menu
     */
    public static String getMainMenu() {
        Connection conn = null;
        Statement stmt = null;
        ResultSet rst = null;
        String str = "<menu>\n";
        try {
            conn = DataSourceManager.newConnection();
            stmt = conn.createStatement();
            rst = stmt.executeQuery("select * from menu where menu_status=0");
            while (rst.next()) {
                str += "<menuitem id='" + rst.getInt(1) + "' parent='"
                        + rst.getInt(2) + "' name='" + rst.getString(3)
                        + "' description='" + rst.getString(4) + "' image='"
                        + rst.getString(5) + "' action='" + rst.getString(6)
                        + "' link='" + rst.getString(7) + "' width='"
                        + rst.getString(9) + "' />\n";
            }
        } catch (Exception e) {
            System.out.println("getMainMenu: " + e.getMessage());
        } finally {
            // Close resources
            try {
                if (rst != null) {
                    rst.close();
                }
            } catch (Exception e) {
            }
            try {
                if (stmt != null) {
                    stmt.close();
                }
            } catch (Exception e) {
            }
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (Exception e) {
            }
        }
        str += "</menu>\n";
        // System.out.println(str);
        return str;
    }

    /*-------------------------------------------------------------*/
    /*
     * Get User Permissions for main menu
     */
    public static String getMainMenuPermissions(int id) // pass User Id
    {
        Connection conn = null;
        Statement stmt = null;
        ResultSet rst = null;
        String str = "<permissions>\n";
        try {
            conn = DataSourceManager.newConnection();
            stmt = conn.createStatement();
            rst = stmt
                    .executeQuery("select menu_id from menu_permission where user_id="
                    + id
                    + " and status=0 and menu_id in (select menu_id from menu where menu_status=0)");
            while (rst.next()) {
                str += "<access id='" + rst.getInt(1) + "' />\n";
            }
        } catch (Exception e) {
            System.out.println("getMainMenuPermissions: " + e.getMessage());
        } finally {
            // Close resources
            try {
                if (rst != null) {
                    rst.close();
                }
            } catch (Exception e) {
            }
            try {
                if (stmt != null) {
                    stmt.close();
                }
            } catch (Exception e) {
            }
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (Exception e) {
            }
        }
        str += "</permissions>\n";
        return str;
    }

    /* ============================================================= */
    /*
     * Manage Favourites
     */
    public static String getFavourites(int user, int count) {
        Connection conn = null;
        Statement stmt = null;
        ResultSet rst = null;

        String str = "<table bgcolor=\"#ECECD9\" bordercolor=\"#B7B76A\" border=\"0\" cellpadding=\"2\" cellspacing=\"0\" width=\"100%\">\n";
        str += "<tr><td width=\"16\" bgcolor=\"#61583A\">&nbsp;</td><td bgcolor=\"#61583A\"><b><font color=\"#ffffff\">Your&nbsp;Favourites</font></b></td></tr>\n";
        //System.out.println("Getting Favourites list for: " + user);
        int favsCount = 0;
        try {
            conn = DataSourceManager.newConnection();
            stmt = conn.createStatement();
            rst = stmt
                    .executeQuery("select favouritelinks.menu_id,favouritelinks.count,menu.menu_name,menu.menu_description,menu.menu_action,menu.menu_image from favouritelinks,menu where favouritelinks.menu_id=menu.menu_id and menu.menu_status=0 and favouritelinks.user_id="
                    + user
                    + " and favouritelinks.menu_id not in (select menu_id from menu_permission where user_id="
                    + user
                    + " and status=0) order by 2 desc limit 0, "
                    + count);
            String imageText = "";
            String actionTest = "void(0)";
            while (rst.next()) {
                favsCount++;
                if (rst.getString(6) == null
                        || rst.getString(6).equalsIgnoreCase("")) {
                    imageText = "&nbsp;";
                } else {
                    imageText = "<img src='" + rst.getString(6) + "'>";
                }
                if (rst.getString(5) == null
                        || rst.getString(5).equalsIgnoreCase("")) {
                    actionTest = "void(0)";
                } else {
                    actionTest = rst.getString(5);
                }
                str += "<tr><td width=\"16\" bgcolor=\"#B7B76A\">" + imageText
                        + "</td><td><a href='javascript:void(0)' onclick='"
                        + actionTest + "' title='" + rst.getString(4)
                        + "'><font color=\"#121212\">" + rst.getString(3)
                        + "</font></a></td></tr>\n";
            }
        } catch (Exception e) {
            System.out.println("getFavourites: " + e.getMessage());
        } finally {
            // Close resources
            try {
                if (rst != null) {
                    rst.close();
                }
            } catch (Exception e) {
            }
            try {
                if (stmt != null) {
                    stmt.close();
                }
            } catch (Exception e) {
            }
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (Exception e) {
            }
        }
        if (favsCount == 0) {
            str += "<tr><td>&nbsp;</td><td>Your list of favourites is empty</td></tr>";
        }
        str += "</table>\n";
        return str;
    }

    /*-------------------------------------------------------------*/
    /*
     * Create BreadCrumb
     */
    public static String breadcrumb(int id, int user) {
        Connection conn = null;
        Statement stmt = null;
        ResultSet rst = null;

        String str = "";
        String actionStr = "";
        // String linkStr="";
        class Tmp {

            Tmp(String name, int id, int pid) {
                this.name = name;
                // this.id=id;
                this.pid = pid;
            }
            String name;
            // int id;
            int pid;
        }
        try {
            conn = DataSourceManager.newConnection();
            stmt = conn.createStatement();
            rst = stmt
                    .executeQuery("select menu_id,menu_parent_id,menu_name,menu_action,menu_link from menu where menu_status=0 and menu_id<="
                    + id);
            Map<Integer, Tmp> map = new HashMap<Integer, Tmp>();

            while (rst.next()) {
                map.put(rst.getInt(1), new Tmp(rst.getString(3), rst.getInt(1),
                        rst.getInt(2)));
                if (id == rst.getInt(1)) {
                    actionStr = rst.getString(4);
                    // linkStr=rst.getString(5);
                }
            }

            int tmpId = id;
            while (tmpId != 1) {
                Tmp t = map.get(new Integer(tmpId));
                String navText = t.name;

                if (tmpId != id) {
                    str = navText
                            + "<small>&nbsp;<font color=\"#CA0000\">&gt;&gt;</font></small>"
                            + str;
                } else {
                    str = navText + str;
                    // str[1]=t.help;
                }
                tmpId = t.pid;
            }
        } catch (Exception e) {
            System.out.println("breadcrumb: " + e.getMessage());
        } finally {
            // Close resources
            try {
                if (rst != null) {
                    rst.close();
                }
            } catch (Exception e) {
            }
            try {
                if (stmt != null) {
                    stmt.close();
                }
            } catch (Exception e) {
            }
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (Exception e) {
            }
        }

        // String
        // reloadStr="<table class=\"coolBar\"><tr>"+"<td class=\"coolButton\" onClick='"+actionStr+"'><img src=\"themes/icons/icon_reset.gif\"> <b>Reload&nbsp;</b></td>";
        // String
        // helpStr="<td class=\"coolButton\" onClick=\"spawnHelp("+id+")\"><img src=\"themes/icons/icon_info.gif\"> <b>&nbsp;Help</b></td></tr></table>";
        String reloadStr = "<input class='navBarButton1' type='button' value='Reload' onClick='"
                + actionStr + "' />";
        String helpStr = "<input class='navBarButton2' type='button' value='Help' onClick=\"spawnHelp("
                + id + ")\" />";

        String ResponseString = "<table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"breadcrumbTable\"><tr><td>"
                + "&nbsp;Navigation: <font color=\"#345678\"><i>"
                + str
                + "</i></font></td>"
                + "<td align=\"right\">"
                + reloadStr
                + helpStr + "</td></tr></table>";
        // System.out.println("Replacing &amp; with &");
        actionStr = actionStr.replaceAll("&amp;", "&");
        // System.out.println("@@@@@ActionStr: "+actionStr);
        // ResponseString+="<script type=\"text/javascript\">\n"+actionStr+"\n</script>";
        updateFavourites(user, id);
        return ResponseString;
    }

    private static void updateFavourites(int user, int path) {
        Connection conn = null;
        Statement stmt = null;
        ResultSet rst = null;
        int count = 0;
        try {
            conn = DataSourceManager.newConnection();
            stmt = conn.createStatement();
            rst = stmt
                    .executeQuery("select count from favouritelinks where menu_id="
                    + path + " and user_id=" + user);
            while (rst.next()) {
                count = rst.getInt(1);
            }

            if (count == 0) {
                stmt.execute("insert into favouritelinks (menu_id,user_id) values ("
                        + path + "," + user + ")");
            } else {
                stmt.executeUpdate("update favouritelinks set count="
                        + (count + 1) + " where menu_id=" + path
                        + " and user_id=" + user);
            }
        } catch (Exception e) {
            System.out.println("updateFavourites: " + e.getMessage());
        } finally {
            // Close resources
            try {
                if (rst != null) {
                    rst.close();
                }
            } catch (Exception e) {
            }
            try {
                if (stmt != null) {
                    stmt.close();
                }
            } catch (Exception e) {
            }
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (Exception e) {
            }
        }
    }

    /* ============================================================= */
    /*
     * Selects Help Page for selected section
     */
    public static String helpLink(int id) {
        String str = "";
        Connection conn = null;
        Statement stmt = null;
        ResultSet rst = null;
        try {
            conn = DataSourceManager.newConnection();
            stmt = conn.createStatement();
            rst = stmt
                    .executeQuery("select help from menu where menu_status=0 and menu_id="
                    + id);
            while (rst.next()) {
                str = rst.getString(1);
            }
            try {
                rst.close();
            } catch (Exception e) {
            }
            try {
                stmt.close();
            } catch (Exception e) {
            }
        } catch (Exception e) {
            System.out.println("helpLink: " + e.getMessage());
        } finally {
            // Close resources
            try {
                if (rst != null) {
                    rst.close();
                }
            } catch (Exception e) {
            }
            try {
                if (stmt != null) {
                    stmt.close();
                }
            } catch (Exception e) {
            }
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (Exception e) {
            }
        }
        return str;
    }

    /* ============================================================= */
    /*
     * Get Context Menu items
     */
    public static String getContextMenu(int menuParentId, int userId,
            Connection conn) {
        // Connection conn=null;
        Statement stmt = null;
        ResultSet rst = null;
        boolean isFirstLevel = (conn == null); // we pass the same connection in
        // recursive calls
        String str = "";
        if (isFirstLevel) {
            str += "<menu>\n";
        }
        try {
            // We need to create a new connection at the first level
            if (isFirstLevel) {
                conn = DataSourceManager.newConnection();
            }
            stmt = conn.createStatement();
            rst = stmt
                    .executeQuery("select* from (select * from menu where menu_parent_id="
                    + menuParentId
                    + " and menu_status=3) as a left join (select menu_id from menu_permission where user_id="
                    + userId + ") as b on a.menu_id=b.menu_id");
            while (rst.next()) {
                int currentId = rst.getInt(1);
                str += "<menuitem id='" + currentId + "' parent='"
                        + rst.getInt(2) + "' name='" + rst.getString(3)
                        + "' description='" + rst.getString(4) + "' image='"
                        + rst.getString(5) + "' action='" + rst.getString(6)
                        + "' link='" + rst.getString(7) + "' status='"
                        + rst.getString(8) + "' width='" + rst.getString(9)
                        + "' permission='" + rst.getInt(12) + "' />\n";
                if (currentId != 1) {
                    str += getContextMenu(currentId, userId, conn);
                }
            }
        } catch (Exception e) {
            System.out.println("getMenu: " + e.getMessage());
        } finally {
            // Close resources
            try {
                if (rst != null) {
                    rst.close();
                }
            } catch (Exception e) {
            }
            try {
                if (stmt != null) {
                    stmt.close();
                }
            } catch (Exception e) {
            }
            try {
                if (isFirstLevel && conn != null) {
                    conn.close();
                }
            } catch (Exception e) {
            }
        }
        if (isFirstLevel) {
            str += "</menu>\n";
            // System.out.println(str);
        }
        return str;
    }
}