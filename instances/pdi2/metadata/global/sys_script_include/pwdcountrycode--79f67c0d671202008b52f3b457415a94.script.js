var PwdCountryCode = Class.create();

// collection of country codes (245 countries)
PwdCountryCode.CountryCodeList = 
[
  {
    "name": sn_i18n.Message.getMessage("global", "United States{? country name}"),
    "code": "+1"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Afghanistan{? country name}"),
    "code": "+93"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Albania{? country name}"),
    "code": "+355"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Algeria{? country name}"),
    "code": "+213"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "American Samoa{? country name}"),
    "code": "+1684"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Andorra{? country name}"),
    "code": "+376"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Angola{? country name}"),
    "code": "+244"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Anguilla{? country name}"),
    "code": "+1264"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Antarctica{? country name}"),
    "code": "+672"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Antigua and Barbuda{? country name}"),
    "code": "+1268"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Argentina{? country name}"),
    "code": "+54"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Armenia{? country name}"),
    "code": "+374"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Aruba{? country name}"),
    "code": "+297"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Australia{? country name}"),
    "code": "+61"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Austria{? country name}"),
    "code": "+43"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Azerbaijan{? country name}"),
    "code": "+994"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Bahamas{? country name}"),
    "code": "+1242"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Bahrain{? country name}"),
    "code": "+973"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Bangladesh{? country name}"),
    "code": "+880"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Barbados{? country name}"),
    "code": "+1246"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Belarus{? country name}"),
    "code": "+375"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Belgium{? country name}"),
    "code": "+32"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Belize{? country name}"),
    "code": "+501"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Benin{? country name}"),
    "code": "+229"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Bermuda{? country name}"),
    "code": "+1441"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Bhutan{? country name}"),
    "code": "+975"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Bolivia{? country name}"),
    "code": "+591"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Bosnia and Herzegovina{? country name}"),
    "code": "+387"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Botswana{? country name}"),
    "code": "+267"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Brazil{? country name}"),
    "code": "+55"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "British Indian Ocean Territory{? country name}"),
    "code": "+246"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "British Virgin Islands{? country name}"),
    "code": "+1284"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Brunei{? country name}"),
    "code": "+673"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Bulgaria{? country name}"),
    "code": "+359"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Burkina Faso{? country name}"),
    "code": "+226"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Burundi{? country name}"),
    "code": "+257"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Cambodia{? country name}"),
    "code": "+855"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Cameroon{? country name}"),
    "code": "+237"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Canada{? country name}"),
    "code": "+1"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Cape Verde{? country name}"),
    "code": "+238"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Cayman Islands{? country name}"),
    "code": "+1345"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Central African Republic{? country name}"),
    "code": "+236"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Chad{? country name}"),
    "code": "+235"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Chile{? country name}"),
    "code": "+56"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "China{? country name}"),
    "code": "+86"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Christmas Island{? country name}"),
    "code": "+61"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Cocos (Keeling) Islands{? country name}"),
    "code": "+61"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Colombia{? country name}"),
    "code": "+57"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Comoros{? country name}"),
    "code": "+269"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Cook Islands{? country name}"),
    "code": "+682"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Costa Rica{? country name}"),
    "code": "+506"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Croatia{? country name}"),
    "code": "+385"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Cuba{? country name}"),
    "code": "+53"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Curaçao{? country name}"),
    "code": "+5999"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Cyprus{? country name}"),
    "code": "+357"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Czech Republic{? country name}"),
    "code": "+420"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "DR Congo{? country name}"),
    "code": "+243"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Denmark{? country name}"),
    "code": "+45"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Djibouti{? country name}"),
    "code": "+253"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Dominica{? country name}"),
    "code": "+1767"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Dominican Republic{? country name}"),
    "code": "+1809"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Ecuador{? country name}"),
    "code": "+593"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Egypt{? country name}"),
    "code": "+20"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "El Salvador{? country name}"),
    "code": "+503"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Equatorial Guinea{? country name}"),
    "code": "+240"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Eritrea{? country name}"),
    "code": "+291"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Estonia{? country name}"),
    "code": "+372"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Ethiopia{? country name}"),
    "code": "+251"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Falkland Islands{? country name}"),
    "code": "+500"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Faroe Islands{? country name}"),
    "code": "+298"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Fiji{? country name}"),
    "code": "+679"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Finland{? country name}"),
    "code": "+358"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "France{? country name}"),
    "code": "+33"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "French Guiana{? country name}"),
    "code": "+594"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "French Polynesia{? country name}"),
    "code": "+689"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Gabon{? country name}"),
    "code": "+241"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Gambia{? country name}"),
    "code": "+220"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Georgia{? country name}"),
    "code": "+995"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Germany{? country name}"),
    "code": "+49"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Ghana{? country name}"),
    "code": "+233"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Gibraltar{? country name}"),
    "code": "+350"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Greece{? country name}"),
    "code": "+30"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Greenland{? country name}"),
    "code": "+299"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Grenada{? country name}"),
    "code": "+1473"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Guadeloupe{? country name}"),
    "code": "+590"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Guam{? country name}"),
    "code": "+1671"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Guatemala{? country name}"),
    "code": "+502"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Guernsey{? country name}"),
    "code": "+44"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Guinea{? country name}"),
    "code": "+224"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Guinea-Bissau{? country name}"),
    "code": "+245"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Guyana{? country name}"),
    "code": "+592"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Haiti{? country name}"),
    "code": "+509"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Heard Island and McDonald Islands{? country name}"),
    "code": "+334"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Honduras{? country name}"),
    "code": "+504"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Hong Kong{? country name}"),
    "code": "+852"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Hungary{? country name}"),
    "code": "+36"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Iceland{? country name}"),
    "code": "+354"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "India{? country name}"),
    "code": "+91"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Indonesia{? country name}"),
    "code": "+62"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Iran{? country name}"),
    "code": "+98"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Iraq{? country name}"),
    "code": "+964"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Ireland{? country name}"),
    "code": "+353"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Isle of Man{? country name}"),
    "code": "+44"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Israel{? country name}"),
    "code": "+972"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Italy{? country name}"),
    "code": "+39"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Ivory Coast{? country name}"),
    "code": "+225"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Jamaica{? country name}"),
    "code": "+1876"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Japan{? country name}"),
    "code": "+81"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Jersey{? country name}"),
    "code": "+44"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Jordan{? country name}"),
    "code": "+962"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Kazakhstan{? country name}"),
    "code": "+76"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Kenya{? country name}"),
    "code": "+254"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Kiribati{? country name}"),
    "code": "+686"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Kosovo{? country name}"),
    "code": "+383"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Kuwait{? country name}"),
    "code": "+965"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Kyrgyzstan{? country name}"),
    "code": "+996"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Laos{? country name}"),
    "code": "+856"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Latvia{? country name}"),
    "code": "+371"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Lebanon{? country name}"),
    "code": "+961"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Lesotho{? country name}"),
    "code": "+266"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Liberia{? country name}"),
    "code": "+231"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Libya{? country name}"),
    "code": "+218"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Liechtenstein{? country name}"),
    "code": "+423"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Lithuania{? country name}"),
    "code": "+370"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Luxembourg{? country name}"),
    "code": "+352"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Macau{? country name}"),
    "code": "+853"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Macedonia{? country name}"),
    "code": "+389"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Madagascar{? country name}"),
    "code": "+261"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Malawi{? country name}"),
    "code": "+265"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Malaysia{? country name}"),
    "code": "+60"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Maldives{? country name}"),
    "code": "+960"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Mali{? country name}"),
    "code": "+223"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Malta{? country name}"),
    "code": "+356"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Marshall Islands{? country name}"),
    "code": "+692"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Martinique{? country name}"),
    "code": "+596"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Mauritania{? country name}"),
    "code": "+222"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Mauritius{? country name}"),
    "code": "+230"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Mayotte{? country name}"),
    "code": "+262"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Mexico{? country name}"),
    "code": "+52"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Micronesia{? country name}"),
    "code": "+691"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Moldova{? country name}"),
    "code": "+373"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Monaco{? country name}"),
    "code": "+377"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Mongolia{? country name}"),
    "code": "+976"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Montenegro{? country name}"),
    "code": "+382"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Montserrat{? country name}"),
    "code": "+1664"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Morocco{? country name}"),
    "code": "+212"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Mozambique{? country name}"),
    "code": "+258"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Myanmar{? country name}"),
    "code": "+95"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Namibia{? country name}"),
    "code": "+264"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Nauru{? country name}"),
    "code": "+674"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Nepal{? country name}"),
    "code": "+977"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Netherlands{? country name}"),
    "code": "+31"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "New Caledonia{? country name}"),
    "code": "+687"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "New Zealand{? country name}"),
    "code": "+64"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Nicaragua{? country name}"),
    "code": "+505"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Niger{? country name}"),
    "code": "+227"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Nigeria{? country name}"),
    "code": "+234"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Niue{? country name}"),
    "code": "+683"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Norfolk Island{? country name}"),
    "code": "+672"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "North Korea{? country name}"),
    "code": "+850"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Northern Mariana Islands{? country name}"),
    "code": "+1670"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Norway{? country name}"),
    "code": "+47"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Oman{? country name}"),
    "code": "+968"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Pakistan{? country name}"),
    "code": "+92"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Palau{? country name}"),
    "code": "+680"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Palestine{? country name}"),
    "code": "+970"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Panama{? country name}"),
    "code": "+507"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Papua New Guinea{? country name}"),
    "code": "+675"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Paraguay{? country name}"),
    "code": "+595"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Peru{? country name}"),
    "code": "+51"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Philippines{? country name}"),
    "code": "+63"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Pitcairn Islands{? country name}"),
    "code": "+64"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Poland{? country name}"),
    "code": "+48"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Portugal{? country name}"),
    "code": "+351"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Puerto Rico{? country name}"),
    "code": "+1787"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Qatar{? country name}"),
    "code": "+974"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Republic of the Congo{? country name}"),
    "code": "+242"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Romania{? country name}"),
    "code": "+40"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Russia{? country name}"),
    "code": "+7"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Rwanda{? country name}"),
    "code": "+250"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Réunion{? country name}"),
    "code": "+262"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Saint Barthélemy{? country name}"),
    "code": "+590"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Saint Kitts and Nevis{? country name}"),
    "code": "+1869"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Saint Lucia{? country name}"),
    "code": "+1758"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Saint Martin{? country name}"),
    "code": "+590"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Saint Pierre and Miquelon{? country name}"),
    "code": "+508"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Saint Vincent and the Grenadines{? country name}"),
    "code": "+1784"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Samoa{? country name}"),
    "code": "+685"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "San Marino{? country name}"),
    "code": "+378"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Saudi Arabia{? country name}"),
    "code": "+966"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Senegal{? country name}"),
    "code": "+221"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Serbia{? country name}"),
    "code": "+381"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Seychelles{? country name}"),
    "code": "+248"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Sierra Leone{? country name}"),
    "code": "+232"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Singapore{? country name}"),
    "code": "+65"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Sint Maarten{? country name}"),
    "code": "+1721"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Slovakia{? country name}"),
    "code": "+421"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Slovenia{? country name}"),
    "code": "+386"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Solomon Islands{? country name}"),
    "code": "+677"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Somalia{? country name}"),
    "code": "+252"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "South Africa{? country name}"),
    "code": "+27"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "South Georgia{? country name}"),
    "code": "+500"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "South Korea{? country name}"),
    "code": "+82"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "South Sudan{? country name}"),
    "code": "+211"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Spain{? country name}"),
    "code": "+34"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Sri Lanka{? country name}"),
    "code": "+94"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Sudan{? country name}"),
    "code": "+249"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Suriname{? country name}"),
    "code": "+597"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Svalbard and Jan Mayen{? country name}"),
    "code": "+4779"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Swaziland{? country name}"),
    "code": "+268"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Sweden{? country name}"),
    "code": "+46"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Switzerland{? country name}"),
    "code": "+41"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Syria{? country name}"),
    "code": "+963"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "São Tomé and Príncipe{? country name}"),
    "code": "+239"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Taiwan{? country name}"),
    "code": "+886"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Tajikistan{? country name}"),
    "code": "+992"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Tanzania{? country name}"),
    "code": "+255"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Thailand{? country name}"),
    "code": "+66"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Timor-Leste{? country name}"),
    "code": "+670"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Togo{? country name}"),
    "code": "+228"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Tokelau{? country name}"),
    "code": "+690"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Tonga{? country name}"),
    "code": "+676"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Trinidad and Tobago{? country name}"),
    "code": "+1868"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Tunisia{? country name}"),
    "code": "+216"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Turkey{? country name}"),
    "code": "+90"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Turkmenistan{? country name}"),
    "code": "+993"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Turks and Caicos Islands{? country name}"),
    "code": "+1649"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Tuvalu{? country name}"),
    "code": "+688"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Uganda{? country name}"),
    "code": "+256"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Ukraine{? country name}"),
    "code": "+380"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "United Arab Emirates{? country name}"),
    "code": "+971"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "United Kingdom{? country name}"),
    "code": "+44"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "United States Virgin Islands{? country name}"),
    "code": "+1340"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Uruguay{? country name}"),
    "code": "+598"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Uzbekistan{? country name}"),
    "code": "+998"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Vanuatu{? country name}"),
    "code": "+678"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Vatican City{? country name}"),
    "code": "+3906698"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Venezuela{? country name}"),
    "code": "+58"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Vietnam{? country name}"),
    "code": "+84"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Wallis and Futuna{? country name}"),
    "code": "+681"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Western Sahara{? country name}"),
    "code": "+212"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Yemen{? country name}"),
    "code": "+967"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Zambia{? country name}"),
    "code": "+260"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Zimbabwe{? country name}"),
    "code": "+263"
  },
  {
    "name": sn_i18n.Message.getMessage("global", "Åland Islands{? country name}"),
    "code": "+358"
  }
];
