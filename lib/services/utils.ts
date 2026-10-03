import { DEFAULT_ERROR_CAUSE, DEFAULT_MESSAGE_ERROR_FETCH } from "../constants";
import { isArray } from "../helpers";

import type { TError, TErrorCode } from "../entities";

export const isTransientHttpFailure = (
  status?: number,
  code?: TErrorCode | string,
) => {
  if (status === 429 || (status !== undefined && status >= 500)) {
    return true;
  }

  return code === "TOO_MANY_REQUESTS" || code === "INTERNAL_ERROR";
};

type OptsType = {
    downloadMode?: boolean;
    rawResponse?: boolean;
    onError?: (res: Response) => Promise<Error>;
};

export const defaultThrowErrorMessage = async (res: Response) => {
    const errResponse = await res.json().catch(() => {
        return {
            message: res.statusText
        }
    })

    return Error(`[${res.status}] ${errResponse?.message || res.statusText}`, {
        cause: errResponse?.code || DEFAULT_ERROR_CAUSE,
    });
}

export const processResult = async (res: Response, options?: OptsType) => {
    if (res.ok) {
        if (options?.downloadMode) {
            return res.blob();
        } else if (options?.rawResponse) {
            return res;
        } else {
            return res.json().catch((e: Error) => {
                console.error('parse json error', e);

                return res;
            });
        }
    } else {
        console.error('Error fetch', {
            url: res.url,
            options: options,
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
        });

        if (options?.onError) {
            throw await options.onError(res);
        }

        throw await defaultThrowErrorMessage(res);
    }
}

export const generateThrowErrorMessage = (message?: string, errors?: TError) => {
    return errors ? (isArray(errors) ? errors.join(',') : errors) : message;
};

export const throwErrorUtil = (e: Error | unknown, messageCustom?: string) => {
    if (navigator?.onLine === false) {
        throw Error(`Ooops... there are problem with the connection, please try again later`);
    }

    throw Error(messageCustom || (e as Error)?.message || DEFAULT_MESSAGE_ERROR_FETCH, {
        cause: (e as Error)?.cause || DEFAULT_ERROR_CAUSE,
    });
};