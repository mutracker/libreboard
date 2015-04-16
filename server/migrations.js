// Anytime you change the schema of one of the collection in a non-backward
// compatible way you have to write a migration in this file using the following
// API:
//
//   Migrations.add(name, migrationCallback, optionalOrder);

Migrations.add('board-background-color', function() {
    var defaultColor = '#16A085';
    Boards.update({
        background: {
            $exists: false
        }
    }, {
        $set: {
            background: {
                type: 'color',
                color: defaultColor
            }
        }
    }, {
        multi: true
    });
});

Migrations.add('lowercase-board-permission', function() {
    _.forEach(['Public', 'Private'], function(permission) {
        Boards.update(
            { permission: permission },
            { $set: { permission: permission.toLowerCase() } },
            { multi: true }
        );
    });
});

// Security migration: see https://github.com/libreboard/libreboard/issues/99
Migrations.add('change-attachments-type-for-non-images', function() {
    var newTypeForNonImage = "application/octet-stream";
    Attachments.find().forEach(function(file){
        if (! file.isImage()) {
            Attachments.update(file._id, {
                $set: {
                    "original.type": newTypeForNonImage,
                    "copies.attachments.type": newTypeForNonImage
                }
            });
        }
    });
});

Migrations.add('card-covers', function() {
    Cards.find().forEach(function(card) {
        var cover =  Attachments.findOne({ cardId: card._id, cover: true });
        if (cover) {
            Cards.update(card._id, {$set: {coverId: cover._id}});
        }
    });
    Attachments.update({}, {$unset: {cover: ""}}, {multi: true});
});
