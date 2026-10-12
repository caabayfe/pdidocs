var topics_servicecatalog;
var topics_sn_hr_core;
var topics_sn_lg_cnt;
var topics_sn_lg_contracts;
var topics_sn_lg_ip;
var topics_sn_lg_ops;
var topics_sn_lg_privacy;
var topics_sn_spend_psd;
var topics_sn_wsd_core;
var topics_sn_hr_core_kiosk;
var topics_sn_wsd_core_kiosk;
var quickLink_app_ex_employee_center_pro_kiosk;
var quickLink_app_ex_guided_help;
var quickLink_app_ex_employee_center;

function revertToOldIcons() {
    // Set runManually to true to execute the script
    var runManually = false;
    if (runManually) {
        var allTopicsArray = [].concat(topics_servicecatalog, topics_sn_hr_core, topics_sn_wsd_core, topics_sn_spend_psd, topics_sn_lg_privacy, topics_sn_lg_ops, topics_sn_lg_cnt, topics_sn_lg_contracts, topics_sn_lg_ip, topics_sn_hr_core_kiosk, topics_sn_wsd_core_kiosk);

        var allQuickLinksArray = [].concat(quickLink_app_ex_employee_center_pro_kiosk, quickLink_app_ex_guided_help, quickLink_app_ex_employee_center);

        // topics
        updateRecordIcons('topic', allTopicsArray);
        // quick links
        updateRecordIcons('sn_ex_sp_quick_link', allQuickLinksArray);

        // topic content search
        renameImage('sn_ex_sp.MESP_empty_state_image_used.png', 'sn_ex_sp.MESP_empty_state_image_staging.png');
        renameImage('sn_ex_sp.MESP_empty_state_image.png', 'sn_ex_sp.MESP_empty_state_image_used.png');
        renameImage('sn_ex_sp.MESP_empty_state_image_staging.png', 'sn_ex_sp.MESP_empty_state_image.png');
    }
}

/**
 * This script updates the icon on the given record.
 *
 * @param {string} tableName - The name of the table (e.g., 'topic' or 'sn_ex_sp_quick_link').
 * @param {Array} records - An array of record objects containing recordSysId, iconSysId, and name.
 */
function updateRecordIcons(tableName, records) {
    records.forEach(function(record) {
        var recordKey = tableName + "_" + record.recordSysId;
        if (!isRecordCustomized(recordKey)) {
            var gr = new GlideRecord(tableName);
            if (gr.get(record.recordSysId)) {
                var attachmentGr = new GlideRecord('sys_attachment');
                if (attachmentGr.get(record.iconSysId)) {
                    attachmentGr.setValue('table_sys_id', record.recordSysId);
                    attachmentGr.update();
                    gr.setValue('icon', record.iconSysId);
                    gr.update();
                    gs.info('Icon updated successfully for record: ' + record.name);
                } else {
                    gs.warn('Icon not found for record: ' + record.name);
                }
            } else {
                gs.warn('Topic not found: ' + record.name);
            }
        }
    });
}

function isRecordCustomized(recordName) {
    var sysUpdateXmlGr = new GlideRecord('sys_update_xml');
    return sysUpdateXmlGr.get('name', recordName);
}

/**
 *  Helper function to rename an image if it exists 
 * @param {string} oldName
 * @param {string} newName
 */
function renameImage(oldName, newName) {
    var imgGR = new GlideRecord('db_image');
    imgGR.addQuery('name', oldName);
    imgGR.query();
    if (imgGR.next()) {
        gs.info('Renaming image: ' + oldName + ' -> ' + newName);
        imgGR.name = newName;
        imgGR.update();
    } else {
        gs.warn('Image not found: ' + oldName);
    }
}

// ==========================================================================
/* Topics - Employee Content Taxonomy  */

