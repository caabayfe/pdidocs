function tsDashboardInit() {
	tsDashboardBindButtons(document);
	// Server always emits the empty-state placeholder rows; hide them where data rows exist.
	tsDashboardRefreshEmptyState('ts_enabled_table');
	tsDashboardRefreshEmptyState('ts_disabled_table');
}

function tsDashboardBindButtons(scope) {
	var disableButtons = scope.querySelectorAll('.ts-disable-btn');
	for (var i = 0; i < disableButtons.length; i++)
		disableButtons[i].addEventListener('click', tsDashboardOnDisableClick);

	var enableButtons = scope.querySelectorAll('.ts-enable-btn');
	for (var i = 0; i < enableButtons.length; i++)
		enableButtons[i].addEventListener('click', tsDashboardOnEnableClick);
}

function tsDashboardOnDisableClick() {
	tsDashboardAction('disable', this);
}

function tsDashboardOnEnableClick() {
	tsDashboardAction('enable', this);
}

function tsDashboardAction(action, buttonEl) {
	var table = buttonEl.getAttribute('data-table');

	// Fetch the tailored confirmation message (server decides warn/children/reindex wording),
	// confirm, and only then perform the action.
	var ctxGa = new GlideAjax('TSTextSearchDashboardAjax');
	ctxGa.addParam('sysparm_name', 'getActionContext');
	ctxGa.addParam('sysparm_table', table);
	ctxGa.addParam('sysparm_action', action);
	ctxGa.getXMLAnswer(function(message) {
		tsDashboardConfirm(message, function() {
			tsDashboardPerform(action, buttonEl, table);
		});
	});
}

// Shows a confirm dialog; runs onConfirm only if the admin accepts. Uses the stock GlideModal
// confirm page when available (loaded on this direct=false page), falling back to native confirm().
function tsDashboardConfirm(message, onConfirm) {
	if (typeof GlideModal !== 'undefined') {
		var dialog = new GlideModal('glide_modal_confirm', true, 400);
		dialog.setTitle(getMessage('Confirm'));
		dialog.setPreference('body', message);
		dialog.setPreference('focusTrap', true);
		dialog.setPreference('onPromptComplete', function() { onConfirm(); });
		dialog.setPreference('onPromptCancel', function() {});
		dialog.render();
	} else if (confirm(message)) {
		onConfirm();
	}
}

function tsDashboardPerform(action, buttonEl, table) {
	buttonEl.disabled = true;

	var ga = new GlideAjax('TSTextSearchDashboardAjax');
	ga.addParam('sysparm_name', action);
	ga.addParam('sysparm_table', table);
	ga.getXMLAnswer(function(answer) {
		var success = !!answer && answer.indexOf('OK:') === 0;
		var message = answer ? answer.replace(/^(OK|ERROR):/, '') : 'No response from server';

		tsDashboardShowMessage(message, success);

		if (success) {
			// Reload so the server recomputes all live stats/sections/tiles - the client can't
			// recompute them, and rebuilding the row in place would show stale zeros. Brief delay
			// lets the admin see the confirmation banner first.
			setTimeout(function() { location.reload(); }, 900);
		} else {
			buttonEl.disabled = false;
		}
	});
}

function tsDashboardShowMessage(message, success) {
	var box = document.getElementById('ts_message');
	if (!box) {
		alert(message);
		return;
	}

	box.className = 'alert ' + (success ? 'alert-success' : 'alert-danger');
	box.textContent = message;
	box.style.display = '';

	if (tsDashboardShowMessage._timer)
		clearTimeout(tsDashboardShowMessage._timer);
	tsDashboardShowMessage._timer = setTimeout(function() {
		box.style.display = 'none';
	}, 5000);
}

// Shows the "no rows" placeholder when a table's body has no data rows, hides it otherwise.
function tsDashboardRefreshEmptyState(tableId) {
	var table = document.getElementById(tableId);
	if (!table)
		return;

	var dataRows = table.querySelectorAll('tbody tr.ts-data-row');
	var emptyRow = table.querySelector('tbody tr.ts-empty-row');
	if (emptyRow)
		emptyRow.style.display = dataRows.length === 0 ? '' : 'none';
}

tsDashboardInit();
