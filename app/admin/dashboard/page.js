"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { C, API_URL } from "@/lib/adminConstants";
import { downloadInvoice } from "@/lib/adminHelpers";

import AdminNavbar from "./components/AdminNavbar";
import DashboardTab from "./components/DashboardTab";
import ProductsTab from "./components/ProductsTab";
import ProductFormModal from "./components/ProductFormModal";
import OrdersTab from "./components/OrdersTab";
import FeedbackTab from "./components/FeedbackTab";
import Sidebar from "../../components/Sidebar";

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const [feedbackStats, setFeedbackStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  // ─── Form State ───
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    cost_price: "",
    price: "",
    original_price: "",
    discount_percent: "",
    tag: "New",
    description: "",
    stock: "",
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ─── Check Auth ───
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/admin");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "admin") {
      router.push("/admin");
      return;
    }

    setAdminUser(user);
    fetchProducts();
    fetchOrders();
    fetchFeedback();
    fetchFeedbackStats();
  }, []);

  // ─── Fetch Products ───
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      showToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch Orders ───
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("Failed to fetch orders", "error");
    }
  };

  // ─── Fetch Feedback ───
  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFeedbackList(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      showToast("Failed to fetch feedback", "error");
    }
  };

  // ─── Fetch Feedback Stats ───
  const fetchFeedbackStats = async () => {
    try {
      const res = await fetch(`${API_URL}/feedback/stats`);
      const data = await res.json();
      setFeedbackStats({
        total: data.total || 0,
        pending: data.pending || 0,
        approved: data.approved || 0,
      });
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
    }
  };

  // ─── Calculate Order Statistics ───
  const calculateStats = (ordersData) => {
    const stats = {
      total: ordersData.length,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    ordersData.forEach((order) => {
      switch (order.status) {
        case "confirmed":
          stats.confirmed++;
          break;
        case "shipped":
          stats.shipped++;
          break;
        case "delivered":
          stats.delivered++;
          break;
        case "cancelled":
          stats.cancelled++;
          break;
      }
    });

    setOrderStats(stats);
  };

  // ─── Toast ───
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Update Order Status ───
  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");

      showToast(`Order #${orderId} status updated to ${status}`, "success");
      await fetchOrders();
    } catch (error) {
      console.error("Update order error:", error);
      showToast(error.message, "error");
    }
  };

  // ─── Handle Form Change ───
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "discount_percent") {
      let discount = parseFloat(value) || 0;
      discount = Math.min(Math.max(discount, 0), 100);

      const original = parseFloat(formData.original_price) || 0;
      const salePrice = discount > 0 ? original - (original * discount) / 100 : original;

      setFormData((prev) => ({
        ...prev,
        discount_percent: discount,
        price: original > 0 ? salePrice.toFixed(2) : "",
      }));
      return;
    }

    if (name === "original_price") {
      const original = parseFloat(value) || 0;
      const discount = parseFloat(formData.discount_percent) || 0;
      const salePrice = discount > 0 ? original - (original * discount) / 100 : original;

      setFormData((prev) => ({
        ...prev,
        original_price: value,
        price: original > 0 ? salePrice.toFixed(2) : "",
      }));
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  // ─── Open Edit Modal ───
  const openEditModal = (product) => {
    setEditingProduct(product);

    let discountPercent = 0;
    if (product.original_price && product.original_price > product.price) {
      discountPercent = Math.round(((product.original_price - product.price) / product.original_price) * 100);
    }

    setFormData({
      name: product.name || "",
      category: product.category || "",
      cost_price: product.cost_price?.toString() || "",
      price: product.price?.toString() || "",
      original_price: product.original_price?.toString() || "",
      discount_percent: discountPercent?.toString() || "",
      tag: product.tag || "New",
      description: product.description || "",
      stock: product.stock?.toString() || "",
    });

    setImages([]);
    setShowEditModal(true);
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      category: "",
      cost_price: "",
      price: "",
      original_price: "",
      discount_percent: "",
      tag: "New",
      description: "",
      stock: "",
    });
    setImages([]);
  };

  // ─── Add Product ───
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const token = localStorage.getItem("token");

      let discountPercent = 0;
      if (formData.original_price && parseFloat(formData.original_price) > parseFloat(formData.price)) {
        discountPercent = Math.round(
          ((parseFloat(formData.original_price) - parseFloat(formData.price)) / parseFloat(formData.original_price)) * 100
        );
      }

      const productRes = await fetch(`${API_URL}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          discount_percent: discountPercent || 0,
          tag: formData.tag,
          description: formData.description,
          stock: parseInt(formData.stock),
        }),
      });

      const productData = await productRes.json();
      if (!productRes.ok) throw new Error(productData.error || "Failed to create product");

      if (images.length > 0) {
        const formDataObj = new FormData();
        images.forEach((file) => formDataObj.append("images", file));

        await fetch(`${API_URL}/admin/products/${productData.id}/images`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataObj,
        });
      }

      showToast("Product added successfully!", "success");
      setShowAddModal(false);
      resetFormData();
      fetchProducts();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  // ─── Update Product ───
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const token = localStorage.getItem("token");

      let discountPercent = 0;
      if (formData.original_price && parseFloat(formData.original_price) > parseFloat(formData.price)) {
        discountPercent = Math.round(
          ((parseFloat(formData.original_price) - parseFloat(formData.price)) / parseFloat(formData.original_price)) * 100
        );
      }

      const productRes = await fetch(`${API_URL}/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          discount_percent: discountPercent || 0,
          tag: formData.tag,
          description: formData.description,
          stock: parseInt(formData.stock),
        }),
      });

      const productData = await productRes.json();
      if (!productRes.ok) throw new Error(productData.error || "Failed to update product");

      if (images.length > 0) {
        const formDataObj = new FormData();
        images.forEach((file) => formDataObj.append("images", file));

        await fetch(`${API_URL}/admin/products/${editingProduct.id}/images`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataObj,
        });
      }

      showToast("Product updated successfully!", "success");
      setShowEditModal(false);
      setEditingProduct(null);
      resetFormData();
      fetchProducts();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  // ─── Delete Product ───
  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");

      showToast("Product deleted successfully!", "success");
      fetchProducts();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: C.white,
        }}
      >
        <div style={{ fontSize: 24, color: C.maroon }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: C.white,
        color: C.text,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        minHeight: "100vh",
      }}
    >
      {/* ── TOAST ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 999,
            backgroundColor: toast.type === "error" ? "#EF4444" : C.maroon,
            color: C.goldLight,
            padding: "12px 20px",
            borderRadius: 14,
            fontSize: 14,
            boxShadow: "0 8px 32px rgba(74,46,34,0.3)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <span>{toast.message}</span>
        </div>
      )}

      <AdminNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingFeedbackCount={feedbackStats.pending}
        onLogout={handleLogout}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={adminUser}
        onLogoutClick={handleLogout}
        showBrandHeader={false}
        showUserSection={false}
      />

      {/* ─── CONTENT ─── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 40px" }}>
        {activeTab === "dashboard" && <DashboardTab orders={orders} products={products} />}

        {activeTab === "products" && (
          <ProductsTab
            products={products}
            onAddClick={() => setShowAddModal(true)}
            onEditClick={openEditModal}
            onDeleteClick={handleDelete}
          />
        )}

        {activeTab === "orders" && (
          <OrdersTab
            orders={orders}
            products={products}
            showToast={showToast}
            fetchOrders={fetchOrders}
            updateOrderStatus={updateOrderStatus}
          />
        )}

        {activeTab === "feedback" && (
          <FeedbackTab
            feedbackList={feedbackList}
            feedbackStats={feedbackStats}
            feedbackFilter={feedbackFilter}
            setFeedbackFilter={setFeedbackFilter}
            showToast={showToast}
            fetchFeedback={fetchFeedback}
            fetchFeedbackStats={fetchFeedbackStats}
          />
        )}
      </div>

      {/* ─── ADD PRODUCT MODAL ─── */}
      <ProductFormModal
        mode="add"
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={formData}
        handleChange={handleChange}
        handleImageUpload={handleImageUpload}
        images={images}
        onSubmit={handleAddProduct}
        uploading={uploading}
      />

      {/* ─── EDIT PRODUCT MODAL ─── */}
      {editingProduct && (
        <ProductFormModal
          mode="edit"
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          formData={formData}
          handleChange={handleChange}
          handleImageUpload={handleImageUpload}
          images={images}
          onSubmit={handleUpdateProduct}
          uploading={uploading}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 700px) {
          .date-filter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}