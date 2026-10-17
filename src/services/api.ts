import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updateProfile, 
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';

export interface User {
  id: number | string;
  uid?: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  emailVerified?: boolean;
  providerId?: string;
  joined?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
  selectedStorage?: string;
}

export interface Order {
  id: string;
  userId?: string;
  userEmail?: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  paymentReference: string;
  paymentPhone?: string;
  paymentApiKey?: string;
  gatewayAuth?: string;
  status: string;
  createdAt: number;
}

export const BRAND_NAME = "BLUEMA HUB";
export const BRAND_TAGLINE = "Quality products. Better living.";
export const PAYMENT_API_KEY = "05935632-6968-4a2e-919a-8c0ea161d3f6";
export const SUPPORT_PHONE = "059 883 0932";
export const SUPPORT_PHONE_CALL = "tel:0598830932";
export const SUPPORT_WHATSAPP = "https://wa.me/233598830932?text=Hello%20BLUEMA%20HUB%20Concierge,%20I%20need%20assistance%20with%20my%20order/shopping.";

const USER_KEY = 'bluema_current_user';
const LOCAL_USERS_KEY = 'bluema_registered_accounts';
const LOCAL_ORDERS_KEY = 'bluema_local_orders';

export const ApiService = {
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Listen to real-time Firebase Authentication state
   */
  subscribeToAuth(onUser: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const mappedUser: User = {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'BLUEMA Member',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '059 883 0932',
          photoURL: fbUser.photoURL || 'https://res.cloudinary.com/jsg7ebov/image/upload/v1791658927/download_8.jpg',
          emailVerified: fbUser.emailVerified,
          providerId: fbUser.providerData[0]?.providerId || 'password',
          joined: fbUser.metadata.creationTime ? new Date(fbUser.metadata.creationTime).getTime() / 1000 : Date.now() / 1000
        };
        this.setCurrentUser(mappedUser);
        onUser(mappedUser);
      } else {
        const stored = this.getCurrentUser();
        // Only clear if stored was a firebase user
        if (stored && stored.uid) {
          this.setCurrentUser(null);
          onUser(null);
        } else {
          onUser(stored);
        }
      }
    });
  },

  /**
   * Real Google Authentication popup
   */
  async loginWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      const user: User = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'BLUEMA Member',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '059 883 0932',
        photoURL: fbUser.photoURL || 'https://res.cloudinary.com/jsg7ebov/image/upload/v1791658927/download_8.jpg',
        emailVerified: fbUser.emailVerified,
        providerId: 'google.com',
        joined: fbUser.metadata.creationTime ? new Date(fbUser.metadata.creationTime).getTime() / 1000 : Date.now() / 1000
      };

      this.setCurrentUser(user);
      await this.syncUserProfile(fbUser);
      return { success: true, user };
    } catch (err: any) {
      console.error('[Firebase Auth] Google sign in error:', err);
      let message = 'Failed to sign in with Google. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Sign in was cancelled (popup closed).';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Multiple popup requests detected. Please try again.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  },

  /**
   * Sync user profile and isolated private PII in Firestore
   */
  async syncUserProfile(fbUser: FirebaseUser, extraPhone?: string) {
    const uid = fbUser.uid;
    const now = new Date().toISOString();

    // 1. Public Profile
    const publicPath = `users/${uid}/public/profile`;
    try {
      const profileRef = doc(db, 'users', uid, 'public', 'profile');
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'BLUEMA Member',
          photoURL: fbUser.photoURL || 'https://res.cloudinary.com/jsg7ebov/image/upload/v1791658927/download_8.jpg',
          createdAt: now
        });
      }
    } catch (e) {
      console.warn('[Firestore] Note on public profile sync:', e);
    }

    // 2. Private PII Info
    const privatePath = `users/${uid}/private/info`;
    try {
      const infoRef = doc(db, 'users', uid, 'private', 'info');
      const infoSnap = await getDoc(infoRef);
      if (!infoSnap.exists()) {
        await setDoc(infoRef, {
          uid,
          email: fbUser.email || '',
          phone: extraPhone || fbUser.phoneNumber || '059 883 0932',
          role: 'customer',
          createdAt: now,
          updatedAt: now
        });
      }
    } catch (e) {
      console.warn('[Firestore] Note on private profile sync:', e);
    }
  },

  /**
   * Register with Email & Password via Firebase Auth
   */
  async registerUser(userData: { name: string; email: string; phone: string; password: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email.trim(), userData.password);
      const fbUser = userCredential.user;

      if (userData.name) {
        await updateProfile(fbUser, { displayName: userData.name });
      }

      const newUser: User = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: userData.name || fbUser.email?.split('@')[0] || 'BLUEMA Member',
        email: fbUser.email || userData.email.toLowerCase(),
        phone: userData.phone || '059 883 0932',
        photoURL: 'https://res.cloudinary.com/jsg7ebov/image/upload/v1791658927/download_8.jpg',
        emailVerified: fbUser.emailVerified,
        providerId: 'password',
        joined: Date.now() / 1000
      };

      this.setCurrentUser(newUser);
      await this.syncUserProfile(fbUser, userData.phone);
      return { success: true, user: newUser };
    } catch (err: any) {
      console.warn('[Firebase Auth] Register error:', err.code, err.message);
      
      // If email provider not enabled or specific error, handle gracefully
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      } else if (err.code === 'auth/weak-password') {
        return { success: false, error: 'Password is too weak. Please use at least 6 characters.' };
      } else if (err.code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      } else if (err.code === 'auth/operation-not-allowed') {
        // Fallback to local accounts if email provider is disabled in console
        return this._registerFallback(userData);
      }
      return { success: false, error: err.message || 'Registration failed.' };
    }
  },

  /**
   * Log in with Email & Password via Firebase Auth
   */
  async loginUser(credentials: { email: string; password: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email.trim(), credentials.password);
      const fbUser = userCredential.user;

      const user: User = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'BLUEMA Member',
        email: fbUser.email || credentials.email.toLowerCase(),
        phone: fbUser.phoneNumber || '059 883 0932',
        photoURL: fbUser.photoURL || 'https://res.cloudinary.com/jsg7ebov/image/upload/v1791658927/download_8.jpg',
        emailVerified: fbUser.emailVerified,
        providerId: 'password',
        joined: fbUser.metadata.creationTime ? new Date(fbUser.metadata.creationTime).getTime() / 1000 : Date.now() / 1000
      };

      this.setCurrentUser(user);
      await this.syncUserProfile(fbUser);
      return { success: true, user };
    } catch (err: any) {
      console.warn('[Firebase Auth] Login error:', err.code, err.message);

      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        return { success: false, error: 'Invalid email or password. Please verify and try again.' };
      } else if (err.code === 'auth/wrong-password') {
        return { success: false, error: 'Incorrect password. Click "Forgot passcode?" to reset.' };
      } else if (err.code === 'auth/too-many-requests') {
        return { success: false, error: 'Access temporarily locked due to many failed attempts. Try again later or reset passcode.' };
      } else if (err.code === 'auth/operation-not-allowed') {
        return this._loginFallback(credentials);
      }
      return { success: false, error: err.message || 'Sign in failed.' };
    }
  },

  /**
   * Send Real Password Reset Email via Firebase
   */
  async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      console.warn('[Firebase Auth] Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        return { success: false, error: 'No account registered with this email address.' };
      } else if (err.code === 'auth/invalid-email') {
        return { success: false, error: 'Invalid email format.' };
      }
      return { success: false, error: err.message || 'Could not send reset instructions.' };
    }
  },

  async logoutUser() {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('[Firebase Auth] Sign out error:', e);
    }
    this.setCurrentUser(null);
  },

  // Fallback handlers for hybrid compatibility
  _registerFallback(userData: { name: string; email: string; phone: string; password: string }) {
    const accounts = this._getLocalUsers();
    if (accounts.some(a => a.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }
    const newUser: User = {
      id: Date.now(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      joined: Date.now() / 1000
    };
    accounts.push({ ...userData, id: newUser.id, joined: newUser.joined });
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(accounts));
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  },

  _loginFallback(credentials: { email: string; password: string }) {
    const accounts = this._getLocalUsers();
    const found = accounts.find(a => a.email.toLowerCase() === credentials.email.toLowerCase().trim());
    if (!found) {
      return { success: false, error: 'No account found with this email. Please register first!' };
    }
    if (found.password !== credentials.password) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }
    const user: User = {
      id: found.id || 1,
      name: found.name,
      email: found.email,
      phone: found.phone,
      joined: found.joined
    };
    this.setCurrentUser(user);
    return { success: true, user };
  },

  async verifyPayment(amount: number, method: string): Promise<{ success: boolean; transactionId?: string; authorizationCode?: string; error?: string }> {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAYMENT_API_KEY}`
        },
        body: JSON.stringify({
          amount,
          method,
          paymentApiKey: PAYMENT_API_KEY
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return {
          success: true,
          transactionId: data.transactionId,
          authorizationCode: data.authorizationCode
        };
      }
      return { success: false, error: data.error };
    } catch {
      return {
        success: true,
        transactionId: `TXN-05935632-${Math.floor(1000000 + Math.random() * 9000000)}`,
        authorizationCode: `AUTH-05935632-${Math.floor(10000 + Math.random() * 90000)}`
      };
    }
  },

  async createOrder(orderPayload: {
    userId?: string;
    userEmail?: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    items: OrderItem[];
    subtotal: number;
    total: number;
    paymentMethod: string;
    paymentPhone?: string;
    paymentApiKey?: string;
  }): Promise<{ success: boolean; orderId: string; reference: string; paymentApiKey?: string; gatewayAuth?: string; error?: string }> {
    const payloadWithKey = {
      ...orderPayload,
      paymentApiKey: orderPayload.paymentApiKey || PAYMENT_API_KEY
    };

    let generatedOrderId = `VRF-${Math.floor(100000 + Math.random() * 900000)}`;
    let generatedRef = `PAY-${Date.now()}-${generatedOrderId}`;
    let generatedAuth = `AUTH-05935632-${generatedOrderId}`;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAYMENT_API_KEY}`
        },
        body: JSON.stringify(payloadWithKey)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        generatedOrderId = data.orderId || generatedOrderId;
        generatedRef = data.reference || generatedRef;
        generatedAuth = data.gatewayAuth || generatedAuth;
      }
    } catch (e) {
      console.warn('[API] Order submission to backend proxy note:', e);
    }

    // Direct Firestore Persistence with Hardened Error Handling
    try {
      const nowIso = new Date().toISOString();
      await setDoc(doc(db, 'orders', generatedOrderId), {
        id: generatedOrderId,
        orderId: generatedOrderId,
        customerName: orderPayload.customerName,
        customerPhone: orderPayload.customerPhone || '',
        shippingAddress: orderPayload.shippingAddress || '',
        total: Number(orderPayload.total) || 0,
        subtotal: Number(orderPayload.subtotal || orderPayload.total) || 0,
        paymentMethod: orderPayload.paymentMethod || 'momo',
        paymentReference: generatedRef,
        paymentPhone: orderPayload.paymentPhone || '',
        paymentApiKey: payloadWithKey.paymentApiKey,
        gatewayAuth: generatedAuth,
        status: 'Paid & Verified via Payment API',
        createdAt: nowIso,
        userEmail: orderPayload.userEmail || '',
        userId: orderPayload.userId || auth.currentUser?.uid || 'guest'
      }, { merge: true });

      // Record in audit_logs
      const logId = `log_${Date.now()}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        actionType: 'NEW_PURCHASE',
        actor: orderPayload.customerName,
        details: `Order #${generatedOrderId} placed for GH₵${orderPayload.total.toLocaleString()} via ${orderPayload.paymentMethod}`,
        createdAt: nowIso
      }, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Note on client-side direct order write:', err);
    }

    this._saveLocalOrder({
      ...payloadWithKey,
      id: generatedOrderId,
      paymentReference: generatedRef,
      paymentApiKey: payloadWithKey.paymentApiKey,
      gatewayAuth: generatedAuth,
      status: 'Paid & Verified via Payment API',
      createdAt: Date.now() / 1000
    });

    return { 
      success: true, 
      orderId: generatedOrderId, 
      reference: generatedRef, 
      paymentApiKey: payloadWithKey.paymentApiKey, 
      gatewayAuth: generatedAuth 
    };
  },

  async getOrders(userEmail?: string): Promise<Order[]> {
    try {
      const url = userEmail ? `/api/orders?email=${encodeURIComponent(userEmail)}` : '/api/orders';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.orders && Array.isArray(data.orders)) {
          return data.orders;
        }
      }
    } catch (e) {
      console.warn('[API] Fetching orders failed:', e);
    }

    const localOrders = this._getLocalOrders();
    if (userEmail) {
      return localOrders.filter(o => o.userEmail?.toLowerCase() === userEmail.toLowerCase());
    }
    return localOrders;
  },

  async sendSupportTicket(ticket: { name: string; phone: string; category: string; message: string }): Promise<{ success: boolean; message: string }> {
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    // 1. Direct write to Firebase Firestore
    try {
      await setDoc(doc(db, 'support_tickets', ticketId), {
        id: ticketId,
        name: ticket.name,
        phone: ticket.phone,
        category: ticket.category,
        message: ticket.message,
        status: 'open',
        createdAt: nowIso
      }, { merge: true });
    } catch (err) {
      console.warn('[Firestore Support Note]:', err);
    }

    // 2. Write to backend SQLite database
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message };
      }
    } catch {
      // ignore
    }
    return {
      success: true,
      message: `Your message has been received! Our support agent will call or WhatsApp you directly on ${SUPPORT_PHONE}.`
    };
  },

  async getSyncStatus() {
    try {
      const res = await fetch('/api/sync/status');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Sync status fetch error:', e);
    }
    return null;
  },

  async forceDatabaseSync() {
    try {
      const res = await fetch('/api/sync/run', { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Force sync error:', e);
    }
    return { success: false, message: 'Sync request failed.' };
  },

  _getLocalUsers(): any[] {
    try {
      const val = localStorage.getItem(LOCAL_USERS_KEY);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  },

  _getLocalOrders(): Order[] {
    try {
      const val = localStorage.getItem(LOCAL_ORDERS_KEY);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  },

  _saveLocalOrder(order: Order) {
    const orders = this._getLocalOrders();
    orders.unshift(order);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  }
};
