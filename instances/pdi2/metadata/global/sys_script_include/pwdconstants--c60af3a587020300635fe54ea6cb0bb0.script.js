var PwdConstants = Class.create();

PwdConstants.TYPE_INFO = 'Info';
PwdConstants.TYPE_WARNING = 'Warning';
PwdConstants.TYPE_ERROR = 'Error';
PwdConstants.SUCCESS = 'success';
PwdConstants.STAGE_IDENTIFICATION = "Identification";
PwdConstants.STAGE_VERIFICATION = "Verification";
PwdConstants.STAGE_RESET = 'Reset';
PwdConstants.STAGE_CHANGE_PWD = 'Change password';
PwdConstants.STATUS_PENDING = 'Pending';

PwdConstants.WIN_STATUS_OK = "ok";
PwdConstants.WIN_STATUS_ERROR = 'error';
PwdConstants.WIN_STATUS_UNAUTHORIZED = 'unauthorized';
PwdConstants.WIN_ERROR_TIMEOUT = 'TIMEOUT';
PwdConstants.WIN_ALLOWED = 'Allowed';
PwdConstants.WIN_DEFAULT = 'default';
PwdConstants.PASSWORD_RESET_KMF_MODULE = 'sn_pwdreset_ah.password_reset';
PwdConstants.SYMMETRIC_WRAPPING = 'SYMMETRIC_WRAPPING';
PwdConstants.SYMMETRIC_UNWRAPPING = 'SYMMETRIC_UNWRAPPING';
PwdConstants.KMF_NONE = 'KMFNone';
PwdConstants.AES_ALGORITHM = 'AES';

// NON Secure Verification type list
PwdConstants.NONSECURE_VERIFICATIONTYPES = {
    '538d0fabbf200100710071a7bf07396c': true, // MOCK Verification Type
    'a7f17087eb1101004d7763fba206fe52': true, // Personal Data Confirmation Type
    '2f39b371eb1101004d7763fba206fed1': true, // Personal Data Verification Type
    '39b15343eb10010045e1a5115206feb7': true // Security Questions Verification Type
};
PwdConstants.ENROLLMENT_ACTIVE_STATUS = '1';
PwdConstants.ENROLLMENT_INACTIVE_STATUS = '2';
PwdConstants.LOCAL_CRED_STORE_SYS_ID = "6e51033fbf020100710071a7bf0739e0";
PwdConstants.SERVICE_DESK_REQUEST_TYPE = 2;

//Reset Request statuses
PwdConstants.REQUEST_STATE_COMPLETED_WITH_FAILURE = -1;
PwdConstants.REQUEST_STATE_MAX_NUMBER_OF_ATTEMPTS = -2;
PwdConstants.REQUEST_STATE_EXPIRED = -3;
PwdConstants.REQUEST_STATE_IN_PROGRESS = 0;
PwdConstants.REQUEST_STATE_COMPLETED_WITH_SUCCESS = 1;
PwdConstants.REQUEST_STATE_VERIFIED = 2;
PwdConstants.REQUEST_STATE_PENDING_WITH_EXTERNAL_SYSTEM_STATUS = 3;
PwdConstants.REQUEST_STATE_NOT_VERIFIED = 4;
PwdConstants.REQUEST_STATE_RESET_URL_TOKEN_VALIDATION_PENDING = 5;

PwdConstants.QA_VERIFICATION_TYPE_ID = '39b15343eb10010045e1a5115206feb7';
PwdConstants.DEFAULT_SELF_SERVICE_PROCESS_ID = "c6b0c20667100200a5a0f3b457415ad5";

