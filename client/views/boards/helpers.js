Template.boards.helpers({
    boards: function() {
        return Boards.find({}, {
            sort: ["title"]
        });
    },
    starredBoards: function() {
        var cursor = Boards.find({
            _id: {
                $in: Meteor.user().profile.starredBoards || []
            }
        }, {
            sort: ["title"]
        });
        return cursor.count() === 0 ? null : cursor;
    },
    isStarred: function() {
        var user = Meteor.user();
        return user && user.hasStarred(this._id);
    }
});

Template.board.helpers({
    isStarred: function() {
        var boardId = Boards.findOne()._id,
            user = Meteor.user();
        return boardId && user && user.hasStarred(boardId);
    }
});

Template.boardChangePermissionPopup.helpers({
    check: function(perm) {
        return this.permission === perm;
    }
});
