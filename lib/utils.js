allowIsBoardAdmin = function(userId, board) {
    return _.contains(_.pluck(_.where(board.members, {isAdmin: true}), 'userId'), userId);
};

allowIsBoardMember = function(userId, board) {
    return _.contains(_.pluck(board.members, 'userId'), userId);
};

isServer = function(callback) {
    return Meteor.isServer && callback();
};
