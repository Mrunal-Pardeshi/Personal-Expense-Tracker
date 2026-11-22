
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  ChartNoAxesCombined,
  Plus,
  Pencil,
  Trash2,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  Menu,
  CalendarDays,
} from "lucide-react";

import {
  getTransactions,
  saveTransactions,
  getBudget,
  saveBudget,
} from "./lib/storage";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const categories = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Salary",
  "Freelance",
  "Other",
];

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const today = () => new Date().toISOString().split("T")[0];

function App() {
  const [transactions, setTransactions] = useState(getTransactions);
  const [budget, setBudget] = useState(getBudget);
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "Expense",
    category: "Food",
    date: today(),
    description: "",
  });

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudget(budget);
  }, [budget]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthlyTransactions = useMemo(
    () =>
      transactions.filter((item) =>
        item.date.startsWith(currentMonth)
      ),
    [transactions, currentMonth]
  );

  const income = monthlyTransactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = monthlyTransactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = income - expenses;
  const remainingBudget = budget - expenses;

  const filteredTransactions = transactions.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || item.type === filter;

    return matchesSearch && matchesFilter;
  });

  function resetForm() {
    setForm({
      title: "",
      amount: "",
      type: "Expense",
      category: "Food",
      date: today(),
      description: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.amount ||
      Number(form.amount) <= 0 ||
      !form.date
    ) {
      alert("Please enter valid transaction details.");
      return;
    }

    const transaction = {
      ...form,
      amount: Number(form.amount),
      id: editingId || Date.now().toString(),
    };

    if (editingId) {
      setTransactions((old) =>
        old.map((item) =>
          item.id === editingId ? transaction : item
        )
      );
    } else {
      setTransactions((old) => [transaction, ...old]);
    }

    resetForm();
  }

  function handleEdit(item) {
    setForm({
      title: item.title,
      amount: String(item.amount),
      type: item.type,
      category: item.category,
      date: item.date,
      description: item.description || "",
    });

    setEditingId(item.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (window.confirm("Delete this transaction?")) {
      setTransactions((old) =>
        old.filter((item) => item.id !== id)
      );
    }
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Transactions", icon: Receipt },
    { name: "Budget", icon: Wallet },
    { name: "Reports", icon: ChartNoAxesCombined },
  ];

  const pieData = categories
    .map((category) => ({
      name: category,
      value: monthlyTransactions
        .filter(
          (item) =>
            item.type === "Expense" &&
            item.category === category
        )
        .reduce((sum, item) => sum + Number(item.amount), 0),
    }))
    .filter((item) => item.value > 0);

  const barData = ["Income", "Expenses"].map((name) => ({
    name,
    amount: name === "Income" ? income : expenses,
  }));

  const colors = [
    "#6366f1",
    "#0ea5e9",
    "#14b8a6",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#84cc16",
    "#f97316",
  ];

  function SummaryCard({ title, amount, icon: Icon, color }) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">{title}</p>
          <div className={`p-2 rounded-xl ${color}`}>
            <Icon size={20} />
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-4 text-slate-800">
          {formatMoney(amount)}
        </h2>
        <p className="text-xs text-slate-400 mt-2">
          Current month
        </p>
      </div>
    );
  }

  function TransactionTable({ data }) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4">Transaction</th>
              <th className="p-4">Category</th>
              <th className="p-4">Date</th>
              <th className="p-4">Type</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="p-4 font-medium text-slate-800">
                    {item.title}
                    {item.description && (
                      <p className="text-xs text-slate-400 font-normal">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4 whitespace-nowrap">{item.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.type === "Income"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className={`p-4 font-semibold ${item.type === "Income"
                    ? "text-green-600"
                    : "text-red-600"
                    }`}>
                    {item.type === "Income" ? "+" : "-"}
                    {formatMoney(item.amount)}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  function Dashboard() {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <SummaryCard
            title="Total Income"
            amount={income}
            icon={TrendingUp}
            color="bg-green-100 text-green-600"
          />
          <SummaryCard
            title="Total Expenses"
            amount={expenses}
            icon={TrendingDown}
            color="bg-red-100 text-red-600"
          />
          <SummaryCard
            title="Available Balance"
            amount={balance}
            icon={Wallet}
            color="bg-blue-100 text-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-5">
              Income vs Expenses
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatMoney(value)} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-5">
              Expense Categories
            </h3>
            <div className="h-64">
              {pieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400">
                  No expense data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatMoney(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mt-6">
          <div className="p-5 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">
              Recent Transactions
            </h3>
            <button
              onClick={() => setActivePage("Transactions")}
              className="text-sm text-indigo-600"
            >
              View all
            </button>
          </div>
          <TransactionTable data={transactions.slice(0, 5)} />
        </div>
      </>
    );
  }

  function Transactions() {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-5 flex flex-col lg:flex-row gap-3 justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2"
          >
            <option>All</option>
            <option>Income</option>
            <option>Expense</option>
          </select>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-indigo-600 text-white rounded-xl px-4 py-2 flex items-center justify-center gap-2 hover:bg-indigo-700"
          >
            <Plus size={18} /> Add Transaction
          </button>
        </div>
        <TransactionTable data={filteredTransactions} />
      </div>
    );
  }

  function Budget() {
    return (
      <div className="max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold">Monthly Budget</h3>
        <p className="text-sm text-slate-500 mt-1">
          Set a spending limit for the current month.
        </p>

        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            const value = Number(e.currentTarget.budget.value);

            if (value <= 0) {
              alert("Please enter a budget greater than zero.");
              return;
            }

            setBudget(value);
          }}
        >
          <label className="text-sm font-medium">Budget Amount (₹)</label>
          <div className="flex gap-3 mt-2">
            <input
              name="budget"
              type="number"
              min="1"
              defaultValue={budget || ""}
              placeholder="Enter monthly budget"
              className="flex-1 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
            <button className="bg-indigo-600 text-white rounded-xl px-5">
              Save
            </button>
          </div>
        </form>

        <div className="mt-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Budget Used</span>
            <strong>
              {budget > 0
                ? `${Math.min((expenses / budget) * 100, 100).toFixed(1)}%`
                : "0%"}
            </strong>
          </div>

          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${expenses > budget ? "bg-red-500" : "bg-indigo-600"
                }`}
              style={{
                width: `${budget > 0 ? Math.min((expenses / budget) * 100, 100) : 0}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500">Spent</p>
              <p className="text-xl font-bold mt-2">
                {formatMoney(expenses)}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500">Remaining</p>
              <p className={`text-xl font-bold mt-2 ${remainingBudget < 0 ? "text-red-600" : "text-green-600"
                }`}>
                {formatMoney(remainingBudget)}
              </p>
            </div>
          </div>

          {budget > 0 && expenses > budget && (
            <p className="text-sm text-red-600 mt-5">
              Your expenses have exceeded the monthly budget.
            </p>
          )}
        </div>
      </div>
    );
  }

  function Reports() {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <SummaryCard title="Income" amount={income} icon={TrendingUp} color="bg-green-100 text-green-600" />
          <SummaryCard title="Expenses" amount={expenses} icon={TrendingDown} color="bg-red-100 text-red-600" />
          <SummaryCard title="Balance" amount={balance} icon={Wallet} color="bg-blue-100 text-blue-600" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 mt-6 shadow-sm">
          <h3 className="font-semibold mb-5">Category-wise Expenses</h3>
          {pieData.length === 0 ? (
            <p className="text-slate-400 text-center py-16">
              No expense records available for this month.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} label>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </>
    );
  }

  const pageContent = {
    Dashboard: Dashboard(),
    Transactions: Transactions(),
    Budget: Budget(),
    Reports: Reports(),
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-800 flex">
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 h-screen bg-slate-950 text-white flex flex-col transition-transform ${menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Wallet size={23} />
            </div>
            <div>
              <h1 className="font-bold text-lg">ExpenseMate</h1>
              <p className="text-xs text-slate-400">Personal Finance</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <p className="text-xs text-slate-500 uppercase px-3 mb-3">
            Main Menu
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActivePage(item.name);
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${activePage === item.name
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Icon size={19} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t border-slate-800 text-xs text-slate-500">
          Personal Expense Tracker
          <br />
          Software Testing Project
        </div>
      </aside>

      <main className="flex-1 min-w-0 h-screen overflow-y-auto lg:ml-64">
        <header className="bg-white border-b border-slate-100 px-5 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu size={22} />
            </button>
            <div>
              <h2 className="font-bold text-xl">{activePage}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage your personal finances
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays size={17} />
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </header>

        <section className="p-5 lg:p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-slate-800">
                Hello! Welcome back.
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Here's your financial overview.
              </p>
            </div>
            {activePage === "Dashboard" && (
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-indigo-700"
              >
                <Plus size={17} />
                <span className="hidden sm:inline">Add Transaction</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>

          {pageContent[activePage]}
        </section>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {editingId ? "Edit Transaction" : "Add Transaction"}
              </h3>
              <button onClick={resetForm}>
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Transaction Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Grocery Shopping"
                  className="w-full border rounded-xl p-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Transaction Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({
                    ...form,
                    type: e.target.value,
                    category: e.target.value === "Income" ? "Salary" : "Food",
                  })}
                  className="w-full border rounded-xl p-3 mt-1"
                >
                  <option>Expense</option>
                  <option>Income</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Amount (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full border rounded-xl p-3 mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-1"
                >
                  {categories
                    .filter((category) =>
                      form.type === "Income"
                        ? ["Salary", "Freelance", "Other"].includes(category)
                        : !["Salary", "Freelance"].includes(category)
                    )
                    .map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border rounded-xl p-3 mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Description (Optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Add a short note"
                  className="w-full border rounded-xl p-3 mt-1"
                  rows="2"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border rounded-xl py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white rounded-xl py-3 hover:bg-indigo-700"
                >
                  {editingId ? "Update" : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
