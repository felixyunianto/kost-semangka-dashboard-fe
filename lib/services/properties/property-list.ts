import { getAPIEndpoint } from "@/lib/helpers";
import { authFetch } from "../http";
import { processResult, throwErrorUtil } from "../utils";

import type { TApiResponse, TPaginated, TProperty, TPropertyParamList } from "@/lib/entities";

const toPropertyQuery = (filter: TPropertyParamList) => {
  const { lateFee, ...rest } = filter;

  return {
    ...rest,
    ...(lateFee === "true" || lateFee === "false"
      ? { lateFeeEnabled: lateFee === "true" }
      : {}),
  };
};

export const getProperties = async (filter: TPropertyParamList) => {
  try {
    const url = getAPIEndpoint("/properties", toPropertyQuery(filter));
    const response = await authFetch(url);
    const result: TApiResponse<TPaginated<TProperty>> = await processResult(response);

    const isSuccess =
      result.code === "SUCCESS" &&
      result.data &&
      Array.isArray(result.data.items) &&
      Boolean(result.data.pagination);

    if (isSuccess) {
      return result.data;
    }

    throwErrorUtil(result.message || "");
  } catch (error) {
    throwErrorUtil(error);
  }
};
