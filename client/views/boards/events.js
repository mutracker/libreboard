var toggleBoardStar = function(boardId) {
    var queryType = Meteor.user().hasStarred(boardId) ? '$pull' : '$addToSet';
    var query = {};
    query[queryType] = {
        'profile.starredBoards': boardId
    };
    Meteor.users.update(Meteor.userId(), query);
};

Template.boards.events({
    'click .js-star-board': function(event, t) {
        toggleBoardStar(this._id);
        event.preventDefault();
    }
});

Template.board.events({
    'click .js-star-board': function(event, t) {
        toggleBoardStar(this._id);
    },
    'click .js-rename-board:not(.no-edit)': Popup.open('boardChangeTitle'),
    'click #permission-level:not(.no-edit)': Popup.open('boardChangePermission'),
    'click .js-filter-cards-indicator': function(event) {
        Session.set('currentWidget', 'filter');
        event.preventDefault();
    },
    'click .js-filter-card-clear': function(event) {
        Filter.reset();
        event.stopPropagation();
    }
});

Template.createBoardPopup.events({
    'submit #CreateBoardForm': function(event, t) {
        var title = t.$('#boardNewTitle');

        // trim value title
        if ($.trim(title.val())) {
            // İnsert Board title
            var boardId = Boards.insert({
                title: title.val(),
                permission : 'public'
            });

            // Go to Board _id
            Utils.goBoardId(boardId);
        }
        event.preventDefault();
    }
});

Template.boardChangeTitlePopup.events({
    'submit #ChangeBoardTitleForm': function(event, t) {
        var title = t.$('.js-board-name').val().trim();
        if (title) {
            Boards.update(this._id, {
                $set: {
                    title: title
                }
            });
            Popup.close();
        }
        event.preventDefault();
    }
});

Template.boardChangePermissionPopup.events({
    'click .js-select': function(event, t) {
        var $this = $(event.currentTarget),
            permission = $this.attr('name');

        Boards.update(this._id, {
            $set: {
                permission: permission
            }
        });
        Popup.close();
    }
});
