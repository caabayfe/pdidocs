/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
 async function handler({api, event, helpers, imports}) {

  var output = api.data.km_diagnostic_util.output;

  if(output){
    if(!output.isDomainSeparationActive){
      api.setState('typeLabel', await helpers.translate( "Type"));
      api.setState('domainSeparationLabel', await helpers.translate( "Domain Separation"));
      api.setState('resultLabel',  await helpers.translate("Result"));
      api.setState('userCriteriaLabel',  await helpers.translate("User Criteria"));
    }
    
    await buildUcTable(api,helpers,output);
    await buildDiagnosticSummaryInfo(api,helpers,output);

  }

  async function buildUcTable(api,helpers,output){
    var showUcTable = ((output.isDomainSeparationActive) || 
    (output.userCriteriaResults.summary != 0 &&
    (output.userCriteriaResults.results.length != 0 || 
    output.userCriteriaResults.summary == 4)));
    api.setState('showUcTable', showUcTable);
    if(showUcTable){
      await buildUcTableHeading(api,helpers,output)
      await buildUcTableNote(api,helpers,output);
      api.setState('accessTypeLabel',   await helpers.translate("Access Type"));
      api.setState('setOnLabel',  await helpers.translate("Set On"));
    }
  }

  async function buildUcTableHeading(api,helpers,output){
    var uc_heading = await helpers.translate("User Criteria");
    if(!output.isDomainSeparationActive){
      if(output.userCriteriaResults && output.userCriteriaResults.summary == "4") 
        uc_heading = await helpers.translate("How to Provide Access");
      else 
        uc_heading = await helpers.translate("User Criteria Assigned");
    }
    api.setState('ucTableHeading',uc_heading);
  }

  async function buildDiagnosticSummaryInfo(api,helpers,output){
    var diagnosticSummaryInfo;
    if(api.state.selectedRecordType === "one"){
      diagnosticSummaryInfo  =  await helpers.translate("If ACLs were applied to this Article, the ACLs will override the permissions defined by user criteria.");
      if(output.userCriteriaResults && output.userCriteriaResults.summary =="1"){
        diagnosticSummaryInfo += ' '+ await helpers.translate("The article\'s publication status may also impact the user\'s access to it. If diagnostic results conflict with the user\'s access, please check the publication status of the article.");
      }
    }else{
      diagnosticSummaryInfo = await helpers.translate("If ACLs were applied to this Knowledge Base, the ACLs will override the permissions defined by user criteria");
    }
    api.setState('diagnosticSummaryInfo', diagnosticSummaryInfo);
  }

  async function buildUcTableNote(api,helpers,output){
    var ucTableNote = {};
    const resultsLength = output.userCriteriaResults.results.length;
    const recordType = api.state.selectedRecordType;
    const username = output.links.username;
    if (resultsLength ==0 && recordType == "one") { 
      ucTableNote.part1 = await helpers.translate("To provide access to the knowledge article, add an appropriate user criteria to the") +" ";
      ucTableNote.part2 = await helpers.translate("knowledge base for")+" " + username + ".";
    } else if (resultsLength == 0 && recordType == "two") {
      ucTableNote.part1 = await helpers.translate("To provide access to the knowledge base, add an appropriate user criteria to the")+" ";
      ucTableNote.part2 = await helpers.translate("knowledge base for")+" " + username + ".";
    } else if (resultsLength == 4 && recordType == "one") { 
      ucTableNote.part1 = await helpers.translate("To provide access to article")+" " ;
      ucTableNote.part2 = ' ' +await helpers.translate("in knowledge base") +" ";
      ucTableNote.part3 = ', '+await helpers.translate("add")+" " + username + " "+ await helpers.translate("to one or more of the following user criteria set at article or knowledge base level.");
    } else if (resultsLength != 0 && recordType == "two") {
      ucTableNote.part1 = await helpers.translate("To provide access to knowledge base")+" (";
      ucTableNote.part2 = '), ' + await helpers.translate("add")+" "+ username +" "+ await helpers.translate("to one or more of the following user criteria.");
    }
    api.setState('ucTableNote', ucTableNote);
  }
}
