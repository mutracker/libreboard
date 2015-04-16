Users = Meteor.users;

// Search a user in the complete server database by its name or username. This
// is used for instance to add a new user to a board.
var searchInFields = ['username', 'profile.name'];
Users.initEasySearch(searchInFields, {
    use: 'mongo-db',
    returnFields: searchInFields
});


// HELPERS
Users.helpers({
    boards: function() {
        return Boards.find({ userId: this._id });
    },
    hasStarred: function(boardId) {
        return this.profile.starredBoards && _.contains(this.profile.starredBoards, boardId);
    },
    isBoardMember: function() {
        var board = Boards.findOne(Router.current().params.boardId);
        return _.contains(_.pluck(board.members, 'userId'), this._id);
    },
    isBoardAdmin: function() {
        var board = Boards.findOne(Router.current().params.boardId);
        return this.isBoardMember(board) && _.where(board.members, {userId: this._id})[0].isAdmin;
    }
});


// BEFORE HOOK
Users.before.insert(function (userId, doc) {

    // connect profile.status default
    doc.profile.status = 'offline';

    // slugify to username
    doc.username = getSlug(doc.profile.name, '');
});


// AFTER HOOK
isServer(function() {
    Users.after.insert(function(userId, doc) {
        var ExampleBoard = {
            title: 'Welcome Board',
            userId: doc._id,
            permission: 'private' // Private || Public
        };

        // Welcome Board insert and list, card :)
        Boards.insert(ExampleBoard, function(err, boardId) {

            // lists
            _.forEach(['Basics', 'Advanced'], function(title) {
                var list = {
                    title: title,
                    boardId: boardId,
                    userId: ExampleBoard.userId,

                    // XXX Not certain this is a bug, but we except these fields
                    // get inserted by the Lists.before.insert collection-hook.
                    // Since this hook is not called in this case, we have to
                    // dublicate the logic and set them here.
                    archived: false,
                    createdAt: new Date()
                };

                // insert List
                Lists.insert(list);
            });
        });
    });
});
