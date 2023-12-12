type Obj = Record<string, unknown>;

export type MessageCommon = {
  jsonrpc: '2.0';
  id: number;
};

type ReqRes<Method extends string, Params extends Obj | undefined, Result> = {
  Request: { method: Method } & (Params extends undefined ? { params?: Obj } : { params: Params });
  Response: MessageCommon & {
    /** Internal, it's not defined. */
    _method: Method;
    error?: string;
    result: Result;
  };
};

export type Message = PushFile | DeleteFile | GetFileNames | GetDefinitionFile;

export type Method = Message['Request']['method'];

export type PushFile = ReqRes<
  'pushFile',
  {
    filename: string;
    content: string;
    server: string;
  },
  'OK'
>;

export type DeleteFile = ReqRes<
  'deleteFile',
  {
    filename: string;
    server: string;
  },
  'OK'
>;

export type GetFileNames = ReqRes<
  'getFileNames',
  {
    server: string;
  },
  Array<string>
>;

export type GetDefinitionFile = ReqRes<'getDefinitionFile', undefined, string>;
