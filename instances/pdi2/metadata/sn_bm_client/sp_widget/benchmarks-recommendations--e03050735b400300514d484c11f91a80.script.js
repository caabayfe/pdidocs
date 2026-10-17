function updateState(mgr, recoId, state) {
  var result = {success: false};
  var activity = null;

  if (gs.nil(recoId))
    return result;

  if (state === 'accepted')
    activity = mgr.accept(recoId);

  else if (state === 'rejected')
    activity = mgr.reject(recoId);

  else if (state === 'implemented')
    activity = mgr.setImplemented(recoId);

  if (!gs.nil(activity))
    result = {success: true, activity: activity};

  return result;
}



(function() {
  /* translated messages */
  data.messages = {
    confirmReject: gs.getMessage('This will remove the recommendation permanently and you will not see this in current or future recommendation list.'),
    implementAcknowledgement: gs.getMessage('This recommendation will move to the implemented tab and will be accessible there.'),
	cim: {
		associateSuccess: gs.getMessage('{0} has been successfully associated'),
		removeSuccess: gs.getMessage('{0} has been successfully removed'),

		url: gs.getMessage('For more details, please visit the following URL: {0}'),
		existingCIM: gs.getMessage('Select existing CIM')
	}
  };
  options.maxResults = 5;

  data.cimEnabled    = GlidePluginManager.isActive('com.sn_cim');
  var gr = new GlideRecord('sn_cim_register');
  data.canCreateCIM  = gr.isValid() && gr.canCreate();
  data.canReadCIM    = gr.isValid() && gr.canRead();
  if (data.cimEnabled)
    data.INITIATIVE_STATES = sn_cim.Constants.register.states;

  var mgr = new RecommendationManager();

  if (!input) {
    var indicatorId = $sp.getParameter('iid');
    data.indicatorId = indicatorId;
    data.recommendations = mgr.getLastMonth(indicatorId);

	data.recommendations.idList.forEach(function(id) {
		var reco = data.recommendations.idMap[id];
		reco.strippedContent = $sp.stripHTML(reco.content);
	});

    var counts = data.recommendations.counts;
    options.showLimits = {all: Math.min(options.maxResults, counts.all),
                          current: options.maxResults,
                          accepted: Math.min(options.maxResults, counts.accepted),
                          implemented: Math.min(options.maxResults, counts.implemented)};

  } else {
    var action = input.action;
    if (gs.nil(action))
      return;

    if (action === 'update_state') {
      var result = updateState(mgr, input.reco_id, input.state);
      data.success = result.success;
      data.activity = result.activity;
    }

	  if (action === 'update_register') {
		  var register  = mgr.updateRegister(input.reco_id, input.register);
		  data.register = register;
		  data.success  = (!gs.nil(register.sys_id));
	  }

	  if (action === 'remove_register')
		  data.success  = mgr.removeRegister(input.reco_id);
  }
})();
