var codeSigningAPI = new sn_cs_ns.CodeSigningAPI();
gs.info("Scan Instance Signatures, started scanning the instance signatures.");
var success = codeSigningAPI.scanAllSignaturesAndCreateReport("sysauto_script", current.sys_id);
if (success == true)
	gs.info("Scan Instance Signatures, successfully scanned instance signatures.");
else
	gs.info('Scan Instance Signatures, failed to scan instance signatures...Please check the Code Signing log for more details.');
