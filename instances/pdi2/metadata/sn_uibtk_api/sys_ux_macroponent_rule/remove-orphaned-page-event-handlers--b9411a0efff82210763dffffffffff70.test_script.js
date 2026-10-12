function test(api) {
    const em = api.ruleElement.eventMappings;
    em.forEach((event) => {
        const eventTargets = event.targets.filter((e) => e.type === 'EVENT');
        eventTargets.forEach((et) => {
            const eventDef = api.fetcher.GetEventDefinitionById(et?.event?.sysId);
            if (!eventDef) {
                const originalNotificationText = api?.rule?.notification_text;
                const notification_text = originalNotificationText?.replace(/\$\{eventSysId\}/g, et?.event?.sysId);
                api.fail({
                    notification_text,
                    notification_target: [{
                        type: 'property',
                        property: 'pageDefinition'
                    }]
                });
            }
        });
    });
}