topics_servicecatalog = [{
        "recordSysId": "f285d3e7c3053010069aec4b7d40dd46",
        "iconSysId": "ee048c9ceb6530104a299f6713522887",
        "name": "VPN"
    }, {
        "recordSysId": "5c4513e7c3053010069aec4b7d40dd01",
        "iconSysId": "e7a3489ceb6530104a299f6713522870",
        "name": "Software and applications"
    },
    {
        "recordSysId": "5d95d3e7c3053010069aec4b7d40dd37",
        "iconSysId": "0d2400dceb6530104a299f671352283f",
        "name": "Network issues"
    },
    {
        "recordSysId": "6535dfa7c3053010069aec4b7d40dd77",
        "iconSysId": "4f83c49ceb6530104a299f6713522830",
        "name": "Access issues"
    },
    {
        "recordSysId": "676497a7c3053010069aec4b7d40dd89",
        "iconSysId": "6380841ceb6530104a299f6713522827",
        "name": "IT for IT"
    },
    {
        "recordSysId": "782413a7c3053010069aec4b7d40ddf1",
        "iconSysId": "d7ef3fc8eb6530104a299f6713522889",
        "name": "Hardware"
    },
    {
        "recordSysId": "988497a7c3053010069aec4b7d40ddea",
        "iconSysId": "49d0c41ceb6530104a299f67135228d7",
        "name": "Developer services"
    },
    {
        "recordSysId": "a754d3a7c3053010069aec4b7d40dd99",
        "iconSysId": "c360041ceb6530104a299f67135228d5",
        "name": "Privacy and security"
    },
    {
        "recordSysId": "baa45ba7c3053010069aec4b7d40dd4a",
        "iconSysId": "6b62885ceb6530104a299f67135228bb",
        "name": "Printers"
    },
    {
        "recordSysId": "d22413a7c3053010069aec4b7d40ddf8",
        "iconSysId": "7e10001ceb6530104a299f671352287d",
        "name": "Software"
    },
    {
        "recordSysId": "ecc49ba7c3053010069aec4b7d40dd89",
        "iconSysId": "3742085ceb6530104a299f6713522830",
        "name": "Phone and mobility"
    },
    {
        "recordSysId": "3ec49ba7c3053010069aec4b7d40dd7b",
        "iconSysId": "c1110c1ceb6530104a299f67135228b2",
        "name": "Hardware issues"
    },
    {
        "recordSysId": "388513e7c3053010069aec4b7d40ddb1",
        "iconSysId": "70f34c9ceb6530104a299f67135228a3",
        "name": "WiFi"
    },
    {
        "recordSysId": "2a4513e7c3053010069aec4b7d40dd6e",
        "iconSysId": "efc30c9ceb6530104a299f6713522829",
        "name": "Software issues"
    },
    {
        "recordSysId": "165b31ebf4500550f877f91bb76e1867",
        "iconSysId": "db0cb1a3f4500550f877f91bb76e187d",
        "name": "Risk and compliance"
    },
    {
        "recordSysId": "1325dba7c3053010069aec4b7d40ddb4",
        "iconSysId": "9073449ceb6530104a299f6713522884",
        "name": "Email accounts"
    },
    {
        "recordSysId": "0fb45ba7c3053010069aec4b7d40dd40",
        "iconSysId": "a702445ceb6530104a299f6713522852",
        "name": "Accessories"
    },
    {
        "recordSysId": "06d3df67c3053010069aec4b7d40dd70",
        "iconSysId": "b4bfbbc8eb6530104a299f67135228cf",
        "name": "Technology services"
    },
    {
        "recordSysId": "0554d3a7c3053010069aec4b7d40ddd3",
        "iconSysId": "4340c01ceb6530104a299f671352281d",
        "name": "Network"
    },
    {
        "recordSysId": "01e4dba7c3053010069aec4b7d40ddcb",
        "iconSysId": "7122845ceb6530104a299f67135228d4",
        "name": "Asset lifecycle"
    },
    {
        "recordSysId": "01a497a7c3053010069aec4b7d40dd14",
        "iconSysId": "1982c85ceb6530104a299f67135228c5",
        "name": "Computers"
    },
];

