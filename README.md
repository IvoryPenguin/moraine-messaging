# Moraine Messaging

Abstacted messaging, currently only supports the stomp protocol.

## Configuration

```
{
    default: 'stomp',
    stomp: {
        host: 'localhost',
        port: 61613,
        destinations: {
            pending: '/queue/conversions/pending',
            completed: '/topic/conversions/finished'
        },
        connectHeaders:{
            host: '/',
            login: 'username',
            passcode: 'password',
            'heart-beat': '5000,5000'
        }
    }
}
```

## Events

### connectError

### clientConnected

### clientDisconnected

### subscribeError

### addedListener

### readError

### messageReceived

### messageEmitted
