var Observer = /** @class */ (function () {
    function Observer(handlers) {
        this.handlers = handlers;
        this.isUnsubscribed = false;
    }
    Observer.prototype.next = function (value) {
        if (this.handlers.next && !this.isUnsubscribed) {
            this.handlers.next(value);
        }
    };
    Observer.prototype.error = function (error) {
        if (!this.isUnsubscribed) {
            if (this.handlers.error) {
                this.handlers.error(error);
            }
            this.unsubscribe();
        }
    };
    Observer.prototype.complete = function () {
        if (!this.isUnsubscribed) {
            if (this.handlers.complete) {
                this.handlers.complete();
            }
            this.unsubscribe();
        }
    };
    Observer.prototype.unsubscribe = function () {
        this.isUnsubscribed = true;
        if (this['_unsubscribe']) {
            this['_unsubscribe']();
        }
    };
    return Observer;
}());
var Observable = /** @class */ (function () {
    function Observable(subscribe) {
        this._subscribe = subscribe;
    }
    Observable.from = function (values) {
        return new Observable(function (observer) {
            values.forEach(function (value) { return observer.next(value); });
            observer.complete();
            return function () {
                console.log('unsubscribed');
            };
        });
    };
    Observable.prototype.subscribe = function (obs) {
        var observer = new Observer(obs);
        observer['_unsubscribe'] = this._subscribe(observer);
        return {
            unsubscribe: function () {
                observer.unsubscribe();
            },
        };
    };
    return Observable;
}());
var HTTP_POST_METHOD = 'POST';
var HTTP_GET_METHOD = 'GET';
var HTTP_STATUS_OK = 200;
var HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
var userMock = {
    name: 'User Name',
    age: 26,
    roles: ['user', 'admin'],
    createdAt: new Date(),
    isDeleted: false,
};
var requestsMock = [
    {
        method: HTTP_POST_METHOD,
        host: 'service.example',
        path: 'user',
        body: userMock,
        params: {},
    },
    {
        method: HTTP_GET_METHOD,
        host: 'service.example',
        path: 'user',
        params: {
            id: '3f5h67s4s',
        },
    },
];
var handleRequest = function (request) {
    // handling of request
    return { status: HTTP_STATUS_OK };
};
var handleError = function (error) {
    // handling of error
    return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};
var handleComplete = function () { return console.log('complete'); };
var requests$ = Observable.from(requestsMock);
var subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete,
});
subscription.unsubscribe();
