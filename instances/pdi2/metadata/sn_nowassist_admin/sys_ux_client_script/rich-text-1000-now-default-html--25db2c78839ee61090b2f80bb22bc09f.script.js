/**
 * @param {Object} params
 * @param {Object} params.api
 * @param {Object} params.helpers
 */
function evaluateProperty({ api, helpers }) {
  const GOOGLE_GEMINI_PROVIDER_ID = 'dc851269ff3566100158ffffffffffe4';
  const AWS_CLAUDE_PROVIDER_ID = '2d655e29ff3566100158ffffffffff2f';

  let providerHelpfulResourceLink = `
    <a title="Azure OpenAI" 
       href="https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/deployment-types#global-standard" 
       target="_blank" 
       rel="noopener">
      Azure OpenAI
    </a>
    <a href="https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/deployment-types#global-standard" 
       target="_blank" 
       rel="noopener">
      <img style="margin-left: 2px;" 
           title="open-link-right-fill.png" 
           src="images/open-link-right-fill.png" 
           width="12" 
           height="12">
    </a>`;

  const selectedProviderId = api?.state?.currentSelectedProvider?.id;

  if (selectedProviderId === GOOGLE_GEMINI_PROVIDER_ID) {
    providerHelpfulResourceLink = `
      <a title="Google Gemini" 
         href="https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations" 
         target="_blank" 
         rel="noopener">
        Google Gemini
      </a>
      <a href="https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations" 
         target="_blank" 
         rel="noopener">
        <img style="margin-left: 2px;" 
             title="open-link-right-fill.png" 
             src="images/open-link-right-fill.png" 
             width="12" 
             height="12">
      </a>`;
  } else if (selectedProviderId === AWS_CLAUDE_PROVIDER_ID) {
    providerHelpfulResourceLink = `
      <a title="AWS Claude" 
         href="https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html" 
         target="_blank" 
         rel="noopener">
        AWS Claude
      </a>
      <a href="https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html" 
         target="_blank" 
         rel="noopener">
        <img style="margin-left: 2px;" 
             title="open-link-right-fill.png" 
             src="images/open-link-right-fill.png" 
             width="12" 
             height="12">
      </a>`;
  }

  return   helpers.translateSync(`<p>When you select Global routing for Large Language Model (LLM) and Small Language Model (SLM) requests,<br>your data processing location will change from regional to a global data center.<br>Your ServiceNow instance location will continue to be regional.<br><br>AI systems powered by third-party Gen AI models may leverage their global infrastructure to dynamically route traffic to the best available data center for each request.<br>The AI system&rsquo;s processing location may differ from the data center location your organization chose for its ServiceNow deployment.<br><br><strong>Note:</strong> AI systems include Out-of-the-Box (OOB) skills, agents, agentic workflows, and custom skills, agents, and agentic workflows.<br><br>Make sure to review your organization&rsquo;s data policies before you enable the Global routing option.<br><br><strong>Global standard deployment help</strong><br>{0}<br></p>`, providerHelpfulResourceLink);
}
