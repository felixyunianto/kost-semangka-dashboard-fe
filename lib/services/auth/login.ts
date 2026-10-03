import { getAPIEndpoint } from "@/lib/helpers";
import type { TApiResponse, TLoginPayload, TLoginResponse } from "@/lib/entities";
import { processResult, throwErrorUtil } from "../utils";

export const submitLogin = async (payload: TLoginPayload) => {
    try {
        const url = getAPIEndpoint('/auth/login');

        const response = await fetch(url, {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })

        const result: TApiResponse<TLoginResponse> = await processResult(response)

        if (result.code === 'SUCCESS' && result.data) {
            return result.data
        }

        throwErrorUtil(result.message || '')

    } catch (error) {
        throwErrorUtil(error)
    }
}