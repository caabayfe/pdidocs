var res = [];
var counter;

var decorate = function(gr) {
    gr.setWorkflow(false);
    gr.setUseEngines(false);
};

gs.setProperty('sa.service_modeling.use',true);

gs.log('1. Updating sa_rel_to_infra_path...');
counter = processRelToInfraPath();
gs.log('        ' + counter + ' items processed.');
gs.log('2. Collect traffic based and hidden connections...');
counter = searchTrafficBasedAndHidden(res);
gs.log('        ' + counter[0] + ' hidden and ' + counter[1] + ' traffic based connections processed.');
gs.log('3. Collect manual connections...');
counter = searchManual(res);
gs.log('        ' + counter + ' connections processed.');
gs.log('4. Building qualifiers and splitting relations...');

for (i = 0; i < res.length; i++)
    splitRelation(res[i]);

gs.log('Done.');

scheduleLazyUpgrade();

//gs.log('5. Recalculating all business services...');
//recalculateAllBusinessServices();
//gs.log('Done.');
gs.log('6. Updating endpoint status table...');
upgradeEndpointStatusTable();
gs.log('7. Deleting boundaries related list entry...');
deleteBoundariesRelatedListEntry();
gs.log('Done.');
gs.log('8. Importing existing impact rules...');
importImpactRules();
gs.log('Done.');


//This must be done to avoid automatic grayout
//of services after upgrade.
function upgradeEndpointStatusTable() {
    var dbu = new GlideDBUpdate('sa_endpoint_status');
    dbu.setMultiple(true);
    dbu.setValue('origin','UPGRADE');
    dbu.execute();
    dbu.close();
}

// Delete the boundary related list entry from the business service screen
function deleteBoundariesRelatedListEntry() {
    var gr = new GlideRecord('sys_ui_related_list_entry');
    gr.get('36066c119312020056f8f179077ffbfc');
    if (gr.isValid())
        gr.deleteRecord();
}

function recalculateAllBusinessServices() {
    var modelManager = new SNC.ServiceModelingIntegrationManager();
    var gr = new GlideRecord('cmdb_ci_service_discovered');
    gr.query();
    var grBs;
    var bsSysId;
    while(gr.next()) {
        grBs = new GlideRecord('cmdb_ci_service_discovered');
        bsSysId = gr.getUniqueValue();
        if (grBs.get(bsSysId)) {
            gs.log('Synchronization of business service ' + gr.getValue('name') + ' ...');
            modelManager.syncBusinessService(grBs);
            modelManager.modifyBusinessService(grBs);
            processExternalQualifiers(bsSysId);
            gs.log('Done.');
        }
    }
}

function processExternalQualifiers (bsSysId) {
    var smUtils = SNC.ServiceModelingIntegrationManager.newServiceModelingUtils();
    var ctx = smUtils.getContext(bsSysId, 'Template', true);
    var model = ctx.getModel();
    if (model === null)
        return;
    var elementList = model.filterElementsWithQualifier('cmdb_ci_qualifier_external_connection');
    for(var i = 0; i < elementList.size(); i++)
        elementList.get(i).markAsBoundaryConnection();
    if (elementList.size() > 0)
        ctx.checkInChanges(true);
    else
        ctx.abandonChanges();
}


//This function splits relation by inserting qualifier it the middle
//relData : array
//             0 - source relation sysId
//             1 - sysClassName of qualifier to insert
function splitRelation(relData) {

    var relSysId = relData[0];
    var qualifierClassName = relData[1];

    var gr = new GlideRecord('cmdb_rel_ci');
    if (gr.get(relSysId)) {
        decorate(gr);

        var parent   = gr.parent;
        var child   = gr.child;
        var relType = gr.type;

        var grQualifier = new GlideRecord(qualifierClassName);
        decorate(grQualifier);
        grQualifier.setValue('discovery_source','ServiceWatch');
        var qualifierSysId = grQualifier.insert();

        var newRelSysId = insertNewRelation(parent, qualifierSysId, relType);
        insertNewRelation(qualifierSysId, child, relType);

        var grRelToInfraPath = new GlideRecord('sa_rel_to_infra_path');
        decorate(grRelToInfraPath);
        grRelToInfraPath.addQuery('relation_id', relSysId);
        grRelToInfraPath.query();
        if (grRelToInfraPath.hasNext()) {
            grRelToInfraPath.setValue('relation_id', newRelSysId);
            grRelToInfraPath.updateMultiple();
        }

        gr = new GlideRecord('cmdb_rel_ci');
        gr.get(relSysId);
        decorate(gr);
        gr.deleteRecord();
    }

}

function insertNewRelation(parent, child, type) {
    var grNewRel = new GlideRecord('cmdb_rel_ci');
    decorate(grNewRel);
    grNewRel.setValue('parent', parent);
    grNewRel.setValue('child', child);
    grNewRel.setValue('type', type);
    return grNewRel.insert();
}

