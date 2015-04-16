Template.lists.events({
    'click .js-open-card-composer': function(event, t) {
        var $el = $(event.currentTarget),
            list = $el.parents('.list'),
            composer = list.find('.card-composer');
            allComposers = t.$('.card-composer');

        // all lists hide composer and open click composer show
        allComposers.addClass('hide');
        t.$('.js-open-card-composer').removeClass('hide');

        // click open composer and focus
        composer.removeClass('hide');
        composer.find('.js-card-title').focus();
        $el.addClass('hide');

        // stop click hash
        event.preventDefault();
    },
    'click .js-open-list-menu': Popup.open('listAction'),
    'click .hide-on-edit': function(event, t) {
        var $this = $(event.currentTarget),
            listHeader = $this.parents('.list-header');

        // remove all editing classes
        $('.js-list-header').removeClass('editing');

        // and current editing open.
        listHeader.addClass('editing');

        // focus current form title
        listHeader.find('.single-line').focus();

        // stop click hash
        event.preventDefault();
    }
});

Template.listTitleEditForm.events({
    'submit #ListTitleEditForm': function(event, t) {
        var title = t.find('.js-title-input').value;
        if ($.trim(title)) {
            Lists.update(this.list._id, {
                $set: {
                    title: title
                }
            });

            // all editing remove
            $('.js-list-header').removeClass('editing');
        }
        event.preventDefault();
    },
    'click .js-cancel-edit': function(event, t) {
        $('.js-list-header').removeClass('editing');
    }
});

Template.addlistForm.events({
    'click .js-open-add-list': function(event, t) {
        t.$('.list').removeClass('idle');
        t.$('.list-name-input').focus();
    },
    'click .js-cancel-edit': function(event, t) {
        t.$('.list').addClass('idle');
    },
    // XXX We do something similar in the new card form event and should
    // probably avoid repeating ourself
    //
    // Keydown (and not keypress) in necessary here because the `keyCode`
    // property is consistent in all browsers, (there is not keyCode for the
    // `keypress` event in firefox)
    'keydown .list-name-input': function(event, t) {
        var code = event.keyCode;
        if (code === 27) {
            t.$('.js-cancel-edit').click();
            event.preventDefault();
        }
    },
    'submit #AddListForm': function(event, t) {
        var title = t.find('.list-name-input');
        if ($.trim(title.value)) {
            // insert
            Lists.insert({
                title: title.value,
                boardId: this.board._id,
                sort: $('.list').length
            }, function() {

                // insert complete to scrollLeft
                Utils.Scroll('#board').left(270, true);
            });

            // clear input
            title.value = '';
        }
        event.preventDefault();
    }
});

Template.listActionPopup.events({
    'click .js-add-card': function(event, t) {},
    'click .js-list-subscribe': function(event, t) {},
    'click .js-move-cards': Popup.open('listMoveCards'),
    'click .js-archive-cards': Popup.afterConfirm('listArchiveCards', function() {
        Cards.find({listId: this._id}).forEach(function(card) {
            Cards.update(card._id, {
                $set: {
                    archived: true
                }
            })
        });
        Popup.close();
    }),
    'click .js-close-list': function(event, t) {
        Lists.update(this._id, {
            $set: {
                archived: true
            }
        });

        Popup.close();

        event.preventDefault();
    }
});

Template.listMoveCardsPopup.events({
    'click .js-select-list': function() {
        var fromList = Template.parentData(2).data._id;
        var toList = this._id;
        Cards.find({listId: fromList}).forEach(function(card) {
            Cards.update(card._id, {
                $set: {
                    listId: toList
                }
            });
        });
        Popup.close();
    }
});
