var con = new GlideRecord("sp_container");
con.sp_page = parent.sys_id;
var conID = con.insert();

var row = new GlideRecord("sp_row");
row.sp_container = conID;
var rowID = row.insert();

var col = new GlideRecord("sp_column");
col.sp_row = rowID;
col.insert();

action.setRedirectURL(con);
gs.addInfoMessage("New container created with first row and column");
