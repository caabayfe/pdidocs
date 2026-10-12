/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const metrics = api.state.idleTimeConfiguration.fields.map(i => i.label).join(", ");
	return helpers.translateSync('Idle time uses activities {items}. Turning it off will remove them from your project. You can choose to keep any of these activities below in the project:', { items: metrics });
}