//Errors while sending verification code
PwdConstants.INVALID_PHONE_NUMBER = -4;
PwdConstants.INVALID_REQUEST_RESPONSE = -3;
PwdConstants.PAUSE_WINDOW_RESPONSE = -2;
PwdConstants.PER_DAY_LIMIT_RESPONSE = -1;
PwdConstants.GENERIC_FAIL_RESPONSE = 0;
PwdConstants.SUCCESS_RESPONSE = 1;
PwdConstants.PHONETIC = {
    'A': sn_i18n.Message.getMessage("pwd_reset", "alpha{? phonetic alphabet for the letter A}"),
    'B': sn_i18n.Message.getMessage("pwd_reset", "bravo{? phonetic alphabet for the letter B}"),
    'C': sn_i18n.Message.getMessage("pwd_reset", "charlie{? phonetic alphabet for the letter C}"),
    'D': sn_i18n.Message.getMessage("pwd_reset", "delta{? phonetic alphabet for the letter D}"),
    'E': sn_i18n.Message.getMessage("pwd_reset", "echo{? phonetic alphabet for the letter E}"),
    'F': sn_i18n.Message.getMessage("pwd_reset", "foxtrot{? phonetic alphabet for the letter F}"),
    'G': sn_i18n.Message.getMessage("pwd_reset", "golf{? phonetic alphabet for the letter G}"),
    'H': sn_i18n.Message.getMessage("pwd_reset", "hotel{? phonetic alphabet for the letter H}"),
    'I': sn_i18n.Message.getMessage("pwd_reset", "india{? phonetic alphabet for the letter I}"),
    'J': sn_i18n.Message.getMessage("pwd_reset", "juliet{? phonetic alphabet for the letter J}"),
    'K': sn_i18n.Message.getMessage("pwd_reset", "kilo{? phonetic alphabet for the letter K}"),
    'L': sn_i18n.Message.getMessage("pwd_reset", "lima{? phonetic alphabet for the letter L}"),
    'M': sn_i18n.Message.getMessage("pwd_reset", "mike{? phonetic alphabet for the letter M}"),
    'N': sn_i18n.Message.getMessage("pwd_reset", "november{? phonetic alphabet for the letter N}"),
    'O': sn_i18n.Message.getMessage("pwd_reset", "oscar{? phonetic alphabet for the letter O}"),
    'P': sn_i18n.Message.getMessage("pwd_reset", "papa{? phonetic alphabet for the letter P}"),
    'Q': sn_i18n.Message.getMessage("pwd_reset", "quebec{? phonetic alphabet for the letter Q}"),
    'R': sn_i18n.Message.getMessage("pwd_reset", "romeo{? phonetic alphabet for the letter R}"),
    'S': sn_i18n.Message.getMessage("pwd_reset", "sierra{? phonetic alphabet for the letter S}"),
    'T': sn_i18n.Message.getMessage("pwd_reset", "tango{? phonetic alphabet for the letter T}"),
    'U': sn_i18n.Message.getMessage("pwd_reset", "uniform{? phonetic alphabet for the letter U}"),
    'V': sn_i18n.Message.getMessage("pwd_reset", "victor{? phonetic alphabet for the letter V}"),
    'W': sn_i18n.Message.getMessage("pwd_reset", "whiskey{? phonetic alphabet for the letter W}"),
    'X': sn_i18n.Message.getMessage("pwd_reset", "x-ray{? phonetic alphabet for the letter X}"),
    'Y': sn_i18n.Message.getMessage("pwd_reset", "yankee{? phonetic alphabet for the letter Y}"),
    'Z': sn_i18n.Message.getMessage("pwd_reset", "zulu{? phonetic alphabet for the letter Z}"),
    '0': sn_i18n.Message.getMessage("pwd_reset", "zero{? phonetic alphabet for number '0'}"),
    '1': sn_i18n.Message.getMessage("pwd_reset", "one{? phonetic alphabet for number '1'}"),
    '2': sn_i18n.Message.getMessage("pwd_reset", "two{? phonetic alphabet for number '2'}"),
    '3': sn_i18n.Message.getMessage("pwd_reset", "three{? phonetic alphabet for number '3'}"),
    '4': sn_i18n.Message.getMessage("pwd_reset", "four{? phonetic alphabet for number '4'}"),
    '5': sn_i18n.Message.getMessage("pwd_reset", "five{? phonetic alphabet for number '5'}"),
    '6': sn_i18n.Message.getMessage("pwd_reset", "six{? phonetic alphabet for number '6'}"),
    '7': sn_i18n.Message.getMessage("pwd_reset", "seven{? phonetic alphabet for number '7'}"),
    '8': sn_i18n.Message.getMessage("pwd_reset", "eight{? phonetic alphabet for number '8'}"),
    '9': sn_i18n.Message.getMessage("pwd_reset", "nine{? phonetic alphabet for number '9'}"),
    '*': sn_i18n.Message.getMessage("pwd_reset", "star (asterisk){? phonetic alphabet for special character '*'}"),
    '-': sn_i18n.Message.getMessage("pwd_reset", "dash{? phonetic alphabet for special character '-'}"),
    '/': sn_i18n.Message.getMessage("pwd_reset", "slash{? phonetic alphabet for special character '/'}"),
    '$': sn_i18n.Message.getMessage("pwd_reset", "dollar{? phonetic alphabet for special character '$'}"),
    ' ': sn_i18n.Message.getMessage("pwd_reset", "space{? phonetic alphabet for special character ' '}"),
    '!': sn_i18n.Message.getMessage("pwd_reset", "exclamation{? phonetic alphabet for special character '!'}"),
    '"': sn_i18n.Message.getMessage("pwd_reset", "double quote{? phonetic alphabet for special character}"),
    '#': sn_i18n.Message.getMessage("pwd_reset", "number sign (hash){? phonetic alphabet for special character '#'}"),
    '%': sn_i18n.Message.getMessage("pwd_reset", "percent{? phonetic alphabet for special character '%'}"),
    '\'': sn_i18n.Message.getMessage("pwd_reset", "single quote{? phonetic alphabet for special character}"),
    '(': sn_i18n.Message.getMessage("pwd_reset", "left paranthesis{? phonetic alphabet for special character '('}"),
    ')': sn_i18n.Message.getMessage("pwd_reset", "right paranthesis{? phonetic alphabet for special character ')'}"),
    '+': sn_i18n.Message.getMessage("pwd_reset", "plus{? phonetic alphabet for special character '+'}"),
    '.': sn_i18n.Message.getMessage("pwd_reset", "period{? phonetic alphabet for special character '.'}"),
    ':': sn_i18n.Message.getMessage("pwd_reset", "colon{? phonetic alphabet for special character ':'}"),
    ';': sn_i18n.Message.getMessage("pwd_reset", "semicolon{? phonetic alphabet for special character ';'}"),
    '=': sn_i18n.Message.getMessage("pwd_reset", "equal sign{? phonetic alphabet for special character '='}"),
    '?': sn_i18n.Message.getMessage("pwd_reset", "question mark{? phonetic alphabet for special character '?'}"),
    '@': sn_i18n.Message.getMessage("pwd_reset", "at sign{? phonetic alphabet for special character '@'}"),
    '[': sn_i18n.Message.getMessage("pwd_reset", "left bracket{? phonetic alphabet for special character '['}"),
    ']': sn_i18n.Message.getMessage("pwd_reset", "right bracket{? phonetic alphabet for special character ']'}"),
    '\\': sn_i18n.Message.getMessage("pwd_reset", "backslash{? phonetic alphabet for special character '\\'}"),
    '^': sn_i18n.Message.getMessage("pwd_reset", "caret{? phonetic alphabet for special character '^'}"),
    '_': sn_i18n.Message.getMessage("pwd_reset", "underscore{? phonetic alphabet for special character '_'}"),
    '`': sn_i18n.Message.getMessage("pwd_reset", "grave accent (backtick){? phonetic alphabet for special character '`'}"),
    '{': sn_i18n.Message.getMessage("pwd_reset", "left brace{? phonetic alphabet for special character '{'}"),
    '|': sn_i18n.Message.getMessage("pwd_reset", "vertical bar{? phonetic alphabet for special character '|'}"),
    '}': sn_i18n.Message.getMessage("pwd_reset", "right brace{? phonetic alphabet for special character}"),
    '~': sn_i18n.Message.getMessage("pwd_reset", "tilde{? phonetic alphabet for special character '~'}"),
    ',': sn_i18n.Message.getMessage("pwd_reset", "comma{? phonetic alphabet for special character ','}"),
    '$[AMP]': sn_i18n.Message.getMessage("pwd_reset", "ampersand{? phonetic alphabet for special character '&'}"),
    '&': sn_i18n.Message.getMessage("pwd_reset", "ampersand{? phonetic alphabet for special character '&'}"),
    '$[LT]': sn_i18n.Message.getMessage("pwd_reset", "less-than sign{? phonetic alphabet for special character '<'}"),
    '<': sn_i18n.Message.getMessage("pwd_reset", "less-than sign{? phonetic alphabet for special character '<'}"),
    '$[GT]': sn_i18n.Message.getMessage("pwd_reset", "greater-than sign{? phonetic alphabet for special character '>'}"),
    '>': sn_i18n.Message.getMessage("pwd_reset", "greater-than sign{? phonetic alphabet for special character '>'}")
};
