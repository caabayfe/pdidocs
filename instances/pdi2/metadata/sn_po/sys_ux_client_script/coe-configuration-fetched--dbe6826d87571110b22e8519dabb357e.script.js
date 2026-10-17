
			/**
   * @param {params} params
   * @param {api} params.api
   * @param {any} params.event
   * @param {any} params.imports
   * @param {ApiHelpers} params.helpers
   */
  async function handler({
	  api,
	  event,
	  helpers,
	  imports
  }) {
	  const {
		  isPluginActive,
		  permissions: {
			  canRead,
			  canCreate
		  }
	  } = api.data.fetch_coe_configuration_1.output.data.now.GlidePromin.automationCenterConfig;
  
	  const headerActions = api.state.header_actions || [];
  
	  if (isPluginActive && canCreate && !headerActions.some(ac => ac.id === 'new-coe'))
		  headerActions.push({
			  id: 'new-coe',
			  label: await helpers.translate('Create automation request'),
		  });
  }
