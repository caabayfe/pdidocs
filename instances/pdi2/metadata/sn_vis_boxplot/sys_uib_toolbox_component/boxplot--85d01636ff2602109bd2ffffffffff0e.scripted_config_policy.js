
function policy(args) {
	
var policy;(()=>{"use strict";var e={d:(a,t)=>{for(var i in t)e.o(t,i)&&!e.o(a,i)&&Object.defineProperty(a,i,{enumerable:!0,get:t[i]})},o:(e,a)=>Object.prototype.hasOwnProperty.call(e,a),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},a={};e.r(a),e.d(a,{default:()=>J});const t=(e,a)=>a.reduce(((a,t)=>{return Object.assign(a,{[t[0]]:(i=e[t[0]],r=t[1],("string"==typeof i?JSON.parse(i):i)||r)});var i,r}),{...e}),i=(e,a)=>e.forEach((e=>{try{e(a)}catch(e){console.error(e)}})),r=(e,a)=>e&&e.some((e=>e.sourceType===a)),o=[{label:"Name",value:"name"},{label:"Value",value:"value"},{label:"Group bucket",value:"bucket"},{label:"Report range",value:"report_range"},{label:"Element order",value:"choice"}],p="paKpi",d="u2",s="metricBase",l="appsee",u={value:"#FFFFFF",themeVariable:"--now-color_background--primary"},n={value:"#4F5C62",themeVariable:"--now-color_text--tertiary"},c=[({api:e,trigger:a,properties:t})=>{a||(e.updateVisibility("showChange",!1),e.updateVisibility("showChangePercentage",!1),e.updateVisibility("showForecast",!1),e.updateVisibility("par-forecast-config",!1),e.updateVisibility("showForecastRange",!1),e.updateVisibility("showConfidenceBand",!1),e.updateVisibility("showGapPercentage",!1),e.updateVisibility("showSparkline",!1),e.updateVisibility("showMetricLabel",!1),e.updateVisibility("showThreshold",!1),e.updateVisibility("showTarget",!1),e.updateVisibility("showComment",!1),e.updateVisibility("showTotalValue",!1),e.updateVisibility("enableRealTimeUpdate",!1),e.updateVisibility("enableClickAndStay",!1),e.updateVisibility("par-refresh-frequency",!1),e.updateVisibility("showTrend",!1),e.updateVisibility("iconStyle",!1),e.updateVisibility("par-additional-group-by",!1),e.updateInterfaceMetadata("par-data-sources","disableRanges",!1),e.updateInterfaceMetadata("par-group-by","disableRanges",!1),e.updateValue("showTotalAggregate",!1),e.updateValue("showSubAggregate",!1),e.updateValue("showFirstGroupAggregate",!1),e.updateValue("showSecondGroupAggregate",!1),e.updateValue("hideMatrixAggregate",!1),e.updateValue("newReporting",!1));const{trendBy:i,groupBy:r,dataPassthrough:o}=t,p=r&&r.length>0,d=o&&(Array.isArray(o)||"object"==typeof o)&&o.length,s=e.isDynamic("dataPassthrough");e.isDynamic("dataSources")||s||d||!i&&!p||e.updateValue("showSparkline",!1)},({api:e,properties:a,trigger:t})=>{const{showDataPassthrough:i}=a;i||(e.updateValue("dataPassthrough",null),e.updateValue("sharedContext",null)),i&&(e.updateVisibility("enableAddZerosAtApi",!1),e.updateValue("enableAddZerosAtApi",!1)),e.updateSectionVisibility("metricSection",!i),e.updateSectionVisibility("groupBySection",!i),e.updateSectionVisibility("trendBySection",!i),e.updateSectionVisibility("dateRangeSection",!i),e.updateVisibility("dataPassthrough",!!i),e.updateVisibility("sharedContext",!!i),e.updateVisibility("par-data-sources",!i),"showDataPassthrough"===t&&i&&(e.updateValue("dataSources",null),e.updateValue("trendBy",null),e.updateValue("groupBy",null),e.updateValue("metrics",null),e.updateValue("additionalGroupByConfig",null));const r=e.isDynamic("dataSources"),o=Boolean(r||i||e.isDynamic("showDataPassthrough"));e.updateInterfaceMetadata("par-metrics","isDynamic",r),e.updateInterfaceMetadata("par-group-by","isDynamic",r),e.updateInterfaceMetadata("par-trend-by","isDynamic",r),e.updateInterfaceMetadata("par-colors","isDynamic",i||r),e.updateVisibility("useDataCache",r),e.updateVisibility("cacheExpirationTime",r),e.updateVisibility("showCacheTime",o),(({api:e,properties:a,trigger:t})=>{e.updateVisibility("showHeaderSeparator",a.showHeader),e.updateVisibility("wrapTitle",a.showHeader),e.updateVisibility("headerTitle",a.showHeader),e.updateVisibility("headingLevel",a.showHeader),e.updateVisibility("description",a.showHeader),e.updateVisibility("contextMenuActions",a.showHeader),e.updateVisibility("showRefresh",a.showHeader),e.updateVisibility("showExportOptions",a.showHeader),e.updateVisibility("title",!1),e.updateVisibility("lineClamp",e.updateVisibility("lineClamp",a.showHeader&&!a.wrapTitle),e.updateVisibility("headerTitleAlignment",a.showHeader),a.showHeader&&!a.wrapTitle),(({api:e,properties:a})=>{e.updateInterfaceMetadata("par-header-color-selector","propId","headerColor"),e.updateInterfaceMetadata("par-header-color-selector","displayColor",a.headerColor),e.updateInterfaceMetadata("par-header-color-selector","defaultColor",u),e.updateInterfaceMetadata("par-header-color-selector","colorCategories",["defaultBackgroundColor","backgroundColors"]),e.updateInterfaceMetadata("par-header-color-selector","label","Header background color"),e.updateInterfaceMetadata("par-header-color-selector","tooltipContent","Choose a header background color to align with your theme, branding, or design preferences. The selected color applies only to the header of this visualization. For better accessibility, ensure sufficient contrast between the header background and title text. Use the contrast ratio checker within the color picker to verify. Note that theming is not supported when selecting a custom color."),e.updateVisibility("par-header-color-selector",a.showHeader)})({api:e,properties:a}),(({api:e,properties:a})=>{e.updateInterfaceMetadata("par-title-color-selector","propId","titleColor"),e.updateInterfaceMetadata("par-title-color-selector","colorCategories",["defaultTextColor","textColors"]),e.updateInterfaceMetadata("par-title-color-selector","label","Title color"),e.updateInterfaceMetadata("par-title-color-selector","comparisonColor",a.headerColor&&Object.keys(a.headerColor).length>0?a.headerColor:u),e.updateInterfaceMetadata("par-title-color-selector","displayColor",a.titleColor),e.updateInterfaceMetadata("par-title-color-selector","defaultColor",n),e.updateInterfaceMetadata("par-title-color-selector","tooltipContent","Select a color for the chart title to align it with your dashboard theme, branding, or design preferences. The chosen color will apply only to the title of the visualization. For better accessibility, ensure sufficient contrast between the header background and title text. You can verify this by checking the contrast ratio within the color picker. Note that theming is not supported when selecting a custom color."),e.updateVisibility("par-title-color-selector",!(!a.showHeader||!a.headerTitle&&!a.title))})({api:e,properties:a}),"showHeader"!=t||a.showHeader||(e.updateValue("headerColor",null),e.updateValue("titleColor",null)),"headerTitle"!=t||a.headerTitle||e.updateValue("titleColor",null),a.title&&!a.headerTitle&&(e.updateValue("title",void 0),e.updateValue("headerTitle","object"==typeof a.title?a.title.message:a.title))})({api:e,properties:a,trigger:t}),(({api:e,properties:a})=>{e.updateVisibility("bareBorder",!a.showBorder),a.showBorder&&e.updateValue("bareBorder",!1)})({api:e,properties:a,trigger:t}),r||((({api:e,properties:a})=>{const{backgroundRefreshInterval:t}=a;t&&Number(t)<0&&e.updateValue("backgroundRefreshInterval","")})({api:e,properties:a,trigger:t}),(({api:e,properties:a,trigger:t})=>{const{followFilters:i}=a;"followFilters"===t&&e.updateValue("showFilterIcon",i),e.updateVisibility("showFilterIcon",i)})({api:e,properties:a,trigger:t}),(({api:e,properties:a})=>{const{followFilters:t,filterPerMetric:i,metrics:r}=a;e.updateInterfaceMetadata("par-filter-per-metric","filterPerMetric",i),(!t||r.length<2)&&e.updateValue("filterPerMetric",[]),e.updateVisibility("par-filter-per-metric",t&&r.length>1)})({api:e,properties:a,trigger:t})),e.updateVisibility("backgroundRefreshInterval",!i)},({api:e,properties:a})=>{const t=r(a.dataSources,s);e.updateVisibility("dateFormat",t)},({api:e,properties:a,trigger:t})=>{"dataSources"!==t&&t||(e.updateInterfaceMetadata("par-metrics","dataSources",a.dataSources),e.updateInterfaceMetadata("par-group-by","dataSources",a.dataSources),e.updateInterfaceMetadata("par-additional-group-by","dataSources",a.dataSources),e.updateInterfaceMetadata("par-date-input-start","dataSources",a.dataSources),e.updateInterfaceMetadata("par-date-input-end","dataSources",a.dataSources),e.updateInterfaceMetadata("par-trend-by","dataSources",a.dataSources),e.updateInterfaceMetadata("par-colors","dataSources",a.dataSources),e.updateInterfaceMetadata("par-forecast-config","dataSources",a.dataSources),e.updateInterfaceMetadata("par-filter-per-metric","dataSources",a.dataSources))},({api:e,properties:a})=>{e.updateInterfaceMetadata("par-trend-by","metrics",a.metrics),e.updateInterfaceMetadata("par-group-by","metrics",a.metrics),e.updateInterfaceMetadata("par-additional-group-by","metrics",a.metrics),e.updateInterfaceMetadata("par-colors","metrics",a.metrics),e.updateInterfaceMetadata("par-data-sources","metrics",a.metrics),e.updateInterfaceMetadata("par-filter-per-metric","metrics",a.metrics),e.updateInterfaceMetadata("par-forecast-config","metrics",a.metrics)},({api:e,properties:a,trigger:t})=>{"trendBy"!==t&&t||e.updateInterfaceMetadata("par-data-sources","trendBy",a.trendBy)},({api:e,properties:a,trigger:t})=>{"additionalGroupByConfig"!==t&&t||e.updateInterfaceMetadata("par-data-sources","additionalGroupByConfig",a.additionalGroupByConfig)},({api:e,properties:a,trigger:t})=>{"groupBy"!==t&&t||(e.updateInterfaceMetadata("par-data-sources","groupBy",a.groupBy),e.updateInterfaceMetadata("par-additional-group-by","groupBy",a.groupBy),e.updateInterfaceMetadata("par-colors","groupBy",a.groupBy),e.updateInterfaceMetadata("par-forecast-config","groupBy",a.groupBy))},({api:e,properties:a})=>{a.showDataPassthrough&&e.updateInterfaceMetadata("par-colors","dataPassthrough",a.dataPassthrough),e.updateInterfaceMetadata("par-forecast-config","dataPassthrough",a.dataPassthrough)},({api:e,properties:a})=>{e.updateInterfaceMetadata("par-date-input-end","value",a.endTime),e.updateInterfaceMetadata("par-date-input-start","value",a.startTime)},({api:e,properties:a})=>{const{hideDevSettings:t,showDataPassthrough:i}=a;e.updateVisibility("refreshRequest",!i&&!t),e.updateVisibility("showExtendedErrorMessages",!t),e.updateVisibility("showDataPassthrough",!t),e.updateVisibility("enableDrilldown",!t),e.updateVisibility("headingLevel",!t),e.updateVisibility("par-chart-size",!t),e.updateVisibility("contextMenuActions",!t),e.updateVisibility("showFilterAsSeparateSeries",!t)},({api:e,properties:a})=>{const{enableCustomEmptyState:t}=a;e.updateSectionVisibility("infoMessagesSection",!0),e.updateVisibility("emptyStateIllustration",t),e.updateVisibility("emptyStateHeading",t),e.updateVisibility("emptyStateHeadingLevel",t),e.updateVisibility("emptyStateContent",t),e.updateVisibility("emptyStateAlignment",t)},({api:e,properties:a})=>{const{hideDevSettings:t,showDataPassthrough:i,useDataCache:r,backgroundRefreshInterval:o,refreshFrequency:p,enableRealTimeUpdate:d,refreshRequest:s}=a,l=Boolean(!i&&!t&&!(d||s>0||p>0||o>0));e.updateVisibility("useDataCache",l),e.updateVisibility("cacheExpirationTime",Boolean(e.isDynamic("useDataCache")||r)),e.updateVisibility("showCacheTime",Boolean(e.isDynamic("useDataCache")||r)),e.updateEnabled("useDataCache",l),r&&!l&&e.updateValue("useDataCache",!1)},({api:e,trigger:a})=>{e.updateVisibility("showFilterAsSeparateSeries",!1),"followFilters"===a&&(e.updateValue("showFilterAsSeparateSeries",!1),e.updateEnabled("showFilterAsSeparateSeries",!1))},e=>{const{api:a,properties:{groupBy:t,dataSources:i,sortBy:d}}=e;(a.isDynamic("dataSources")||i&&i.length)&&!r(i,p)?(["sortBy","sortByOrder"].forEach((e=>a.updateVisibility(e,!0))),a.updateSectionVisibility("sortingSection",!0)):a.updateSectionVisibility("sortingSection",!1);const s=o.filter((e=>!("bucket"===e.value&&!(e=>e&&e.length&&e[0].groupBy&&e[0].groupBy.length&&e[0].groupBy.some((e=>e.isPaBucket))||!1)(t)||"report_range"===e.value&&!(e=>e&&e.length&&e[0].groupBy&&e[0].groupBy.length&&e[0].groupBy.some((e=>e.isRange))||!1)(t)||"choice"===e.value&&!(e=>e&&e.length&&e[0].groupBy&&e[0].groupBy.length&&e[0].groupBy.some((e=>e.isChoice))||!1)(t))));s.find((e=>e.value===d))||(a.updateValue("sortBy","value"),a.updateValue("sortByOrder","desc")),a.updateTypeMetadata("sortBy","choices",s)},({api:e,trigger:a,properties:t})=>{"colorConfig"===a?e.updateValue("rangesConfig",{}):t.rangesConfig?.data&&e.updateValue("colorConfig",{})}],y=[({trigger:e,properties:a,api:t})=>{const i=a.groupBy,r=[{label:"Name",value:"name",condition:()=>!0},{label:"Value",value:"value",condition:()=>!0},{label:"Group bucket",value:"bucket",condition:()=>i.some((e=>e.groupBy.some((e=>e.isPaBucket))))},{label:"Element order",value:"choice",condition:()=>i.some((e=>e.groupBy.some((e=>e.isChoice))))}].filter((e=>e.condition())).map((({label:e,value:a})=>({label:e,value:a})));"sortBy"===e&&t.updateValue("sortByOrder","value"===a.sortBy?"desc":"asc"),t.updateTypeMetadata("sortBy","choices",r)},({api:e,trigger:a,properties:t})=>{const{followFilters:i}=t;e.updateVisibility("followFilters",!0),e.updateVisibility("showFilterIcon",i),"dataSources"===a&&(e.updateValue("showFilterIcon",!0),e.updateValue("followFilters",!0))},({api:e,properties:a})=>{const{enableRealTimeUpdate:t}=a;e.updateSectionVisibility("dateRangeSection",!t)},({api:e,trigger:a})=>{e.updateVisibility("showThreshold",!0),e.updateVisibility("showTarget",!0),e.updateVisibility("showComment",!0),e.updateVisibility("par-forecast-config",!0),e.updateVisibility("showTrend",!0),e.updateVisibility("showConfidenceBand",!0),"dataSources"!==a&&a||(e.updateVisibility("showSparkline",!0),"dataSources"===a&&e.updateValue("showSparkline",!0))},({api:e,properties:a,trigger:t})=>{const{followFilters:i,groupBy:r,dataSources:o}=a,p=e=>"3"!==e.indicatorType&&("1"===e.indicatorType&&(3!==e.aggregateType||6!==e.aggregateType)||!("2"!==e.indicatorType||!e.allowMultiElementsAggregation));e.updateVisibility("showFilterAsSeparateSeries",o.some((e=>i&&0===r.length&&p(e)))),"followFilters"===t&&(e.updateValue("showFilterAsSeparateSeries",i&&o.some((e=>p(e)))),e.updateEnabled("showFilterAsSeparateSeries",i&&o.some((e=>p(e)))))}],h=[({trigger:e,properties:a,api:t})=>{const i=a.groupBy,r=[{label:"Name",value:"name",condition:()=>!0},{label:"Value",value:"value",condition:()=>!0},{label:"Report range",value:"report_range",condition:()=>i.some((e=>e.groupBy.some((e=>e.isRange))))},{label:"Element order",value:"choice",condition:()=>i.some((e=>e.groupBy.some((e=>e.isChoice))))}].filter((e=>e.condition())).map((({label:e,value:a})=>({label:e,value:a})));"sortBy"===e&&t.updateValue("sortByOrder","value"===a.sortBy?"desc":"asc"),t.updateTypeMetadata("sortBy","choices",r)},({api:e,trigger:a,properties:t})=>{const{followFilters:i}=t;e.updateVisibility("followFilters",!0),e.updateVisibility("showFilterIcon",i),"dataSources"===a&&(e.updateValue("showFilterIcon",!0),e.updateValue("followFilters",!0))},({api:e})=>{e.updateSectionVisibility("dateRangeSection",!1)},({api:e})=>{e.updateValue("showDateRangeByDefault",!1),e.updateValue("allowChangeDateRange",!1)},({api:e,trigger:a})=>{e.updateVisibility("showThreshold",!1),e.updateVisibility("showTarget",!1),e.updateVisibility("showComment",!1),e.updateVisibility("par-forecast-config",!0),e.updateVisibility("showTrend",!1),e.updateVisibility("showConfidenceBand",!1),"dataSources"===a&&(e.updateVisibility("showSparkline",!1),e.updateValue("showSparkline",!1))}],g="standard",b="weekly",V="monthly",f="quarterly",S="yearly",m={MINUTELY:{value:0,calendarType:g},HOURLY:{value:5,calendarType:g},DAILY:{value:10,calendarType:g},WEEKLY:{value:20,calendarType:b},BI_WEEKLY:{value:30,calendarType:b},FOUR_WEEKLY:{value:35,calendarType:b},MONTHLY:{value:40,calendarType:V},BI_MONTHLY:{value:50,calendarType:V},QUARTERLY:{value:60,calendarType:f},FISCAL_QUARTERLY:{value:65,calendarType:f},HALF_YEARLY:{value:70,calendarType:V},YEARLY:{value:80,calendarType:S},FISCAL_YEARLY:{value:85,calendarType:S}},w=[{label:"Days",value:"D",frequencyRange:m.DAILY},{label:"Months",value:"M",frequencyRange:m.BI_MONTHLY},{label:"Years",value:"Y",frequencyRange:m.FISCAL_YEARLY}],T=[{label:"Latest score",value:"latest"}],I=({api:e,properties:a,trigger:t})=>{const{startTime:i,endTime:r,dataSources:o,showMaximumRange:p}=a;if(p)return e.updateVisibility("par-date-input-start",!1),e.updateVisibility("par-date-input-end",!1),e.updateValue("startTime",null),void e.updateValue("endTime",null);e.updateVisibility("par-date-input-start",!0),e.updateVisibility("par-date-input-end",!0),e.updateVisibility("numberOfPeriods",!1),e.updateVisibility("period",!1);let d=g;if(o&&o.length&&o[0].kpiInfo&&o[0].kpiInfo.calendarFrequency){const e=o[0].kpiInfo.calendarFrequency.value;if(e){const a=Object.values(m).find((a=>a.value===parseInt(e)));a&&(d=a.calendarType)}}if(e.updateInterfaceMetadata("par-date-input-end","hideTimePicker",!0),e.updateInterfaceMetadata("par-date-input-end","calendarType",d),e.updateInterfaceMetadata("par-date-input-start","calendarType",d),e.updateInterfaceMetadata("par-date-input-start","hideTimePicker",!0),"startTime"!==t&&t||e.updateInterfaceMetadata("par-date-input-end","disabledDates",{before:i}),"endTime"!==t&&t||e.updateInterfaceMetadata("par-date-input-start","disabledDates",{after:r}),!i){const a=new Date;switch(d){case g:a.setDate(a.getDate()-7);break;case b:a.setDate(a.getDate()-28);break;case V:case f:a.setMonth(a.getMonth()-3);break;case S:a.setFullYear(a.getFullYear()-1)}const t=a.toISOString();e.updateValue("startTime",t),e.updateInterfaceMetadata("par-date-input-end","disabledDates",{before:t})}if(!r){const a=(new Date).toISOString();e.updateValue("endTime",a),e.updateInterfaceMetadata("par-date-input-start","disabledDates",{after:a})}},M=[({trigger:e,properties:a,api:t})=>{t.updateSectionVisibility("dateRangeSection",!0),t.updateVisibility("showMaximumRange",!1);const{applyDateRange:i}=a;i?(t.updateVisibility("showAbsolutePeriod",!0),t.updateVisibility("scoreType",!0),t.updateTypeMetadata("scoreType","choices",T),(({api:e,properties:a,trigger:t})=>{const{showMaximumRange:i,period:r,showAbsolutePeriod:o}=a;if(o)I({api:e,properties:a,trigger:t});else if(e.updateVisibility("par-date-input-start",!1),e.updateValue("startTime",null),e.updateVisibility("par-date-input-end",!1),e.updateValue("endTime",null),e.updateVisibility("numberOfPeriods",!i),e.updateVisibility("period",!i),e.updateTypeMetadata("period","choices",w),r){const a=w.find((e=>e.value===r));e.updateValue("period",a.value)}})({api:t,properties:a,trigger:e})):(t.updateVisibility("showAbsolutePeriod",!1),t.updateVisibility("scoreType",!1),t.updateVisibility("par-date-input-start",!1),t.updateVisibility("par-date-input-end",!1),t.updateVisibility("numberOfPeriods",!1),t.updateVisibility("period",!1))},({api:e,properties:a,trigger:t})=>{const{showSparkline:i}=a;e.updateSectionVisibility("additionalSettingsSection",!0),"dataSources"!==t&&t||["showSparkline","showScoreDate"].forEach((a=>{e.updateVisibility(a,!0),t&&e.updateValue(a,!0)})),["showChange","showTarget","showGapPercentage","showChangePercentage","showChangeFrom","showScoreUpdateTime","showZero","enableRealTimeUpdate","useRelativeScoreTime"].forEach((a=>{e.updateVisibility(a,!1),e.updateValue(a,!1)})),e.updateVisibility("showMetricLabel",!0),e.updateEnabled("showMetricLabel",!0),e.updateVisibility("sparklineStyle",i)},({api:e,trigger:a,properties:t})=>{const{followFilters:i}=t;e.updateVisibility("followFilters",!0),e.updateVisibility("showFilterIcon",i),"dataSources"===a&&(e.updateValue("showFilterIcon",!0),e.updateValue("followFilters",!0))}],v="standard",B={value:0,calendarType:v},C=[{label:"Seconds",value:"s",frequencyRange:B},{label:"Minutes",value:"m",frequencyRange:B},{label:"Hours",value:"H",frequencyRange:B},{label:"Days",value:"D",frequencyRange:B},{label:"Months",value:"M",frequencyRange:B},{label:"Years",value:"Y",frequencyRange:B}],R=({api:e,properties:a,trigger:t})=>{const{startTime:i,endTime:r}=a;if(e.updateVisibility("par-date-input-start",!0),e.updateVisibility("par-date-input-end",!0),e.updateVisibility("numberOfPeriods",!1),e.updateVisibility("period",!1),e.updateInterfaceMetadata("par-date-input-end","calendarType",v),e.updateInterfaceMetadata("par-date-input-start","calendarType",v),e.updateInterfaceMetadata("par-date-input-end","hideTimePicker",!1),e.updateInterfaceMetadata("par-date-input-start","hideTimePicker",!1),"startTime"!==t&&t||e.updateInterfaceMetadata("par-date-input-end","disabledDates",{before:i}),"endTime"!==t&&t||e.updateInterfaceMetadata("par-date-input-start","disabledDates",{after:r}),!i){const a=new Date;a.setDate(a.getDate()-1);const t=a.toISOString();e.updateValue("startTime",t),e.updateInterfaceMetadata("par-date-input-end","disabledDates",{before:t})}if(!r){const a=(new Date).toISOString();e.updateValue("endTime",a),e.updateInterfaceMetadata("par-date-input-start","disabledDates",{after:a})}},P=[({trigger:e,properties:a,api:t})=>{t.updateSectionVisibility("dateRangeSection",!0),t.updateVisibility("showMaximumRange",!1),t.updateVisibility("applyDateRange",!1),t.updateValue("applyDateRange",!0),t.updateVisibility("showAbsolutePeriod",!0),t.updateVisibility("scoreType",!1),(({api:e,properties:a,trigger:t})=>{const{showAbsolutePeriod:i}=a;i?R({api:e,properties:a,trigger:t}):(e.updateVisibility("par-date-input-start",!1),e.updateValue("startTime",null),e.updateVisibility("par-date-input-end",!1),e.updateValue("endTime",null),e.updateVisibility("numberOfPeriods",!0),e.updateVisibility("period",!0),e.updateTypeMetadata("period","choices",C),"showAbsoluteValue"!==t&&"dataSources"!==t||(e.updateValue("period","H"),e.updateValue("numberOfPeriods",24)))})({api:t,properties:a,trigger:e})},({api:e})=>{e.updateSectionVisibility("trentBy",!1)},({api:e,trigger:a})=>{e.updateSectionVisibility("additionalSettingsSection",!1),"dataSources"===a&&(e.updateVisibility("showSparkline",!1),e.updateValue("showSparkline",!1))}],D=[({api:e,trigger:a,properties:t})=>{const{followFilters:i}=t;e.updateVisibility("followFilters",!0),e.updateVisibility("showFilterIcon",i),"dataSources"===a&&(e.updateValue("showFilterIcon",!0),e.updateValue("followFilters",!0))},({trigger:e,api:a})=>{"dataSources"===e&&(a.updateVisibility("showSparkline",!1),a.updateValue("showSparkline",!1))}],A="standard",F="weekly",k="monthly",E="quarterly",Y="yearly",L={MINUTELY:{value:0,calendarType:A},HOURLY:{value:5,calendarType:A},DAILY:{value:10,calendarType:A},WEEKLY:{value:20,calendarType:F},BI_WEEKLY:{value:30,calendarType:F},FOUR_WEEKLY:{value:35,calendarType:F},MONTHLY:{value:40,calendarType:k},BI_MONTHLY:{value:50,calendarType:k},QUARTERLY:{value:60,calendarType:E},FISCAL_QUARTERLY:{value:65,calendarType:E},HALF_YEARLY:{value:70,calendarType:k},YEARLY:{value:80,calendarType:Y},FISCAL_YEARLY:{value:85,calendarType:Y}},O=[{label:"Days",value:"D",frequencyRange:L.DAILY},{label:"Months",value:"M",frequencyRange:L.BI_MONTHLY},{label:"Years",value:"Y",frequencyRange:L.FISCAL_YEARLY}],H=[({trigger:e,properties:a,api:t})=>{const{trendByEnabled:i,groupByEnabled:r}=a.dataSources[0],{showAbsolutePeriod:o,startTime:p,endTime:d}=a,s=e=>{t.updateVisibility("numberOfPeriods",e),t.updateVisibility("period",e)},l=e=>{t.updateVisibility("par-date-input-start",e),t.updateVisibility("par-date-input-end",e)};if(t.updateVisibility("showMaximumRange",!1),o){l(!0),s(!1),t.updateValue("numberOfPeriods",null),t.updateValue("periods",null);const e=(new Date).toISOString();p||t.updateValue("startTime",e),d||t.updateValue("endTime",e)}else l(!1),s(!0),t.updateValue("startTime",null),t.updateValue("endTime",null),t.updateTypeMetadata("period","choices",O),"dataSources"!==e&&"showAbsolutePeriod"!==e||(t.updateValue("period","D"),t.updateValue("numberOfPeriods",30));t.updateInterfaceMetadata("par-date-input-start","hideTimePicker",!0),t.updateInterfaceMetadata("par-date-input-end","hideTimePicker",!0),t.updateVisibility("showAbsolutePeriod",!0),t.updateSectionVisibility("trendBySection",i),t.updateSectionVisibility("groupBySection",r),"dataSources"===e&&t.updateValue("groupBy",null),new Map([["showMetricLabel",!0],["showChange",!0],["showChangePercentage",!0],["showSparkline",!0],["useRelativeScoreTime",!1],["showScoreUpdateTime",!1]]).forEach(((e,a)=>{t.updateVisibility(a,e)}))},({trigger:e,api:a})=>{"dataSources"===e&&(a.updateVisibility("showSparkline",!1),a.updateValue("showSparkline",!1))}],q=[({api:e})=>{e.updateValue("period",null),e.updateValue("numberOfPeriods",null),e.updateSectionVisibility("dateRangeSection",!1)},({api:e})=>{e.updateVisibility("showSparkline",!1),e.updateValue("showSparkline",!1)}],_=[{label:"Days",value:"D",frequencyRange:{value:10,calendarType:"standard"}},{label:"Months",value:"M",frequencyRange:{value:50,calendarType:"monthly"}},{label:"Years",value:"Y",frequencyRange:{value:85,calendarType:"yearly"}}],x=(e,a)=>{e.updateVisibility("numberOfPeriods",a),e.updateVisibility("period",a)},U=(e,a)=>{e.updateVisibility("par-date-input-start",a),e.updateVisibility("par-date-input-end",a)},N=[({trigger:e,properties:a,api:t})=>{const{showAbsolutePeriod:i,startTime:r,endTime:o}=a;if(t.updateVisibility("showMaximumRange",!1),i){U(t,!0),x(t,!1),t.updateValue("numberOfPeriods",null),t.updateValue("periods",null);const e=(new Date).toISOString();r||t.updateValue("startTime",e),o||t.updateValue("endTime",e)}else U(t,!1),x(t,!0),t.updateValue("startTime",null),t.updateValue("endTime",null),t.updateTypeMetadata("period","choices",_),"dataSources"!==e&&"showAbsolutePeriod"!==e||(e=>{e.updateValue("period","M"),e.updateValue("numberOfPeriods",1)})(t);(e=>{e.updateInterfaceMetadata("par-date-input-start","hideTimePicker",!0),e.updateInterfaceMetadata("par-date-input-end","hideTimePicker",!0)})(t),t.updateVisibility("showAbsolutePeriod",!0),"dataSources"===e&&t.updateValue("groupBy",null),new Map([["showMetricLabel",!0],["showChange",!0],["showChangePercentage",!0],["showSparkline",!0],["useRelativeScoreTime",!1],["showScoreUpdateTime",!1]]).forEach(((e,a)=>{t.updateVisibility(a,e)}))},({trigger:e,api:a})=>{"dataSources"===e&&(a.updateVisibility("showSparkline",!1),a.updateValue("showSparkline",!1))}],j=({properties:e})=>{const a=[...c];return r(e.dataSources,"table")?a.push(...h):r(e.dataSources,"indicator")?a.push(...y):r(e.dataSources,s)?a.push(...D):r(e.dataSources,p)?a.push(...M):r(e.dataSources,"hlaElasticSearchSavedSearches")||r(e.dataSources,"hlaElasticSearchComponents")?a.push(...P):r(e.dataSources,l)?a.push(...H):r(e.dataSources,d)?a.push(...q):r(e.dataSources,"observability")&&a.push(...N),a},G=["updateValue","updateEnabled","updateVisibility","updateSectionVisibility","updateTypeMetadata","updateInterfaceMetadata"],K=()=>{},W=({properties:e,api:a})=>{const t=e.componentId;t&&(a.updateInterfaceMetadata("par-data-sources","dataSourceProviderId",t),a.updateInterfaceMetadata("par-metrics","dataSourceProviderId",t),a.updateInterfaceMetadata("par-group-by","dataSourceProviderId",t),a.updateInterfaceMetadata("par-additional-group-by","dataSourceProviderId",t),a.updateInterfaceMetadata("par-date-input-start","dataSourceProviderId",t),a.updateInterfaceMetadata("par-filter-per-metric","dataSourceProviderId",t),a.updateInterfaceMetadata("par-date-input-end","dataSourceProviderId",t),a.updateInterfaceMetadata("par-trend-by","dataSourceProviderId",t),a.updateInterfaceMetadata("par-colors","dataSourceProviderId",t),a.updateInterfaceMetadata("par-forecast-config","dataSourceProviderId",t))},Q=[({api:e,properties:a})=>{const{configPropModifiers:t}=a;t&&Object.keys(t).forEach((a=>{const{hidden:i,disabled:r,maximum:o}=t[a];e.updateVisibility(a,!i),e.updateEnabled(a,!r),e.updateInterfaceMetadata(a,"maximum",o)}))}],$=[function({api:e}){e.updateSectionVisibility("dateRangeSection",!1)}],z=[function({api:e,properties:a}){const t=Array.isArray(a?.dataSources)&&a.dataSources[0]?.type;e.updateVisibility("showScoreDate",!0),"events"!==t&&"pages"!==t||e.updateVisibility("par-additional-group-by",!1)}];function Z({properties:e}){const a=[...Q];return r(e.dataSources,d)?a.push(...$):r(e.dataSources,l)&&a.push(...z),a}function J({api:e,properties:a,trigger:r}){"dateFormat"!==r&&function(e,{trigger:a,api:r,properties:o}){const{applyCalls:p,patchedApi:d}=function(e){const a={};return{patchedApi:new Proxy(e,{get:(e,t)=>G.includes(t)?(e,...i)=>{a[t]||(a[t]={}),"updateInterfaceMetadata"===t?(a[t][`${e}${i[0]}`]&&K(t,e),a[t][`${e}${i[0]}`]=[e,...i]):(a[t][e]&&K(t,e),a[t][e]=[e,...i])}:e[t]}),applyCalls:()=>{for(let[t,i]of Object.entries(a))for(let[,a]of Object.entries(i))e[t]&&e[t](...a)}}}(r),s=t(o,[["dataSources",[]],["metrics",[]],["groupBy",[]]]);if(!o.componentId){const e=Math.floor(Math.random()*Date.now()).toString(36);r.updateValue("componentId",e)}W({api:d,properties:s,trigger:a});const l=[...j({properties:s}),...e,...Z({properties:s})];i(l,{api:d,properties:s,trigger:a}),p()}([],{trigger:r,api:e,properties:a})}policy=a})();

	policy['default'](args);

	function mergeProperties(obj, path, value) {
		if (!obj || typeof obj !== 'object') {
			throw new Error('Invalid object provided');
		}

		if (!path || typeof path !== 'string') {
			throw new Error('Invalid path provided');
		}

		const pathArray = path.split('.');
		let newObj = Object.assign({}, obj); // Create a shallow copy to avoid modifying the original object
		let currentObj = newObj;

		for (var i = 0; i < pathArray.length - 1; i++) {
			var key = pathArray[i];

			if (!currentObj[key] || typeof currentObj[key] !== 'object') {
				currentObj[key] = {};
			}

			currentObj = currentObj[key];
		}

		currentObj[pathArray[pathArray.length - 1]] = value;

		return newObj;
	}

	function updateConfigProperty(properties) {
		var result = Object.keys(properties)
			.filter(function(prop){
				return prop.startsWith('config.');
			})
			.reduce(function(acc, item) {
				return mergeProperties(acc, item, properties[item]);
			}, {
				config: JSON.parse(JSON.stringify(properties.config)) || {}
			});

		return result.config;
	}

	var api = args.api;
	var properties = args.properties;
	var trigger = args.trigger;
	var type = "group";
	api.updateInterfaceMetadata('par-data-sources', 'vizType', type);

	var dataEmpty = !Array.isArray(properties.dataPassthrough) || properties.dataPassthrough.length;
	var showDataPassthrough = properties.showDataPassthrough;

	if (!trigger || (trigger && trigger.startsWith('config.'))) {
		api.updateValue('config', updateConfigProperty(properties));
	}

	if (trigger === 'showDataPassthrough' && showDataPassthrough && dataEmpty) {
		api.updateValue('dataPassthrough', [{"data":[{"priority":"1 - Critical","sys_mod_count":"6","value":53},{"priority":"1 - Critical","sys_mod_count":"5","value":46},{"priority":"1 - Critical","sys_mod_count":"8","value":70},{"priority":"1 - Critical","sys_mod_count":"0","value":1},{"priority":"1 - Critical","sys_mod_count":"4","value":61},{"priority":"1 - Critical","sys_mod_count":"7","value":4},{"priority":"2 - High","sys_mod_count":"6","value":54},{"priority":"2 - High","sys_mod_count":"5","value":41},{"priority":"2 - High","sys_mod_count":"8","value":3},{"priority":"2 - High","sys_mod_count":"0","value":21}],"metadata":{"timeZone":"SESSION","format":{"unitFormat":"{0}"},"eventData":{"table":"incident"},"aggregateBy":4,"groupBy":[{"id":"priority","label":"Priority","fieldType":"integer","elements":[{"id":"1","label":"1 - Critical","eventData":{"query":"priority=1"}},{"id":"2","label":"2 - High","eventData":{"query":"priority=2"}}]},{"id":"sys_mod_count","label":"Updates","fieldType":"integer","elements":[{"eventData":{"query":"sys_mod_count=6"},"label":"6","id":"6"},{"eventData":{"query":"sys_mod_count=5"},"label":"5","id":"5"},{"eventData":{"query":"sys_mod_count=8"},"label":"8","id":"8"},{"eventData":{"query":"sys_mod_count=0"},"label":"0","id":"0"},{"eventData":{"query":"sys_mod_count=4"},"label":"4","id":"4"},{"eventData":{"query":"sys_mod_count=7"},"label":"7","id":"7"}]}],"trendBy":null}}]);
		return;
	}

	if (showDataPassthrough) {
		return;
	}

	(function policy({api, properties, trigger}) {
		const { dataSources, groupBy, metrics } = properties;

		const isIndicator = dataSources?.some(({ sourceType }) => sourceType === 'indicator');

		// Datasource
	api.updateInterfaceMetadata(
        'par-data-sources',
        'maximumNumberOfDataSources',
        1
    );

	// To fetch supported feature config in vis designer
	api.updateInterfaceMetadata('par-data-sources', 'chartFeatureConfig', '{"dataCategory":"group","groupBy":{"enabled":true,"min":2,"max":2,"supportedFieldTypes":["numeric"]},"options":{"showForecast":false,"showConfidenceBand":false,"showThreshold":false,"showTarget":false,"showComment":false,"showTrend":false}}');

    // Metrics
	api.updateSectionVisibility('metricsSection', true);
    api.updateInterfaceMetadata('par-metrics', 'enableMultipleMetrics', false);
	api.updateInterfaceMetadata('par-metrics', 'maximum', 1);
	api.updateInterfaceMetadata('par-metrics', 'minimum', 1);


	//Additional settings
	api.updateVisibility("showConfidenceBand", false);
	api.updateVisibility("par-forecast-config", false);
	api.updateVisibility("showThreshold", false);
	api.updateVisibility("showTarget", false);
	api.updateVisibility("showComment", false);
	api.updateVisibility("showTrend", false);

	// Group By
	api.updateSectionVisibility('groupBySection', true);
	api.updateVisibility('par-group-by', true);
	api.updateInterfaceMetadata('par-data-sources', 'groupBySupport', {
        min: 2
    });

	true ? '' : api.updateValue("groupBy", null);

    api.updateInterfaceMetadata('par-group-by', 'maximum', 2);
    api.updateInterfaceMetadata('par-group-by', 'minimum', 2);
	api.updateInterfaceMetadata('par-group-by', 'showMaxNumberOfGroups', true);
	api.updateInterfaceMetadata('par-group-by', 'showOthersToggle', true);

	// Trend By
	api.updateSectionVisibility('trendBySection', false && !isIndicator);
	api.updateVisibility('par-trend-by', false && !isIndicator);

	false ? isIndicator ?
		api.updateValue('trendBy', {
				trendByFrequency: 'date',
				trendByFields: metrics?.map(({ id }) => ({
					field: 'anything',
					metric: id,
				})),
			}) :
			'' : api.updateValue("trendBy", null);

	//Date range
	api.updateSectionVisibility('dateRangeSection', false);

	//Sorting
	if (!dataSources || !dataSources.length || !groupBy || !groupBy.length)
		api.updateSectionVisibility('sortingSection', false);

	if (!properties.sortBy) {
		api.updateValue('sortBy', 'value');
		api.updateValue('sortByOrder', 'desc');
	}

	//Colors
	api.updateSectionVisibility('colorConfigSection', true);

	api.updateInterfaceMetadata('par-colors', 'showSingleColor', true);
	api.updateInterfaceMetadata('par-colors', 'showColorPalette', true);
	api.updateInterfaceMetadata('par-colors', 'showColorRange', true);
	api.updateInterfaceMetadata('par-colors', 'showColorRules', false);

	api.updateInterfaceMetadata(
		'par-colors',
		'showFixedElementColor',
		dataSources && dataSources[0].sourceType === 'table' && metrics && metrics.length < 2
	);

	api.updateInterfaceMetadata('par-colors', 'ranges', [
		{
			id: 'minColor',
			label: 'Low values color',
		},
		{
			id: 'maxColor',
			label: 'High values color',
		},
	]);
}
	)(args);
	(function policy() {
    api.updateInterfaceMetadata('par-metrics', 'hideAggregationField', true);
    api.updateInterfaceMetadata('par-group-by', 'groupCategories', [{
            "minimum": 1,
            "maximum": 1,
            "label": "Group by",
            "showMaxNumberOfGroups": true,
            "showOthersToggle": true
        },
        {
            "minimum": 1,
            "maximum": 1,
            "label": "Measured by",
            "listAllNumericFields": true,
        }
    ]);

    api.updateInterfaceMetadata('par-group-by', 'disableRanges', true);
    api.updateVisibility('par-additional-group-by', true);

    api.updateSectionVisibility('additionalSettingsSection', false);
    api.updateTypeMetadata('sortBy', 'choices', [{
            label: 'Name',
            value: 'name',
        },
        {
            label: 'Value',
            value: 'value',
        }
    ]);
    // Colors
    api.updateSectionVisibility('colorConfigSection', true);
    api.updateInterfaceMetadata('par-colors', 'showSingleColor', true);
    api.updateInterfaceMetadata('par-colors', 'showColorPalette', false);
    api.updateInterfaceMetadata('par-colors', 'showColorRange', false);
    api.updateInterfaceMetadata('par-colors', 'showColorRules', false);
    api.updateInterfaceMetadata(
        'par-colors',
        'showFixedElementColor',
        false
    );

    // Y - Axis
    api.updateVisibility('yAxisTitle', !properties.yAxisHidden);
    api.updateVisibility('yAxisStyle', !properties.yAxisHidden);
    api.updateVisibility('yAxisPosition', !properties.yAxisHidden);
})(args);
}
	
