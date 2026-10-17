/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return `<p>This skill is powered by a third-party GenAI model offered under <now-text-link href='https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/deployment-types#global-standard'  opens-window = true label = 'Global Standard deployment' variant = 'primary' underlined = false icon-end= 'open-link-right-outline' icon-size='sm'></now-text-link> GenAI processing leverages Microsoft Azure’s global infrastructure to dynamically route traffic to the best available data center for each request. This skill's processing location may differ from the data center location your organization chose for its ServiceNow deployment.</p>`;
}
