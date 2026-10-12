gs.info('syncOrgFieldsToAssignedEntity: starting migration');

// Not dynamically fetching the tables as this the config OOB and will run during upgrade.
var fieldToTables = {
	"business_unit":"business_unit",
	"department":"cmn_department",
	"company":"core_company",
	"portfolio":"pm_portfolio"
}

var isPortfolioMgmtInstalled = GlidePluginManager.isActive('com.snc.portfolio_management');
var encodedQuery = '';

if(isPortfolioMgmtInstalled)
	encodedQuery ="business_unitISNOTEMPTY^ORcompanyISNOTEMPTY^ORdepartmentISNOTEMPTY^ORportfolioISNOTEMPTY^assigned_entity=";
else
	encodedQuery = "business_unitISNOTEMPTY^ORcompanyISNOTEMPTY^ORdepartmentISNOTEMPTY^assigned_entity=";


// query all goal records where org fields are populated and Assigned entity is empty
var gr = new GlideRecord('sn_gf_goal');
gr.addEncodedQuery(encodedQuery);
gr.query();

if(!gr.hasNext())
	gs.info('syncOrgFieldsToAssignedEntity: No record found to modify');
else
	gs.info('syncOrgFieldsToAssignedEntity: Total records found to modify: ' + gr.getRowCount());

//update the assigned entity field.
var count = 0;
while(gr.next()){
	 try{
		if (!gs.nil(gr.getValue('business_unit'))) {
			gr.setValue('assigned_entity_type', fieldToTables['business_unit']);
			gr.setValue('assigned_entity', gr.getValue('business_unit'));
		} else if (!gs.nil(gr.getValue('department'))) {
			gr.setValue('assigned_entity_type', fieldToTables['department']);
			gr.setValue('assigned_entity', gr.getValue('department'))
		} else if (!gs.nil(gr.getValue('company'))) {
			gr.setValue('assigned_entity_type', fieldToTables['company']);
			gr.setValue('assigned_entity', gr.getValue('company'))
		} else if (isPortfolioMgmtInstalled && !gs.nil(gr.getValue('portfolio'))) {
			gr.setValue('assigned_entity_type', fieldToTables['portfolio']);
			gr.setValue('assigned_entity', gr.getValue('portfolio'))
	    }
		if(!gs.nil(gr.getValue('assigned_entity'))){
			if(gr.update())
			  count++;
		}
	 }
	 catch(error){
		 gs.info('syncOrgFieldsToAssignedEntity: Failed to update Assigned Entity for Goals Record Id: ' + gr.getValue('sys_id') + ' Error: ' + JSON.stringify(error));
	 }
}

gs.info('syncOrgFieldsToAssignedEntity: Total records modified: ' + count);
gs.info('syncOrgFieldsToAssignedEntity: ending migration');
