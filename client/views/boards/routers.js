Router.route('/boards', {
    name: 'Boards',
    template: 'boards',
    bodyClass: 'page-index large-window tabbed-page',
    authenticated: 'Login',
    waitOn: function() {
        return Meteor.subscribe('boards');
    }
});

Router.route('/boards/:boardId/:slug', {
    name: 'Board',
    template: 'board',
    bodyClass: 'page-index large-window body-board-view bgBoard',
    onAfterAction: function() {
        Session.set('sidebarIsOpen', true);
        Session.set('currentWidget', 'home');
        Session.set('menuWidgetIsOpen', false);
    },
    waitOn: function() {
        var params = this.params;

        return [

            // Update currentUser profile status
            Meteor.subscribe('connectUser'),

            // Board page list, cards members vs
            Meteor.subscribe('board', params.boardId, params.slug)
        ];
    },
    data: function() {
        return Boards.findOne(this.params.boardId);
    }
});

// Reactively set the color of the page from the color of the current board.
Meteor.startup(function() {
    Tracker.autorun(function() {
        var currentRoute = Router.current();
        // We have to be very defensive here because we have no idea what the
        // state of the application is, so we have to test existence of any
        // property we want to use.
        // XXX There is one feature of coffeescript that rely shine in this kind
        // of code: `currentRoute?.params?.boardId` -- concise and clear.
        var currentBoard = Boards.findOne(currentRoute &&
                                          currentRoute.params &&
                                          currentRoute.params.boardId);
        if (currentBoard &&
            currentBoard.background &&
            currentBoard.background.type === "color") {
            $(document.body).css({
                backgroundColor: currentBoard.background.color
            });
        } else {
            $(document.body).css({ backgroundColor: '' });
        }
    });
});
