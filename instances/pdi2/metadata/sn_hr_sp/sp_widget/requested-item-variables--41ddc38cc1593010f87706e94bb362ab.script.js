(function() {
        data.CONST = {
            i18n: {
              PRICE: gs.getMessage("Price"),
              QUANTITY: gs.getMessage("Quantity"),
              TOTAL: gs.getMessage("Total")
            },
            listOverFlowLimit: 10
        };
        if (options && options.sysId) {
          data.ritmId = options.sysId;
        data.isExpanded = options.isExpanded;
        }
        data.label = options.label || gs.getMessage("Options");
        if (options.task)
          data.ariaLabel = gs.getMessage("{0} for {1}", [data.label, options.task]);
        else
          data.ariaLabel = data.label;
        if (options.variables) {
          data.variables = filterVariables(options.variables);
          return;
        }
        data.labelClose = gs.getMessage("Close");

        var record = sn_std_tkt_api.TicketConfig.getTicketRecord('sc_req_item', data.ritmId);
        if (record == null)
          return;
        var currencyCode = record.price.getSessionCurrencyCode();
        var formatter = new sn_currency.GlideCurrencyFormatter();
        data.short_description = record.getValue('short_description');
        data.price = record.price.getSessionDisplayValue();
        data.quantity = record.getValue('quantity');
        data.total = formatter.format(record.getValue('price') * data.quantity, currencyCode);
        var widget = 'sc-variable-summarizer';
        var widgetParam = {
          hide_control: true,
          sys_id: data.ritmId,
          table: 'sc_req_item',
          toggle: true
        };

        data.canRead = record.canRead();
        if (!data.canRead)
          return;

        data.variables = filterVariables(new global.GlobalServiceCatalogUtil().getVariablesForTask(record, true));
      })();

      function filterVariables(variables) {
        if (variables == null || variables.length == 0)
          return variables;

        var filteredVariables = [];
        variables.forEach(function(variable) {
          if (variable.visible_summary)
            filteredVariables.push(variable);
        });

        return filteredVariables;
      }
