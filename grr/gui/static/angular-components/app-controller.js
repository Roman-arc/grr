'use strict';

goog.provide('grrUi.appController');
goog.provide('grrUi.appController.appControllerModule');

/*
 * TODO(hanuszczak): This module still uses old-style `goog.require` statements
 * because of the issues with `grrUi.templates`. `grrUi.templates` module is
 * auto-generated and we cannot easily fix its `goog.provide` statements.
 *
 * This should not be a big problem though. This module is ought to be
 * converted to ES6-style module system as the last one. Because of that we can
 * skip the `goog.require` migration step and do it in a single CL when
 * everything else is already converted.
 */

goog.require('grrUi.acl.acl');            // USE: aclModule
goog.require('grrUi.artifact.artifact');  // USE: artifactModule
goog.require('grrUi.client.client');  // USE: clientModule
goog.require('grrUi.config.config');  // USE: configModule
goog.require('grrUi.core.core');  // USE: coreModule
goog.require('grrUi.cron.cron');  // USE: cronModule
goog.require('grrUi.docs.docs');  // USE: docsModule
goog.require('grrUi.flow.flow');  // USE: flowModule
goog.require('grrUi.forms.forms');  // USE: formsModule
goog.require('grrUi.hunt.hunt');    // USE: huntModule
/**
 * grrUi.local.local.localModule is empty by default and can be used for
 * deployment-specific plugins implementation.
 */
goog.require('grrUi.local.local');  // USE: localModule
goog.require('grrUi.outputPlugins.outputPlugins');  // USE: outputPluginsModule
goog.require('grrUi.routing.routing');              // USE: routingModule
goog.require('grrUi.semantic.semantic');  // USE: semanticModule
goog.require('grrUi.sidebar.sidebar');    // USE: sidebarModule
goog.require('grrUi.stats.stats');        // USE: statsModule
/**
 * If GRR is running with AdminUI.use_precompiled_js = True, then
 * grrUi.templates is a special autogenerated module containing all the
 * directives templates. If GRR is running with
 * AdminUI.use_precompiled_js = False, then this module is empty.
 */
goog.require('grrUi.templates.templatesModule');
goog.require('grrUi.user.user');  // USE: userModule


/**
 * Main GRR UI application module.
 */
grrUi.appController.appControllerModule =
    angular.module('grrUi.appController', [
      grrUi.acl.acl.aclModule.name, grrUi.artifact.artifact.artifactModule.name,
      grrUi.client.client.clientModule.name,
      grrUi.config.config.configModule.name, grrUi.core.core.coreModule.name,
      grrUi.cron.cron.cronModule.name, grrUi.docs.docs.docsModule.name,
      grrUi.flow.flow.flowModule.name, grrUi.forms.forms.formsModule.name,
      grrUi.hunt.hunt.huntModule.name, grrUi.local.local.localModule.name,
      grrUi.outputPlugins.outputPlugins.outputPluginsModule.name,
      grrUi.routing.routing.routingModule.name,
      grrUi.semantic.semantic.semanticModule.name,
      grrUi.stats.stats.statsModule.name,
      grrUi.sidebar.sidebar.sidebarModule.name,
      grrUi.templates.templatesModule.name, grrUi.user.user.userModule.name
    ]);

/**
 * Global list of intercepted errors. Filled by $exceptionHandler.
 * @private
 */
window.grrInterceptedErrors_ = [];

grrUi.appController.appControllerModule.config(function(
    $httpProvider, $interpolateProvider, $qProvider, $locationProvider,
    $rootScopeProvider, $provide) {
  // Set templating braces to be '{$' and '$}' to avoid conflicts with Django
  // templates.
  $interpolateProvider.startSymbol('{$');
  $interpolateProvider.endSymbol('$}');

  // Ensuring that Django plays nicely with Angular-initiated requests
  // (see http://www.daveoncode.com/2013/10/17/how-to-
  // make-angularjs-and-django-play-nice-together/).
  $httpProvider.defaults.headers.post[
    'Content-Type'] = 'application/x-www-form-urlencoded';

  // Erroring on unhandled rejection is a behavior added in Angular 1.6, our
  // code is written without this check in mind.
  $qProvider.errorOnUnhandledRejections(false);

  // Setting this explicitly due to Angular's behavior change between
  // versions 1.5 and 1.6.
  $locationProvider.hashPrefix('');

  // We use recursive data model generation when rendering forms. Therefore
  // have to increase the digestTtl limit to 50.
  $rootScopeProvider.digestTtl(50);

  // We decorate $exceptionHandler to collect information about errors
  // in a global list (window._grrInterceptedErrors). This is then used
  // by Selenium testing code to check for JS errors.
  $provide.decorator("$exceptionHandler", function($delegate) {
    return function(exception, cause) {
      window.grrInterceptedErrors_.push(exception.stack || exception.toString());
      $delegate(exception, cause);
    };
  });
});

grrUi.appController.appControllerModule.run(function($injector, $http, $cookies,
                                                     grrFirebaseService,
                                                     grrReflectionService) {
  // Ensure CSRF token is in place for Angular-initiated HTTP requests.
  $http.defaults.headers.post['X-CSRFToken'] = $cookies.get('csrftoken');
  $http.defaults.headers.delete = $http.defaults.headers.patch = {
    'X-CSRFToken': $cookies.get('csrftoken')
  };

  grrFirebaseService.setupIfNeeded();

  // Call reflection service as soon as possible in the app lifetime to cache
  // the values. "ACLToken" is picked up here as an arbitrary name.
  // grrReflectionService loads all RDFValues definitions on first request
  // and then caches them.
  grrReflectionService.getRDFValueDescriptor('ACLToken');
});


/**
 * Hardcoding jsTree themes folder so that it works correctly when used
 * from a JS bundle file.
 */
$['jstree']['_themes'] = '/static/third-party/jstree/themes/';


/**
 * TODO(user): Remove when dependency on jQuery-migrate is removed.
 */
jQuery['migrateMute'] = true;


grrUi.appController.appControllerModule.controller('GrrUiAppController', function() {});
