Template.addCardForm.events({
    'click .js-cancel': function(event, t) {
        var composer = t.$('.card-composer');

        // Keep the old value in memory to display it again next time
        var inputCacheKey = "addCard-" + this.listId;
        var oldValue = composer.find('.js-card-title').val();
        InputsCache.set(inputCacheKey, oldValue);

        // add composer hide class
        composer.addClass('hide');
        composer.find('.js-card-title').val('');

        // remove hide open link class
        $('.js-open-card-composer').removeClass('hide');
    },
    'keydown .js-card-title': function(event, t) {
        var code = event.keyCode;
        // Pressing enter submit the form and add the card
        if (code === 13) { 
            t.$('#AddCardForm').submit();
            event.preventDefault();
        // Pressing escape close the form
        } else if (code === 27) {
            t.$('.js-cancel').click();
            event.preventDefault();
        }
    },
    'submit #AddCardForm': function(event, t) {
        var title = t.$('.js-card-title'),
            list = title.parents('.list'),
            cards = list.find('.card'),
            sort = cards.last().length ? (Blaze.getData(cards.last()[0]).sort +1) : 0;

        // Clear the form in-memory cache
        var inputCacheKey = "addCard-" + this.listId;
        InputsCache.set(inputCacheKey, '');

        // title trim if not empty then
        if ($.trim(title.val())) {
            Cards.insert({
                title: title.val(),
                listId: this.listId,
                boardId: this.board._id,
                sort: sort
            }, function(err, _id) {
                // In case the filter is active we need to add the newly
                // inserted card in the list of exceptions -- cards that are
                // not filtered. Otherwise the card will disappear instantly.
                // See https://github.com/libreboard/libreboard/issues/80
                Filter.addException(_id);
            });

            // empty and focus.
            title.val('').focus();

            // focus complete then scroll top
            Utils.Scroll(list.find('.list-cards')).top(1000, true);
        }
        event.preventDefault();
    }
});

Template.cards.events({
    'click .member': Popup.open('cardMember')
});

Template.cardMemberPopup.events({
    'click .js-remove-member': function(event, t) {
        Cards.update(this.cardId, {$pull: {members: this.userId}});
        Popup.close();
    }
});

Template.cardDetailWindow.events({
    'click .editable .js-card-title': function(event, t) {
        var editable = t.$('.card-detail-title');

        // add class editing and focus
        $('.editing').removeClass('editing');
        editable.addClass('editing');
        editable.find('#title').focus();
    },
    'click .js-edit-desc': function(event, t) {
        var editable = t.$('.card-detail-item');

        // editing remove based and add current editing.
        $('.editing').removeClass('editing');
        editable.addClass('editing');
        editable.find('#desc').focus();

        event.preventDefault();
    },
    'click .js-cancel-edit': function(event, t) {
        // remove editing hide.
        $('.editing').removeClass('editing');
    },
    'submit #WindowTitleEdit': function(event, t) {
        var title = t.find('#title').value;
        if ($.trim(title)) {
            Cards.update(this.card._id, {
                $set: {
                    title: title
                }
            }, function (err, res) {
                if (!err) $('.editing').removeClass('editing');
            });
        }

        event.preventDefault();
    },
    'submit #WindowDescEdit': function(event, t) {
        Cards.update(this.card._id, {
            $set: {
                description: t.find('#desc').value
            }
        }, function(err) {
            if (!err) $('.editing').removeClass('editing');
        });
        event.preventDefault();
    },
    'click .member': Popup.open('cardMember'),
    'click .js-details-edit-members': Popup.open('cardMembers'),
    'click .js-details-edit-labels': Popup.open('cardLabels')
});

Template.WindowActivityModule.events({
    'click .js-new-comment:not(.focus)': function(event, t) {
        var $this = $(event.currentTarget);
        $this.addClass('focus');
    },
    'submit #CommentForm': function(event, t) {
        var text = t.$('.js-new-comment-input');
        if ($.trim(text.val())) {
            CardComments.insert({
                boardId: this.card.boardId,
                cardId: this.card._id,
                text: text.val()
            });
            text.val('');
            $('.focus').removeClass('focus');
        }
        event.preventDefault();
    }
});

Template.WindowSidebarModule.events({
    'click .js-change-card-members': Popup.open('cardMembers'),
    'click .js-edit-labels': Popup.open('cardLabels'),
    'click .js-archive-card': function(event, t) {
        // Update
        Cards.update(this.card._id, {
            $set: {
                archived: true
            }
        });
        event.preventDefault();
    },
    'click .js-unarchive-card': function(event, t) {
        Cards.update(this.card._id, {
            $set: {
                archived: false
            }
        });
        event.preventDefault();
    },
    'click .js-delete-card': Popup.afterConfirm('cardDelete', function() {
        Cards.remove(this.card._id);

        // redirect board
        Utils.goBoardId(this.card.board()._id);
        Popup.close();
    }),
    'click .js-more-menu': Popup.open('cardMore'),
    'click .js-attach': Popup.open('cardAttachments')
});

