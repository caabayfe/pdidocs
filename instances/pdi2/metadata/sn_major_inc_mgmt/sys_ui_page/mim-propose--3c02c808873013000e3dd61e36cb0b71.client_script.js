addLoadEvent(function() {
	(function(global) {
		var workNotes = $("mim-propose-work-notes");
		var businessImpact = $("mim-propose-business-impact");
		var workNotesWrapper = $('work-notes-wrapper');
		var proposeBtn = $('mim-propose-button');
		var dialog, resizeObserver;
		if(!config.workspace) {
			dialog = GlideModal.prototype.get("sn_major_inc_mgmt_mim_propose");

          var currentWorkNotes = dialog.getPreference('WORK_NOTES');
          if(currentWorkNotes) {
              workNotes.value = currentWorkNotes;
              workNotesOnChange();
          }
          var currentBusinessImpact = dialog.getPreference('BUSINESS_IMPACT');
          if(currentBusinessImpact)
              businessImpact.value = currentBusinessImpact;
        } else {
			var modalTextAreas = document.querySelectorAll(".propose-modal-textarea");
			var iframeStyle = window.frameElement.style;
			var formContainer = $("mim-propose-form");
			resizeObserver = new ResizeObserver(function(entries) {
				iframeStyle.height = formContainer.offsetHeight + 5 + "px";
			});
			for(var i=0; i < modalTextAreas.length; i++) {
				resizeObserver.observe(modalTextAreas[i]);
			}
		}
		function _debounce(func, wait, immediate) {
			var timeout;
			return function() {
				var context = this,
					args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) func.apply(context, args);
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply(context, args);
			};
		}

		function workNotesOnChange() {
			if (!workNotes.value.trim()) {
				workNotesWrapper.removeClassName('is-filled');
				proposeBtn.addClassName('disabled');
				proposeBtn.writeAttribute('aria-disabled', true);
			} else {
				workNotesWrapper.addClassName('is-filled');
				proposeBtn.removeClassName('disabled');
				proposeBtn.writeAttribute('aria-disabled', false);
			}
		}

		function propose() {
			if (!proposeBtn.hasClassName('disabled')) {
				var msg = getMessage("Proposed as major incident candidate");
				var notes = workNotes.value.trim();
				var bi = businessImpact.value.trim();
				if(!config.workspace) {
					g_form.getControl('work_notes').value = msg + "\n" + notes;
					if (businessImpact.value && businessImpact.value != currentBusinessImpact)
						g_form.setValue('business_impact', bi);
					close();
					gsftSubmit(null, g_form.getFormElement(), 'sysverb_mim_propose');
				}else {
					iframeMsgHelper.confirm({
						msg: msg,
						workNotes: notes,
						businessImpact: bi
					});
				}
			}
		}

		function close() {
			if(!config.workspace) {
				dialog.destroy();
			} else {
				resizeObserver.disconnect();
				window.location.href = window.location.href + '&sysparm_next_pg=true';
			}
		}
		global.proposeModal = {
			propose: propose,
			close: close,
			workNotesOnChange: _debounce(workNotesOnChange, 200) // Only execute when left idle for 200 ms
		};
	})(window);
});
