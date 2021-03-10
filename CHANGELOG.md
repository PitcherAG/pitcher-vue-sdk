# Changelog

## [NEXT: 1.5.5]

## 1.5.4
- Fix a windows bug in DB for single quote duplication
- Added custom caches - field types, for Windows
- Updated google.json.gpg

## 1.5.3
### Changed
- export functions from filePath.js & filePath fixes
- getFavoriteItems fix not working on android. Using `then` instead of `await` 
- docs update

## 1.5.2
### Changed
- Add `emulate-ios` option to declare as browser user-agent for ti-web testing
- Add getFullFilepath method that returns the absolute normalized path of a given vUrl filepath
- Fixed loadValidations for Windows environment
- Revert `moment` usage from minifed file to esm version

## 1.5.1
### Changed
- loadConfig default parameter `source = 'modal'` added
- detailingStore changes
- documentation updates for instance store
- fix user extra field in `query`
- `fuse.js` & `moment` are now imported as CJS modules. No need to compile in consumer project


## 1.5.0
### Changed
- Insfrastructure updates, added @pitcher/eslint-config
- Change files according to the new eslint rules
- formatDate & numbers, fallback to i18nStore locale
- Calendar component is re-written, IE bugs fixed
- filter dropdown focus bug fixed
- Added validations store, usage with `loadValidations(validationsJsonFile)` and `useValidations()`
- fix remove null hardcode in `contextQuery`

### Added
- Added new slot named `body` to replace FileCard body content
- Pitcher UI business logic, includes functions to fetch stuff from serverJSON / params. Includes also multiple stores to keep the information
- Added field types for Account/Contact/User in iOS
- Added conversion of Boolean values to Numbers when saving
- Added fieldsToNull to ignored fields on save
- Added new prop `clearable` to Calendar component


## 1.4.12
### Breaking changes
- NumpadInput.vue has a new prop called `resetBefore` which is by default `true`. If numpad has a value higher than 0 initially, first numpad click will reset the value to 0 first.

### Changed
- NumpadInput can now be used with undefined/null in `v-model`
- Fixes a bug that Modal component had on `exec` function
- ObjectForm fixes
- Dropdown fixes, multiple/clearable selection dropdown works properly
- `exec` function support for dropdown to be able to access dropdown commands outside
- Added missing `ref` reference in `sfdcField.js`
- Error handling in `sfdcLayout.js` & `sfdcField.js`

## 1.4.11
### Changed
- no account problem in formatCurrency fixed
- getObjectNameField function added to sfdcSchema
- updated tests for assign & clone
- NumpadInput componenent updated to accept keyboard input
- Change in formatting functions (currency, date, decimals and percent) - use account local language

## 1.4.10
### Changed
- Added "Load more" feature into FilterDropdown component
- Updated docs
- Updated Demo with a demo page selector
- Added capability to make all fields read-only in ObjectForm
- Updated docs
- ObjectForm fields now use Fomantic grid classes for fields layout (customizable as a prop)
- Changed ObjectForm CSS to have a compact look
- Added dash when no value exists in ObjectFormField


## 1.4.9
### Changed
- import { createStore } from `../store` in i18n
- documentation is migrated from docsify to storybook
- slow query warning added in `query.js`
- improvements in `contextQuery`
- added `getRecordTypeId` function in `sfdcSchema.js`

## 1.4.7

- data table support {{}} syntax for fields
- object form support help text and disabling of them
- currency format support different formats
- calendar translation fixes
- translation fixes

## 1.4.6

- include i18n files

## 1.4.5

### Changed / Fixed
- Calendar.vue
  - init calendar in setTimeout to put initialisation at the end of event loop.
  - size validator component name fixed
  - fix min/max date parsing
- FilterDropdown.vue
  - fix text overflow problem
- Modal.vue
  - v-model can now be any instead of boolean
- DataTable.vue
  - fix table row emit click event to it's parent
- ObjectForm & ObjectFormField
  - external id generation, url parsing, and fixes for object form
  - help text added


## 1.4.4

### Breaking changes
- Calendar.vue prop change `setting` => `settings`

### Changed / Fixed
- Calendar.vue
  - no required booleans in formfield
  - most of fomantic settings ported to native props
  - minDate is not overriding currentValue anymore
  - updating calendar props are observable now, changes applied to the component
  - unit tests & docs updated


## 1.4.3

### Changed / Fixed
- ObjectFormField.vue
  - no required booleans in formfield
- FileCard.vue
  - Card image url fix for iOS
  - Additional prop: hideFavorite, to be able to hide/show favorite icon
  - Additional prop: favoriteIcon, for custom favorite icon
  - Additional slot: keywords, to replace content of keywords container
  - Additional slot: new, to replace content of new label

## 1.4.2

### Fixed
- NumpadInput.vue
  - store registration & unregistration bug fixed
  - NumpadInput not using it is own store anymore. When jumping to next sibling or group, finding elements directly from the current DOM tree. This is changed because of when using NumpadInput inside a table and sorting the table, numpad references are not valid anymore.
- FilterDropdown.vue
  - Touch/Scroll glitch is fixed in filters menu
- DataTable.vue
  - Do not add click event on column header if not sortable
  - Fixed issues for IE11

## 1.4.1

### Changed
- DataTable.vue
  - added `search-options` property to be able to set fuse.js search options
  - fixed grouping bug depending on group keys undefined & null and group length
- NumpadInput
  - trigger blur on all other numpad inputs when focused one

## 1.4.0