topics_sn_hr_core = [{
        "recordSysId": "f887fe0cc3203010069aec4b7d40ddc9",
        "iconSysId": "9c0442a9c3d13010069aec4b7d40ddc1",
        "name": "Time off"
    },
    {
        "recordSysId": "f1017248c3203010069aec4b7d40dddf",
        "iconSysId": "ef038669c3d13010069aec4b7d40ddff",
        "name": "Travel and relocation"
    },
    {
        "recordSysId": "da803a08c3203010069aec4b7d40dd82",
        "iconSysId": "13924269c3d13010069aec4b7d40dd10",
        "name": "Onboarding"
    },
    {
        "recordSysId": "d7e8be4cc3203010069aec4b7d40dd3a",
        "iconSysId": "4a840aa9c3d13010069aec4b7d40dd0f",
        "name": "Education reimbursement"
    },
    {
        "recordSysId": "d5d0fe08c3203010069aec4b7d40dd47",
        "iconSysId": "c0c2c269c3d13010069aec4b7d40dd0a",
        "name": "Career development"
    },
    {
        "recordSysId": "caff7280c3603010069aec4b7d40dd1a",
        "iconSysId": "43c4caa9c3d13010069aec4b7d40ddfe",
        "name": "Talent management"
    },
    {
        "recordSysId": "bdd87e4cc3203010069aec4b7d40dd1d",
        "iconSysId": "a06446a9c3d13010069aec4b7d40dd0a",
        "name": "Leave of absence"
    },
    {
        "recordSysId": "b311b248c3203010069aec4b7d40ddff",
        "iconSysId": "a3334a69c3d13010069aec4b7d40dd08",
        "name": "Policies and procedures"
    },
    {
        "recordSysId": "a367be0cc3203010069aec4b7d40dda6",
        "iconSysId": "ece3ce69c3d13010069aec4b7d40dd65",
        "name": "Time cards"
    },
    {
        "recordSysId": "a2c83e4cc3203010069aec4b7d40ddb0",
        "iconSysId": "c25406a9c3d13010069aec4b7d40dd9b",
        "name": "Retirement"
    },
    {
        "recordSysId": "8dffa608c3203010069aec4b7d40dd56",
        "iconSysId": "db220e29c3d13010069aec4b7d40ddd0",
        "name": "Human resources"
    },
    {
        "recordSysId": "8d11b248c3203010069aec4b7d40dd66",
        "iconSysId": "d213c669c3d13010069aec4b7d40ddbc",
        "name": "Retirement and separations"
    },
    {
        "recordSysId": "87a0be08c3203010069aec4b7d40dd30",
        "iconSysId": "21b28269c3d13010069aec4b7d40dd54",
        "name": "Employee conduct"
    },
    {
        "recordSysId": "82f03248c3203010069aec4b7d40ddb6",
        "iconSysId": "dc030669c3d13010069aec4b7d40ddc4",
        "name": "Employment information"
    },
    {
        "recordSysId": "77b83e4cc3203010069aec4b7d40dd54",
        "iconSysId": "8f4406a9c3d13010069aec4b7d40dddc",
        "name": "Health and wellness"
    },
    {
        "recordSysId": "68e87e4cc3203010069aec4b7d40ddbb",
        "iconSysId": "e36486a9c3d13010069aec4b7d40dda7",
        "name": "Child and dependent care"
    },
    {
        "recordSysId": "67cffe40c3603010069aec4b7d40dd6d",
        "iconSysId": "5ba48aa9c3d13010069aec4b7d40dd48",
        "name": "Job change"
    },
    {
        "recordSysId": "62f8be4cc3203010069aec4b7d40dd28",
        "iconSysId": "6f74c6a9c3d13010069aec4b7d40dd46",
        "name": "Donating and volunteering"
    },
    {
        "recordSysId": "4be0be08c3203010069aec4b7d40dd27",
        "iconSysId": "6fd20669c3d13010069aec4b7d40dd8f",
        "name": "Return to workplace"
    },
    {
        "recordSysId": "3fdf3280c3603010069aec4b7d40dd1a",
        "iconSysId": "bdb48aa9c3d13010069aec4b7d40ddf1",
        "name": "Career growth"
    },
    {
        "recordSysId": "3860ba08c3203010069aec4b7d40dd5c",
        "iconSysId": "6782ce29c3d13010069aec4b7d40ddf5",
        "name": "Pay and time"
    },
    {
        "recordSysId": "17ef3280c3603010069aec4b7d40dd76",
        "iconSysId": "e8c4caa9c3d13010069aec4b7d40dd93",
        "name": "Training and certification"
    },
    {
        "recordSysId": "0ebfb600c3603010069aec4b7d40dd6c",
        "iconSysId": "f8a44aa9c3d13010069aec4b7d40dddf",
        "name": "Promotions"
    },
    {
        "recordSysId": "0ce0fe08c3203010069aec4b7d40ddde",
        "iconSysId": "aac28269c3d13010069aec4b7d40dd7c",
        "name": "HR systems"
    },
    {
        "recordSysId": "09004380c3603010069aec4b7d40dda4",
        "iconSysId": "76d40ea9c3d13010069aec4b7d40dd18",
        "name": "Performance"
    },
    {
        "recordSysId": "0757360cc3203010069aec4b7d40ddff",
        "iconSysId": "add38e69c3d13010069aec4b7d40dddd",
        "name": "Compensation"
    },
    {
        "recordSysId": "0277be0cc3203010069aec4b7d40ddb5",
        "iconSysId": "8be302a9c3d13010069aec4b7d40ddaf",
        "name": "Tax information"
    },
    {
        "recordSysId": "00a03e08c3203010069aec4b7d40dded",
        "iconSysId": "62a24269c3d13010069aec4b7d40ddc2",
        "name": "Benefits"
    }
];

