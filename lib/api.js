// lib/api.js
import { API_URL } from "./config";

// ─── Auth APIs ──────────────────────────
export async function signupUser(userData) {
  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    return data;
  } catch (error) {
    throw error;
  }
}

export async function loginUser(credentials) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser(token) {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get user');
    return data;
  } catch (error) {
    throw error;
  }
}

// ─── Product APIs ──────────────────────
export async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(productId) {
  try {
    const res = await fetch(`${API_URL}/products/${productId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch product');
    return data;
  } catch (error) {
    throw error;
  }
}

// ─── Admin APIs ─────────────────────────
export async function createProduct(token, productData) {
  try {
    const res = await fetch(`${API_URL}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create product');
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateProduct(token, productId, productData) {
  try {
    const res = await fetch(`${API_URL}/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
    return data;
  } catch (error) {
    throw error;
  }
}

export async function deleteProduct(token, productId) {
  try {
    const res = await fetch(`${API_URL}/admin/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function uploadProductImages(token, productId, formData) {
  try {
    const res = await fetch(`${API_URL}/admin/products/${productId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload images');
    return data;
  } catch (error) {
    throw error;
  }
}

// ─── Cart APIs ─────────────────────────
export async function getCart(token) {
  try {
    const res = await fetch(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch cart');
    return data;
  } catch (error) {
    throw error;
  }
}

export async function addToCart(token, productId, quantity = 1) {
  try {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add to cart');
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateCartItem(token, itemId, quantity) {
  try {
    const res = await fetch(`${API_URL}/cart/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update cart');
    return data;
  } catch (error) {
    throw error;
  }
}

export async function removeCartItem(token, itemId) {
  try {
    const res = await fetch(`${API_URL}/cart/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to remove item');
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ─── Order APIs ─────────────────────────
export async function createOrder(token, orderData) {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create order');
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getOrders(token) {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
    return data;
  } catch (error) {
    throw error;
  }
}