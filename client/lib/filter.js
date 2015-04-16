// Filtered view manager
// We define local filter objects for each different type of field (SetFilter,
// RangeFilter, dateFilter, etc.). We then define a global `Filter` object whose
// goal is to filter complete documents by using the local filters for each
// fields.


// Use a "set" filter for a field that is a set of documents uniquely
// identified. For instance `{ labels: ['labelA', 'labelC', 'labelD'] }`.
var SetFilter = function(name) {
    this._dep = new Tracker.Dependency;
    this._selectedElements = [];
};

_.extend(SetFilter.prototype, {
    isSelected: function(val) {
        this._dep.depend();
        return this._selectedElements.indexOf(val) > -1;
    },
    // XXX We don't have a `add` and `remove` methods here, that would probably
    // makes sense, and would be trivial to write but since there is currently
    // no need in the code, I didn't write these.
    toogle: function(val) {
        var indexOfVal = this._selectedElements.indexOf(val);
        if (indexOfVal === -1) {
            this._selectedElements.push(val);
        } else {
            this._selectedElements.splice(indexOfVal, 1);
        }
        this._dep.changed();
    },
    reset: function() {
        this._selectedElements = [];
        this._dep.changed();
    },
    _isActive: function() {
        this._dep.depend();
        return this._selectedElements.length !== 0;
    },
    _getMongoSelector: function() {
        this._dep.depend();
        return { $in: this._selectedElements };
    }
});

// The global Filter object.
// XXX It would be possible to re-write this object more elegantly, and removing
// the need to provide a list of `_fields`. We also should move methods into the
// object prototype.
Filter = {
    // XXX I would like to rename this field into `labels` to be consistent with
    // the rest of the schema, but we need to set some migrations architecture
    // before changing the schema.
    labelIds: new SetFilter(),
    members: new SetFilter(),

    _fields: ['labelIds', 'members'],

    // We don't filter cards that have been added after the last filter change.
    // To implement this we keep the id of these cards in this `_exceptions`
    // fields and use a `$or` condition in the mongo selector we return.
    _exceptions: [],
    _exceptionsDep: new Tracker.Dependency,

    isActive: function() {
        var self = this;
        return _.any(self._fields, function(fieldName) {
            return self[fieldName]._isActive();
        });
    },

    getMongoSelector: function() {
        var self = this;

        if (! self.isActive())
            return {};

        var filterSelector = {};
        _.forEach(self._fields , function(fieldName) {
            var filter = self[fieldName];
            if (filter._isActive())
                filterSelector[fieldName] = filter._getMongoSelector();
        });

        var exceptionsSelector = {_id: {$in: this._exceptions}};
        this._exceptionsDep.depend();

        return {$or: [filterSelector, exceptionsSelector]};
    },

    reset: function() {
        var self = this;
        _.forEach(self._fields , function(fieldName) {
            var filter = self[fieldName];
            filter.reset();
        });
        self.resetExceptions();
    },

    addException: function(_id) {
        if (this.isActive()) {
            this._exceptions.push(_id);
            this._exceptionsDep.changed();
        }
    },

    resetExceptions: function() {
        this._exceptions = [];
        this._exceptionsDep.changed();
    }
};

Blaze.registerHelper('Filter', Filter);
