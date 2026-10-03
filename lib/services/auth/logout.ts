import { getAPIEndpoint } from "@/lib/helpers";
import type { TRefreshPayload } from "@/lib/entities";
import { processResult } from "../utils";

export const submitLogout = async (payload: TRefreshPayload) => {
    const url = getAPIEndpoint('/auth/logout');

    const response = await fetch(url, {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    await processResult(response)
}
