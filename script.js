
const STORAGE_KEY = "ruangAnggaranTransactions";
const BUDGET_STORAGE_KEY = "ruangAnggaranBudgets";

const form = document.getElementById("transactionForm");
const tanggalInput = document.getElementById("tanggal");
const jenisInput = document.getElementById("jenis");
const kategoriInput = document.getElementById("kategori");
const nominalInput = document.getElementById("nominal");
const catatanInput = document.getElementById("catatan");

const transactionList = document.getElementById("transactionList");
const transactionCount = document.getElementById("transactionCount");
const emptyMessage = document.getElementById("emptyMessage");
const formMessage = document.getElementById("formMessage");

const totalPemasukan = document.getElementById("totalPemasukan");
const totalPengeluaran = document.getElementById("totalPengeluaran");
const saldoAkhir = document.getElementById("saldoAkhir");

const saveBudgetsButton = document.getElementById("saveBudgetsButton");
const budgetMessage = document.getElementById("budgetMessage");

const budgetFields = {
  "Belanja Dapur": {
    input: document.getElementById("budgetDapur"),
    used: document.getElementById("usedDapur"),
    remaining: document.getElementById("remainingDapur")
  },
  "Transportasi": {
    input: document.getElementById("budgetTransportasi"),
    used: document.getElementById("usedTransportasi"),
    remaining: document.getElementById("remainingTransportasi")
  },
  "Pendidikan": {
    input: document.getElementById("budgetPendidikan"),
    used: document.getElementById("usedPendidikan"),
    remaining: document.getElementById("remainingPendidikan")
  }
};

const categories = {
  pemasukan: [
    "Gaji",
    "Uang Belanja",
    "Bonus",
    "Pemasukan Lainnya"
  ],
  pengeluaran: [
    "Belanja Dapur",
    "Pendidikan",
    "Kesehatan",
    "Tagihan Rumah",
    "Transportasi",
    "Lainnya"
  ]
};

let transactions = [];
let budgets = {};

function formatRupiah(nominal) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(nominal);
}

function formatTanggal(tanggal) {
  const parts = tanggal.split("-");

  if (parts.length !== 3) {
    return tanggal;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function tanggalHariIni() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function muatData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const parsedData = savedData ? JSON.parse(savedData) : [];

    transactions = Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    transactions = [];
    formMessage.textContent =
      "Data transaksi tidak dapat dibaca dari penyimpanan browser.";
  }

  try {
    const savedBudgets = localStorage.getItem(BUDGET_STORAGE_KEY);
    const parsedBudgets = savedBudgets
      ? JSON.parse(savedBudgets)
      : {};

    budgets =
      parsedBudgets &&
      typeof parsedBudgets === "object" &&
      !Array.isArray(parsedBudgets)
        ? parsedBudgets
        : {};
  } catch (error) {
    budgets = {};
    budgetMessage.textContent =
      "Data anggaran tidak dapat dibaca. Silakan masukkan ulang anggaran.";
  }

  Object.entries(budgetFields).forEach(function ([category, field]) {
    if (
      Object.prototype.hasOwnProperty.call(budgets, category) &&
      Number.isFinite(budgets[category]) &&
      budgets[category] >= 0
    ) {
      field.input.value = budgets[category];
    }
  });
}

function simpanData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch (error) {
    formMessage.textContent =
      "Data gagal disimpan. Periksa penyimpanan browser.";
    return false;
  }
}

function simpanAnggaranKeStorage() {
  try {
    localStorage.setItem(
      BUDGET_STORAGE_KEY,
      JSON.stringify(budgets)
    );
    return true;
  } catch (error) {
    budgetMessage.textContent =
      "Anggaran gagal disimpan. Periksa penyimpanan browser.";
    return false;
  }
}

function perbaruiKategori() {
  const pilihan = categories[jenisInput.value] || [];

  kategoriInput.replaceChildren();

  pilihan.forEach(function (kategori) {
    const option = document.createElement("option");
    option.value = kategori;
    option.textContent = kategori;
    kategoriInput.appendChild(option);
  });
}