//This function for each rel_to_infra_path record initialises
//fields source_ci and target_ci
function processRelToInfraPath() {
    var counter = 0;
    var gr = new GlideRecord('sa_rel_to_infra_path');
    gr.query();
    while(gr.next()) {
        gr.setValue('source_ci', gr.relation_id.parent);
        gr.setValue('target_ci', gr.relation_id.child);
        gr.update();
        counter++;
    }
    return counter;
}

//This function searches traffic based and hidden connections according to
//sa_rel_attr table, 'content' field.
//If it contains word 'hidden', relation is hidden
//If it contains "port" : "..." (json) and port is not empty (search is done with regex),
//relation is traffic based.
function searchTrafficBasedAndHidden(res) {

    var content;
    var reg = /\S*\"port\"\s*:\s*\"(\d*)\"/;
    var match;
    var port;
    var counter = [0, 0];


    var gr = new GlideRecord('sa_rel_attr');
    gr.query();

    while (gr.next()) {
        content = gr.getValue('content');
        if (isEmpty(content))
            continue;
        if (content.indexOf('hidden') > -1) {
            res.push([gr.getValue('cmdb_rel_ci'), 'cmdb_ci_qualifier_hidden_conn']);
            counter[0]++;
        }
        //       else {
        //           match=reg.exec(content);
        //           if (match === null)
        //               continue;
        //           port = parseInt(match[1]);
        //           if (isNaN(port))
        //               continue;
        //           res.push([gr.getValue('cmdb_rel_ci'), 'cmdb_ci_qualifier_traffic_based_connection']);
        //           counter[1]++;
        //       }
    }
    return counter;
}

//This function searches for manual connections by content of sa_manual_connections DB table
function searchManual(res) {
    var counter = 0;
    var grRel;
    var gr = new GlideRecord('sa_manual_connections');
    gr.query();

    while (gr.next()) {
        grRel = new GlideRecord('cmdb_rel_ci');
        grRel.addQuery('parent', gr.getValue('source_ci'));
        grRel.addQuery('child' , gr.getValue('endpoint'));
        grRel.addQuery('type', 'e7490a74532221007c949096a11c08b2'); //USE EP relation type SYS ID
        grRel.query();
        if (grRel.next()) {
            res.push([grRel.getUniqueValue(), 'cmdb_ci_qualifier_manual_connection']);
            counter++;
        }
    }
    return counter;
}

function isEmpty(value){
    return (value == null || value.length === 0);
}

function importImpactRules(){

    //get properties
    var grProp = new GlideRecord("sys_properties");
    var qcProp = grProp.addQuery("name", "evt_mgmt.import_rules_max_bs_count");
    qcProp.addOrCondition("name", "evt_mgmt.import_rules_min_alerts_count");
    qcProp.addOrCondition("name", "evt_mgmt.force_import_rules_legacy_use");
    qcProp.addOrCondition("name", "evt_mgmt.dont_import_rules_by_job");   
    grProp.query();
    var maxBsCount = 100;
    var minAlertsCount = 100;
    var forceLegacyUse = false;
    var dontImportRules = false;
    while (grProp.next()) {
        if (grProp.getValue("name") == 'evt_mgmt.import_rules_max_bs_count')
            maxBsCount = grProp.getValue("value");
        else if (grProp.getValue("name") == 'evt_mgmt.import_rules_min_alerts_count')
            minAlertsCount = grProp.getValue("value");
        else if (grProp.getValue("name") == 'evt_mgmt.force_import_rules_legacy_use')
            forceLegacyUse = (grProp.getValue("value") === "true");
        else if (grProp.getValue("name") == 'evt_mgmt.dont_import_rules_by_job')
            dontImportRules = (grProp.getValue("value") === "true");
    }
                
	var impactManager = new SNC.ImpactManager();

	//check rather there are less then 100 bs or more then 100 alerts (=> using EM or not many bs)
	if (useLegacyImport(maxBsCount, minAlertsCount, forceLegacyUse)) { //legacy calculation
		 gs.log('Import impact rules- using Legacy Import');

		var grServices = new GlideRecord('cmdb_ci_service_discovered');
		if (!grServices.isValid())
			return;
		grServices.query();
		while (grServices.next()) {
			var bsId = grServices.getUniqueValue();
			gs.log('importing impact rules for business service: ' + bsId);
			impactManager.importAllImpactRulesWhileMappingUpgrade(grServices.getUniqueValue());
		}
    } else {
		//check rather em is instaled, there are bs and dont_import_rules isn't turn on
		if (shouldImportImpactRule(dontImportRules)) {
			gs.log('Import impact rules- using job to import impact rules');

			//disable impact job
			impactManager.enableImpactCalculation(false);

			//create job that runs import and then runs impact job
			createJob();
		}
	}
}

