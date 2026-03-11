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
    try {
      const saved = localStorage.getItem("expenses");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [incomes, setIncomes] = useState(() => {
    try {
      const saved = localStorage.getItem("incomes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [amountError, setAmountError] = useState("");
  const submitting = useRef(false);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("incomes", JSON.stringify(incomes));
  }, [incomes]);

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
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    color: "#e5e5e5",
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 16px 56px",
    gap: "28px",
  },
  header: { width: "100%", maxWidth: 680, display: "flex", justifyContent: "flex-start" },
  logo: { fontSize: 12, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase", fontWeight: 600 },
  summaryRow: {
    width: "100%", maxWidth: 680, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
  },
  summaryCard: {
    borderRadius: 8, padding: "20px 22px", display: "flex", flexDirection: "column",
    gap: 8, minHeight: 180, border: "1px solid",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    transition: "all 0.2s ease",
  },
  expenseCard: { background: "#1a0f0f", borderColor: "#3a2020", boxShadow: "0 4px 12px rgba(248, 113, 113, 0.05)" },
  incomeCard: { background: "#0f1a12", borderColor: "#203a28", boxShadow: "0 4px 12px rgba(74, 222, 128, 0.05)" },
  summaryLabel: { fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#777", fontWeight: 500 },
  summaryAmount: { fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "#f5f5f5", marginBottom: 10 },
  entryList: { display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", maxHeight: 180 },
  entryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#999", padding: "4px 0" },
  entryCategory: { color: "#777", fontSize: 11, fontWeight: 500 },
  entryAmt: { color: "#f87171", fontVariantNumeric: "tabular-nums", fontWeight: 600 },
  empty: { fontSize: 11, color: "#444", fontStyle: "italic" },
  form: {
    width: "100%", maxWidth: 680, background: "#1a1a1a", border: "1px solid #2a2a2a",
    borderRadius: 8, padding: "28px", display: "flex", flexDirection: "column", gap: 24,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
  },
  toggle: {
    display: "flex", gap: 0, background: "#0a0a0a", border: "1px solid #2a2a2a",
    borderRadius: 6, overflow: "hidden", width: "fit-content",
  },
  toggleBtn: {
    background: "transparent", border: "none", color: "#777", fontSize: 11,
    letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 22px",
    cursor: "pointer", transition: "all 0.2s ease", fontWeight: 600,
  },
  toggleActive: { background: "#3a2020", color: "#f87171", boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)" },
  toggleActiveIncome: { background: "#203a28", color: "#4ade80", boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)" },
  inputGroup: { display: "flex", flexDirection: "column", gap: 10 },
  label: { fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#777", fontWeight: 500 },
  input: {
    background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#e5e5e5",
    fontSize: 28, fontFamily: "inherit", fontWeight: 700, padding: "12px 16px",
    outline: "none", width: "100%", boxSizing: "border-box", letterSpacing: "-0.02em",
    transition: "all 0.2s ease",
  },
  inputError: { border: "1px solid #9f2825", boxShadow: "0 0 8px rgba(248, 113, 113, 0.2)" },
  errorText: { fontSize: 10, color: "#f87171", letterSpacing: "0.05em", marginTop: 4, fontWeight: 500 },
  customInput: {
    marginTop: 8, background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 6,
    color: "#e5e5e5", fontSize: 13, fontFamily: "inherit", padding: "10px 14px",
    outline: "none", width: "100%", boxSizing: "border-box", letterSpacing: "0.02em",
    transition: "all 0.2s ease",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    background: "transparent", border: "1px solid #2a2a2a", borderRadius: 6, color: "#777",
    fontSize: 11, letterSpacing: "0.05em", padding: "6px 14px", cursor: "pointer", transition: "all 0.2s ease",
    fontWeight: 500,
  },
  chipActive: { border: "1px solid #666", color: "#f5f5f5", background: "#2a2a2a", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)" },
  submitBtn: {
    background: "#e5e5e5", color: "#0a0a0a", border: "none", borderRadius: 6,
    fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
    fontFamily: "inherit", fontWeight: 700, padding: "13px 20px", cursor: "pointer",
    transition: "all 0.2s ease", boxShadow: "0 4px 12px rgba(229, 229, 229, 0.15)",
  },
  balance: {
    width: "100%", maxWidth: 680, display: "flex", justifyContent: "space-between",
    alignItems: "baseline", padding: "20px 0 0", borderTop: "1px solid #2a2a2a",
  },
  balanceLabel: { fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#777", fontWeight: 500 },
  balanceValue: { fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 8 },
};
