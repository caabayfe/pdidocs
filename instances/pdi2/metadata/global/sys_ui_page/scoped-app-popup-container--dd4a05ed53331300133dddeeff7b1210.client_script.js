window.onload = function() {
    var from = document.getElementById("from").value;
    popOverAction();

    function closeUibModalDialog(refreshPage) {
        if (from == 'appDetailPage') {
            CustomEvent.fireTop("app_manager.close-uninstall-modal");
        } else {
            var ngScope = parent.angular.element('[uib-modal-window="modal-window"]').scope();
            ngScope.$close();
        }

        if (refreshPage) {
            var refreshLocation = window.parent.location.href;
            window.parent.location.replace(refreshLocation);
        }
    }

    function popOverAction() {
        var dialogClass = GlideModal ? GlideModal : GlideDialogWindow;
        var dd = new dialogClass("sn_appclient_uninstall_app_dialog");
        dd.setTitle(document.getElementById("title").value);
        dd.setPreference('sysparm_sys_id', document.getElementById("app_id").value);
        dd.setPreference('sysparm_plugin_id', document.getElementById("sys_code").value);
        dd.setWidth(500);
        dd.render();

        jQuery(document).on('click', '#sn_appclient_uninstall_app_dialog_closemodal', function() {
            closeUibModalDialog();
        });

        jQuery(document).on('click', '#cancel_button', function() {
            closeUibModalDialog();
        });

        jQuery(document).on('click', '#sysparm_button_close', function() {
            closeUibModalDialog(true);
        });

        jQuery(document).on('click', '#buttonsPanel button', function() {
            closeUibModalDialog(true);
        });

        jQuery(document).on('click', '#ok_button', function() {
            function waitForReconfirm() {
                if (window.reconfimMsg) {
                    clearTimeout(window.waitForReconfirm);
                    if (window.reconfimMsg == "reconfirmFailed")
                        closeUibModalDialog();
                    else
                        adjustFrameHeight();
                    return;
                }

                window.waitForReconfirm = setTimeout(waitForReconfirm, 100);
            }

            waitForReconfirm();
        });

        adjustFrameHeight();
    }

    function adjustFrameHeight() {
        var modalContent = jQuery('.modal-content')[0];
        if (modalContent) {
            var modalDialog = modalContent.parentElement;
            var modalDialogViewer = modalDialog.parentElement;
            var newHeight = modalContent.getDimensions().height + "px";
            modalDialog.style.height = newHeight;
            modalDialogViewer.style.height = newHeight;

            newHeight = modalContent.getDimensions().height + "px";
            if (from == 'appDetailPage') {
                newHeight = modalContent.getDimensions().height + 40;
                CustomEvent.fireTop("app_manager.uninstall-modal", {
                    height: newHeight + "px"
                });
                return;
            } else {
                window.parent.jQuery("#pluginActivateFrame")[0].style.height = newHeight;
            }

            var parentModalContent = window.parent.jQuery(".modal-content")[0];
            if (parentModalContent && parentModalContent.style) {
                parentModalContent.style.height = newHeight;
                parentModalContent.style.border = "0px solid";
            }
            if (modalDialogViewer.id === 'sn_appclient_uninstall_app_dialog' || (modalDialogViewer.id === 'hierarchical_progress_viewer' && jQuery("#buttonsPanel")[0].childNodes.length >= 1)) {
                jQuery(document).on('click', '#hierarchical_progress_viewer_closemodal', function() {
                    closeUibModalDialog();
                });
                jQuery(document).on('click', '#buttonsPanel button:contains("Done")', function() {
                    closeUibModalDialog();
                });
                clearTimeout(window.resizeTimeout);
                return;
            }
        }

        window.resizeTimeout = setTimeout(adjustFrameHeight, 100);
    }
};

window.onkeydown = function(event) {
    _handleKeyDown(event);

    function _handleKeyDown(e) {
        var Dialog = this;
        var KEY_TAB = 9;
        var KEY_ESC = 27;

        function handleBackwardTab() {
            if (document.activeElement.id === 'sn_appclient_uninstall_app_dialog_closemodal') {
                e.preventDefault();
                jQuery('#ok_button').focus();
            }
        }

        function handleForwardTab() {
            if (document.activeElement.id === 'ok_button') {
                e.preventDefault();
                jQuery('#sn_appclient_uninstall_app_dialog_closemodal').focus();
            }
        }

        switch (e.keyCode) {
            case KEY_TAB:
                if (e.shiftKey) {
                    handleBackwardTab();
                } else {
                    handleForwardTab();
                }
                break;
            case KEY_ESC:
                closeUibModalDialog();
                break;
            default:
                break;
        }
    }

    function closeUibModalDialog() {
        if (from == 'appDetailPage') {
            CustomEvent.fireTop("app_manager.close-uninstall-modal");
        } else {
            var ngScope = parent.angular.element('[uib-modal-window="modal-window"]').scope();
            ngScope.$close();
        }
    }
};
