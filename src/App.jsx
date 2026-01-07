// src/App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SidebarLayout from "./components/layouts/SidebarLayout";
import AccountList from './components/accounts/AccountList';
import AddAccountForm from './components/accounts/AddAccountForm';
import EditAccountSection from './components/accounts/EditAccountSection';
import ProductForm from "./components/products/ProductForm";
import EditProductSection from "./components/products/EditProductSection";
import TransactionModal from "./components/transactions/TransactionModal";
import FundTransactionForm from "./components/transactions/FundTransactionForm";
import TransactionForm from "./components/transactions/TransactionForm";
import StatementForm from "./components/accounts/StatementForm";
import StockSummaryPage from "./pages/StockSummaryPage";
import TransactionsPage from "./pages/TransactionsPage";
import ProfitLoss from "./pages/ProfitLoss";
import BalanceSheet from "./pages/BalanceSheet";


function App() {
  // Holds the currently selected transaction type for the modal
  const [transactionType, setTransactionType] = useState(null);

  return (
    <Router>
      <div className="min-h-screen justify-center bg-gray-100">
        <header className="bg-blue-700 text-white p-4 text-lg font-semibold">
          Najmat Al Nakheelat
        </header>

        <main className="p-4">
          <Routes>
            <Route
              path="/"
              element={<SidebarLayout openTransactionModal={setTransactionType} />}
            >
              <Route path="/addAccount" element={<AddAccountForm />} />
              <Route path="/statement" element={<StatementForm />} />
              <Route path="/clstock" element={<StockSummaryPage />} />
              <Route path="/showinvoice" element={<TransactionsPage />} />
              <Route path="/showPL" element={<ProfitLoss />} />
              <Route path="/showBS" element={<BalanceSheet />} />
              <Route path="/addStock" element={<ProductForm />} />
              <Route path="/editProduct" element={<EditProductSection />} />
              <Route path="/accounts" element={<AccountList />} />
              <Route path="/accounts/edit/:id" element={<EditAccountSection />} />
              <Route path="/nsales" element={<TransactionForm type="sales"/>} />
              <Route path="/npurchase" element={<TransactionForm type="purchase"/>} />
              <Route path="/fund/:type" element={<FundTransactionForm />} />
              
              {/*<Route path="/payment" element={<FundTransactionForm type="payment" />} />
              <Route path="/receipt" element={<FundTransactionForm type="receipt" />} />
              <Route path="/transfer" element={<FundTransactionForm type="transfer" />} /> 
              <Route path="/deposit" element={<FundTransactionForm type="deposit" />} />
              <Route path="/withdrawal" element={<FundTransactionForm type="withdrawal" />} />
              /* No need for /transaction route */}
            </Route>
          </Routes>
        </main>

        {/* Transaction Modal: Conditionally rendered */}
        {transactionType && (
          <TransactionModal
            type={transactionType}
            onClose={() => setTransactionType(null)}
            onSuccess={() => {
              // Optional: refresh data if needed
            }}
          />
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
