# On OSX the PATH variable isn't exported unless "SHELL" is also set, see: http://stackoverflow.com/a/25506676
SHELL = /bin/bash
NODE_BINDIR = ./node_modules/.bin
export PATH := $(NODE_BINDIR):$(PATH)
LOGNAME ?= $(shell logname)

# adding the name of the user's login name to the template file, so that
# on a multi-user system several users can run this without interference
TEMPLATE_POT ?= /tmp/messages.pot

# Where to find input files (it can be multiple paths).
INPUT_FILES = ./src

# Where to write the files generated by this makefile.
OUTPUT_DIR = ./src

# Available locales for the app.
LOCALES = en_US fr_FR it_IT de_DE

# Name of the generated .po files for each available locale.
LOCALE_FILES ?= $(patsubst %,$(OUTPUT_DIR)/locale/%/LC_MESSAGES/app.po,$(LOCALES))

GETTEXT_SOURCES ?= $(shell find $(INPUT_FILES) -name '*.html' -o -name '*.js' -o -name '*.vue' 2> /dev/null)

# Makefile Targets
.PHONY: clean makemessages translations all

all:
	@echo choose a target from: clean makemessages

clean:
	rm -f $(TEMPLATE_POT) public/translations/*.json

makemessages: $(TEMPLATE_POT)


# Create a main .pot template, then generate .po files for each available language.
# Thanx to Systematic: https://github.com/Polyconseil/systematic/blob/866d5a/mk/main.mk#L167-L183
$(TEMPLATE_POT): $(GETTEXT_SOURCES)
# `dir` is a Makefile built-in expansion function which extracts the directory-part of `$@`.
# `$@` is a Makefile automatic variable: the file name of the target of the rule.
# => `mkdir -p /tmp/`
	mkdir -p $(dir $@);
	mkdir -p public/translations;
# Extract gettext strings from templates files and create a POT dictionary template.
	node_modules/easygettext/src/extract-cli.js --quite --output $@ $(GETTEXT_SOURCES);
	# xgettext -d default --language=JavaScript --language=Python --from-code=UTF-8 --keyword=gettext --keyword="(\"gettext\")" --keyword=gettext_noop --keyword="_" --keyword=gettext_lazy --output=$@ $(GETTEXT_SOURCES)
    # Generate .po files for each available language.

	@for lang in $(LOCALES); do \
		export PO_FILE=locale/$$lang/LC_MESSAGES/app.po; \
		export JSON_FILE=public/translations/$$lang.json; \
		mkdir -p $$(dirname $$PO_FILE); \
		if [ -f $$PO_FILE ]; then  \
			echo "msgmerge --update $$PO_FILE $@"; \
			msgmerge --lang=$$lang --update $$PO_FILE $@ || break;\
		else \
			msginit --no-translator --locale=$$lang --input=$@ --output-file=$$PO_FILE || break ; \
			msgattrib --no-wrap --no-obsolete -o $$PO_FILE $$PO_FILE || break; \
		fi; \
	done;

# node_modules/easygettext/src/compile-cli.js --output $$JSON_FILE $$PO_FILE || break;
