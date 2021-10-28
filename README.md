# Composer template for Digital Echidna Drupal 8 projects


## System Requirements

- PHP 7.1  (recommended - developed and tested on this version)
- [Composer](https://getcomposer.org/)

## Steps

- Use the Echidna site generator to clone the repo and create a CI file for your hosting environment following the steps [here](https://git.echidna.ca/echidna/internal/wikis/creating-a-new-drupal-site)
- Run `composer install`
- Add vhost to the site docroot in your `httpd-vhosts.conf`
- Run `drush site-install config_installer`
  - path to config is `../config/sync`
- Login using `drush uli`
- Go to site

## Installing the Git Hooks

- Check your version of git with `git --version`
- If your git version is > 2.9 - you can update it with `brew upgrade git`
- Make sure you have already created the .git directory using `git init`
- Set your git hooks directory to the repo's .githooks directory by typing `git config core.hooksPath .githooks`
- make sure the hooks in your .githooks folder are executable
- The pre-commit hook will check the code you submit in each commit for any drupal standards.
- The commit-msg hook will check that your commit message adheres to certain criteria.
- Make sure you have php code sniffing installed on your local. See this link for installing it to your global composer install https://www.drupal.org/docs/8/modules/code-review-module/installing-coder-sniffer

## Gotchas/Housekeeping -- before you really start working on your project

- Include a settings.local.php in your settings.php by commenting out a few lines at the bottom of your setttings.php
- Create a settings.local.php and move your database config in there.
- Update your .gitlab-ci.yml with the correct drupal docroot (web, html, docroot) you are using for the linter and security scripts to run correctly.
- Update your .gitlab-ci.yml with the correct scripts (you may not need dev, stage, prod deploy scripts).
- Update your .gitignore file to reflect the drupal docroot (web, html, docroot) you are using.
- Update your .gitignore file to reflect the environment you are pushing to, you will likely need the directories created by composer to be in your repo, so you will want to remove those directories from your .gitignore (example: /vendor/, /docroot/core/, /docroot/modules/contrib/, /docroot/themes/contrib/)
- Duplicate the `.env.example` file to `.env` and replace `example.localhost` with your site uri for drush 9 to communicate with it.
- If on Acquia use drush 8. Aliases from Acquia are in drush 8 format.
- If you are on Acquia or Pantheon you can detect environments directly in your `settings.php` file, else use `.env` file for each each environment.

## Multilingual

### Is your site going to be multilingual?

- Follow the instructions [in this video](https://www.youtube.com/watch?v=OnQlnRdtoYQ) for a good step by step on how to set up your site for multiple languages. It's good to do this as early in the project as possible.
- Other examples of Echidna built Drupal 8 Multilingual sites
  - Unicef - Voices of Youth
  - Ingenium
  - Special Olympics
  - Agency for Co-op Housing (multilingual SOLR setup, paragraphs, entity browser, revisions)
    - note there are a few patches you may need for all of these things to work properly, so check that project's composer.json

## FAQ

### How can I apply patches to downloaded modules and core?

To add a patch to a drupal module or core insert the patches section in the extra
section of composer.json:
```json
"extra": {
    "patches": {
        "drupal/core": {
            "Patch description": "URL or local path to patch"
        },
        "drupal/devel": {
            "Patch description": "URL or local path to patch"
        }
    }
}
```
and then run `composer update nothing`

### How to use PHPCS

PHPCS will be run automatically on the diff of your commit if you have installed the githooks using the above instructions. However, if you want to manually run phpcs on your code, you can run `vendor/bin/phpcs [folder/file]` from your project root to check your php standards. You can also use phpcbf command to attempt to fix the errors `vendor/bin/phpcbf [folder/file]` -- note this will only fix what it can, so run phpcs again after to check if errors remain.

PHPCS is not flawless and it may sometimes result in false positives. You can ignore the scan on certain lines of your code by using `// @codingStandardsIgnoreStart` and `// @codingStandardsIgnoreEnd`

```
$xmlPackage = new XMLPackage;
// @codingStandardsIgnoreStart
$xmlPackage['error_code'] = get_default_error_code_value();
$xmlPackage->send();
// @codingStandardsIgnoreEnd
```

-- These commands depend on the version of CodeSniffer you have installed. [See here for more details if this is not working for you](https://github.com/squizlabs/PHP_CodeSniffer/wiki/Advanced-Usage#ignoring-parts-of-a-file)


### How can I create re-usable content types and configuration?

You can export any relevant config into a module folder and then people can install your config on their site. Example of exporting the `slide` content type and related config into a module for re-use:

`drupal generate:module`
- answer the questions, really you only need the folder and info.yml

`drupal config:export:content:type slide`
- this will export the content type and fields for the `slide` content type,  you do not want the UUID or config hash

`drupal config:export:single --name=rabbit_hole.behavior_settings.node_type_slide`
- this will export a single config file, in this case the rabbit hole configuration for the slide content type,  you do not want the UUID or config hash

`drupal config:export:view`
- answer the questions, exports a view config file into your module ,  you do not want the UUID or config hash

To import just enable the module and then export the config so it is then stored in your sync directory. Then... TEST THAT IS WORKS!
