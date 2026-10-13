createJob();


function createJob(){
	
	var jobs = new GlideRecord('sysauto_script');
	jobs.initialize();
	jobs.name = 'Event Management -convert IT service';
	jobs.upgrade_safe = false;
	jobs.state = 0;        //READY
	jobs.run_type = 'periodically';
	jobs.run_period= new GlideDateTime('1970-01-01 00:30:00');
	
	jobs.script = 'gs.log(\'Starting job of convert to IT service\');'
	
	+'  gs.include(\'EvtMgmtConvertAndPopulateITService\');'
	+'  var EvtMgmtConvertAndPopulateITService=new EvtMgmtConvertAndPopulateITService();'
	
	+'  EvtMgmtConvertAndPopulateITService.execute("ServiceNow Event Management", 5);'
	+' gs.include(\'RemoveManualServiceMenue\');'
	+'var RemoveManualServiceMenue=new RemoveManualServiceMenue();'
	+'RemoveManualServiceMenue.execute();'
	+' var jobs = new GlideRecord(\'sysauto_script\');'
	+' jobs.addQuery("name", "Event Management -convert IT service");'
	+' jobs.query();'
	+' if (jobs.next()) {'
		+'    jobs.active = \'false\'; '
		+'    jobs.update(); '
		+'    gs.log(\'Deactivating convert IT service job after run\');}'
		+' gs.log(\'End job of convert to IT service\');';
		
		gs.log('1. Setting workflow to true before creating job of convert IT service job');
		var wf = session.setWorkflow(true);
		gs.log('2. Old workflow was ' + wf +' before creating job of convert IT service, current workflow is- '+ session.getWorkflow());
		
		var jobId= jobs.insert();
		
		session.setWorkflow(wf);
		
		gs.log('3. Setting workflow back to ' + wf +' before creating job of convert to IT service, current workflow after set is ' + session.getWorkflow());
		gs.log('convert to IT service- create job to convert to IT service, job id =' + jobId);
		
	}
