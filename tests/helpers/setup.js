global.jQuery = global.$ = require('jquery')
require('@pitcher/fomantic-ui')

/* Global helpers */
global.removeLineBreaksAndSpaces = str => str.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ' ')
