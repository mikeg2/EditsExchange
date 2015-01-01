/* Routes
 *
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */



/*
 * (1) Core middleware
 *
 * Middleware included with `app.use` is run first, before the router
 */


/**
 * (2) Static routes
 *
 * This object routes static URLs to handler functions--
 * In most cases, these functions are actions inside of your controllers.
 * For convenience, you can also connect routes directly to views or external URLs.
 *
 */
var RESTUrlManager = require('../api/services/RESTUrlManager');
var SocketUrlManager = require('../api/services/SocketUrlManager');

var routes = module.exports.routes = {};

//----Pages----
routes['/auth'] = {
    controller: 'PageController',
    action: 'auth'
};

routes['/auth/logout'] = {
    controller: 'PageController',
    action: 'logout'
};

routes['get /user/edits'] = {
    controller: 'PageController',
    action: 'userEdits'
};

routes['get /user/drafts'] = {
    controller: 'PageController',
    action: 'userDrafts'
};

routes['get /user/settings'] = {
    controller: 'PageController',
    action: 'userSettings'
};

routes['get /user/messages'] = {
    controller: 'PageController',
    action: 'userMessages'
};

routes['get /user/groups'] = {
    controller: 'PageController',
    action: 'userGroups'
};

routes['get /users/:user_id/user-page'] = {
    controller: 'PageController',
    action: 'userPage'
};

routes['get /exchange'] = {
    controller: 'PageController',
    action: 'exchange'
};

routes['get /genres'] = {
    controller: 'PageController',
    action: 'genres'
};

routes['get /genres/:genre_id/genre-page'] = {
  controller: 'PageController',
  action: 'genrePage'
};

routes['get /drafts/:draft_id/draft-page'] = {
  controller: 'PageController',
  action: 'draftPage'
};

routes['get /groups'] = {
    controller: 'PageController',
    action: 'groups'
};

routes['get /groups/:group_id/group-page'] = {
    controller: 'PageController',
    action: 'groupPage'
};

routes['get /edits/edit-editor/draft/:draft_id/user/:user_id'] = {
    controller: 'PageController',
    action: 'editEditor'
};

// routes['get ' + UrlManager.getUrlForEditViewer(':edit_id')] = {
//     controller: 'PageController',
//     action: 'editViewer'
// };

//TODO reorganize by resource, not controller
//----API----

//Auth
routes['post /api/v0/auth/login'] = {
    controller: 'AuthController',
    action: 'login'
};

routes['post /api/v0/auth/logout'] = {
    controller: 'AuthController',
    action: 'logout'
};

routes['post /api/v0/auth/register'] = {
    controller: 'AuthController',
    action: 'register'
};

routes['/partials/:partialName'] = {
    controller: 'PartialsController',
    action: 'compilePartialByName'
};

//User

routes['get ' + RESTUrlManager.getUrlForAllUsers()] = {
    controller: 'UserController',
    action: 'findAll'
};

routes['get ' + RESTUrlManager.getUrlForUser(':user_id')] = {
    controller: 'UserController',
    action: 'find'
};

routes['put ' + RESTUrlManager.getUrlForUser(':user_id')] = {
    controller: 'UserController',
    action: 'update'
};

routes['put ' + RESTUrlManager.getUrlForUser(':user_id') + '/password'] = {
    controller: 'UserController',
    action: 'updatePassword'
};


routes['get ' + RESTUrlManager.getUrlForUser(':user_id') + '/drafts'] = {
    controller: 'DraftController',
    action: 'findAllForUser'
};

routes['post ' + RESTUrlManager.getUrlForUser(':user_id') + '/drafts'] = {
    controller: 'DraftController',
    action: 'create'
};

routes['get ' + RESTUrlManager.getUrlForUser(':user_id') + '/edited-drafts'] = {
    controller: 'DraftController',
    action: 'findAllEditedByUser'
};


routes['get ' + RESTUrlManager.getUrlForUser(":user_id") + "/favoriteGenres"] = {
    controller: 'GenreController',
    action: 'findFavoritesForUser'
};

routes['get ' + RESTUrlManager.getUrlForUser(":user_id") + "/chats"] = {
    controller: 'ChatController',
    action: 'findAllForUser'
};

routes['get ' + RESTUrlManager.getUrlForUser(":user_id") + "/groups"] = {
    controller: 'GroupController',
    action: 'findAllForUser'
};

routes['get ' + RESTUrlManager.getUrlForUser(":user_id") + "/subscriptions"] = {
    controller: 'UserController',
    action: 'getAllSubscriptionsForUser'
};

routes['post ' + RESTUrlManager.getUrlForUser(":user_id") + "/subscriptions"] = {
    controller: 'UserController',
    action: 'addSubscription'
};

routes['post ' + RESTUrlManager.getUrlForUser(":user_id") + "/subscribers"] = {
    controller: 'UserController',
    action: 'addSubscriber'
};

routes['delete ' + RESTUrlManager.getUrlForUser(":user_id") + "/subscribers/:subscriber_id"] = {
    controller: 'UserController',
    action: 'removeSubscriber'
};

