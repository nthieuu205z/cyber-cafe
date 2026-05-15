"use client";

import { Printer } from "lucide-react";

export interface InvoiceData {
  id: string;
  machine: string;
  customer: string | null;
  session_cost: number;
  service_cost: number;
  total: number;
  payment_method: string;
  paid_at: string;
}

const PM: Record<string, string> = {
  cash: "Tiền mặt",
  balance: "Trừ số dư",
  transfer: "Chuyển khoản",
};

export default function PrintInvoiceButton({ inv }: { inv: InvoiceData }) {
  function print() {
    const w = window.open("", "_blank", "width=380,height=600");
    if (!w) return;
    const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";
    w.document.write(`
      <html><head><title>Hoa don ${inv.id.slice(0, 8)}</title>
      <style>
        body{font-family:monospace;padding:16px;color:#000;font-size:13px}
        h2{text-align:center;margin:0 0 4px}
        .c{text-align:center;color:#555;font-size:11px}
        hr{border:none;border-top:1px dashed #999;margin:10px 0}
        .r{display:flex;justify-content:space-between;margin:4px 0}
        .t{font-weight:bold;font-size:15px}
      </style></head><body>
      <h2>CYBER CAFE</h2>
      <p class="c">HOA DON THANH TOAN</p>
      <p class="c">${new Date(inv.paid_at).toLocaleString("vi-VN")}</p>
      <hr/>
      <div class="r"><span>Ma HD</span><span>${inv.id.slice(0, 8)}</span></div>
      <div class="r"><span>May</span><span>${inv.machine}</span></div>
      <div class="r"><span>Khach</span><span>${inv.customer ?? "Vang lai"}</span></div>
      <hr/>
      <div class="r"><span>Tien gio</span><span>${fmt(inv.session_cost)}</span></div>
      <div class="r"><span>Dich vu</span><span>${fmt(inv.service_cost)}</span></div>
      <hr/>
      <div class="r t"><span>TONG CONG</span><span>${fmt(inv.total)}</span></div>
      <div class="r"><span>Thanh toan</span><span>${PM[inv.payment_method] ?? inv.payment_method}</span></div>
      <hr/>
      <p class="c">Cam on quy khach!</p>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <button onClick={print} className="btn btn-ghost text-xs">
      <Printer className="h-3 w-3" /> In
    </button>
  );
}
