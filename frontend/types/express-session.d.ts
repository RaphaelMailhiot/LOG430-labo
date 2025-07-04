import 'express-session';

declare module 'express-session' {
    interface SessionData {
        selectedStore?: string;
        user?: any;
        isManager?: boolean;
    }
}