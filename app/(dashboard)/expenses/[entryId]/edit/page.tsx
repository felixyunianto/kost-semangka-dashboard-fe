"use client";

import { FinanceEntryEditPage } from "../../../finances/components/FinanceEntryEditPage";

export default function EditExpensePage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  return <FinanceEntryEditPage kind="expense" params={params} />;
}
