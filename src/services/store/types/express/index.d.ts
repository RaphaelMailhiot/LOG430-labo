import 'express';

declare module 'express-serve-static-core' {
    interface Response {
        sendData: (data: any) => void;
    }
}