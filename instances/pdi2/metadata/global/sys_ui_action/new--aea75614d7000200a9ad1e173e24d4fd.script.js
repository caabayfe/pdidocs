var con = new GlideRecord("sp_row");
if (parent.getRecordClassName() == "sp_container")
	con.sp_container = parent.sys_id;
else if (parent.getRecordClassName() == "sp_column")
	con.sp_column = parent.sys_id;
con.insert();
action.setRedirectURL(con);
