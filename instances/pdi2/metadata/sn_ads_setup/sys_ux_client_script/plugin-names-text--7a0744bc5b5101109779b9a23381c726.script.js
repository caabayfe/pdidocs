/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let modalBody = 'Plugins to be installed:\n';//TODO: i18n
  
  api.state.installPlugins.forEach((plugin, index) => {
    modalBody += (index+1) + '. ' + plugin.name + '\n';
  });
	
  return modalBody;
}
