import type { RawData } from 'ws';
import type { Message, MessageCommon, Method } from './types';
import { ws } from './webSocket';

let messageCounter = 0;

const requestsCallbacks: Record<
  number,
  { method: Method; callback: (e: Message['Response']) => void }
> = {};

export const sendMessage = async <T extends Message['Request']>(
  request: T,
): Promise<Message['Response'] & { _method: T['method'] }> => {
  const requestData: T & MessageCommon = {
    jsonrpc: '2.0',
    id: messageCounter++,
    ...request,
  };

  return new Promise((resolve) => {
    requestsCallbacks[requestData.id] = {
      method: requestData.method,
      callback: (response) => {
        delete requestsCallbacks[requestData.id];
        resolve(response);
      },
    };
    ws.send(JSON.stringify(requestData));
  });
};

export const parseMessage = (data: RawData): Message['Response'] => {
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const response = JSON.parse(data.toString()) as Message['Response'];

  if (response.error != null) throw Error(response.error);

  const request = requestsCallbacks[response.id];

  request?.callback(response);

  return response;
};
