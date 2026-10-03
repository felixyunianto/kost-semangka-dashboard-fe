import en from "./en";
import { TDictionary } from "./i18n.type";

const id: TDictionary = {
    ...en,
    DashboardPage: {
        ...en.DashboardPage,
        title: 'Selamat Datang, {name}',
    },
    RoomPage: {
        ...en.RoomPage,
        table: {
            ...en.RoomPage.table,
            rentStatus: {
                PAID: 'Lunas',
                UNPAID: 'Belum bayar',
                PENDING: 'Menunggu pembayaran',
                OVERDUE: 'Terlambat',
                NONE: 'Belum ada tagihan',
            },
            rentDueOn: 'Jatuh tempo {date}',
            rentOutstandingCount: '{count} tagihan belum lunas',
        },
    },
}

export default id;