topics_sn_lg_cnt = [{
    "recordSysId": "af62e204c3203010069aec4b7d40dd0e",
    "iconSysId": "62cfcae5c3153010069aec4b7d40dd89",
    "name": "Contracts"
}];

topics_sn_lg_contracts = [{
    "recordSysId": "af62e204c3203010069aec4b7d40dd0e",
    "iconSysId": "62cfcae5c3153010069aec4b7d40dd89",
    "name": "Contracts"
}];

topics_sn_lg_ip = [{
    "recordSysId": "d0a26e04c3203010069aec4b7d40dd73",
    "iconSysId": "c2ef4ee5c3153010069aec4b7d40dd95",
    "name": "Intellectual property"
}];

topics_sn_lg_ops = [{
        "recordSysId": "a501aec0c3203010069aec4b7d40dd3a",
        "iconSysId": "00cf8ae5c3153010069aec4b7d40ddb2",
        "name": "Legal services"
    },
    {
        "recordSysId": "9d922e04c3203010069aec4b7d40ddac",
        "iconSysId": "7fdf0ee5c3153010069aec4b7d40ddd0",
        "name": "Ethics and compliance"
    }
];

topics_sn_lg_privacy = [{
    "recordSysId": "cc82a204c3203010069aec4b7d40ddcb",
    "iconSysId": "85df0ee5c3153010069aec4b7d40dd16",
    "name": "Privacy and data"
}];

topics_sn_spend_psd = [{
        "recordSysId": "f2bdae84c3203010069aec4b7d40dd9d",
        "iconSysId": "25dd6490eb2930104a299f6713522839",
        "name": "Invoices"
    },
    {
        "recordSysId": "c5ed62c4c3203010069aec4b7d40dd61",
        "iconSysId": "a21ea890eb2930104a299f6713522837",
        "name": "Purchase requests"
    },
    {
        "recordSysId": "90fda2c4c3203010069aec4b7d40ddf4",
        "iconSysId": "9c3ee890eb2930104a299f67135228f1",
        "name": "Travel and expenses"
    },
    {
        "recordSysId": "8dcd62c4c3203010069aec4b7d40dd1b",
        "iconSysId": "abed2890eb2930104a299f6713522864",
        "name": "Supplier services"
    },
    {
        "recordSysId": "35dd62c4c3203010069aec4b7d40ddb4",
        "iconSysId": "c50e6890eb2930104a299f6713522825",
        "name": "Corporate cards"
    },
    {
        "recordSysId": "0a3d6a84c3203010069aec4b7d40ddc9",
        "iconSysId": "6bbd2490eb2930104a299f67135228fe",
        "name": "Purchases and expenses"
    }
];

