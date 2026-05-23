document.addEventListener("DOMContentLoaded", () => {
  const cart = getCart();

  if (!cart.length) {
    window.location.href = "index.html";
    return;
  }

  const summaryContainer = document.getElementById("checkoutSummaryItems");
  let total = 0;

  summaryContainer.innerHTML = cart
    .map((item) => {
      total += item.price * item.quantity;
      return `
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">
          ${item.name} x ${item.quantity}
        </span>
        <span class="font-medium">
          ₹${(item.price * item.quantity).toLocaleString("en-IN")}
        </span>
      </div>
    `;
    })
    .join("");

  document.getElementById("subtotal").textContent = `₹${total.toLocaleString(
    "en-IN"
  )}`;
  document.getElementById("total").textContent = `₹${total.toLocaleString(
    "en-IN"
  )}`;

  // Form submission handler
  const checkoutForm = document.getElementById("checkoutForm");

  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const paymentMethod = document.querySelector(
      'input[name="pay_method"]:checked'
    );

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (paymentMethod.value === "online") {
      // Open Simulated Razorpay Gateway Modal
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;

      document.getElementById("rzpCustomerName").textContent = name;
      document.getElementById("rzpCustomerContact").textContent = `${phone} | ${email}`;
      document.getElementById("rzpTotalAmount").textContent = `₹${total.toLocaleString("en-IN")}.00`;
      document.getElementById("rzpPayBtnAmount").textContent = `₹${total.toLocaleString("en-IN")}.00`;
      
      // Show Razorpay Modal
      document.getElementById("razorpayGatewayModal").classList.remove("hidden");
    } else {
      // Cash on Delivery - Complete Purchase Directly
      await completeOrderPlacement("cod", "Pending COD Confirmation");
    }
  });

  // Reusable order placement controller
  async function completeOrderPlacement(method, paymentStatus) {
    const orderData = {
      customerName: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
      pincode: document.getElementById("pincode").value,
      items: cart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalPrice: total,
      paymentStatus: paymentStatus,
      status: "Ready for Shipping"
    };

    try {
      // 1. Post order to the Node backend
      const response = await fetch("https://shopkart-10.onrender.com/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sync order with database");
      }

      const backendOrder = await response.json();
      console.log("Order saved to backend DB:", backendOrder);

      // 2. Prepend order to sk_orders in localStorage so it displays in orders.html
      const order = {
        id: backendOrder._id || Date.now(),
        date: new Date().toLocaleDateString(),
        items: cart,
        total: total,
        method: method, // 'cod' or 'online'
        status: "Ready for Shipping"
      };

      const orders = JSON.parse(localStorage.getItem("sk_orders") || "[]");
      orders.unshift(order);
      localStorage.setItem("sk_orders", JSON.stringify(orders));

      // 3. Clear cart
      if (typeof saveCart === "function") {
        saveCart([]);
      } else {
        localStorage.setItem("sk_cart", JSON.stringify([]));
      }

      // 4. Update frontend cart badge and UI
      if (typeof updateCartUI === "function") {
        updateCartUI();
      }

      // 5. Open Success Modal
      document.getElementById("successModal").classList.remove("hidden");

    } catch (error) {
      console.error("Order Placement Error:", error);
      alert(`Failed to place order: ${error.message} ❌`);
    }
  }

  // --- Simulated Razorpay Functions (Exposed to Window for HTML event handler access) ---
  
  window.switchRzpTab = (tabName) => {
    // Hide all tab views
    document.getElementById("rzp-view-card").classList.add("hidden");
    document.getElementById("rzp-view-upi").classList.add("hidden");
    document.getElementById("rzp-view-netbank").classList.add("hidden");

    // Remove active styling from buttons
    document.getElementById("tab-card").classList.remove("rzp-active-tab");
    document.getElementById("tab-upi").classList.remove("rzp-active-tab");
    document.getElementById("tab-netbank").classList.remove("rzp-active-tab");

    // Show active tab view and add active styling
    document.getElementById(`rzp-view-${tabName}`).classList.remove("hidden");
    document.getElementById(`tab-${tabName}`).classList.add("rzp-active-tab");
  };

  window.selectQuickUpi = (upiType) => {
    const handle = document.getElementById("name").value.toLowerCase().replace(/\s+/g, "");
    let upiId = `${handle || "skcustomer"}`;

    if (upiType === "gpay") upiId += "@okaxis";
    else if (upiType === "phonepe") upiId += "@ybl";
    else if (upiType === "paytm") upiId += "@paytm";
    else if (upiType === "bhim") upiId += "@upi";

    document.getElementById("rzpUpiId").value = upiId;
  };

  window.closeRazorpayGateway = () => {
    document.getElementById("razorpayGatewayModal").classList.add("hidden");
    // Reset modal state overlay classes
    document.getElementById("rzpProcessingOverlay").classList.add("hidden");
    document.getElementById("rzpSuccessOverlay").classList.add("hidden");
  };

  window.submitRazorpayPayment = () => {
    // Simple verification
    const activeTab = document.querySelector(".rzp-active-tab").id.replace("tab-", "");

    if (activeTab === "card") {
      const cardNum = document.getElementById("rzpCardNumber").value.trim();
      const cardExp = document.getElementById("rzpCardExpiry").value.trim();
      const cardCvv = document.getElementById("rzpCardCvv").value.trim();

      if (!cardNum || cardNum.length < 12) {
        alert("Please enter a valid card number.");
        return;
      }
      if (!cardExp || !cardExp.includes("/")) {
        alert("Please enter card expiry in MM/YY format.");
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        alert("Please enter a valid CVV.");
        return;
      }
    } else if (activeTab === "upi") {
      const upiId = document.getElementById("rzpUpiId").value.trim();
      if (!upiId || !upiId.includes("@")) {
        alert("Please enter a valid UPI ID (containing '@').");
        return;
      }
    }

    // Enter Processing State
    document.getElementById("rzpProcessingOverlay").classList.remove("hidden");

    // Success transition after 1.8 seconds
    setTimeout(() => {
      document.getElementById("rzpProcessingOverlay").classList.add("hidden");
      document.getElementById("rzpSuccessOverlay").classList.remove("hidden");
      
      const randTxnId = "pay_" + Math.random().toString(36).substring(2, 12).toUpperCase();
      document.getElementById("rzpPaymentIdPlaceholder").textContent = `Transaction ID: ${randTxnId}`;

      // Complete order placement after another 1.2 seconds
      setTimeout(async () => {
        window.closeRazorpayGateway();
        await completeOrderPlacement("online", `Paid via Razorpay (${randTxnId})`);
      }, 1200);

    }, 1800);
  };
});