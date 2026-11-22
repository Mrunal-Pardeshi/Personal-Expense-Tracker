
const KEYS = {
  transactions: "expense_tracker_transactions",
  budget: "expense_tracker_budget",
};

export function getTransactions() {
  return JSON.parse(localStorage.getItem(KEYS.transactions)) || [];
}

export function saveTransactions(transactions) {
  localStorage.setItem(
    KEYS.transactions,
    JSON.stringify(transactions)
  );
}

export function getBudget() {
  return Number(localStorage.getItem(KEYS.budget)) || 0;
}

export function saveBudget(amount) {
  localStorage.setItem(KEYS.budget, String(amount));
}
