/*
* If you want to use a default layout template for all routes you can
* configure a global Router option.
*/
Router.configure({
    loadingTemplate: 'loading',
    notFoundTemplate: 'notfound',
    trackPageView: true,

    yieldRegions: {
        '': {
            to: 'modal'
        }
    },

    /*
    * onBeforeAction hooks now require you to call this.next(),
    * and no longer take a pause() argument. So the default behaviour is reversed.
    * ClassMapper body add, remove class.
    */
    onBeforeAction: function(pause) {
        var body = $('body'),
            options = this.route.options,
            bodyClass = options["bodyClass"],
            authenticate = options['authenticated'],
            redirectLoggedInUsers = options['redirectLoggedInUsers'];

        // redirect logged in users to Boards view when they try to open Login or Signup views
        if (Meteor.user() && redirectLoggedInUsers) {
            // redirect
            this.redirect('Boards');
            return;
        }

        // authenticated
        if (!Meteor.user() && authenticate) {

            // redirect
            this.redirect(authenticate);

            // options authenticate not next().
            return;
        }

        // Remove class attribute body
        body.removeAttr('class');

        // if klass iron router name currentRouter then add Class
        if (bodyClass) body.addClass(bodyClass);

        // reset default sessions
        Session.set('error', false);
        Session.set('warning', false);

        Popup.close();

        // Layout template found then set render this.route options layout.
        if (!options.layoutTemplate) {

            // if user undefined then layout render
            if (!Meteor.user()) this.layout('layout');

            // user found then AuthLayout render
            else this.layout('AuthLayout');
        }

        // Next
        this.next();
    }
});

Router.route('/', {
    name: 'Home',
    template: 'home',
    layoutTemplate: 'LandingLayout'
});
