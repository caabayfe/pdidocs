var stageMgr = new WFStageSet();

// Set an initial stagemap value into the new workflow version itf this is a 
// insert. 
//
if (current.isNewRecord())
	current.activity_stages = '{}';

// 1. looks in the current version for stages already saved to wf_stage, then
// 2. looks in the current table to see if any stages already in use, then
// 3. looks to the defaults declared for the table 
// --- inserts into wf_stage any discovered stages that are not already in wf_stage for
//     the current version.
//
if (current.table.changes() || current.stage_field.changes())
    stageMgr.findExistingStages(current.getUniqueValue());

//  If the table has stage set associated with it then 
//    Use that stage set to populate wf_stage entries for the new record
//
createDefaultStages();


// Collect the default stages associated with table and 
// copy them into the version's stage list
//
function createDefaultStages() {
    var found = false;
    var tablesetGR = new GlideRecord('stage_set_table');
    if (tablesetGR.get('table', current.table)) {
        found = true;
        copyStages(tablesetGR.set+'');
    }
    return found;
}

function copyStages(setId) {
    var stageGR = new GlideRecord('wf_stage');
    var gr = new GlideRecord('stage_set_entry');
    gr.addQuery('set', setId);
    gr.query();

    while (gr.next()) {
        if (stageMgr.isExisting(gr.value))
            continue;
        stageMgr.cloneStage(stageGR, gr, current.getUniqueValue());
    }
}
