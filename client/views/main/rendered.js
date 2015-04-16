Template.editor.rendered = function() {
    this.$('textarea').textcomplete([
        { // emojies
            match: /\B:([\-+\w]*)$/,
            search: function (term, callback) {
                callback($.map(Emoji.values, function (emoji) {
                    return emoji.indexOf(term) === 0 ? emoji : null;
                }));
            },
            template: function (value) {
                return '<img src="' + Emoji.baseImagePath + value + '.png"></img>' + value;
            },
            replace: function (value) {
                return ':' + value + ':';
            },
            index: 1
        },
        { // user mentions
            match: /\B@(\w*)$/,
            search: function (term, callback) {
                var currentBoard = Boards.findOne(Router.current().params.boardId);
                callback($.map(currentBoard.members, function (member) {
                    var username = Users.findOne(member.userId).username;
                    return username.indexOf(term) === 0 ? username : null;
                }));
            },
            template: function (value) {
                return value;
            },
            replace: function (username) {
                return '@' + username + ' ';
            },
            index: 1
        }
    ]);
};
