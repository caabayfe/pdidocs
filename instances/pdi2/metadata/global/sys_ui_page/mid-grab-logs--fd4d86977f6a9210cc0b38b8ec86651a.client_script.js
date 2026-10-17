var currentPage1 = 1;
var currentPage2 = 1;
var itemsPerPage1 = 5;
var itemsPerPage2 = 5;
var logFiles = [];
var otherFiles = [];
var filteredLogFiles = [];
var filteredOtherFiles = [];
var selectedFiles = [];

function onLoad() {
    restoreSelection();
    updateSelectedFilesPillsList();
}

function listLogFiles() {
    var iframe = document.querySelector('#filesList iframe');
    var midServerPicker = $('mid_server_picker').value;
    var midServerName = $('sys_display.mid_server_picker').value;
    var disable = midServerPicker == '';

    if (midServerName) {
        document.getElementById('loader').style.display = 'block';
        document.getElementById('logFilesResult1').innerHTML = '';
        document.getElementById('logFilesResult2').innerHTML = '';
        iframe.src = 'agent_file_list.do?sysparm_query=mid_server=' + midServerPicker + '^ORDERBYDESCsys_updated_on';
        document.getElementById('filesList').style.display = 'block';
        document.getElementById('instancefilesTitle').style.display = 'block';
        document.getElementById('listLogFilesButton').disabled = disable;
        document.getElementById('grabMidSettings').disabled = disable;
        document.getElementById('grabMidServerThreadDump').disabled = disable;

        var ga = new GlideAjax('MIDServerAjax');
        ga.addParam('sysparm_name', 'getTroubleshootingFileList');
        ga.addParam('sysparm_agent_name', midServerName);

        ga.getXMLWait();
        var sys_id = ga.getAnswer();
        checkProgress(midServerName, sys_id);
        listLogFilesButton.innerText = 'Refresh List Log Files';
    }
}

function checkProgress(midServerName, commandSyd) {
    setTimeout(function() {
        var gr = new GlideRecord('ecc_queue');
        gr.addQuery('response_to', commandSyd);
        gr.query();

        if (gr.next()) {
            document.getElementById('loader').style.display = 'none';
            var payload = gr.getValue('payload');

            // Extract the <output> element from the XML response
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(payload, "text/xml");
            var outputElement = xmlDoc.getElementsByTagName("output")[0];
            var output = outputElement.textContent;

            var files = JSON.parse(output);
            //Format start and end dates from each files
            files.forEach(function(file) {
                file.startDate = file.startDate || "N/A";
                file.endDate = file.endDate || "N/A";
            });
            logFiles = files.filter(file => (file.name.toLowerCase().includes('.log.') || file.name.toLowerCase().includes('wrapper.log')));
            otherFiles = files.filter(file => (!file.name.toLowerCase().includes('.log.') && !file.name.toLowerCase().includes('wrapper.log')));
            filteredLogFiles = logFiles;
            filteredOtherFiles = otherFiles;
            renderPage(1, 1);
            renderPage(1, 2);

            document.getElementById('logFilesTitle1').style.display = 'block';
            document.getElementById('logFilesTitle2').style.display = 'block';
            document.getElementById('searchBar1').style.display = 'block';
            document.getElementById('searchBar2').style.display = 'block';
            document.getElementById('selectedFilesContainer').style.display = 'block';
            document.getElementById('filters1').style.display = 'block';
            document.getElementById('grabLogsButton').style.display = 'block';
            document.getElementById('unselectAllButton').style.display = 'block';
            document.getElementById('midfilesTitle').style.display = 'block';
        } else {
            checkProgress(midServerName, commandSyd);
        }
    }, 5000);
}

