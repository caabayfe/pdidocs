function evaluateProperty({api}) {
	if(api.state.selectedTemplateId)
    return [api.state.selectedTemplateId];
  return [];
}
