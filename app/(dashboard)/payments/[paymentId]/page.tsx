"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import { Loading, TextInput } from "@/components";
import {
  BILLS_ROUTE,
  GET_PAYMENT_DETAIL_QUERY_KEY,
  PAYMENTS_ROUTE,
  getOccupantEditRoute,
  getPropertyRoomsRoute,
} from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/helpers";
import { useI18n } from "@/lib/i18n/useI18n";
import { getPayment } from "@/lib/services";

import { PaymentStatusBadge } from "../components/PaymentStatusBadge";

const isQrImage = (value?: string | null) => {
  return Boolean(value && /^(https?:|data:image)/i.test(value));
};

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentDetailPageContent params={params} />
    </Suspense>
  );
}

function PaymentDetailPageContent({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = use(params);
  const { t } = useI18n();

  const paymentQuery = useQuery({
    queryKey: [...GET_PAYMENT_DETAIL_QUERY_KEY, paymentId],
    queryFn: () => getPayment(paymentId),
  });

  const payment = paymentQuery.data;
  const occupant = payment?.bill?.occupant;
  const property = occupant?.room?.property;
  const gatewayKey = payment ? `PaymentPage.gateway.${payment.gateway}` : "";
  const gatewayLabel = gatewayKey ? t(gatewayKey) : "";
  const payUrl = payment?.payUrl || payment?.paymentUrl;

  return (
    <section className="mx-auto w-full max-w-4xl">
      <Link
        href={PAYMENTS_ROUTE}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
        {t("PaymentPage.back")}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {t("PaymentPage.detail.title")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {t("PaymentPage.detail.subtitle")}
      </p>

      <div className="mt-6">
        {paymentQuery.isLoading ? (
          <div className="rounded-xl border border-slate-100 bg-white py-10 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <Loading />
          </div>
        ) : null}

        {paymentQuery.isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)]">
            <p className="text-sm font-medium text-ink">{t("PaymentPage.table.empty")}</p>
            <button
              type="button"
              onClick={() => {
                void paymentQuery.refetch();
              }}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {t("common.button.retry")}
            </button>
          </div>
        ) : null}

        {payment ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-6 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <PaymentStatusBadge status={payment.status} />
                <span className="text-sm text-muted">
                  {gatewayLabel === gatewayKey ? payment.gateway : gatewayLabel}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  id="payment-invoice"
                  label={t("PaymentPage.detail.invoice")}
                  value={payment.bill?.invoiceNumber || "—"}
                  readOnly
                />
                <TextInput
                  id="payment-amount"
                  label={t("PaymentPage.detail.amount")}
                  value={formatCurrency(payment.amount)}
                  readOnly
                />
                <TextInput
                  id="payment-occupant"
                  label={t("PaymentPage.detail.occupant")}
                  value={occupant?.fullName || "—"}
                  readOnly
                />
                <TextInput
                  id="payment-property"
                  label={t("PaymentPage.detail.property")}
                  value={property?.name || "—"}
                  readOnly
                />
                <TextInput
                  id="payment-room"
                  label={t("PaymentPage.detail.room")}
                  value={occupant?.room?.name || "—"}
                  readOnly
                />
                <TextInput
                  id="payment-reference"
                  label={t("PaymentPage.detail.gatewayReference")}
                  value={payment.gatewayReference || "—"}
                  readOnly
                />
                <TextInput
                  id="payment-paid-at"
                  label={t("PaymentPage.detail.paidAt")}
                  value={formatDateTime(payment.paidAt)}
                  readOnly
                />
                <TextInput
                  id="payment-expired-at"
                  label={t("PaymentPage.detail.expiredAt")}
                  value={formatDateTime(payment.expiredAt)}
                  readOnly
                />
                <TextInput
                  id="payment-last-charged"
                  label={t("PaymentPage.detail.lastChargedAt")}
                  value={formatDateTime(payment.lastChargedAt)}
                  readOnly
                />
                <TextInput
                  id="payment-created"
                  label={t("PaymentPage.detail.createdAt")}
                  value={formatDateTime(payment.createdAt)}
                  readOnly
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {payment.bill?.invoiceNumber ? (
                  <Link
                    href={`${BILLS_ROUTE}?invoiceNumber=${encodeURIComponent(payment.bill.invoiceNumber)}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50"
                  >
                    <Icon icon="solar:document-text-linear" className="size-4" />
                    {t("PaymentPage.detail.invoice")}
                  </Link>
                ) : null}
                {occupant ? (
                  <Link
                    href={getOccupantEditRoute(occupant.id)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50"
                  >
                    <Icon icon="solar:user-linear" className="size-4" />
                    {t("PaymentPage.detail.occupant")}
                  </Link>
                ) : null}
                {property ? (
                  <Link
                    href={getPropertyRoomsRoute(property.id)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50"
                  >
                    <Icon icon="solar:home-2-linear" className="size-4" />
                    {t("PaymentPage.detail.property")}
                  </Link>
                ) : null}
                {payUrl ? (
                  <a
                    href={payUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
                  >
                    <Icon icon="solar:qr-code-linear" className="size-4" />
                    {t("PaymentPage.openPayUrl")}
                  </a>
                ) : null}
              </div>

              {payment.qrCode ? (
                <div>
                  <p className="text-sm font-medium text-ink">{t("PaymentPage.detail.qrCode")}</p>
                  {isQrImage(payment.qrCode) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={payment.qrCode}
                      alt={t("PaymentPage.detail.qrCode")}
                      className="mt-3 h-40 w-40 rounded-xl border border-slate-100 bg-white object-contain p-2"
                    />
                  ) : (
                    <p className="mt-2 break-all text-sm text-muted">{payment.qrCode}</p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(16,36,61,0.18)] sm:p-6">
              <h2 className="text-base font-semibold tracking-tight text-ink">
                {t("PaymentPage.detail.charges")}
              </h2>
              {(payment.charges ?? []).length === 0 ? (
                <p className="mt-4 text-sm text-muted">{t("PaymentPage.detail.chargesEmpty")}</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-muted">
                        <th className="py-2 pr-4 font-medium">
                          {t("PaymentPage.detail.chargeReference")}
                        </th>
                        <th className="py-2 pr-4 font-medium">
                          {t("PaymentPage.detail.chargeAmount")}
                        </th>
                        <th className="py-2 pr-4 font-medium">
                          {t("PaymentPage.detail.chargeStatus")}
                        </th>
                        <th className="py-2 pr-4 font-medium">
                          {t("PaymentPage.detail.chargeExpired")}
                        </th>
                        <th className="py-2 font-medium">
                          {t("PaymentPage.detail.chargeCreated")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(payment.charges ?? []).map((charge) => (
                        <tr key={charge.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-3 pr-4 font-medium text-ink">
                            {charge.gatewayReference}
                          </td>
                          <td className="py-3 pr-4 text-ink">{formatCurrency(charge.amount)}</td>
                          <td className="py-3 pr-4">
                            <PaymentStatusBadge status={charge.status} kind="charge" />
                          </td>
                          <td className="py-3 pr-4 text-muted">
                            {formatDateTime(charge.expiredAt)}
                          </td>
                          <td className="py-3 text-muted">{formatDateTime(charge.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
