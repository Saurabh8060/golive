
declare module 'stream-chat' {
    interface CustomMessageData extends CustomMessageData {
        color?:string;
        isStream?: boolean;
    }     
}