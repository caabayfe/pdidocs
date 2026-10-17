/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const project = api.data.fetch_promin_header_state_2.output.data.GlidePromin_Query.scheduleModel.project;

  const dashboard = {
    id: project.paDashboardId,
    label: project.paDashboardName,
  };

  const placeholder = {
    id: '',
    label: helpers.translateSync('KPI Dashboard'),
    sublabel: helpers.translateSync('No dashboard configured for this project'),
    disabled: true,
  };

  const projectMetrics = {
    id: 'projectMetrics',
    label: helpers.translateSync('Project Metrics'),
  };

  const items = [projectMetrics];
  items.push(dashboard.id ? dashboard : placeholder);

	return items;
}
