Utils = {
    error: function(err) {
        Session.set("error", (err && err.message || false));
    },

    is_authenticated: function() {
        return Meteor.user() ? true : false;
    },

    resizeHeight: function(selector, callback) {
        return function() {
            var board = jQuery(selector);
            var headerSize = $('#header').outerHeight();
            board.height($(window).height() - 60 - headerSize);

            // call
            callback && callback();
        };
    },

    boardScrollLeft: function() {
        var el = jQuery('#board'),
            data = Blaze.getData(el.get(0));
        if (data) {
            var sessionName = data.board ? 'scrollBoardLeft-' + data.board._id : false;

            if (sessionName) {
                el.scroll(function() {
                    Session.set(sessionName, $(this).scrollLeft());
                });
                el.scrollLeft(Session.get(sessionName));
            }
        }
    },

    widgetsHeight: function() {
        var wrapper = $('.board-wrapper'),
            widgets = $('.board-widgets'),
            boardActions = $('.board-actions-list'),
            pop = $('.pop-over');

        // set height widgets
        widgets.height(wrapper.height());
        boardActions.height(wrapper.height() - 215);
        pop.find('.content').css('max-height', widgets.height() / 2);
    },

    // scroll
    Scroll: function(selector) {
        var $el = $(selector);
        return {
            top: function(px, add) {
                var t = $el.scrollTop();
                $el.animate({ scrollTop: (add ? (t + px) : px) });
            },
            left: function(px, add) {
                var l = $el.scrollLeft();
                $el.animate({ scrollLeft: (add ? (l + px) : px) });
            }
        };
    },

    Warning: {
        get: function() {
            return Session.get('warning');
        },
        open: function(desc) {
            Session.set('warning', { desc: desc });
        },
        close: function() {
            Session.set('warning', false);
        }
    },

    goBoardId: function(_id) {
        var board = Boards.findOne(_id);
        return board && Router.go('Board', { boardId: board._id, slug: board.slug });
    },

    liveEvent: function(events, callback) {
        $(document).on(events, function() {
            callback($(this));
        });
    },

    // new getCardData(cardEl)
    getCardData: function(item) {
        var el = item.get(0),
            card = Blaze.getData(el),
            list = Blaze.getData(item.parents('.list').get(0)),
            before = item.prev('.card').get(0),
            after = item.next('.card').get(0);

        this.listId = list._id;
        this.cardId = card._id;

        // if before and after undefined then sort 0
        if (!before && !after) {

            // set sort 0
            this.sort = 0;
        } else {

            /*
            *
            * Blaze.getData takes as a parameter an html element
            * and will return the data context that was bound when
            * that html element was rendered!
            */
            if(!before) {

                /*
                * if it was dragged into the first position grab the
                * next element's data context and subtract one from the rank
                */
                this.sort = Blaze.getData(after).sort - 1;
            } else if(!after) {
                /*
                * if it was dragged into the last position grab the
                * previous element's data context and add one to the rank
                */
                this.sort = Blaze.getData(before).sort + 1;
            } else {

                /*
                * else take the average of the two ranks of the previous
                *  and next elements
                */
                this.sort = (Blaze.getData(after).sort + Blaze.getData(before).sort) / 2;
            }
        }
    },
    getLabelIndex: function(boardId, labelId) {
        var board = Boards.findOne(boardId),
            labels = {};
        _.each(board.labels, function(a, b) {
            labels[a._id] = b;
        });
        return {
            index: labels[labelId],
            key: function(key) {
                return 'labels.' + labels[labelId] + '.' + key;
            }
        };
    }
};

InputsCache = new ReactiveDict('inputsCache');

Blaze.registerHelper('inputCache', function (formName, formInstance) {
    var key = formName.toString() + '-' + formInstance.toString();
    return InputsCache.get(key);
});
