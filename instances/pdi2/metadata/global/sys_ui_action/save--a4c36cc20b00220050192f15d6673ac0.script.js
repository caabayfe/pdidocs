action.setRedirectURL(current);
current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
new sn_atf.TestSuiteProcessor().refreshTestSuite(current.getValue("sys_id"), true);
