import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SidebarLayout from "./components/layouts/SidebarLayout";
import AccountList from './components/accounts/AccountList';
import AddAccountForm from './components/accounts/AddAccountForm';
import EditAccountSection from './components/accounts/EditAccountSection';
import ProductForm from "./components/products/ProductForm";
import EditProductSection from "./components/products/EditProductSection";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-700 text-white p-4 text-lg font-semibold">
          Accounting App
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<SidebarLayout />}>
            <Route path="/addAccount" element={<AddAccountForm />}/>
            <Route path="/addStock" element={<ProductForm />} />
            <Route path="/editProduct" element={<EditProductSection />} />


           {/* <Route path="/" element={<Navigate to="/accounts" />} />
            <Route path="/accounts" element={<AccountList />} />
            <Route path="/accounts/new" element={<AddAccountForm />} />
            <Route path="/accounts/:id/edit" element={<EditAccountSection />} /> */}
            </Route>
            {/* Add more routes like /transactions or /products later */}
          </Routes>
        </main>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