//Edits

routes['get ' + RESTUrlManager.getUrlForEditByUser(':draft_id', ':user_id')] = {
    controller: 'EditController',
    action: 'findOrCreateByUser'
};

routes['delete ' + RESTUrlManager.getUrlForEditByUser(':draft_id', ':user_id')] = {
    controller: 'EditController',
    action: 'deleteByUser'
};

routes['put ' + RESTUrlManager.getUrlForEditByUser(':draft_id', ':user_id')] = {
    controller: 'EditController',
    action: 'updateByUser'
};

routes['get ' + RESTUrlManager.getUrlForEdit(':edit_id') + '/comments'] = {
    controller: 'EditController',
    action: 'findAllEditComments'
};

routes['put ' + RESTUrlManager.getUrlForEdit(':edit_id') + '/comments'] = {
    controller: 'EditController',
    action: 'replaceEditComments'
};

routes['get ' + RESTUrlManager.getUrlForEdit(':edit_id')] = {
    controller: 'EditController',
    action: 'find'
};

routes['delete ' + RESTUrlManager.getUrlForEdit(':edit_id')] = {
    controller: 'EditController',
    action: 'destroy'
};

routes['put ' + RESTUrlManager.getUrlForEdit(':edit_id')] = {
    controller: 'EditController',
    action: 'update'
};


//Drafts

routes['get ' + RESTUrlManager.getUrlForDraft(':draft_id')] = {
    controller: 'DraftController',
    action: 'find'
};

routes['delete ' + RESTUrlManager.getUrlForDraft(':draft_id')] = {
    controller: 'DraftController',
    action: 'destroy'
};

routes['post ' + RESTUrlManager.getUrlForDraft(':draft_id')] = {
    controller: 'DraftController',
    action: 'update'
};

routes['get ' + RESTUrlManager.getUrlForDraft(':draft_id') + '/genres'] = {
    controller: 'GenreController',
    action: 'findAllForDraft'
};

routes['get ' + RESTUrlManager.getUrlForDraft(':draft_id') + '/edits'] = {
    controller: 'EditController',
    action: 'findAllForDraft'
};

routes['post ' + RESTUrlManager.getUrlForDraft(':draft_id') + '/invites'] = {
    controller: 'InviteController',
    action: 'createForDraft'
};

//Genres
routes['get ' + RESTUrlManager.getUrlForAllGenres()] = {
    controller: 'GenreController',
    action: 'findAll'
};

routes['get ' + RESTUrlManager.getUrlForGenre(":genre_id")] = {
    controller: 'GenreController',
    action: 'find'
};

routes['get ' + RESTUrlManager.getUrlForGenre(":genre_id") + '/drafts'] = {
    controller: 'DraftController',
    action: 'findAllForGenre'
};

//Chats
routes['get ' + RESTUrlManager.getUrlForChat(":chat_id")] = {
    controller: 'ChatController',
    action: 'find'
};

routes['post ' + RESTUrlManager.getUrlForChat(":chat_id") + "/messages"] = {
    controller: 'MessageController',
    action: 'createForChat'
};

routes['post ' + RESTUrlManager.getUrlForAllChats()] = {
    controller: 'ChatController',
    action: 'getOrCreateChat'
};

//Groups
routes['get ' + RESTUrlManager.getUrlForAllGroups()] = {
  controller: 'GroupController',
  action: 'findAll'
};

routes['get ' + RESTUrlManager.getUrlForAllGroups() + "/random"] = {
  controller: 'GroupController',
  action: 'findRandom'
};

routes['get ' + RESTUrlManager.getUrlForGroup(':group_id')] = {
  controller: 'GroupController',
  action: 'find'
};

routes['post ' + RESTUrlManager.getUrlForAllGroups()] = {
  controller: 'GroupController',
  action: 'create'
};

routes['put ' + RESTUrlManager.getUrlForGroup(':group_id')] = {
  controller: 'GroupController',
  action: 'update'
};

routes['post ' + RESTUrlManager.getUrlForGroup(':group_id') + '/invites'] = {
    controller: 'InviteController',
    action: 'createForGroup'
};

routes['get ' + RESTUrlManager.getUrlForGroup(':group_id') + "/members"] = {
  controller: 'UserController',
  action: 'findAllForGroup'
};

routes['post ' + RESTUrlManager.getUrlForGroup(':group_id') + "/members"] = {
  controller: 'GroupController',
  action: 'addMember'
};

routes['post ' + RESTUrlManager.getUrlForGroup(':group_id') + "/admin"] = {
  controller: 'GroupController',
  action: 'changeAdmin'
};

routes['delete ' + RESTUrlManager.getUrlForGroup(':group_id') + "/members/:user_id"] = {
  controller: 'GroupController',
  action: 'removeMember'
};

routes['get ' + RESTUrlManager.getUrlForGroup(':group_id') + "/drafts"] = {
  controller: 'DraftController',
  action: 'findAllForGroup'
};

