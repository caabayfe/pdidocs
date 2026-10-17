/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // Must be in release date order, newest first
    // Entries beyond the fourth should be removed (ignoring future releases) but will not cause issues if kept
    var familyInfo = [{
            "name": "Yokohama",
            "date": "2025-03-12",
            "link": "https://docs.servicenow.com/bundle/yokohama-release-notes/page/release-notes/quality/yokohama-security-notables.html"
        },
        {
            "name": "Xanadu",
            "date": "2024-08-01",
            "link": "https://docs.servicenow.com/bundle/xanadu-release-notes/page/release-notes/quality/xanadu-security-notables.html"
        }, {
            "name": "Washington",
            "date": "2024-03-20",
            "link": "https://docs.servicenow.com/bundle/washingtondc-release-notes/page/release-notes/quality/washingtondc-security-notables.html"
        },
        {
            "name": "Vancouver",
            "date": "2023-09-20",
            "link": "https://docs.servicenow.com/bundle/vancouver-release-notes/page/release-notes/quality/vancouver-security-notables.html"
        }
    ];

    // Must be in release date order, newest first
    // Entries beyond the fourth should be removed (ignoring future releases) but will not cause issues if kept
    var storeInfo = [{
        "name": "Security Center v2.1.0",
        "date": "2025-01-30",
        "link": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/a51d46e3f2014110366b10017c5ba675/2.1.0"
    }, {
        "name": "Security Center v2.0.4",
        "date": "2024-12-05",
        "link": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/a51d46e3f2014110366b10017c5ba675/2.0.4"
    }, {
        "name": "Security Center v1.6.1",
        "date": "2024-10-17",
        "link": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/a51d46e3f2014110366b10017c5ba675/1.6.1"
    }, {
        "name": "Security Center v1.5.4",
        "date": "2024-05-09",
        "link": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/a51d46e3f2014110366b10017c5ba675/1.5.4"
    }];

    /**
     * Gets a String date from a Date object in the given format
     *
     * @param {Date}	date		Date object to get the date from
     * @param {String}	format		String date format (EX: 'yyyy-MM-dd'
     */
    function formatDate(date, format) {
        const map = {
            'yyyy': date.getFullYear(),
            'MM': String(date.getUTCMonth() + 1).padStart(2, '0'),
            'dd': String(date.getUTCDate()).padStart(2, '0')
        };

        return format.replace(/yyyy|MM|dd/g, function(matched) {
            return map[matched];
        });
    }

    /**
     * Writes the properties from the info param into the tableVars param
     * if the info[index].date is in the past.
     * This only adds the first 4 valid entries.
     *
     * @param {Array}	info		Input Array of Objects containing
     *					"name", "date", "link" variables
     * @param {Object}	tableVars	The Object to insert
     *					all of the variable into
     */
    function writeTableEntries(info, tableVars) {
        var now = new Date();
        var entry = 0;
        var maxEntries = 4;
        for (var i = 0; entry < maxEntries; i++) {
            if (i >= info.length) {
                tableVars["visibility_" + entry] = 'none';
                entry++;
                continue;
            }
            var releaseDate = new Date(info[i].date);
            var userFormat = api.context.session.user.dateFormat;
            if (now > releaseDate) {
                tableVars["visibility_" + entry] = '';
                tableVars["name_" + entry] = helpers.translateSync("{0}", info[i].name);
                tableVars["date_" + entry] = formatDate(releaseDate, userFormat);
                tableVars["link_" + entry] = info[i].link;
                entry++;
            }
        }
    }

    let storeVars = {};
    let familyVars = {};
    writeTableEntries(storeInfo, storeVars);
    writeTableEntries(familyInfo, familyVars);
    let msg_sc_title = helpers.translateSync('Security Center app release notes');
    let msg_app_version = helpers.translateSync('App version');
    let msg_release_date = helpers.translateSync('Release date');
    let msg_platsec_fixes = helpers.translateSync('Now Platform security fixes');
    let msg_plat_ver = helpers.translateSync('Platform version');

    var baseHTML = `<style type="text/css">
	.sc-td:hover {
		background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));
	}
	.sc-cell {
		padding-right: calc(var(--now-scale-space--sm, 1)*0.5rem);
		padding-left: calc(var(--now-scale-space--lg, 1)*1rem);
		padding-bottom: calc(var(--now-scale-space--sm, 1)*0.5rem);
		padding-top: calc(var(--now-scale-space--sm, 1)*0.5rem);
		align-items: center;
		color: RGB(var(--now-color_text--primary,var(--now-color--neutral-18,22,27,28)));
		font-size: 1rem;
		min-height: calc(1.25rem + var(--now-grid-cell--scale-size-block, 1)*2.5rem/2);
		position: relative;
		text-decoration: none;
		width: 50%;
		height: auto;
	}
  
	.sc-th {
		text-align: left;
	}
   
	.sc-table {
		border-collapse: collapse;
		width: 100%;
	}

	.sc-text-link {
		color: RGB(var(--now-text-link--primary--color,var(--now-color--secondary-1,1,119,142)));
		font-style: var(--now-text-link--font-style,inherit);
		font-weight: var(--now-text-link--font-weight,inherit);
		font-family: var(--now-text-link--font-family,inherit);
		text-transform: var(--now-text-link--text-transform,inherit);
		text-decoration: none;
	}

	tbody tr:nth-child(2n+3) {
		background: RGB(var(--now-color_background--secondary,var(--now-color--neutral-1,246,247,247)));
	}

	.sc-card {
		width: 50%;
		padding: calc(1rem*var(--now-card--scale-size, 1));
		border: solid;
		border-width: 1px;
		border-radius: var(--now-static-border-radius--md, 0.25rem);
		border-color: RGB(var(--now-card--border-color,211,214,220));
		display: flex;
		align-items: stretch;
		flex-direction: column;
		justify-content: space-between;
		background: RGB(var(--now-color_background--primary));
		box-shadow: var(--now-static-drop-shadow--sm);
		margin-left: 0.125rem;
		margin-right: 0.125rem;
		margin-bottom: 0.25rem;
	}

	.sc-card-title {
		font-family: Lato;
		font-size: 24px;
		font-weight: 600;
		line-height: 29px;
		letter-spacing: 0px;
		text-align: left;
	}

	.sc-flex-container {
		display: flex;
  }

	.sc-button {
		user-select: none;
		width: 100%;
		border: solid;
		border-radius: var(--now-button--border-radius,var(--now-actionable--border-radius,0.125rem));
		border-width: var(--now-button--secondary--border-width,var(--now-button--border-width,var(--now-actionable--border-width,1px)));
		color: RGB(var(--now-button--secondary--color,var(--now-color--secondary-2,1,89,107)));
		text-align: center;
		cursor: pointer;
		min-height: calc(1rem + var(--now-button--scale-size-block, 1)*2rem/2);
		font-size: 1rem;
		line-height: calc(1rem + var(--now-button--scale-size-block, 1)*2rem/2);
		font-family: Lato;
		font-size: 16px;
		font-weight: 700;
		background-color: RGBA(var(--now-button--secondary--background-color,var(--now-color_background--tertiary,var(--now-color--neutral-2,228,230,231))),var(--now-button--secondary--background-color-alpha,1));
	}

	.sc-button:hover {
		border-color: RGB(var(--now-button--secondary--border-color--hover,var(--now-color--neutral-7,135,147,148)));
		color: RGB(var(--now-button--secondary--color--hover,var(--now-color--secondary-2,1,89,107)));
		background-color: RGBA(var(--now-button--secondary--background-color--hover,var(--now-color--neutral-3,209,214,214)),var(--now-button--secondary--background-color-alpha--hover,1));
	}

	.sc-button:focus {
		box-shadow: inset 0 0 0 2px RGB(var(--now-color_focus-ring,var(--now-color--secondary-1,1,119,142))),inset 0 0 0 3px RGB(var(--now-color_focus-ring_shadow,var(--now-color_background--primary,var(--now-color--neutral-0,255,255,255))));
		outline: none;
	}

	.sc-button:active {
		border-color: RGB(var(--now-button--secondary--border-color--active,var(--now-color--neutral-7,135,147,148)));
		color: RGB(var(--now-button--secondary--color--active,var(--now-color--secondary-3,1,60,71)));
		background-color: RGBA(var(--now-button--secondary--background-color--active,var(--now-color--neutral-5,172,180,181)),var(--now-button--secondary--background-color-alpha--active,1));
	}
  
</style>
<div class="sc-flex-container">
<div class="sc-card">
<div>
<div class="sc-card-title">${msg_sc_title}</div>
<div>&nbsp;</div>
<table class="sc-table">
<tbody>
<tr>
<th class="sc-cell sc-th">${msg_app_version}</th>
<th class="sc-cell sc-th">${msg_release_date}</th>
</tr>
<tr style="display: ${storeVars.visibility_0};">
<td class="sc-cell sc-td"><a class="sc-text-link" href="${storeVars.link_0}" target="_blank" rel="noopener noreferrer nofollow">${storeVars.name_0}</a></td>
<td class="sc-cell sc-td">${storeVars.date_0}</td>
</tr>
<tr style="display: ${storeVars.visibility_1};">
<td class="sc-cell sc-td"><a class="sc-text-link" href="${storeVars.link_1}"" target="_blank" rel="noopener noreferrer nofollow">${storeVars.name_1}</a></td>
<td class="sc-cell sc-td">${storeVars.date_1}</td>
</tr>
<tr style="display: ${storeVars.visibility_2};">
<td class="sc-cell sc-td"><a class="sc-text-link" href="${storeVars.link_2}" target="_blank" rel="noopener noreferrer nofollow">${storeVars.name_2}</a></td>
<td class="sc-cell sc-td">${storeVars.date_2}</td>
</tr>
<tr style="display: ${storeVars.visibility_3};">
<td class="sc-cell sc-td"><a class="sc-text-link" href="${storeVars.link_3}"" target="_blank" rel="noopener noreferrer nofollow">${storeVars.name_3}</a></td>
<td class="sc-cell sc-td">${storeVars.date_3}</td>
</tr>
</tbody>
</table>
</div>
</div>
<div style="width: 24px;">&nbsp;</div>
<div class="sc-card">
<div>
<div class="sc-card-title">${msg_platsec_fixes}</div>
<div>&nbsp;</div>
<table class="sc-table">
<tbody>
<tr>
<th class="sc-cell sc-th">${msg_plat_ver}</th>
<th class="sc-cell sc-th">${msg_release_date}</th>
</tr>
<tr style="display: ${familyVars.visibility_0};">
<td class="sc-cell sc-td"><a class="sc-text-link" href="${familyVars.link_0}" target="_blank" rel="noopener noreferrer nofollow">${familyVars.name_0}</a></td>
<td class="sc-cell sc-td">${familyVars.date_0}</td>
</tr>
<tr style="display: ${familyVars.visibility_1};">
<td class="sc-cell sc-td"><a class="sc-text-link" href="${familyVars.link_1}"" target="_blank" rel="noopener noreferrer nofollow">${familyVars.name_1}</a></td>
<td class="sc-cell sc-td">${familyVars.date_1}</td>
</tr>
<tr style="display: ${familyVars.visibility_2};">
<td class="sc-cell sc-td"><a class="sc-text-link" href="${familyVars.link_2}" target="_blank" rel="noopener noreferrer nofollow">${familyVars.name_2}</a></td>
<td class="sc-cell sc-td">${familyVars.date_2}</td>
</tr>
<tr style="display: ${familyVars.visibility_3};">
<td class="sc-cell sc-td"><a class="sc-text-link" href="${familyVars.link_3}"" target="_blank" rel="noopener noreferrer nofollow">${familyVars.name_3}</a></td>
<td class="sc-cell sc-td">${familyVars.date_3}</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>`;
    return baseHTML;
}
