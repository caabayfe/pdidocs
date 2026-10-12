(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	response.setContentType('application/json');

	var serverId = request.pathParams.serverId;

	var toolsByServer = {
		'sn-itsm-prod': [
			{
				name: 'create_incident',
				description: 'Create a new incident in ServiceNow',
				inputSchema: {
					type: 'object',
					required: ['short_description', 'category', 'urgency'],
					properties: {
						short_description: { type: 'string', description: 'Brief description of the incident' },
						category: { type: 'string', enum: ['network', 'hardware', 'software', 'database', 'security'] },
						urgency: { type: 'integer', enum: [1, 2, 3], description: '1=High, 2=Medium, 3=Low' }
					}
				}
			},
			{
				name: 'get_incident',
				description: 'Retrieve an incident by number or sys_id',
				inputSchema: {
					type: 'object',
					required: ['identifier'],
					properties: {
						identifier: { type: 'string', description: 'Incident number (INC0001234) or sys_id' }
					}
				}
			}
		],
		'sn-hrsd-prod': [
			{
				name: 'submit_hr_case',
				description: 'Submit a new HR service case',
				inputSchema: {
					type: 'object',
					required: ['subject', 'hr_service'],
					properties: {
						subject: { type: 'string', description: 'Brief description of the HR request' },
						hr_service: { type: 'string', enum: ['onboarding', 'offboarding', 'benefits', 'payroll'] }
					}
				}
			}
		],
		'sn-secops-prod': [
			{
				name: 'create_vulnerability_task',
				description: 'Create a remediation task for a known vulnerability',
				inputSchema: {
					type: 'object',
					required: ['cve_id', 'priority'],
					properties: {
						cve_id: { type: 'string', description: 'CVE identifier, e.g. CVE-2024-12345' },
						priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] }
					}
				}
			}
		]
	};

	var tools = toolsByServer[serverId];
	if (!tools) {
		response.setStatus(404);
		response.setBody({ error: 'Server not found: ' + serverId });
		return;
	}

	response.setStatus(200);
	response.setBody({ tools: tools });
})(request, response);
