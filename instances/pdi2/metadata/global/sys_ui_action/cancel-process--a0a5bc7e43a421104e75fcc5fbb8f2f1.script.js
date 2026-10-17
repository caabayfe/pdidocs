// Client side code
function showReasonModal() {
	var gm = new GlideModal();
	gm.setTitle(getMessage("Cancel processes"));
	gm.renderWithContent(generateModalContent());
	return false;
}

// Server side code
if (typeof window === 'undefined') {
	var uri = action.getGlideURI();
	sn_playbook.PlaybookExperience.cancelPlaybook(current, uri.get('sysparm_reason'));
	action.setRedirectURL(current);
}

// Client side functions
if (typeof window !== 'undefined') {
	g_form.cancel = function() {
		var document = g_form.getFormElement().ownerDocument;
		var form = g_form.getFormElement();
		var input = document.createElement('input');
		input.type = 'hidden';
		input.id = 'sysparm_reason';
		input.name = 'sysparm_reason';
		input.value = document.getElementById('reason_to_cancel').value;
		form.appendChild(input);

		gsftSubmit(null, g_form.getFormElement(), 'cancel_process');
	};
}

function generateModalContent() {
	var document = g_form.getFormElement().ownerDocument;
	var modalContent = document.createElement('div');
	modalContent.style.display = 'flex';
	modalContent.style.flexDirection = 'column';

	var activityInfoText = document.createElement('p');
	activityInfoText.textContent = getMessage("Provide a reason for canceling the processes. This information will show up in the Playbook.");
	modalContent.appendChild(activityInfoText);
	var infoText = document.createElement('p');
	infoText.textContent = getMessage("Some processes can’t be canceled right away. They will remain in the Pending Cancel state until their activities finish running.");
	modalContent.appendChild(infoText);

	var textArea = document.createElement('textarea');
	textArea.id = 'reason_to_cancel';
	textArea.placeholder = getMessage('Enter reason here...');
	textArea.classList.add('form-control');
	var label = document.createElement('label');
	label.textContent = getMessage('Reason for cancelation');
	label.appendChild(textArea);
	label.style.marginTop = 'var(--now-global-space--md,10px)';
	label.style.fontSize = 'smaller';
	modalContent.appendChild(label);

	var confirmButton = document.createElement('button');
	confirmButton.classList.add('btn', 'btn-destructive');
	confirmButton.setAttribute('onClick', 'g_form.cancel()');
	confirmButton.textContent = getMessage('Cancel Process');
	confirmButton.disabled = true;
	var cancelButton = document.createElement('button');
	cancelButton.classList.add('btn', 'btn-default');
	cancelButton.dataset.action = 'discard';
	cancelButton.dataset.dismiss = 'GlideModal';
	cancelButton.textContent = getMessage('Close');
	var footer = document.createElement('div');
	footer.classList.add('modal-footer');
	footer.appendChild(cancelButton);
	footer.appendChild(confirmButton);
	modalContent.appendChild(footer);

	textArea.addEventListener('input', function checkReasonField(event) {
		confirmButton.disabled = event.target.value === "";
	});

	return modalContent;
}
