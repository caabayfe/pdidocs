var pageGR = new SPPageMapHelper().getPageGRFromColumnGR(current.sp_column.getRefRecord());
if (pageGR != null) {
	var url = "sp_page.do?sys_id=" + pageGR.sys_id;
	action.setRedirectURL(url);
} else {
	action.setRedirectURL(current);
	gs.addInfoMessage("This Rectangle does not have a valid Service Portal Page");
}