function createJob(){

    var jobs = new GlideRecord('sysauto_script');
    jobs.initialize();
    jobs.name = 'Event Management -Import impact rules';
    jobs.upgrade_safe = false;
    jobs.state = 0;        //READY
    jobs.run_type = 'periodically';
	jobs.run_period= new GlideDateTime('1970-01-01 00:30:00');

    jobs.script = 'gs.log(\'Starting job of Import impact rules\');'
                  +'  var impactManager = new SNC.ImpactManager();'
                  +'  impactManager.enableImpactCalculation(false);'
                  +'  var gr = new GlideRecord(\'cmdb_ci_service_discovered\');'
                  +'      if (gr.isValid()) {'
                  +'  gr.query();'
                  +'  while (gr.next()) {'
                  +'      var bsId = gr.getUniqueValue();'
                  +'      gs.log(\'importing impact rules for business service: \' + bsId );'
                  +'      impactManager.importAllImpactRulesWhileMappingUpgrade(gr.getUniqueValue());'
                  +'  }}'
                  +'  impactManager.enableImpactCalculation(true);'
				  +' var jobs = new GlideRecord(\'sysauto_script\');'
				  +' jobs.addQuery("name", "Event Management -Import impact rules");'
				  +' jobs.query();'
				  +' if (jobs.next()) {'
				  +'    jobs.active = \'false\'; '	
				  +'    jobs.update(); '		
				  +'    gs.log(\'Deactivating import impact rule job after run\');}'
				  +' gs.log(\'End job of Import impact rules\');';

	gs.log('1. Setting workflow to true before creating job of Import impact rules');
	var wf = session.setWorkflow(true);
	gs.log('2. Old workflow was ' + wf +' before creating job of Import impact rules, current workflow is- '+ session.getWorkflow());

    var jobId= jobs.insert();

	session.setWorkflow(wf);
	
	gs.log('3. Setting workflow back to ' + wf +' before creating job of Import impact rules, current workflow after set is ' + session.getWorkflow());
    gs.log('Import impact rules- create job to import impact rules, job id =' + jobId);

}


function shouldImportImpactRule(dontImportRules) {

    if (dontImportRules) {
        gs.log('Import impact rules- evt_mgmt.dont_import_rules property is set to false, no need to import EM rules');
        return false; 
    }

    var grImapctRules = new GlideRecord('em_impact_rule');
    if (!grImapctRules.isValid()) {
        gs.log('Import impact rules- no EM plugin, no need to import EM rules');
        return false;
    }
    
    var impactManager = new SNC.ImpactManager();
    var grServices = new GlideRecord('cmdb_ci_service_discovered');
    if (!grServices.isValid()) {
        gs.log('Import impact rules- no discovered table, no need to import EM rules');
        return false; 
    }
    
	grServices.query();
    if (!(grServices.next())) {
        gs.log('Import impact rules- no discovered services, no need to import EM rules');
        return false;
    }
    
    if (impactManager.isDefaultRulesExist(grServices.getUniqueValue())) {
        gs.log('Import impact rules- impact rules allready exists, no need to import EM rules');
		return false;  
    }

    return true;        
}

function useLegacyImport(maxBsCount, minAlertsCount,forceLegacyUse) {

    if (forceLegacyUse) {
        gs.log('Import impact rules- using Legacy Import, evt_mgmt.force_import_rules_legacy_use is set to true');
        return true;
    }

    var grBS = new GlideRecord('cmdb_ci_service_discovered');
    if (!grBS.isValid())
        return true;
    grBS.query();
            
    //check num of services
    var numOfServices = grBS.getRowCount();
    if (numOfServices < maxBsCount) {
        gs.log('Import impact rules- using Legacy Import, less then ' + maxBsCount + ' bs.');  
        return true;          
    }
            
    //check num of alerts
    var grAlert = new GlideRecord('em_alert');
    if (!grAlert.isValid())
        return false; //no alert table means there are no alerts
    grAlert.query();
    var numOfAlerts = grAlert.getRowCount();
    if (numOfAlerts > minAlertsCount) {
        gs.log('Import impact rules- using Legacy Import, more then ' + minAlertsCount + ' alerts.');  
        return true;          
    }

    return false;

}

function scheduleLazyUpgrade() {
    var gr = new GlideRecord('cmdb_ci_service_discovered');
    if (!gr.isValid())
        return;
    gr.query();
    while (gr.next()) {
        var grAttr = new GlideRecord('sa_ci_attr');
        grAttr.setValue('cmdb_ci', gr.getUniqueValue());
        grAttr.setValue('content', '{"RecomputeOnFirstShow":"true","ProcessBoundaries":"true"}');
        grAttr.insert();
	}
}
