/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  const notifDashboardUtils = imports["sn_notif_dashboard.NotificationDashboardUtils"](helpers);
   const payload = {event};
    if(api.state.selectedTab == "id=connection_status"){
    switch (event.name) {
        case 'UXF_TAB_SET#TAB_SELECTED':
            loadTotalObjects();
            break;

        case 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET':
            var pageNumber = payload.event.payload.value;
            api.setState("pageNumber", ({api}) => {
                var {totalObjects} = api.state;
                showAccounts(totalObjects, pageNumber, api.state.pageSize, true);
                return pageNumber;
            });    
            break;

        case 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SIZE_SET':
            var pageSize = payload.event.payload.value;
            api.setState("pageSize", ({api}) => {
                var {totalObjects} = api.state;
                showAccounts(totalObjects, api.state.pageNumber, pageSize, true);
                return pageSize;
            }); 
            break;
    }
}

    function loadTotalObjects() {
        helpers.snHttp("api/snc/notification_dashboard/get_email_accounts", {
            method: "GET"
        }).then(
            response => {

                var accountsResult = response.response.result;
                var totalObjects = accountsResult.results;

                //fixed elements
                api.setState("totalObjects", totalObjects);
                api.setState("workersLimit", accountsResult.maxWorkers);
                notifDashboardUtils.getHeaders("email_accounts").then(headers => {
                    api.setState("emailAccountHeaders", headers);
                });
                showAccounts(totalObjects, api.state.pageNumber, api.state.pageSize, true);
            }
        );
    }

    function contains(array, searchItem) {
        var element = array.find(item => item == searchItem);
        return element == searchItem;
    }

    function remove(array, value) {
        return array.filter(function(item) {
            return item !== value;
        });
    }

    function createWorker(i) {

        api.setState("totalObjects", ({
            current,
            api
        }) => {
            var {
                inProgressAccounts,
                workersLimit,
                totalObjects
            } = api.state;
            var account = totalObjects[i];

            if (!account["workerStatus"]) {
                if (workersLimit >= inProgressAccounts.length) {
                    inProgressAccounts.push(i);
                    api.setState("inProgressAccounts", inProgressAccounts);
                    account["workerStatus"] = "initiated";
                    helpers.snHttp("api/snc/notification_dashboard/createworker", {
                        method: "POST",
                        body: {
                            accountId: account.sysId
                        }
                    }).then(({
                        response
                    }) => {

                        api.setState("totalObjects", ({
                            api
                        }) => {

                            var {
                                totalObjects
                            } = api.state;
                            totalObjects[i]["workerStatus"] = "created";
                            totalObjects[i]["progressID"] = response.result.progressID;
                            totalObjects[i]["retryCount"] = 0;
                            helpers.timing.setTimeout(() => {
                                checkAccount(i);
                            }, 300);
                            return totalObjects;
                        });
                    });
                } else {
                    var id = helpers.timing.setTimeout(() => {
                        createWorker(i);
                    }, 1500);
                    totalObjects[i]["timeoutId"] = id;
                }
            }
            return totalObjects;
        });

    }

    function checkAccount(i) {
        api.setState("totalObjects", ({
            api
        }) => {
            var {
                totalObjects
            } = api.state;
            var account = totalObjects[i];
            var url = "/api/snc/notification_dashboard/checkworkerStatus?progressID=" + account["progressID"];
            helpers.snHttp(url, {
                method: "GET"
            }).then(({
                response
            }) => {
                api.setState("totalObjects", ({
                    api
                }) => {
                    var {
                        totalObjects,
                        inProgressAccounts
                    } = api.state;
                    var account = totalObjects[i];
                    account["WorkerStatus"] = response.result.WorkerStatus;
                    account["stateCode"] = response.result.stateCode;
                    account["message"] = response.result.message;
                    account["retryCount"] = account["retryCount"] + 1;

                    if (!(account["WorkerStatus"] == "complete")) {
                        if (account["retryCount"] <= 76) {
                            var id = helpers.timing.setTimeout(() => {
                                checkAccount(i);
                            }, 300);
                            account["timeoutId"] = id;
                        } else {
                            account["message"] = account["message"] + "\nNumber of attempts exhausted";
                            inProgressAccounts = remove(inProgressAccounts, i);
                            api.setState("inProgressAccounts", inProgressAccounts);
                        }
                    } else {
                        inProgressAccounts = remove(inProgressAccounts, i);
                        api.setState("inProgressAccounts", inProgressAccounts);
                    }
                    showAccounts(totalObjects, api.state.pageNumber, api.state.pageSize);
                    return totalObjects;
                });

            });
            return totalObjects;
        });
    }


    function showAccounts(totalObjects, pageNum, pageSize, triggerWorkers) {
        var start = pageNum * pageSize;
        var end = start + pageSize;
        end = totalObjects.length > end ? end : totalObjects.length;
        var currentPage = totalObjects.slice(start, end);

        api.setState("emailAccountRows", ({
            api
        }) => {
            if (triggerWorkers) {
                var totalObjects = api.state.totalObjects;
                for (var i = start; i < end; i++) {
                    var id = initWorker(i);
                    totalObjects[i]["timeoutId"] = id;
                }
            }
            api.setState("totalObjects", totalObjects);

            return notifDashboardUtils.generateTable("email_accounts", currentPage, {
                key: "sysId"
            });
        });
    }

    function initWorker(i) {
        var id = helpers.timing.setTimeout(() => {
            createWorker(i);
        }, 10);
        return id;
    }
}
