// This is the publication used to display the board list. We publish all the
// non-archived boards:
// 1. that the user is a member of
// 2. the user has starred
Meteor.publish('boards', function() {
    // Ensure that the user is connected
    check(this.userId, String);

    // Defensive programming to verify that starredBoards has the expected
    // format -- since the field is in the `profile` a user can modify it.
    var starredBoards = Users.findOne(this.userId).profile.starredBoards || [];
    check(starredBoards, [String]);

    return Boards.find({
        archived: false,
        $or: [
            { 'members.userId': this.userId },
            { _id: { $in: starredBoards } }
        ]
    }, {
        fields: {
            _id: 1,
            slug: 1,
            title: 1,
            background: 1
        }
    });
});

Meteor.publishComposite('board', function(boardId, slug) {
    check(boardId, String);
    check(slug, String);
    return {
        find: function() {
            return Boards.find({
                _id: boardId,
                slug: slug,
                archived: false,
                $or: [
                    // If the board is not public the user has to be a member of
                    // it to see it.
                    { permission: 'public' },
                    { 'members.userId': this.userId }
                ]
            }, { limit: 1 });
        },
        // XXX For efficiency we shouldn't publish all activities and comments
        // in this publication, and instead use the card publication for that
        // purpose.
        children: [
            // Lists
            {
                find: function(board) {
                    return Lists.find({
                        boardId: board._id
                    });
                }
            },

            // Cards and cards comments
            // XXX Originally we were publishing the card documents as a child
            // of the list publication defined above using the following
            // selector `{ listId: list._id }`. But it was causing a race
            // condition in publish-composite, that I documented here:
            //
            //   https://github.com/englue/meteor-publish-composite/issues/29
            //
            // I then tried to replace publish-composite by cottz:publish, but
            // it had a similar problem:
            //
            //   https://github.com/Goluis/cottz-publish/issues/4
            //   https://github.com/libreboard/libreboard/pull/78
            //
            // The current state of relational publishing in meteor is a bit
            // sad, there are a lot of various packages, with various APIs, some
            // of them are unmaintained. Fortunately this is something that will
            // be fixed by meteor-core at some point:
            //
            //   https://trello.com/c/BGvIwkEa/48-easy-joins-in-subscriptions
            //
            // And in the meantime our code below works pretty well -- it's not
            // even a hack!
            {
                find: function(board) {
                    return Cards.find({
                        boardId: board._id
                    });
                },

                children: [
                    // comments
                    {
                        find: function(card) {
                            return CardComments.find({
                                cardId: card._id
                            });
                        }
                    },
                    // Attachments
                    {
                        find: function(card) {
                            return Attachments.find({
                                cardId: card._id
                            });
                        }
                    }
                ]
            },

            // Board members
            {
                find: function(board) {
                    return Users.find({
                        _id: { $in: _.pluck(board.members, 'userId') }
                    });
                }
            },

            // Activities
            {
                find: function(board) {
                    return Activities.find({
                        boardId: board._id
                    });
                },
                children: [
                    // Activities members. In general activity members are
                    // already published in the board member publication above,
                    // but it can be the case that a board member was removed
                    // and we still want to read his activity history.
                    // XXX A more efficient way to do this would be to keep a
                    // {active: Boolean} field in the `board.members` so we can
                    // publish former board members in one single publication,
                    // and have a easy way to distinguish between current and
                    // former members.
                    {
                        find: function(activity) {
                            if (activity.memberId)
                                return Users.find(activity.memberId);
                        }
                    }
                ]
            }
        ]
    };
});
