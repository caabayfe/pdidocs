gs.debug('Process PIWB batch test: script action: START');
var data = new JSON().decode(event.parm2);
var user = data.input_config.run_by;
gs.getSession().impersonate(user);
new PIWBMLTestingAPI().processBatchPredictionEvent(event.parm1, new JSON().decode(event.parm2));
gs.debug('Process PIWB batch test: script action: END');
