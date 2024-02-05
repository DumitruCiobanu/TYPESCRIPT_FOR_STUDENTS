type ObserverHandlers<T> = {
  next?: (value: T) => void;
  error?: (error: any) => void;
  complete?: () => void;
};

class Observer<T> {
  private isUnsubscribed: boolean = false;

  constructor(private handlers: ObserverHandlers<T>) {}

  next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: any): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }
      this.unsubscribe();
    }
  }

  complete(): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }
      this.unsubscribe();
    }
  }

  unsubscribe(): void {
    this.isUnsubscribed = true;

    if (this['_unsubscribe']) {
      this['_unsubscribe']();
    }
  }
}

type SubscribeFunction<T> = (observer: Observer<T>) => (() => void) | void;

class Observable<T> {
  private _subscribe: SubscribeFunction<T>;

  constructor(subscribe: SubscribeFunction<T>) {
    this._subscribe = subscribe;
  }

  static from<T>(values: T[]): Observable<T> {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: ObserverHandlers<T>): { unsubscribe(): void } {
    const observer = new Observer(obs);

    observer['_unsubscribe'] = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const HTTP_POST_METHOD = 'POST';
const HTTP_GET_METHOD = 'GET';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

interface User {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleted: boolean;
}

interface CustomRequest {
  method: string;
  host: string;
  path: string;
  body?: User;
  params: Record<string, string>;
}

const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: ['user', 'admin'],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: CustomRequest[] = [
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

const handleRequest = (request: CustomRequest): { status: number } => {
  // handling of request
  return { status: HTTP_STATUS_OK };
};
const handleError = (error: any): { status: number } => {
  // handling of error
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
