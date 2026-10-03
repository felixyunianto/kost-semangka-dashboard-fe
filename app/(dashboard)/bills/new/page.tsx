"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { BILLS_ROUTE, GET_BILL_LIST_QUERY_KEY } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/useI18n";
import { createBill } from "@/lib/services";
import { toast } from "@/store";

import { BillForm } from "../components/BillForm";

import type { TCreateBillPayload } from "@/lib/entities";

export default function NewBillPage() {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createBillMutation = useMutation({
    mutationFn: (payload: TCreateBillPayload) => createBill(payload),
    onSuccess: (bill) => {
      if (!bill) return;

      void queryClient.invalidateQueries({
        queryKey: GET_BILL_LIST_QUERY_KEY,
      });
      toast.success(t("common.toast.created"));
      router.push(BILLS_ROUTE);
    },
    onError: (error) => {
      toast.error(error, t("common.toast.error"));
    },
  });

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Link
        href={BILLS_ROUTE}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
        {t("BillPage.form.back")}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {t("BillPage.form.addTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t("BillPage.form.addSubtitle")}
      </p>
      <div className="mt-6">
        <BillForm
          isSubmitting={createBillMutation.isPending}
          submitError={createBillMutation.error?.message}
          onSubmit={(data) => {
            const payload = data.payload as TCreateBillPayload;
            createBillMutation.mutate({
              occupantId: payload.occupantId,
              amount: payload.amount,
              dueDate: payload.dueDate,
              description: payload.description,
            });
          }}
        />
      </div>
    </section>
  );
}
