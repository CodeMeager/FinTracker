import { useState } from "react";

const categories = {
  expense: ["Еда", "Транспорт", "Жильё", "Здоровье", "Развлечения", "Одежда", "Другое"],
  income: ["Зарплата", "Фриланс", "Инвестиции", "Подарок", "Другое"],
};

const formatAmount = (n) =>
  n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function App() {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories.expense[0]);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

  const handleTypeSwitch = (t) => {
    setType(t);
    setCategory(categories[t][0]);
  };

  const handleSubmit = () => {
    const val = parseFloat(amount.replace(",", "."));
    if (!val || val <= 0) return;
    const entry = { amount: val, category, id: Date.now() };
    if (type === "expense") setExpenses((p) => [entry, ...p]);
    else setIncomes((p) => [entry, ...p]);
    setAmount("");
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncomes = incomes.reduce((s, e) => s + e.amount, 0);

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.logo}>₽ финансы</span>
      </div>

      {/* Summary blocks */}
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
                <span style={{ ...styles.entryAmt, color: "#4ade80" }}>+{formatAmount(e.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={styles.form}>
        {/* Toggle */}
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

        {/* Amount */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Сумма, ₽</label>
          <input
            style={styles.input}
            type="number"
            min="0"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {/* Category */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Категория</label>
          <div style={styles.chips}>
            {categories[type].map((c) => (
              <button
                key={c}
                style={{ ...styles.chip, ...(category === c ? styles.chipActive : {}) }}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button style={styles.submitBtn} onClick={handleSubmit}>
          Подтвердить
        </button>
      </div>

      {/* Balance */}
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
    background: "#0a0a0a",
    color: "#e5e5e5",
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 16px 48px",
    gap: "24px",
  },
  header: {
    width: "100%",
    maxWidth: 680,
    display: "flex",
    justifyContent: "flex-start",
  },
  logo: {
    fontSize: 13,
    letterSpacing: "0.15em",
    color: "#555",
    textTransform: "uppercase",
  },
  summaryRow: {
    width: "100%",
    maxWidth: 680,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  summaryCard: {
    borderRadius: 2,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minHeight: 160,
    border: "1px solid",
  },
  expenseCard: {
    background: "#110e0e",
    borderColor: "#2a1a1a",
  },
  incomeCard: {
    background: "#0b110e",
    borderColor: "#1a2a1e",
  },
  summaryLabel: {
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#555",
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#e5e5e5",
    marginBottom: 8,
  },
  entryList: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    overflowY: "auto",
    maxHeight: 160,
  },
  entryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 12,
    color: "#888",
  },
  entryCategory: {
    color: "#666",
    fontSize: 11,
  },
  entryAmt: {
    color: "#f87171",
    fontVariantNumeric: "tabular-nums",
  },
  empty: {
    fontSize: 11,
    color: "#333",
  },
  form: {
    width: "100%",
    maxWidth: 680,
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: 2,
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  toggle: {
    display: "flex",
    gap: 0,
    background: "#0a0a0a",
    border: "1px solid #1e1e1e",
    borderRadius: 2,
    overflow: "hidden",
    width: "fit-content",
  },
  toggleBtn: {
    background: "transparent",
    border: "none",
    color: "#555",
    fontSize: 12,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "8px 20px",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  toggleActive: {
    background: "#2a1a1a",
    color: "#f87171",
  },
  toggleActiveIncome: {
    background: "#1a2a1e",
    color: "#4ade80",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#555",
  },
  input: {
    background: "#0a0a0a",
    border: "1px solid #222",
    borderRadius: 2,
    color: "#e5e5e5",
    fontSize: 28,
    fontFamily: "inherit",
    fontWeight: 700,
    padding: "10px 14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    letterSpacing: "-0.02em",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    background: "transparent",
    border: "1px solid #222",
    borderRadius: 2,
    color: "#666",
    fontSize: 11,
    letterSpacing: "0.05em",
    padding: "5px 12px",
    cursor: "pointer",
    transition: "all 0.1s",
  },
  chipActive: {
    border: "1px solid #555",
    color: "#e5e5e5",
    background: "#1a1a1a",
  },
  submitBtn: {
    background: "#e5e5e5",
    color: "#0a0a0a",
    border: "none",
    borderRadius: 2,
    fontSize: 12,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    fontWeight: 700,
    padding: "14px",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  balance: {
    width: "100%",
    maxWidth: 680,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    padding: "0 2px",
  },
  balanceLabel: {
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#555",
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: "-0.03em",
  },
};