### New Store backend
createStore() now accepts class instances
class getter are automatically converted to computed
on_state_account() {} gets converted to state.account watcher

### Breaking changes
- Store getters do not need .value at the end anymore
- Checkbox.vue updated, by default it comes as a checkbox. You can add fomantic UI options as props now. Default checkboxes had toggle by default, this must be added.

### Added
- FileCard & FileCardContainer component
 
### Changed
- Checkbox.vue
  - added relevant props and events from Fomantic
- FilterDropdown.vue
  - using built-in checkbox component now
- DataTable.vue
  - added `tr-class` property to be able to add class to `<tr>` of line-items dynamically
  - added 2 new events, @onSort & @onSearch
  - grouping feature for line items thru prop `group-by`
  - updated row slot to return `filteredFields` & `mapper` function

### Fixed
- FilterDropdown clicking filter fast unselect option before


## 1.3.10

### Added
- FilterDropdown component

### Changed
- ObjectForm updated
  - added prop customSettings to allow custom settings for the fields

### Fixed
- Encountering error when `en-US` sent as a param to translation plugin
- Lint errors
- Dropdown typos fixed in the documentation


## 1.3.9

### Added
- Modal component

### Changed
- DataTable updated
  - added tooltipText as a prop to field definition for defining custom tooltipText
  - added new slots: append-tbody, prepend-tbody
  - added rowClick event to the table
- NumpadInput updated
  - added lazy property to change value when blur event occurs
- created mixins.js for components to reduce redundant functions

### Fixed
- various typos fixed in the documentation

## 1.3.8

### Fixed
- Currency format polyfills for IE11


## 1.3.7

### Changed
- ios wkview detection
- ObjectFormField
  - show labels if a field is not updateable
  - new event emitter: @fieldUpdate
  - fixed height for empty fields
- ObjectForm
  - bug fixes
  - checkbox inside template v-model => value & emit input
  - new event emitter @fieldUpdate that is forwarded from ObjectFormField
  - .fields margin-bottom reduced
- Checkbox
  - accepting undefined/null as value now and transforms to false by default
- Sidebar
  - new prop: type, default value remains as 'push'
- support package translations
- support multiple categories

### Fixed
- store function binding

## 1.3.6

### Added
- fetch polyfill with whatwg-fetch

### Changed
- Store related bugs are fixed
- Dropdown related bugs in ObjectForm / ObjectFormField
- eslint-plugin-vue to 7.0.0-alpha.7
- Dropdown updated
  - emit string as value (Fomantic dropdown default)
  - renamed prop: options -> items
  - renamed prop: textField -> item-text
  - renamed prop: valueField -> item-value
  - renamed prop: setting -> settings

## 1.3.5

### Added
- Dropdown component added
- ProgressBar component added
- added uid function to utils to generate unique ids
- added fetch pollyfill
- should now be windows compatible
- config-gettext-extract, config-gettext-translate and config-gettext-compile commands
- i18n/browser.js to detect browser language
- translate component and directive
- removed pinia

### Changed
- @vue/composition-api to 0.6.6
- DataTable updated
  - use uid for each table row (required for ui)
  - return mapper function as a prop in body slot
- trans to replace placeholders if no translation found
- use impact system language

## 1.3.4

- DataTable updated
  - added searchFor default value
  - added maxWidth property
  - deep object mapping support for dataField in field definition
  - dataField does not support __slot anymore, added slotName property instead
  - better sort functionality
  - support sortType in field definition
  - added dynamic slot property: rowFields
  - dynamic th slots are supported now
- NumpadInput updated
  - v-model supports number as well
  - add document listener to make blur event work
- Dropdown component bugfix
- importing modules with @ were causing error, fixed now
- import lodash modules only instead of whole package
- search threshold decreased to 0.3

## 1.3.3

- added non-exported components -> Popup & Sidebar
- updated dependencies
  - pinia to 0.0.6
  - @pitcher/machine-gettext to 1.1.2
  - @vue/cli-service to 4.4.1
  - eslint to 7.2.0
  - eslint-plugin-vue to 7.0.0-alpha.6
- eslint rules update
- various bug fixes
- DataTable component added
- NumpadInput component updated
  - validation for size prop
  - transparent attr added
  - maxWidth attr added
- new utility search function added

## 1.3.2

- added demo page for future changes & development of UI elements
- NumpadInput component updated
  - minWidth attr added
  - placeholder attr added
  - max attr has not default value anymore
  - z-index: 10000 & user-select: none added
- dropdown multiple support
- partial dropdown search support


## 1.3.1

- plural forms for translations works now
- machine translations implemented for .po files
- sidebar component
- checkbox component
- numpadInput component
- fixes Calendar translations bug
- fixes Watcher callbacks for params and serverJSON
- added saveLocal() and loadLocal() functions (saveFromHTML, getFromHTML) with docs

## 1.3.0

- i18n refactor
    you now need to intialize like this:
    ``` javascript
     await loadParams()
     const params = useParamsStore()
     const i18n = useI18nStore()
     await i18n.setLanguage(params.locale.value, true) // true loads translation files
  ```
- iso date format with timezone support for safari
    
## 1.2.3

- bugfixes

## 1.2.2

- our own simple template engine

## 1.2.1

- bugfixes

## 1.2.0

- complete new translation system with gettext support 

## 1.1.5
 - reduces npm file size

## 1.1.4

 - unit tests added
 - unit test coverage added
 - i18n for numbers and currencies
 - docs added
 - serverJSON loading added