Template.WindowAttachmentsModule.events({
    'click .js-attach': Popup.open('cardAttachments'),
    'click .js-confirm-delete': Popup.afterConfirm('attachmentDelete', function() {
        Attachments.remove(this._id);
        Popup.close();
    }),
    // If we let this event bubble, Iron-Router will handle it and empty the
    // page content, see #101.
    'click .js-open-viewer, click .js-download': function(event) {
        event.stopPropagation();
    },
    'click .js-add-cover': function() {
        Cards.update(this.cardId, { $set: { coverId: this._id } });
    },
    'click .js-remove-cover': function() {
        Cards.update(this.cardId, { $unset: { coverId: "" } } );
    }
});

Template.cardMembersPopup.events({
    'click .js-select-member': function(event, tpl) {
        var cardId = Template.parentData(2).data.card._id;
        var memberId = this.userId;
        var operation;
        if (Cards.find({ _id: cardId, members: memberId}).count() === 0)
            operation = '$addToSet';
        else
            operation = '$pull';

        var query = {};
        query[operation] = {
            members: memberId
        };
        Cards.update(cardId, query);
        event.preventDefault();
    }
});

Template.cardLabelsPopup.events({
    'click .js-select-label': function(event, tpl) {
        var cardId = Template.parentData(2).data.card._id;
        var labelId = this._id;
        var operation;
        if (Cards.find({ _id: cardId, labelIds: labelId}).count() === 0)
            operation = '$addToSet';
        else
            operation = '$pull';

        var query = {};
        query[operation] = {
            labelIds: labelId
        };
        Cards.update(cardId, query);
        event.preventDefault();
    },
    'click .js-edit-label': Popup.open('editLabel'),
    'click .js-add-label': Popup.open('createLabel')
});


Template.formLabel.events({
    'click .js-palette-color': function(event, tpl) {
        var $this = $(event.currentTarget);

        // hide selected ll colors
        $('.js-palette-select').addClass('hide');

        // show select color
        $this.find('.js-palette-select').removeClass('hide');
    }
});

Template.createLabelPopup.events({
    // Create the new label
    'submit .create-label': function(event, tpl) {
        var name = tpl.$('#labelName').val().trim();
        var boardId = Router.current().params.boardId;
        var selectLabel = Blaze.getData(tpl.$('.js-palette-select:not(.hide)').get(0));
        Boards.update(boardId, {
            $push: {
                labels: {
                    _id: Random.id(6),
                    name: name,
                    color: selectLabel.color
                }
            }
        });
        Popup.back();
        event.preventDefault();
    }
});

Template.editLabelPopup.events({
    'click .js-delete-label': Popup.afterConfirm('deleteLabel', function(){
        var boardId = Router.current().params.boardId;
        Boards.update(boardId, {
            $pull: {
                labels: {
                    _id: this._id
                }
            }
        });
        Popup.back(2);
    }),
    'submit .edit-label': function(event, tpl) {
        var name = tpl.$('#labelName').val().trim();
        var boardId = Router.current().params.boardId;
        var getLabel = Utils.getLabelIndex(boardId, this._id);
        var selectLabel = Blaze.getData(tpl.$('.js-palette-select:not(.hide)').get(0));
        var $set = {};

        // set label index
        $set[getLabel.key('name')] = name;

        // set color
        $set[getLabel.key('color')] = selectLabel.color;

        // update
        Boards.update(boardId, { $set: $set });

        // return to the previous popup view trigger
        Popup.back();

        event.preventDefault();
    },
    'click .js-select-label': function() {
        Cards.remove(this.cardId);

        // redirect board
        Utils.goBoardId(this.boardId);
    }
});

Template.cardMorePopup.events({
    'click .js-delete': Popup.afterConfirm('cardDelete', function() {
        Cards.remove(this.card._id);

        // redirect board
        Utils.goBoardId(this.card.board()._id);
    })
});

Template.cardAttachmentsPopup.events({
    'change .js-attach-file': function(event, t) {
        var card = this.card;
        FS.Utility.eachFile(event, function(f) {
            var file = new FS.File(f);

            // set Ids
            file.boardId = card.boardId;
            file.cardId  = card._id;

            // upload file
            Attachments.insert(file);

            Popup.close();
        });
    },
    'click .js-computer-upload': function(event, t) {
        t.find('.js-attach-file').click();
        event.preventDefault();
    }
});
