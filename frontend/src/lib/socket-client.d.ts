declare module '@/lib/socket.io.esm.min.js' {
  export interface Socket {
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener?: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
    disconnect(): void;
  }

  export interface IoOptions {
    auth?: {
      userId?: string;
      token?: string;
    };
    transports?: string[];
  }

  export function io(url: string, options?: IoOptions): Socket;
}
