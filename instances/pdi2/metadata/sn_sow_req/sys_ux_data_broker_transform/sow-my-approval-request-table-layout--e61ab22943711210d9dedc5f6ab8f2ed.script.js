function transform(input) {
    var table = input.table;
    var sysId = input.sysId;

    //Define Request Summary
    if (table == "sc_request") {
        var requestGr = new GlideRecord('sc_request');

        if (requestGr.get(sysId)) {
            var openedBy = requestGr.opened_by.getDisplayValue();
            var openedFor = requestGr.requested_for.getDisplayValue();
            var totalPrice = requestGr.price.getDisplayValue();
            var currencyCode = requestGr.price.getCurrencyCode() || "USD";
            var summary = "<p style=\"text-align: left;\"><span style=\"font-size: 12pt;\"><strong>" +
                sn_i18n.Message.getMessage("sn_sow_req", "Summary of request being approved:") +
                "</strong></span></p><div style=\"background-color: rgba(211, 214, 220, 1); height: 1px; margin: 4px 0;\"></div><table style=\"border-collapse: collapse; width: 100%; border-width: 0px; height: 67.9923px; margin-left: 0px; margin-right: auto;\" border=\"1\"><colgroup><col style=\"width: 15.9664%;\"><col style=\"width: 84.1737%;\"></colgroup><tbody><tr style=\"height: 24.6641px; border-bottom: 1px solid rgba(211, 214, 220, 1);\"><td style=\"border-width: 0px; height: 24.6641px;\">" +
                requestGr.opened_by.getLabel() +
                ": </td><td style=\"border-width: 0px; height: 24.6641px;\">" + openedBy + "</td></tr><tr style=\"height: 24.6641px; border-bottom: 1px solid rgba(211, 214, 220, 1);\"><td style=\"border-width: 0px; height: 24.6641px;\">" +
                requestGr.requested_for.getLabel() +
                ": </td><td style=\"border-width: 0px; height: 24.6641px;\">" + openedFor + "</td></tr><tr style=\"height: 24.6641px;\"><td style=\"border-width: 0px; height: 24.6641px;\">" +
                sn_i18n.Message.getMessage("sn_sow_req", "Total:") +
                "</td><td style=\"border-width: 0px; height: 24.6641px;\">" + totalPrice + "</td></tr></tbody></table>";
        }
    } else {
        var requestItemGR = new GlideRecord('sc_req_item');
        requestItemGR.get(sysId);
        var currencyCode = requestItemGR.price.getCurrencyCode() || "USD";
    }

    //Create Column definition
    var columnDef = {
        "columns": []
    };

    if (table == "sc_request") {
        columnDef.columns = columnDef.columns.concat([{
                "key": "status",
                "type": "icon",
                "label": sn_i18n.Message.getMessage("sn_sow_req", "Status")
            },
            {
                "key": "deny",
                "type": "link"
            },
            {
                "key": "accept",
                "type": "link"
            },
            {
                "key": "ritmNumber",
                "label": sn_i18n.Message.getMessage("sn_sow_req", "Number"),
                "type": "link"
            }
        ]);
    }

    columnDef.columns = columnDef.columns.concat([{
            "key": "description",
            "label": sn_i18n.Message.getMessage("sn_sow_req", "Description"),
            "type": "custom",
            "componentTag": "now-rich-text"
        },
        {
            "key": "price",
            "label": sn_i18n.Message.getMessage("sn_sow_req", "Price"),
            "type": "currency",
            "currency": currencyCode,
            "headerCellAlignment": "default",
            "alignment": "inverse"
        },
        {
            "key": "quantity",
            "label": sn_i18n.Message.getMessage("sn_sow_req", "Quantity"),
            "type": "number",
            "headerCellAlignment": "default",
            "alignment": "inverse"
        },
        {
            "key": "total",
            "label": sn_i18n.Message.getMessage("sn_sow_req", "Total"),
            "type": "currency",
            "currency": currencyCode,
            "headerCellAlignment": "default",
            "alignment": "inverse"
        }
    ]);

    //Create Row definition
    var requestItemGr = new GlideRecord('sc_req_item');
    if (table == "sc_request")
        requestItemGr.addQuery('request', sysId);
    else
        requestItemGr.addQuery('sys_id', sysId);
    requestItemGr.query();

    var rowDef = {
        "rows": []
    };
    while (requestItemGr.hasNext()) {
        requestItemGr.next();
        var row = {
            "cells": {},
            "key": requestItemGr.getUniqueValue(),
            "type": "default"
        };
        if (table == "sc_request") {
            switch (String(requestItemGr.approval)) {
                case 'not requested':
                    row.cells.status = {
                        "value": "checkbox-unchecked-fill",
                        "color": "info"
                    };
                    var isAuthorized = false;
                    if (gs.hasRole("approval_admin")) {
                        isAuthorized = true;
                    } else if (gs.hasRole("approver_user")) {
                        var approvalGR = new GlideRecord("sysapproval_approver");
                        approvalGR.addQuery("sysapproval", requestItemGr.getValue("request"));
                        approvalGR.query();
                        while (approvalGR.next()) {
                            var isMyApproval = new global.ApprovalDelegationUtil().isMyApproval(approvalGR);
                            if (isMyApproval) {
                                isAuthorized = true;
                                break;
                            }
                        }
                    }
                    if (isAuthorized) {
                        row.cells.accept = {
                            "label": sn_i18n.Message.getMessage("sn_sow_req", "Accept"),
                            "value": sn_i18n.Message.getMessage("sn_sow_req", "Accept")
                        };
                        row.cells.deny = {
                            "label": sn_i18n.Message.getMessage("sn_sow_req", "Deny"),
                            "value": sn_i18n.Message.getMessage("sn_sow_req", "Deny")
                        };
                    }
                    break;
                case 'requested':
                    row.cells.status = {
                        "value": "checkbox-checked-fill",
                        "color": "info"
                    };
                    break;
                case 'rejected':
                    row.cells.status = {
                        "value": "checkbox-indeterminate-fill",
                        "color": "critical"
                    };
                    break;
                case 'approved':
                    row.cells.status = {
                        "value": "circle-check-fill",
                        "color": "positive"
                    };
                    break;
            }

            row.cells.ritmNumber = {
                "label": requestItemGr.getValue("number"),
                "value": requestItemGr.getValue("number")
            };
        }

        var requestUtil = new global.RequestNotificationUtil();
        var requestItemVariables = requestUtil.getRequestItemVariables(requestItemGr.sys_id);
        var descriptionHtml = "<p>" + String(requestItemGr.cat_item.short_description) + "</p>";

        var tableRows = "";
        for (var i = 0; i < requestItemVariables.length; i++) {
            var item = requestItemVariables[i];
            var title = item.label;
            var value = item.value;
            var type = item.type;

            // Only add rows with non-empty titles or values
            if (title && value) {
                tableRows += "<tr style=\"border: none;\">";
                tableRows += "<td style=\"padding: 2px; border: none;\">" + title + "</td>";

                if (type === 33) {
                    var attachmentGR = new GlideRecord('sys_attachment');
                    attachmentGR.addQuery('file_name', value);
                    attachmentGR.query();
                    if (attachmentGR.next()) {
                        var attachmentSysId = attachmentGR.getValue('sys_id');
                        tableRows += "<td style=\"padding: 2px; border: none;\"><a href=\"/sys_attachment.do?sys_id=" + attachmentSysId + "&sysparm_nostack=true\" download=\"" + value + "\">" + value + "</a></td>";
                    } else {
                        tableRows += "<td style=\"padding: 2px; color: red; border: none;\">Attachment not found: " + value + "</td>";
                    }
                } else {
                    tableRows += "<td style=\"padding: 2px; border: none;\">" + value + "</td>";
                }

                tableRows += "</tr>";
            }
        }

        if (tableRows) {
            descriptionHtml += "\n<table style=\"border-collapse: collapse; width: 100%; border: 1px solid rgba(228, 230, 234, 1);  box-shadow: 0px 8px 12px 0px rgba(56, 56, 56, 0.25);\">";
            descriptionHtml += "<tbody>" + tableRows + "</tbody></table>";
        }

        row.cells.description = {
            "componentProps": {
                "html": descriptionHtml
            }
        };
        row.cells.price = {
            "value": Number(requestItemGr.price)
        };
        row.cells.quantity = {
            "value": Number(requestItemGr.getValue("quantity"))
        };
        row.cells.total = {
            "value": Number(requestItemGr.price) * Number(requestItemGr.quantity)
        };

        rowDef.rows.push(row);
    }

    var result = {
        "columnDefinitions": columnDef,
        "rowDefinitions": rowDef,
    };
    if (table == "sc_request") {
        result.summary = summary;
    }

    return result;
}