function renderPage(page, section) {
    var logFilesResult = section === 1 ? document.getElementById('logFilesResult1') : document.getElementById('logFilesResult2');
    var filteredFiles = section === 1 ? sortFilesByDate(filteredLogFiles, 1) : sortFilesByDate(filteredOtherFiles, 2);
    var currentPage = section === 1 ? currentPage1 : currentPage2;
    var paginationControls = section === 1 ? document.getElementById('paginationControls1') : document.getElementById('paginationControls2');
    var pageInfo = section === 1 ? document.getElementById('pageInfo1') : document.getElementById('pageInfo2');
    var pageSelect = section === 1 ? document.getElementById('pageSelect1') : document.getElementById('pageSelect2');
    var midServerName = $('sys_display.mid_server_picker').value;
    var itemsPerPage = section === 1 ? itemsPerPage1 : itemsPerPage2;

    currentPage = page;
    logFilesResult.innerHTML = '';

    var start = (page - 1) * itemsPerPage;
    var end = start + itemsPerPage;
    var paginatedItems = section === 1 ? filteredFiles.slice(start, end) : filteredOtherFiles.slice(start, end);
    filteredFiles.slice(start, end);
    var table = '<table class="results-table"><thead><tr>';
    table += '<th style="width: 5%;">Select</th>';
    table += '<th style="width: 45%;">File</th>';
    if (section === 1) {
        table += '<th style="width: 20%;">Start Date</th><th style="width: 20%;">End Date</th>';
    } else {
        table += '<th style="width: 20%;">Last Modified</th>';
    }
    table += '<th style="width: 10%;">Size (MB)</th></tr></thead><tbody>';
    paginatedItems.forEach(function(file) {
        var isDisabled = isFileInAgentFileTable(file.name, midServerName, file.startDate, file.endDate);
        table += '<tr>';
        table += '<td style="width: 5%;"><input type="checkbox" name="logFile" value="' + file.name + '"';
        if (section === 1) {
            table += ' data-start-date="' + file.startDate + '" data-end-date="' + file.endDate + '"';
        } else {
            table += ' data-last-modified="' + file.endDate + '"';
        }
        //Disable checkbox if file already present in agent_file table
        if (isDisabled) {
            table += ' disabled';
        }
        table += ' onchange="handleCheckbox(this.value,this.checked)"></td>';
        table += '<td style="width: 45%;">' + file.name + '</td>';
        if (section === 1) {
            table += '<td style="width: 20%;">' + file.startDate + '</td><td style="width: 20%;">' + file.endDate + '</td>';
        } else {
            table += '<td style="width: 20%;">' + file.endDate + '</td>';
        }
        table += '<td style="width: 10%;">' + file.size + '</td></tr>';
    });
    table += '</tbody></table>';
    logFilesResult.innerHTML = table;

    document.getElementById('prevPage' + section).disabled = page === 1;
    document.getElementById('nextPage' + section).disabled = end >= filteredFiles.length;

    var totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    pageInfo.innerText = 'Page ' + currentPage + ' of ' + totalPages;
    paginationControls.style.display = 'flex';
    pageSelect.style.display = 'block';
    restoreSelection();
}

function prevPage(section) {
    if (section === 1 && currentPage1 > 1) {
        currentPage1--;
        renderPage(currentPage1, 1);
    } else if (section === 2 && currentPage2 > 1) {
        currentPage2--;
        renderPage(currentPage2, 2);
    }
}

function nextPage(section) {
    if (section === 1 && (currentPage1 * itemsPerPage1) < filteredLogFiles.length) {
        currentPage1++;
        renderPage(currentPage1, 1);
    } else if (section === 2 && (currentPage2 * itemsPerPage2) < filteredOtherFiles.length) {
        currentPage2++;
        renderPage(currentPage2, 2);
    }
}

function updateItemsPerPage(section) {
    if (section == 1) {
        var select = document.getElementById('itemsPerPage1');
        itemsPerPage1 = parseInt(select.value, 10);
        renderPage(currentPage1, section); // Refresh the list with the new itemsPerPage value
    } else {
        var select = document.getElementById('itemsPerPage2');
        itemsPerPage2 = parseInt(select.value, 10);
        renderPage(currentPage2, section);
    }
}

function filterFiles(section) {
    if (section == 1) {
        var searchBar1 = document.getElementById('searchBar1');
        var filter1 = searchBar1.value.toLowerCase();
        var startDateInput = document.getElementsByName('startDate')[0].value;
        var endDateInput = document.getElementsByName('endDate')[0].value;

        var startDate = startDateInput ? new Date(startDateInput) : null;
        var endDate = endDateInput ? new Date(endDateInput) : null;

        filteredLogFiles = logFiles.filter(function(file) {
            var fileStartDate = new Date(file.startDate);
            var fileEndDate = new Date(file.endDate);
            var isNameValid = file.name.toLowerCase().includes(filter1);

            if (startDate && endDate) {
                return fileStartDate >= startDate && fileEndDate <= endDate && isNameValid;
            } else if (startDate) {
                return (fileStartDate >= startDate || fileEndDate >= startDate) && isNameValid;
            } else if (endDate) {
                return (fileEndDate <= endDate || fileStartDate <= endDate) && isNameValid;
            } else {
                return isNameValid;
            }
        });
        renderPage(1, 1);

    } else {
        var searchBar2 = document.getElementById('searchBar2');
        var filter2 = searchBar2.value.toLowerCase();
        filteredOtherFiles = otherFiles.filter(function(file) {
            return file.name.toLowerCase().includes(filter2);
        });
        renderPage(1, 2);
    }
}

function grabLogs() {
    document.getElementById('grabLoader').style.display = 'block';
    var midName = $('sys_display.mid_server_picker').value;

    var ga = new GlideAjax('MIDServerAjax');
    ga.addParam('sysparm_name', 'grabMIDLog');
    ga.addParam('sysparm_agent_name', midName);
    ga.addParam('sysparm_log_files', selectedFiles.toString());
    ga.addParam('sysparm_is_dedicated_selection','true');
    ga.getXMLWait();

    unselectAll();
    restoreSelection();
    toggleGrabLogsButtons();
    refreshGrabResults('Grabbing Logs...', "");
}

