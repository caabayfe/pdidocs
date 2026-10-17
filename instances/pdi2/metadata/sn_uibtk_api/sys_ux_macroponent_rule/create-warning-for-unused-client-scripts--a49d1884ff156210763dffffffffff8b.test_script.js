function test(api) {
    const mcpSysId = api.input.macroponent.sysId;
	const macroponent = JSON.stringify(api.input.macroponent);
    try {
        const clientScripts = api.fetcher.GetAllClientScripts(mcpSysId);
        clientScripts.forEach((script) => {
            const isUsed = macroponent.includes(script.sysId); 
            if (!isUsed) {
                api.fail({
                    element: {
                        elementId: script.sysId,
                        elementLabel: script.name
                    },
					target_type: "scripts"
                });
            }
        });
    } catch (error) {
        api.log.error('Builder Assistant: Failed to retrieve client scripts record for this page');
        api.log.error(error);
    }
}
