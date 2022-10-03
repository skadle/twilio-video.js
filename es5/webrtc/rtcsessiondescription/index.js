/* globals RTCSessionDescription */
'use strict';
if (typeof RTCSessionDescription === 'function') {
    var guessBrowser = require('../util').guessBrowser;
    switch (guessBrowser()) {
        case 'chrome':
            module.exports = require('./chrome');
            break;
        case 'firefox':
            module.exports = require('./firefox');
            break;
        default:
            console.log('banana chrome is selected');
            module.exports = require('./chrome');
            break;
    }
}
else {
    module.exports = function RTCSessionDescription() {
        throw new Error('RTCSessionDescription is not supported');
    };
}
//# sourceMappingURL=index.js.map