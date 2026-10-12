
			function onChange(control, oldValue, newValue, isLoading, isTemplate) {
          if (isLoading || newValue === '')
              return;

          validateHostNameFormat(newValue);
        }

        function validateHostNameFormat(host) {
            var hostPattern = /^[a-z0-9]([a-z0-9\-.]*[a-z0-9])?$/;
            if (!hostPattern.test(host)) {
                g_form.showFieldMsg('host_name', getMessage('Invalid host name format. Use lowercase letters, numbers, dots, and hyphens only.'), 'error');
            } else {
                g_form.hideFieldMsg('host_name');
            }
        }
