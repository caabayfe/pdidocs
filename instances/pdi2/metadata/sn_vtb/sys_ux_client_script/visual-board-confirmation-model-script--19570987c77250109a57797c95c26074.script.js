function handler({api, event, imports, helpers}) {
	const {modalId, modalData} = event.payload;
	api.setState('modalId',  modalId);
	if (modalId === 'cardDetails') {
		api.setState('cardDetails', {
			...modalData,
			table: modalData.record.sys_class_name,
			recordId: modalData.record.sys_id,
			view: "workspace",
			isVisible: true
		});
	} else {
                 api.setState('modalData', {
                ...modalData,
                headerLabel: modalData.modalData.headerLabel,
                primaryButtonLabel: modalData.modalData.footerActions[0].label,
                secondaryButtonLabel: modalData.modalData.footerActions[1].label,
                content: modalData.modalData.content
              });
		helpers.modal.open("[component-id$='vtbConfirmationModal']");
	}
}
