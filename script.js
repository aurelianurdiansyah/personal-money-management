
const STORAGE_KEY = "ruangAnggaranTransactions";

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

function muatData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const parsedData = savedData ? JSON.parse(savedData) : [];

    transactions = Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    transactions = [];
    formMessage.textContent =
      "Data tersimpan tidak dapat dibaca. Silakan periksa penyimpanan browser.";
  }
}

function simpanData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch (error) {
    formMessage.textContent =
      "Data gagal disimpan. Periksa ruang penyimpanan browser.";
    return false;
  }
}

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

function perbaruiKategori() {
  const pilihan = categories[jenisInput.value];

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
      `${formatTanggal(transaction.tanggal)} · ${transaction.catatan || "Tanpa catatan"}`
    );

    const right = buatElemen("div", "transaction-right", "");
    const amountClass =
      transaction.jenis === "pemasukan" ? "amount income" : "amount expense";

    const sign = transaction.jenis === "pemasukan" ? "+" : "-";
    const amount = buatElemen(
      "span",
      amountClass,
      `${sign} ${formatRupiah(transaction.nominal)}`
    );

    const deleteButton = buatElemen("button", "delete-button", "Hapus");
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

  transactionCount.textContent =
    `${transactions.length} transaksi`;

  emptyMessage.hidden = transactions.length > 0;
}

function tambahTransaksi(event) {
  event.preventDefault();
  formMessage.textContent = "";

  const nominal = Number(nominalInput.value);

  if (
    !tanggalInput.value ||
    !jenisInput.value ||
    !kategoriInput.value ||
    !Number.isFinite(nominal) ||
    nominal <= 0
  ) {
    formMessage.textContent =
      "Lengkapi data dan masukkan nominal lebih dari nol.";
    return;
  }

  const transaction = {
    id: Date.now(),
    tanggal: tanggalInput.value,
    jenis: jenisInput.value,
    kategori: kategoriInput.value,
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

  formMessage.textContent = "Transaksi berhasil disimpan.";
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

function tanggalHariIni() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

muatData();
tanggalInput.value = tanggalHariIni();
perbaruiKategori();
renderDaftar();
