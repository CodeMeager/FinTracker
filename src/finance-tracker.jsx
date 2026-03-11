import { useState, useRef, useEffect } from "react";

const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
};

const categories = {
  expense: ["Еда", "Транспорт", "Жильё", "Здоровье", "Развлечения", "Одежда", "Другое"],
  income: ["Зарплата", "Фриланс", "Инвестиции", "Подарок", "Другое"],
};

const MAX_AMOUNT = 999_999_999;

const formatAmount = (n) =>
  n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const formatInput = (raw) => {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(",");
  const digits = intPart.replace(/\D/g, "");
  const intFormatted = digits ? parseInt(digits, 10).toLocaleString("ru-RU") : "";
  return decPart !== undefined ? intFormatted + "," + decPart : intFormatted;
};

export default function App() {
  const [type, setType] = useState("expense");
  const [rawAmount, setRawAmount] = useState("");
  const [category, setCategory] = useState(categories.expense[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [expenses, setExpenses] = useState(() => load("expenses"));
  const [incomes, setIncomes] = useState(() => load("incomes"));
  const [amountError, setAmountError] = useState("");
  const submitting = useRef(false);

  useEffect(() => { localStorage.setItem("expenses", JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem("incomes", JSON.stringify(incomes)); }, [incomes]);

  const handleTypeSwitch = (t) => {
    setType(t);
    setCategory(categories[t][0]);
    setCustomCategory("");
    setAmountError("");
  };

  const handleAmountChange = (e) => {
    let input = e.target.value;
    input = input.replace(/[^\d.,]/g, "").replace(".", ",");
    const parts = input.split(",");
    if (parts.length > 2) input = parts[0] + "," + parts.slice(1).join("");
    const [i, d] = input.split(",");
    if (d !== undefined) input = i + "," + d.slice(0, 2);
    setRawAmount(input);
    setAmountError("");
  };

  const handleSubmit = () => {
    if (submitting.current) return;
    const val = parseFloat(rawAmount.replace(",", "."));
    if (!rawAmount || isNaN(val) || val <= 0) {
      setAmountError("Введите сумму больше 0");
      return;
    }
    if (val > MAX_AMOUNT) {
      setAmountError("Максимум " + formatAmount(MAX_AMOUNT) + " ₽");
      return;
    }
    const resolvedCategory =
      category === "Другое" && customCategory.trim() ? customCategory.trim() : category;
    submitting.current = true;
    const entry = { amount: val, category: resolvedCategory, id: Date.now() };
    if (type === "expense") setExpenses((p) => [entry, ...p]);
    else setIncomes((p) => [entry, ...p]);
    setRawAmount("");
    setCustomCategory("");
    setAmountError("");
    setTimeout(() => { submitting.current = false; }, 300);
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncomes = incomes.reduce((s, e) => s + e.amount, 0);

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <span style={styles.logo}>Финансы</span>
      </div>

      <div style={styles.summaryRow}>
        <div style={{ ...styles.summaryCard, ...styles.expenseCard }}>
          <span style={styles.summaryLabel}>Расходы</span>
          <span style={styles.summaryAmount}>−{formatAmount(totalExpenses)} ₽</span>
          <div style={styles.entryList}>
            {expenses.length === 0 && <span style={styles.empty}>пусто</span>}
            {expenses.map((e) => (
              <div key={e.id} style={styles.entryRow}>
                <span style={styles.entryCategory}>{e.category}</span>
                <span style={styles.entryAmt}>−{formatAmount(e.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...styles.summaryCard, ...styles.incomeCard }}>
          <span style={styles.summaryLabel}>Доходы</span>
          <span style={styles.summaryAmount}>+{formatAmount(totalIncomes)} ₽</span>
          <div style={styles.entryList}>
            {incomes.length === 0 && <span style={styles.empty}>пусто</span>}
            {incomes.map((e) => (
              <div key={e.id} style={styles.entryRow}>
                <span style={styles.entryCategory}>{e.category}</span>
                <span style={{ ...styles.entryAmt, color: "#4ade80" }}>
                  +{formatAmount(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.form}>
        <div style={styles.toggle}>
          <button
            style={{ ...styles.toggleBtn, ...(type === "expense" ? styles.toggleActive : {}) }}
            onClick={() => handleTypeSwitch("expense")}
          >
            Расход
          </button>
          <button
            style={{ ...styles.toggleBtn, ...(type === "income" ? styles.toggleActiveIncome : {}) }}
            onClick={() => handleTypeSwitch("income")}
          >
            Доход
          </button>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Сумма, ₽</label>
          <input
            style={{ ...styles.input, ...(amountError ? styles.inputError : {}) }}
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={formatInput(rawAmount)}
            onChange={handleAmountChange}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {amountError && <span style={styles.errorText}>{amountError}</span>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Категория</label>
          <div style={styles.chips}>
            {categories[type].map((c) => (
              <button
                key={c}
                style={{ ...styles.chip, ...(category === c ? styles.chipActive : {}) }}
                onClick={() => { setCategory(c); if (c !== "Другое") setCustomCategory(""); }}
              >
                {c}
              </button>
            ))}
          </div>
          {category === "Другое" && (
            <input
              style={styles.customInput}
              type="text"
              placeholder="Название категории"
              maxLength={32}
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          )}
        </div>

        <button style={styles.submitBtn} onClick={handleSubmit}>
          Подтвердить
        </button>
      </div>

      <div style={styles.balance}>
        <span style={styles.balanceLabel}>Свободно</span>
        <span
          style={{
            ...styles.balanceValue,
            color: totalIncomes - totalExpenses >= 0 ? "#4ade80" : "#f87171",
          }}
        >
          {formatAmount(totalIncomes - totalExpenses)} ₽
        </span>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#09090b",
    color: "#f4f4f5",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 16px 64px",
    gap: "16px",
  },
  header: { width: "100%", maxWidth: 680, display: "flex", justifyContent: "flex-start", alignItems: "center" },
  logo: { fontSize: 16, fontWeight: 700, color: "#f4f4f5", letterSpacing: "-0.02em" },
  summaryRow: {
    width: "100%", maxWidth: 680, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
  },
  summaryCard: {
    borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column",
    gap: 6, minHeight: 180, border: "1px solid",
  },
  expenseCard: { background: "#180a0a", borderColor: "#3f1212" },
  incomeCard: { background: "#0a1810", borderColor: "#123f1a" },
  summaryLabel: { fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#71717a" },
  summaryAmount: { fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", color: "#f4f4f5", marginBottom: 8 },
  entryList: { display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", maxHeight: 160 },
  entryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: "1px solid #ffffff08" },
  entryCategory: { color: "#71717a", fontSize: 12, fontWeight: 400 },
  entryAmt: { color: "#f87171", fontVariantNumeric: "tabular-nums", fontSize: 13, fontWeight: 500 },
  empty: { fontSize: 12, color: "#3f3f46" },
  form: {
    width: "100%", maxWidth: 680, background: "#18181b", border: "1px solid #27272a",
    borderRadius: 16, padding: "28px", display: "flex", flexDirection: "column", gap: 22,
  },
  toggle: {
    display: "flex", gap: 4, background: "#09090b", border: "1px solid #27272a",
    borderRadius: 12, padding: 4, width: "fit-content",
  },
  toggleBtn: {
    background: "transparent", border: "none", color: "#71717a", fontSize: 13,
    fontWeight: 500, padding: "7px 20px", borderRadius: 9,
    cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
  },
  toggleActive: { background: "#3f1212", color: "#f87171" },
  toggleActiveIncome: { background: "#12401a", color: "#4ade80" },
  inputGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#71717a" },
  input: {
    background: "#09090b", border: "1px solid #27272a", borderRadius: 10, color: "#f4f4f5",
    fontSize: 30, fontFamily: "inherit", fontWeight: 700, padding: "12px 16px",
    outline: "none", width: "100%", boxSizing: "border-box", letterSpacing: "-0.03em",
  },
  inputError: { border: "1px solid #7f1d1d" },
  errorText: { fontSize: 12, color: "#f87171", marginTop: 2 },
  customInput: {
    marginTop: 6, background: "#09090b", border: "1px solid #27272a", borderRadius: 10,
    color: "#f4f4f5", fontSize: 14, fontFamily: "inherit", padding: "10px 14px",
    outline: "none", width: "100%", boxSizing: "border-box",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    background: "transparent", border: "1px solid #27272a", borderRadius: 20, color: "#71717a",
    fontSize: 12, fontWeight: 500, padding: "6px 14px", cursor: "pointer",
    transition: "all 0.12s", fontFamily: "inherit",
  },
  chipActive: { border: "1px solid #52525b", color: "#f4f4f5", background: "#27272a" },
  submitBtn: {
    background: "#f4f4f5", color: "#09090b", border: "none", borderRadius: 10,
    fontSize: 14, fontWeight: 600, fontFamily: "inherit",
    padding: "14px", cursor: "pointer", transition: "opacity 0.15s",
  },
  balance: {
    width: "100%", maxWidth: 680, background: "#18181b", border: "1px solid #27272a",
    borderRadius: 16, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  balanceLabel: { fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#71717a" },
  balanceValue: { fontSize: 32, fontWeight: 700, letterSpacing: "-0.04em" },
};
