var con = new GlideRecord("sp_column");
con.sp_row = parent.sys_id;
con.insert();
action.setRedirectURL(con);
