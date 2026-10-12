var ScanComparisonUtil = Class.create();
ScanComparisonUtil.prototype = {
    constants: new sn_vsc.SecurityCenterConstants(),
    initialize: function() {},
    /*
     *
     *Input params (scanResult1 = first comparison result)
     *Input params (scanResult2 = second comparison result)
     *Check if comparison already exist, update user assignment respectively
     */
    lookForComparison: function(scanResult1, scanResult2) {
        var grR = new GlideRecord('scan_result');
        grR.get(scanResult1);
        var sr1 = grR.number;
        var gr2 = new GlideRecord('scan_result');
        gr2.get(scanResult2);
        var sr2 = gr2.number;
        var compId = sr1 + ',' + sr2;

        var grUser = new GlideRecord("sn_vsc_scan_comparisons");
        grUser.addQuery('scn_comp', compId);
        grUser.query();
        if (grUser.next()) { //Comparison found
            if (!grUser.scn_list.toString().includes(gs.getUserID())) {
                this.removeUserFromComparisons(gs.getUserID());
                if (grUser.scn_list.toString() != '') {
                    grUser.scn_list = grUser.scn_list.toString() + ',' + gs.getUserID();
                } else {
                    grUser.scn_list = gs.getUserID();
                }
                grUser.update();
            }
        } else { //Comparison not found
            this.compareWithUserId(scanResult1, scanResult2);
        }
    },

    /*
     *
     *Input params (timeStamp = dateTime for sys_created_on)
     *check if result exist for given timestamp
     */
    checkTableForResult: function(timeStamp) {
        var gdt = new GlideDateTime(timeStamp);
        var date = gdt.getDate();
        var gt = gdt.getTime();
        var time = gt.getByFormat('HH:mm:ss');
        var gr = new GlideRecord('scan_result');
        gr.addEncodedQuery("sys_created_onON" + date + "@javascript:gs.dateGenerate('" + date + "','" + time + "')@javascript:gs.dateGenerate('" + date + "','" + time + "')");
        gr.query();
        if (gr.next()) {
            return gr.sys_id;
        }
        return null;
    },

    /*
     *
     *Input params (userId = user running comparison)
     *Remove user from previous comparisons
     */
    removeUserFromComparisons: function(userId) {
        var gr = new GlideRecord("sn_vsc_scan_comparisons");
        var eQ = "scn_listLIKE" + userId;
        gr.addEncodedQuery(eQ);
        gr.query();
        while (gr.next()) {
            var Uarr = gr.scn_list.split(",");
            var index = Uarr.indexOf(userId.toString());
            if (index !== -1) {
                Uarr.splice(index, 1);
            }
            gr.scn_list = Uarr.toString();
            gr.update();
        }
    },

    /*
     *Input params (scanId = sysId of scan result)
     *Return Scan Result number
     */
    getScanNumber: function(scanId) {
        var gr = new GlideRecord('scan_result');
        gr.get('sys_id', scanId);
        gr.query();
        return gr.next() ? gr.number : null;
    },

    /*
     *Triggered upon Auditor Scan suite execution
     */
    defaultComparison: function() {
        var gr = new GlideRecord('scan_suite_execution');
        gr.addQuery('suite', this.constants.HardeningSuite);
        gr.orderByDesc('sys_created_on');
        gr.query();
        if (gr.getRowCount() > 1) {
            var count = 2;
            var suiteIds = [];
            while (gr.next() && count > 0) {
                count--;
                suiteIds.push(gr.result.toString());
            }
            var gU = new GlideRecord("sn_vsc_scan_comparisons");
            gU.addQuery('scn_default', true);
            gU.query();
            while (gU.next()) {
                gU.scn_default = false;
                gU.update();
            }
            var com = this.createScanComparison(suiteIds[1], suiteIds[0], " ", this.constants.HardeningSuite, true);
            var scan = com + ',' + suiteIds[1] + ',' + suiteIds[0];
            gs.eventQueue('sn_vsc.sec.scan.comparison', null, 'sn_vsc_changed_scan_findings', scan);
        }
    },

    /*
     *Input params (scanResult1 = first comparison result)
     *Input params (scanResult2 = second comparison result)
     *Run comparison for user
     */
    compareWithUserId: function(scanResult1, scanResult2) {
        var gr = new GlideRecord('scan_suite_execution');
        gr.get('result', scanResult1);

        //create new comparison
        var compare = this.createScanComparison(scanResult1, scanResult2, gs.getUserID(), gr.suite, false);
        var scan = compare + ',' + scanResult1 + ',' + scanResult2;
        gs.eventQueue('sn_vsc.sec.scan.comparison', null, 'sn_vsc_changed_scan_findings', scan);
    },

    /*
     *Input params (scanResult1 = first comparison result)
     *Input params (scanResult2 = second comparison result)
     *Input params (userId = Logged in user)
     *Input params (suite = sysId of suite)
     *Input params (isDefault = is this default comparison)
     *Create comparison records
     */
    createScanComparison: function(scanResult1, scanResult2, userId, suite, isDefault) {
        if (userId != " ") {
            this.removeUserFromComparisons(gs.getUserID());
        }
        var grR = new GlideRecord('scan_result');
        grR.get(scanResult1);
        var sr1 = grR.number;
        var gr2 = new GlideRecord('scan_result');
        gr2.get(scanResult2);
        var sr2 = gr2.number;
        var res = sr1 + ',' + sr2;
        var grC = new GlideRecord('sn_vsc_scan_comparisons');
        grC.initialize();
        grC.setValue("scn_comp", res);
        grC.setValue("scn_suite", suite);
        if (userId != "") {
            grC.setValue("scn_list", userId);
        }
        grC.setValue("scn_default", isDefault);
        grC.setValue("scn_status", 'progress');
        return grC.insert();
    },


    /*
     *Input params (scanResult1 = first comparison result)
     *Input params (scanResult2 = second comparison result)
     *Input params (compare = Comparison record)
     *Insert records
     */
    runComparison: function(scanResult1, scanResult2, compare, scan1, scan2) {
        var gFin = new GlideRecord('scan_finding');
        gFin.addQuery('result', scanResult1);
        gFin.query();
        while (gFin.next()) {
            var result = this.checkInResult(gFin.source, scanResult2);
            if (result) {
                var res = scan1 + ',' + scan2;
                this.insertComparison(gFin.sys_id, res, compare);
            } else {
                this.insertComparison(gFin.sys_id, this.getScanNumber(scanResult1), compare);
            }
        }
    },

    /*
     *Input params (scanResult1 = first comparison result)
     *Input params (scanResult2 = second comparison result)
     *Input params (compare = Comparison record)
     *Insert records into chnaged findings table
     */
    insertComparison: function(finding, result, compare) {
        var gInsert = new GlideRecord('sn_vsc_changed_scan_findings');
        gInsert.initialize();
        gInsert.fin_finding = finding;
        gInsert.fin_status = result;
        gInsert.fin_comp = compare;
        gInsert.insert();
    },

    /*
     *Input params (source = source of finding)
     *Input params (scanResult = result to compare)
     *Input params (compare = Comparison record)
     *Check if finding already exist in other result
     */
    checkInResult: function(source, scanResult) {
        var gFin = new GlideRecord('scan_finding');
        gFin.addQuery('result', scanResult);
        gFin.addQuery('source', source);
        gFin.query();
        if (gFin.next()) {
            return true;
        } else {
            return false;
        }
    },

    /*
     *Input params (uId = logged in user)
     *Assign default comparison to logged in user
     */
    loginEvent: function(uId) {
        var gC = new GlideRecord("sn_vsc_scan_comparisons");
        gC.query();
        if (gC.getRowCount() > 0) {
            this.removeUserFromComparisons(uId);
        }
    },

    /*
     *Input params (suiteId = sysId of scan suite)
     *Check if given suite has sc tag, or is child of suite with sc tag
     */
    isSCChildSuite: function(suiteId) {
        var grChildSuite = new GlideRecord("scan_check_suite_m2m");
        grChildSuite.addEncodedQuery("child_suite=" + suiteId, true);
        grChildSuite.query();
        if (!grChildSuite.next()) return false;
        var parentSuite = grChildSuite.getValue("parent_suite");
        var grSuite = new GlideRecord("scan_check_suite");
        grSuite.addEncodedQuery("sys_id=" + parentSuite + "^sys_tags.e97202ce1ba201100fbd1066b04bcb30=e97202ce1ba201100fbd1066b04bcb30", true);
        grSuite.query();
        if (!grSuite.next()) return false;
        return true;
    },

    /*
     *Input params (checkId = sysId of scan check)
     *Create security area record for scan check
     */
    createSecAreaRecord: function(checkId) {
        var gArea = new GlideRecord("sn_vsc_check_security_area");
        gArea.addQuery("cat_check", checkId);
        gArea.query();
        if (!gArea.next()) {
            gArea.initialize();
            gArea.setValue("cat_check", checkId);
            gArea.insert();
        }
    },

	/*
     *Input params (suiteId = sysId of scan suite)
     *Check if given suite is one of security center OOB suites
     */
    isSecCenterOOBSuite: function(suiteId) {
        if (this.constants.SC_OOB_SUITES.includes(suiteId)) return true;
        return false;
    },
    type: 'ScanComparisonUtil'
};
