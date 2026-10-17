/**
 *   parm1 - comma-separated list of table names loaded from update set
 *   parm2 - unused
 */
if (event.parm1.includes('sys_atf_test')) {
	new sn_atf.TestSuiteProcessor().refreshAllTestSuites();
}
