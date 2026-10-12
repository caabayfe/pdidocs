function script({ api, event }) {
    const fieldsBySection = api.data.glide_form_1?.nowRecordFormBlob?.fieldsBySection;
    const sections = api.data.glide_form_1?.nowRecordFormBlob?.sections;
    if (!sections || !sections.length) return;

    const mainSections = [sections[0]];
    const mainFields = fieldsBySection[sections[0].sysId];

    api.setState('mainSections', mainSections);
    api.setState('mainFields', mainFields);
    const sectionsInTab = sections.slice(1).map(section => {
        return {
            sysId: section.sysId,
            label: section.label,
            sections: [section],
            fields: fieldsBySection[section.sysId]
        };
    });
    api.setState('sectionsInTab', sectionsInTab);
    console.log(`--- Field and sections ${event.payload.name} fieldsBySection:`, fieldsBySection, ` -- sections:`, sections, `-- mainFields:`, mainFields, `---mainSections:`, mainSections, `--- sectionsInTab`, sectionsInTab);

}
