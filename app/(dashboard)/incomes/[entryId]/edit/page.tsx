"use client";

import { FinanceEntryEditPage } from "../../../finances/components/FinanceEntryEditPage";

export default function EditIncomePage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  return <FinanceEntryEditPage kind="income" params={params} />;
}
