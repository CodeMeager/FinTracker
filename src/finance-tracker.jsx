import { useState, useRef, useEffect } from "react";

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
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("expenses")) || []; } catch { return []; }
  });
  const [incomes, setIncomes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("incomes")) || []; } catch { return []; }
  });
  const [amountError, setAmountError] = useState("");

    useEffect(() => { localStorage.setItem("expenses", JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem("incomes", JSON.stringify(incomes)); }, [incomes]);
  const submitting = useRef(false);

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
        <span style={styles.logo}>₽ финансы</span>
      </div>

      <div style={styles.balanceCard}>
        <span style={styles.balanceLabel}>Баланс</span>
        <span
          style={{
            ...styles.balanceValue,
            color: totalIncomes - totalExpenses >= 0 ? "#4ade80" : "#f87171",
          }}
        >
          {formatAmount(totalIncomes - totalExpenses)} ₽
        </span>
      </div>

      <div style={styles.summaryRow}>
        <div style={{ ...styles.summaryCard, ...styles.expenseCard }}>
          <div style={styles.summaryHeader}>
            <span style={styles.summaryDot("#f87171")} />
            <span style={styles.summaryLabel}>Расходы</span>
          </div>
          <span style={{ ...styles.summaryAmount, color: "#f87171" }}>
            −{formatAmount(totalExpenses)} ₽
          </span>
          <div style={styles.divider} />
          <div style={styles.entryList}>
            {expenses.length === 0 && <span style={styles.empty}>нет записей</span>}
            {expenses.map((e) => (
              <div key={e.id} style={styles.entryRow}>
                <span style={styles.entryCategory}>{e.category}</span>
                <span style={styles.entryAmt}>−{formatAmount(e.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...styles.summaryCard, ...styles.incomeCard }}>
          <div style={styles.summaryHeader}>
            <span style={styles.summaryDot("#4ade80")} />
            <span style={styles.summaryLabel}>Доходы</span>
          </div>
          <span style={{ ...styles.summaryAmount, color: "#4ade80" }}>
            +{formatAmount(totalIncomes)} ₽
          </span>
          <div style={styles.divider} />
          <div style={styles.entryList}>
            {incomes.length === 0 && <span style={styles.empty}>нет записей</span>}
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
          Добавить
        </button>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#09090b",
    color: "#e5e5e5",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 16px 64px",
    gap: "20px",
  },
  header: { width: "100%", maxWidth: 680, display: "flex", justifyContent: "flex-start" },
  logo: {
    fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", color: "#525252",
    textTransform: "uppercase",
  },
  balanceCard: {
    width: "100%", maxWidth: 680, background: "#111113",
    border: "1px solid #1c1c22", borderRadius: 16,
    padding: "28px 28px 24px", display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4,
  },
  balanceLabel: {
    fontSize: 11, fontWeight: 500, letterSpacing: "0.15em",
    textTransform: "uppercase", color: "#525252",
  },
  balanceValue: {
    fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em",
    fontFamily: "'Inter', sans-serif",
  },
  summaryRow: {
    width: "100%", maxWidth: 680, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
  },
  summaryCard: {
    borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column",
    gap: 4, minHeight: 160, border: "1px solid",
    transition: "border-color 0.2s",
  },
  expenseCard: { background: "#12100f", borderColor: "#231a1a" },
  incomeCard: { background: "#0f1210", borderColor: "#1a231c" },
  summaryHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 2 },
  summaryDot: (color) => ({
    width: 8, height: 8, borderRadius: "50%", background: color,
    display: "inline-block", opacity: 0.7,
  }),
  summaryLabel: {
    fontSize: 11, fontWeight: 500, letterSpacing: "0.12em",
    textTransform: "uppercase", color: "#525252",
  },
  summaryAmount: {
    fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em",
    marginBottom: 4,
  },
  divider: { height: 1, background: "#1a1a1f", margin: "8px 0" },
  entryList: {
    display: "flex", flexDirection: "column", gap: 6,
    overflowY: "auto", maxHeight: 160, paddingRight: 4,
  },
  entryRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 13, color: "#888", padding: "4px 0",
  },
  entryCategory: { color: "#6b6b6b", fontSize: 12, fontWeight: 500 },
  entryAmt: { color: "#f87171", fontVariantNumeric: "tabular-nums", fontWeight: 500 },
  empty: { fontSize: 12, color: "#2a2a2a", fontStyle: "italic", padding: "8px 0" },
  form: {
    width: "100%", maxWidth: 680, background: "#111113",
    border: "1px solid #1c1c22", borderRadius: 16,
    padding: "28px", display: "flex", flexDirection: "column", gap: 22,
  },
  toggle: {
    display: "flex", gap: 4, background: "#0c0c0e", border: "1px solid #1c1c22",
    borderRadius: 10, overflow: "hidden", width: "fit-content", padding: 3,
  },
  toggleBtn: {
    background: "transparent", border: "none", color: "#555", fontSize: 12,
    fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
    padding: "8px 22px", cursor: "pointer", transition: "all 0.2s",
    borderRadius: 7,
  },
  toggleActive: { background: "#271a1a", color: "#f87171" },
  toggleActiveIncome: { background: "#1a271e", color: "#4ade80" },
  inputGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    fontSize: 11, fontWeight: 500, letterSpacing: "0.12em",
    textTransform: "uppercase", color: "#525252",
  },
  input: {
    background: "#0c0c0e", border: "1px solid #1c1c22", borderRadius: 10,
    color: "#e5e5e5", fontSize: 28, fontFamily: "'Inter', sans-serif",
    fontWeight: 700, padding: "14px 18px", outline: "none",
    width: "100%", boxSizing: "border-box", letterSpacing: "-0.02em",
    transition: "border-color 0.2s",
  },
  inputError: { borderColor: "#7f1d1d" },
  errorText: { fontSize: 12, color: "#f87171", fontWeight: 500, marginTop: 2 },
  customInput: {
    marginTop: 4, background: "#0c0c0e", border: "1px solid #1c1c22",
    borderRadius: 10, color: "#e5e5e5", fontSize: 13, fontWeight: 500,
    fontFamily: "inherit", padding: "10px 14px", outline: "none",
    width: "100%", boxSizing: "border-box", transition: "border-color 0.2s",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    background: "transparent", border: "1px solid #1c1c22", borderRadius: 20,
    color: "#666", fontSize: 12, fontWeight: 500, padding: "7px 16px",
    cursor: "pointer", transition: "all 0.15s",
  },
  chipActive: {
    borderColor: "#444", color: "#e5e5e5", background: "#1a1a1f",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #e5e5e5, #c5c5c5)", color: "#0a0a0a",
    border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600,
    letterSpacing: "0.08em", textTransform: "uppercase",
    padding: "15px", cursor: "pointer", transition: "all 0.2s",
  },
};
