/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const events = api.data.fetch_categories.output ? api.data.fetch_categories.output : [];
  return events.map(category => ({
    id: category,
    label: category
  }));
}