// Find if we have the same file on instance where its start and end date covers the start and end dates of the file in MID
function isFileInAgentFileTable(fileName, midServer, startDate, endDate) {
    var agentFileGr = new GlideRecord('agent_file');
    var query = "";

    if (startDate !== 'null' && startDate !== "N/A") {
        startDate = startDate.split(' ');
        query += "start_date<=javascript:gs.dateGenerate('" + startDate[0] + "','" + startDate[1] + "')";
    }
    if (endDate !== 'null' && endDate !== "N/A") {
        endDate = endDate.split(' ');
        if (query) query += "^";
        query += "end_date>=javascript:gs.dateGenerate('" + endDate[0] + "','" + endDate[1] + "')";
    }

    agentFileGr.addQuery('mid_server.name', midServer);
    if (query) {
        agentFileGr.encodedQuery = query;
    }
    agentFileGr.query();

    while (agentFileGr.next()) {
        var filePath = agentFileGr.getValue('path');
        // Compare the name or the filepath to find a match
        if (filePath && (filePath.endsWith(fileName) || fileName.endsWith(agentFileGr.name))) {
            return true;
        }
    }
    return false;
}

function toggleGrabLogsButtons() {
    var grabLogsButton = document.getElementById('grabLogsButton');
    var unselectAllButton = document.getElementById('unselectAllButton');
    grabLogsButton.disabled = selectedFiles.length === 0;
    unselectAllButton.disabled = selectedFiles.length === 0;
}

function refreshGrabResults(action, commandSyd) {
    var loader = document.getElementById('grabLoader');
    var iframe = document.querySelector('#filesList iframe');
    var midServerPicker = $('mid_server_picker').value;
    loader.querySelector('p').innerText = action;
    setTimeout(function() {
        if (!action.includes("Log")) {
            var gr = new GlideRecord('ecc_queue');
            gr.addQuery('response_to', commandSyd);
            gr.query();

            if (!gr.next())
                refreshGrabResults(action, commandSyd);
        }
        iframe.src = 'agent_file_list.do?sysparm_query=mid_server=' + midServerPicker + '^ORDERBYDESCsys_updated_on';
        document.getElementById('filesList').style.display = 'block';
        instancefilesTitle.style.display = 'block';
        loader.style.display = 'none';

    }, 5000);
}

function grabMidSettings() {
    var agentName = $('sys_display.mid_server_picker').value;
    document.getElementById('grabLoader').style.display = 'block';

    var ga = new GlideAjax('MIDServerAjax');
    ga.addParam('sysparm_name', 'grabSettings');
    ga.addParam('sysparm_agent_name', agentName);
    ga.getXMLWait();

    var sys_id = ga.getAnswer();
    refreshGrabResults('Grabbing settings...', sys_id);
}

function grabMidThreadDump() {
    var agentName = $('sys_display.mid_server_picker').value;
    document.getElementById('grabLoader').style.display = 'block';

    var ga = new GlideAjax('MIDServerAjax');
    ga.addParam('sysparm_name', 'threaddump');
    ga.addParam('sysparm_agent_name', agentName);
    ga.getXMLWait();
    var sys_id = ga.getAnswer();
    refreshGrabResults('Grabbing thread dump...', sys_id);
}

function updateSelectedFilesPillsList() {
    var selectedFilesList = document.getElementById('selectedFilesList');
    selectedFilesList.innerHTML = '';

    if (selectedFiles.length > 0) {
        selectedFiles.forEach(function(file) {
            var pill = document.createElement('span');
            pill.className = 'file-pill';
            pill.innerHTML = file + '<span class="remove-icon" onclick="unselectFile(\'' + file + '\')">&times;</span>';
            selectedFilesList.appendChild(pill);
        });
    } else {
        selectedFilesList.innerHTML = '<span class="no-files-pill">No files selected</span>';
    }
}

function restoreSelection() {
    var checkboxes = document.querySelectorAll('input[name="logFile"]');
    checkboxes.forEach(function(checkbox) {
        if (selectedFiles.indexOf(checkbox.value) != -1) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });
}

function handleCheckbox(fileName, checked) {
    if (checked) {
        selectedFiles.push(fileName);
    } else {
        selectedFiles = selectedFiles.filter(item => item !== fileName);
    }
    updateSelectedFilesPillsList();
    toggleGrabLogsButtons();
}

function unselectFile(fileName) {
    //Uncheck checkbox
    var checkbox = document.querySelector('input[name="logFile"][value="' + fileName + '"]');
    if (checkbox) {
        checkbox.checked = false;
    }
    handleCheckbox(fileName, false);
}

function unselectAll() {
    selectedFiles.forEach(function(file) {
        unselectFile(file);
    });
}

function sortFilesByDate(files, section) {
    return files.sort((a, b) => {
        if (section === 1) {
            const startDateA = new Date(a.startDate);
            const startDateB = new Date(b.startDate);
            const endDateA = new Date(a.endDate);
            const endDateB = new Date(b.endDate);

            if (startDateA - startDateB !== 0) {
                return startDateB - startDateA;
            } else {
                return endDateB - endDateA;
            }
        } else {
            const endDateA = new Date(a.endDate);
            const endDateB = new Date(b.endDate);
            return endDateB - endDateA;
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    onLoad();
});
