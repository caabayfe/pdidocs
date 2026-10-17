function onLoad() {
    var orderList = g_scratchpad.orderList || [];
    parseAndSetOrderList(orderList);
    setDefaultTabFocus(orderList);

    function parseAndSetOrderList(orderList) {
        var tabOrder;
        var tabOrderJSON = g_form.getValue("tabs_order");

        if (tabOrderJSON) {
            tabOrder = JSON.parse(tabOrderJSON);
        }

        var newList = diffOrderList(tabOrder, orderList);
        g_form.setValue("tabs_order", newList);
    }

    function setDefaultTabFocus(orderList) {
        var originalChoiceValue = g_form.getValue('default_tab_focus');
        var hideDetails = g_form.getBooleanValue('hide_details');
		
        g_form.clearOptions('default_tab_focus');

        orderList.forEach(function(item) {
            if (!(hideDetails && item.value === "Details")) {
                g_form.addOption("default_tab_focus", item.value, item.label);
            }
        });

        var firstNoneDetailsValue = orderList[0].value !== "Details" ?
            (orderList[0] && orderList[0].value) :
            (orderList[1] && orderList[1].value);

        if (hideDetails && originalChoiceValue === "Details") {
            g_form.setValue('default_tab_focus', firstNoneDetailsValue);
        } else {
            g_form.setValue('default_tab_focus', originalChoiceValue);
        }
    }

    function diffOrderList(oldList, newList) {
        oldList = oldList ? oldList : [];
        newList = newList ? newList.slice() : [];
        var outList = [];

        oldList.forEach(function(item1, index1) {
            for (var i = 0; i < newList.length; i++) {
                if (item1.value === newList[i].value) {
                    outList.push(item1);
                    newList.splice(i, 1);
                    break;
                }
            }
        });

        return outList.concat(newList);
    }
}