routes['get ' + RESTUrlManager.getUrlForGroup(':group_id') + "/discussions"] = {
  controller: 'DiscussionController',
  action: 'findAllForGroup'
};

routes['get ' + RESTUrlManager.getUrlForGroup(':group_id') + "/activity"] = {
  controller: 'GroupController',
  action: 'findGroupActivity'
};

routes['remove ' + RESTUrlManager.getUrlForGroup(':group_id')] = {
  controller: 'GroupController',
  action: 'removeMember'
};

// Discussion
routes['post ' + RESTUrlManager.getUrlForAllDiscussions()] = {
  controller: 'DiscussionController',
  action: 'create'
};

routes['get ' + RESTUrlManager.getUrlForDiscussion(':discussion_id')] = {
  controller: 'DiscussionController',
  action: 'find'
};

routes['post ' + RESTUrlManager.getUrlForDiscussion(':discussion_id') + '/messages'] = {
  controller: 'MessageController',
  action: 'createForDiscussion'
};

// Socket Event Subscriptions and Rooms
// routes['get ' + SocketUrlManager.getUrlForEditDeepSubscription(':edit_id')] = {
//     controller: 'EditController',
//     action: 'addDeepSubscription'
// };

//TODO Add socket to allow only one editor window to be open

//TODO Add socket to allow deep subscription and invalidation  

/*
  // But what if you want your home page to display
  // a signup form located at `views/user/signup.ejs`?
  '/': {
    view: 'user/signup'
  }


  // Let's say you're building an email client, like Gmail
  // You might want your home route to serve an interface using custom logic.
  // In this scenario, you have a custom controller `MessageController`
  // with an `inbox` action.
  '/': 'MessageController.inbox'


  // Alternatively, you can use the more verbose syntax:
  '/': {
    controller: 'MessageController',
    action: 'inbox'
  }


  // If you decided to call your action `index` instead of `inbox`,
  // since the `index` action is the default, you can shortcut even further to:
  '/': 'MessageController'


  // Up until now, we haven't specified a specific HTTP method/verb
  // The routes above will apply to ALL verbs!
  // If you want to set up a route only for one in particular
  // (GET, POST, PUT, DELETE, etc.), just specify the verb before the path.
  // For example, if you have a `UserController` with a `signup` action,
  // and somewhere else, you're serving a signup form looks like: 
  //
  //		<form action="/signup">
  //			<input name="username" type="text"/>
  //			<input name="password" type="password"/>
  //			<input type="submit"/>
  //		</form>

  // You would want to define the following route to handle your form:
  'post /signup': 'UserController.signup'


  // What about the ever-popular "vanity URLs" aka URL slugs?
  // (you might remember doing this with `mod_rewrite` in Apache)
  //
  // This is where you want to set up root-relative dynamic routes like:
  // http://yourwebsite.com/twinkletoez
  //
  // NOTE:
  // You'll still want to allow requests through to the static assets,
  // so we need to set up this route to ignore URLs that have a trailing ".":
  // (e.g. your javascript, CSS, and image files)
  'get /*(^.*)': 'UserController.profile'

  */




/** 
 * (3) Action blueprints
 * These routes can be disabled by setting (in `config/controllers.js`):
 * `module.exports.controllers.blueprints.actions = false`
 *
 * All of your controllers ' actions are automatically bound to a route.  For example:
 *   + If you have a controller, `FooController`:
 *     + its action `bar` is accessible at `/foo/bar`
 *     + its action `index` is accessible at `/foo/index`, and also `/foo`
 */


/**
 * (4) Shortcut CRUD blueprints
 *
 * These routes can be disabled by setting (in config/controllers.js)
 *			`module.exports.controllers.blueprints.shortcuts = false`
 *
 * If you have a model, `Foo`, and a controller, `FooController`,
 * you can access CRUD operations for that model at:
 *		/foo/find/:id?	->	search lampshades using specified criteria or with id=:id
 *
 *		/foo/create		->	create a lampshade using specified values
 *
 *		/foo/update/:id	->	update the lampshade with id=:id
 *
 *		/foo/destroy/:id	->	delete lampshade with id=:id
 *
 */

/**
 * (5) REST blueprints
 *
 * These routes can be disabled by setting (in config/controllers.js)
 *		`module.exports.controllers.blueprints.rest = false`
 *
 * If you have a model, `Foo`, and a controller, `FooController`,
 * you can access CRUD operations for that model at:
 *
 *		get /foo/:id?	->	search lampshades using specified criteria or with id=:id
 *
 *		post /foo		-> create a lampshade using specified values
 *
 *		put /foo/:id	->	update the lampshade with id=:id
 *
 *		delete /foo/:id	->	delete lampshade with id=:id
 *
 */

/**
 * (6) Static assets
 *
 * Flat files in your `assets` directory- (these are sometimes referred to as 'public')
 * If you have an image file at `/assets/images/foo.jpg`, it will be made available
 * automatically via the route:  `/images/foo.jpg`
 *
 */



/*
 * (7) 404 (not found) handler
 *
 * Finally, if nothing else matched, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 */
 