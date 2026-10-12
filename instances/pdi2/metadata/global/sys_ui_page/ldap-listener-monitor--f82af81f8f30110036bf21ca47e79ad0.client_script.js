loadData();

function loadData() {
    var ldap_id = "${RP.getWindowProperties().get('ldap_server_id')}";
    var ga = new GlideAjax('LDAPListenerDiagnostics');
    ga.addParam("sysparm_type", "loadDiagnostics");
    ga.addParam("sysparm_ldap_id", ldap_id);
    ga.getXMLAnswer(function(answer, ldap_id) {
        updatePage(answer);
    });
}
jQuery(document).ready(focusOnModal);



var lastElement;

function focusOnModal () {
    var modalHeader = document.getElementById('ldap_listener_monitor_header');
    modalHeader.tabIndex = 0;
    modalHeader.focus();
	lastElement = document.getElementById('ldap-last-element');
	jQuery(lastElement).on('keydown', function (e) {
		if (e.which === 9 && !e.shiftKey) {
			e.preventDefault();
			modalHeader.focus();
		}
			
	});
	jQuery(modalHeader).on('keydown', function (e) {
		if (e.which === 9 && e.shiftKey) {
			e.preventDefault();
			lastElement.focus();
		}
	});
	jQuery('#popup_close_image').on('click', function (e) {
		jQuery('[gsft_action_name="ldap_listener_status"]').focus();
	});
	jQuery('#popup_close_image').on('keydown', function (e) {
		if (e.which == 13)
			jQuery('[gsft_action_name="ldap_listener_status"]').focus();
	})
}

function updatePage(answer) {
    var ldap_id = "${RP.getWindowProperties().get('ldap_server_id')}";
    var json = eval("(" + answer + ")");

    var lastMessage = json['glide.ldap.listener' + '-' + ldap_id];
    var activeStatus = json['glide.ldap.listener' + '-' + ldap_id + '.active'];
    var shutdownPending = json['glide.ldap.listener' + '-' + ldap_id + '.shutdown_pending'];
    var starting = json['glide.ldap.listener' + '-' + ldap_id + '.starting'];
    var lastChange = json['glide.ldap.listener' + '-' + ldap_id + '.last_change'];
    var lastError = json['glide.ldap.listener' + '-' + ldap_id + '.last_error'];

    setActiveRow(lastMessage, activeStatus, starting, shutdownPending);
    setLastMessageRow(lastMessage);
    setLastChangeRow(lastChange);
    setLastErrorRow(lastError);
}

function setActiveRow(lastMessage, activeStatus, starting, shutdownPending) {
    if (activeStatus && activeStatus['value'] == 'true') {
        if (shutdownPending && shutdownPending['value'] == 'true') {
            gel('statusValue').innerHTML = 'Active (Shutting down ...)';
            gel('statusValue').className = 'inactive label-bold';
            gel('statusTime').innerHTML = shutdownPending['sys_updated_on'];
        } else {
            gel('statusValue').innerHTML = 'Active';
            gel('statusValue').className = 'active label-bold';
            gel('statusTime').innerHTML = activeStatus['sys_updated_on'];
        }
    } else {
        if (starting && starting['value'] == 'true') {
            gel('statusValue').innerHTML = 'Inactive (Starting ...)';
            gel('statusValue').className = 'inactive label-bold';
            gel('statusTime').innerHTML = starting['sys_updated_on'];
        } else {
            gel('statusValue').innerHTML = 'Inactive';
            gel('statusValue').className = 'inactive label-bold';
            gel('statusTime').innerHTML = activeStatus['sys_updated_on'];
        }
    }
}

function setLastMessageRow(lastMessage) {
    if (lastMessage) {
        gel('messageValue').innerHTML = lastMessage['value'];
        gel('messageTime').innerHTML = lastMessage['sys_updated_on'];

        if (lastMessage['type'] == 'error') {
            gel('messageValue').className = 'inactive label-bold';
        }
    }
}

function setLastChangeRow(lastChange) {
    if (lastChange) {
        gel('changeValue').innerHTML = lastChange['value'];
        gel('changeTime').innerHTML = lastChange['sys_updated_on'];
    }
}

function setLastErrorRow(lastError) {
    if (lastError) {
        gel('errorValue').innerHTML = lastError['value'];
        gel('errorTime').innerHTML = lastError['sys_updated_on'];
        gel('errorValue').className = 'inactive label-bold';
    }
}
