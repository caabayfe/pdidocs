/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.setState("senderConnectivityResult", {
        isLoading: true,
    });
    api.setState("readerConnectivityResult", {
        isLoading: true,
    });
    const smtpAccounts = api.data.query_smtp_email_accounts.output.data.GlideRecord_Query.sys_email_account._results;
    const readerAccounts = api.data.query_reader_email_accounts.output.data.GlideRecord_Query.sys_email_account._results;
    const maxQueryCount = 5;

    troubleshootConnectivity("sender", smtpAccounts, "senderConnectivityResult", triggerWorkers);
    troubleshootConnectivity("reader", readerAccounts, "readerConnectivityResult", triggerWorkers);

    function updateConnectionDiagnosisTime() {
        var now = new Date();
        var formattedPresentTime = now.toTimeString().split(' ')[0];
        var connectionDiagnosisTime = formattedPresentTime.slice(0, 5);
        api.setState('connectionTimeStamp', connectionDiagnosisTime);
    }

    function troubleshootConnectivity(type, accounts, stateKey, workerTriggerFn) {
        const maxAccountsKey = type === "sender" ? "maxSMTPAccounts" : "maxReaderAccounts";

        if (api.state[maxAccountsKey] === 0) {
            api.setState(stateKey, {
                isLoading: false,
                data: {
                    isError: true,
                    message: `No active ${type} email accounts are configured. Configure from Email Accounts.`,
                    link: "/sys_email_account_list.do",
                    linkText: "Email Accounts"
                }
            });
            updateConnectionDiagnosisTime();
            return;
        }

        helpers.snHttp("api/snc/notification_dashboard/validate_connectivity", {
            method: "GET"
        }).then(({
            response
        }) => {
            const resultKey = `${type}ConnectivityResult`;
            const connectivityResult = response.result[resultKey];

            if (connectivityResult.isError) {
                api.setState(stateKey, {
                    isLoading: false,
                    data: connectivityResult
                });
                updateConnectionDiagnosisTime();
            } else {
                workerTriggerFn(0, type, accounts, stateKey);
            }
        });
    }

    function triggerWorkers(start, type, accounts, stateKey) {
        const maxAccountsKey = type === "sender" ? "maxSMTPAccounts" : "maxReaderAccounts";
        const initWorkerFn = type === "sender" ? initWorker : initReaderWorker;

        for (let i = start; i < maxQueryCount && i < api.state[maxAccountsKey]; i++) {
            const id = initWorkerFn(i);
            accounts[i].timeoutId = id;
        }

        if (start > api.state[maxAccountsKey]) {
            api.setState(stateKey, {
                isLoading: false,
                data: {
                    isError: true,
                    message: `No valid ${type} email accounts are configured. Configure from Email Accounts.`,
                    link: "/sys_email_account_list.do",
                    linkText: "Email Accounts"
                }
            });
             updateConnectionDiagnosisTime();
        }
    }

    function initWorker(i) {
        return helpers.timing.setTimeout(() => createWorker(i, smtpAccounts, "senderConnectivityResult", checkAccount), 10);
    }

    function initReaderWorker(i) {
        return helpers.timing.setTimeout(() => createWorker(i, readerAccounts, "readerConnectivityResult", checkReaderAccount), 10);
    }

    function createWorker(i, accounts, stateKey, checkFn) {
        const {
            senderDiagnosisInProgressAccounts,
            diagnosisWorkersLimit
        } = api.state;
        const account = accounts[i];

        if (!account.workerStatus) {
            if (diagnosisWorkersLimit >= senderDiagnosisInProgressAccounts.length) {
                senderDiagnosisInProgressAccounts.push(i);
                api.setState("inProgressAccounts", senderDiagnosisInProgressAccounts);

                account.workerStatus = "initiated";

                helpers.snHttp("api/snc/notification_dashboard/createworker", {
                    method: "POST",
                    body: {
                        accountId: account.sys_id.value
                    }
                }).then(({
                    response
                }) => {
                    account.workerStatus = "created";
                    account.progressID = response.result.progressID;
                    account.retryCount = 0;

                    helpers.timing.setTimeout(() => checkFn(i, accounts, stateKey), 300);
                });
            } else {
                const id = helpers.timing.setTimeout(() => createWorker(i, accounts, stateKey, checkFn), 1500);
                account.timeoutId = id;
            }
        }
    }

    function checkAccount(i, accounts, stateKey) {
        const account = accounts[i];
        const url = `/api/snc/notification_dashboard/checkworkerStatus?progressID=${account.progressID}`;

        helpers.snHttp(url, {
            method: "GET"
        }).then(({
            response
        }) => {
            let {
                senderDiagnosisInProgressAccounts
            } = api.state;
            account.WorkerStatus = response.result.WorkerStatus;
            account.stateCode = response.result.stateCode;
            account.message = response.result.message;
            account.retryCount++;

            if (account.WorkerStatus !== "complete") {
                if (account.retryCount <= 76) {
                    account.timeoutId = helpers.timing.setTimeout(() => checkAccount(i, accounts, stateKey), 300);
                } else {
                    account.message += "\nNumber of attempts exhausted";
                    senderDiagnosisInProgressAccounts = remove(senderDiagnosisInProgressAccounts, i);
                    api.setState("senderDiagnosisInProgressAccounts", senderDiagnosisInProgressAccounts);
                }
            } else {
                senderDiagnosisInProgressAccounts = remove(senderDiagnosisInProgressAccounts, i);
                api.setState("senderDiagnosisInProgressAccounts", senderDiagnosisInProgressAccounts);

                if (response.result.stateCode === "Ready") {
                    api.setState(stateKey, {
                        isLoading: false,
                        data: {
                            isError: false
                        }
                    });
                    updateConnectionDiagnosisTime();
                } else {
                    const nextTrigger = stateKey === "senderConnectivityResult" ? triggerWorkers : triggerWorkers;
                    nextTrigger(i + 5, stateKey.includes("sender") ? "sender" : "reader", accounts, stateKey);
                }
            }
        });
    }

    function remove(array, value) {
        return array.filter(item => item !== value);
    }

    function checkReaderAccount(i, accounts, stateKey) {
        checkAccount(i, accounts, stateKey);
    }
}