function buatElemen(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

// W5: Hitung pemasukan, pengeluaran, dan saldo.
function renderRingkasan() {
  const pemasukan = transactions.reduce(function (total, item) {
    return item.jenis === "pemasukan"
      ? total + item.nominal
      : total;
  }, 0);

  const pengeluaran = transactions.reduce(function (total, item) {
    return item.jenis === "pengeluaran"
      ? total + item.nominal
      : total;
  }, 0);

  const saldo = pemasukan - pengeluaran;

  totalPemasukan.textContent = formatRupiah(pemasukan);
  totalPengeluaran.textContent = formatRupiah(pengeluaran);
  saldoAkhir.textContent = formatRupiah(saldo);

  saldoAkhir.classList.toggle("expense", saldo < 0);
  saldoAkhir.classList.toggle("income", saldo >= 0);
}

// Fitur persona: hitung pemakaian setiap amplop.
function renderAnggaran() {
  Object.entries(budgetFields).forEach(function ([category, field]) {
    const terpakai = transactions.reduce(function (total, item) {
      if (
        item.jenis === "pengeluaran" &&
        item.kategori === category
      ) {
        return total + item.nominal;
      }

      return total;
    }, 0);

    const anggaran = Number(budgets[category] || 0);
    const sisa = anggaran - terpakai;

    field.used.textContent = formatRupiah(terpakai);
    field.remaining.textContent = formatRupiah(sisa);

    field.remaining.classList.toggle("expense", sisa < 0);
    field.remaining.classList.toggle("income", sisa >= 0);
  });
}

function renderDaftar() {
  transactionList.replaceChildren();

  const sortedTransactions = [...transactions].sort(function (a, b) {
    if (a.tanggal !== b.tanggal) {
      return b.tanggal.localeCompare(a.tanggal);
    }

    return b.id - a.id;
  });

  sortedTransactions.forEach(function (transaction) {
    const item = buatElemen("article", "transaction-item", "");
    const info = buatElemen("div", "transaction-info", "");
    const title = buatElemen("h3", "", transaction.kategori);

    const detail = buatElemen(
      "p",
      "",
      `${formatTanggal(transaction.tanggal)} · ${
        transaction.catatan || "Tanpa catatan"
      }`
    );

    const right = buatElemen("div", "transaction-right", "");

    const amountClass =
      transaction.jenis === "pemasukan"
        ? "amount income"
        : "amount expense";

    const sign =
      transaction.jenis === "pemasukan" ? "+" : "-";

    const amount = buatElemen(
      "span",
      amountClass,
      `${sign} ${formatRupiah(transaction.nominal)}`
    );

    const deleteButton = buatElemen(
      "button",
      "delete-button",
      "Hapus"
    );

    deleteButton.type = "button";
    deleteButton.dataset.id = String(transaction.id);
    deleteButton.setAttribute(
      "aria-label",
      `Hapus transaksi ${transaction.kategori}`
    );

    info.append(title, detail);
    right.append(amount, deleteButton);
    item.append(info, right);
    transactionList.appendChild(item);
  });

  transactionCount.textContent = `${transactions.length} transaksi`;
  emptyMessage.hidden = transactions.length > 0;

  renderRingkasan();
  renderAnggaran();
}

// W6: Validasi transaksi sebelum disimpan.
function tambahTransaksi(event) {
  event.preventDefault();
  formMessage.textContent = "";

  const tanggal = tanggalInput.value;
  const jenis = jenisInput.value;
  const kategori = kategoriInput.value;
  const nominal = Number(nominalInput.value);

  if (!tanggal || !jenis || !kategori || nominalInput.value.trim() === "") {
    formMessage.textContent =
      "Yuk, lengkapi tanggal, jenis, kategori, dan nominal transaksi.";
    return;
  }

  if (!categories[jenis] || !categories[jenis].includes(kategori)) {
    formMessage.textContent =
      "Kategori tidak sesuai dengan jenis transaksi.";
    return;
  }

  if (!Number.isFinite(nominal) || nominal <= 0) {
    formMessage.textContent =
      "Nominal harus berupa angka lebih dari nol.";
    nominalInput.focus();
    return;
  }

  
const date = new Date(`${tanggal}T00:00:00`);

const tanggalLokalValid =
  !Number.isNaN(date.getTime()) &&
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` === tanggal;

if (!tanggalLokalValid) {
  formMessage.textContent = "Tanggal transaksi tidak valid.";
  tanggalInput.focus();
  return;
}


  const transaction = {
    id: Date.now(),
    tanggal: tanggal,
    jenis: jenis,
    kategori: kategori,
    nominal: nominal,
    catatan: catatanInput.value.trim()
  };

  transactions.push(transaction);

  if (!simpanData()) {
    transactions.pop();
    return;
  }

  renderDaftar();

  form.reset();
  tanggalInput.value = tanggalHariIni();
  perbaruiKategori();

  formMessage.textContent = "Transaksi berhasil disimpan!";
}

function hapusTransaksi(id) {
  const transaction = transactions.find(function (item) {
    return item.id === id;
  });

  if (!transaction) {
    return;
  }

  const yakin = confirm(
    `Yakin ingin menghapus transaksi "${transaction.kategori}"?`
  );

  if (!yakin) {
    return;
  }

  const previousTransactions = transactions;

  transactions = transactions.filter(function (item) {
    return item.id !== id;
  });

  if (!simpanData()) {
    transactions = previousTransactions;
    return;
  }

  renderDaftar();
  formMessage.textContent = "Transaksi berhasil dihapus.";
}

// Simpan tiga anggaran sekaligus.
function simpanAnggaran() {
  budgetMessage.textContent = "";

  const newBudgets = {};

  for (const [category, field] of Object.entries(budgetFields)) {
    const value = field.input.value.trim();
    const amount = Number(value);

    if (
      value === "" ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      budgetMessage.textContent =
        `Masukkan anggaran ${category} berupa angka nol atau lebih.`;
      field.input.focus();
      return;
    }

    newBudgets[category] = amount;
  }

  const previousBudgets = budgets;
  budgets = newBudgets;

  if (!simpanAnggaranKeStorage()) {
    budgets = previousBudgets;
    return;
  }

  renderAnggaran();
  budgetMessage.textContent = "Anggaran berhasil disimpan!";
}

form.addEventListener("submit", tambahTransaksi);

jenisInput.addEventListener("change", perbaruiKategori);

transactionList.addEventListener("click", function (event) {
  const button = event.target.closest(".delete-button");

  if (!button) {
    return;
  }

  hapusTransaksi(Number(button.dataset.id));
});

saveBudgetsButton.addEventListener("click", simpanAnggaran);

// Jalankan aplikasi.
muatData();
tanggalInput.value = tanggalHariIni();
perbaruiKategori();
renderDaftar();