topics_sn_wsd_core = [{
        "recordSysId": "f8202d67c3303010069aec4b7d40dd53",
        "iconSysId": "468c6410eb2930104a299f6713522814",
        "name": "Food and catering"
    },
    {
        "recordSysId": "ad302d67c3303010069aec4b7d40dde5",
        "iconSysId": "b79c6410eb2930104a299f67135228f9",
        "name": "Events"
    },
    {
        "recordSysId": "888f5567c3303010069aec4b7d40dd99",
        "iconSysId": "e848a85cebe530104a299f6713522884",
        "name": "Workplace services"
    },
    {
        "recordSysId": "8750ed67c3303010069aec4b7d40dd4a",
        "iconSysId": "12fce810eb2930104a299f67135228bb",
        "name": "Maintenance"
    },
    {
        "recordSysId": "7f306d67c3303010069aec4b7d40dd7b",
        "iconSysId": "b5bce410eb2930104a299f6713522874",
        "name": "Transportation"
    },
    {
        "recordSysId": "46406d67c3303010069aec4b7d40dd5b",
        "iconSysId": "1bcc6810eb2930104a299f6713522805",
        "name": "Building access"
    },
    {
        "recordSysId": "3050ad67c3303010069aec4b7d40dd34",
        "iconSysId": "94eca810eb2930104a299f6713522852",
        "name": "Site safety"
    },
    {
        "recordSysId": "1b10e567c3303010069aec4b7d40dda1",
        "iconSysId": "906ca010eb2930104a299f67135228fd",
        "name": "Furniture and supplies"
    }
];

// ==========================================================================
/* Topics - EC Kiosk  */
topics_sn_hr_core_kiosk = [{
        "recordSysId": "0df87a3b43b982108c5d43d488b8f264",
        "iconSysId": "81f87a3b43b982108c5d43d488b8f267",
        "name": "Leave of Absence"
    },
    {
        "recordSysId": "b548baf743b982108c5d43d488b8f254",
        "iconSysId": "3d48baf743b982108c5d43d488b8f256",
        "name": "Benefits"
    },
    {
        "recordSysId": "b598723b43b982108c5d43d488b8f20b",
        "iconSysId": "3d98723b43b982108c5d43d488b8f20d",
        "name": "Compensation"
    },
    {
        "recordSysId": "c1b8363b43b982108c5d43d488b8f2a0",
        "iconSysId": "49b8363b43b982108c5d43d488b8f2a2",
        "name": "Time off"
    },
    {
        "recordSysId": "d2e7b2f743b982108c5d43d488b8f299",
        "iconSysId": "5ae7b2f743b982108c5d43d488b8f29b",
        "name": "Pay and time"
    }
];

topics_sn_wsd_core_kiosk = [{
        "recordSysId": "8439be3b43b982108c5d43d488b8f256",
        "iconSysId": "4c39be3b43b982108c5d43d488b8f259",
        "name": "Workplace services"
    },
    {
        "recordSysId": "9649727b43b982108c5d43d488b8f276",
        "iconSysId": "1e49727b43b982108c5d43d488b8f278",
        "name": "Site safety"
    },
];

// // ==========================================================================
// /* Quick Links */

quickLink_app_ex_employee_center_pro_kiosk = [{
        "recordSysId": "a038e7bf25318610f877e921a5b623d3",
        "iconSysId": "7d5863bf25318610f877e921a5b623e5",
        "name": "Report Health and Safety Incident"
    },
    {
        "recordSysId": "cd01b89143a11210ab7e29f026b8f282",
        "iconSysId": "63afe75d43a11210ab7e29f026b8f20a",
        "name": "Schedule appointment"
    }
];

quickLink_app_ex_guided_help = [{
    "recordSysId": "b5a5b90debfa0210860f9f6713522848",
    "iconSysId": "eb01c209eb3e0210860f9f6713522804",
    "name": "Time off request guide"
}];

quickLink_app_ex_employee_center = [{
        "recordSysId": "ea85a44c43b431507d2f52cba5b8f21a",
        "iconSysId": "d385393e43f031107d2f52cba5b8f20e",
        "name": "Request profile update"
    },
    {
        "recordSysId": "22f514cc437cfd107d2f52cba5b8f264",
        "iconSysId": "6c75753e43f031107d2f52cba5b8f268",
        "name": "Request password reset"
    },
    {
        "recordSysId": "0eb4d04c437cfd107d2f52cba5b8f225",
        "iconSysId": "1855713e43f031107d2f52cba5b8f2e8",
        "name": "Report IT issue"
    },
    {
        "recordSysId": "b8d5200043f431507d2f52cba5b8f28f",
        "iconSysId": "19257dfa43f031107d2f52cba5b8f28a",
        "name": "Ask HR question"
    }
];

revertToOldIcons();
