
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import QuotesPage from './pages/QuotesPage';
import InvoicesPage from './pages/InvoicesPage';
import WarehousesPage from './pages/WarehousesPage';
import ProfilePage from './pages/ProfilePage';
import ClientDetailPage from './pages/ClientDetailPage';
import StockMovementsPage from './pages/StockMovementsPage';
import PriceListsPage from './pages/PriceListsPage';
import SettingsPage from './pages/SettingsPage';
import POSPage from './pages/POSPage'; // Import POS Page
import POSHistoryPage from './pages/POSHistoryPage';
import { CashRegisterSession, Product, StockMovement, StockMovementReason, Invoice, InvoiceStatus } from './types';
import { mockSessions as initialSessions, mockProducts as initialProducts, mockStockMovements as initialStockMovements, mockInvoices as initialInvoices } from './data/mockData';


// --- Auth Context ---
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Company Context ---
export interface CompanyInfo {
    name: string;
    rut: string;
    activity: string;
    address: string;
    website: string;
    email: string;
    logoUrl: string;
}

interface CompanyContextType {
    companyInfo: CompanyInfo;
    updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
}

const CompanyContext = createContext<CompanyContextType | null>(null);

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
}

const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
        name: 'Undermix',
        rut: '76.443.314-9',
        activity: 'Portales Web',
        address: 'Las Encinas 600',
        website: 'www.undermix.cl',
        email: 'oliver@undermix.cl',
        logoUrl: '',
    });

    const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
        setCompanyInfo(prevInfo => ({ ...prevInfo, ...info }));
    };

    return (
        <CompanyContext.Provider value={{ companyInfo, updateCompanyInfo }}>
            {children}
        </CompanyContext.Provider>
    );
};

// --- Stock Context ---
interface StockContextType {
  products: Product[];
  stockMovements: StockMovement[];
  addStockMovement: (
    productId: string,
    warehouseId: string,
    quantity: number,
    reason: StockMovementReason,
    referenceId?: string
  ) => void;
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
}

const StockContext = createContext<StockContextType | null>(null);

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>(() => {
        const stored = localStorage.getItem('erp_products');
        return stored ? JSON.parse(stored) : initialProducts;
    });

    const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
        const stored = localStorage.getItem('erp_stock_movements');
        return stored ? JSON.parse(stored, (key, value) => {
            if (key === 'createdAt') return value ? new Date(value) : undefined;
            return value;
        }) : initialStockMovements;
    });

    useEffect(() => {
        localStorage.setItem('erp_products', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('erp_stock_movements', JSON.stringify(stockMovements));
    }, [stockMovements]);

    const addStockMovement = (
        productId: string,
        warehouseId: string,
        quantity: number, // Should be negative for sales
        reason: StockMovementReason,
        referenceId?: string
    ) => {
        setProducts(currentProducts => {
            const newProducts = [...currentProducts];
            const productIndex = newProducts.findIndex(p => p.id === productId);
            if (productIndex === -1) {
                console.error(`Product with id ${productId} not found.`);
                return currentProducts;
            }

            const product = { ...newProducts[productIndex] };
            const locationIndex = product.locations.findIndex(l => l.warehouseId === warehouseId);

            if (locationIndex === -1) {
                console.error(`Warehouse location ${warehouseId} not found for product ${productId}.`);
                return currentProducts;
            }

            const newLocations = [...product.locations];
            const newLocation = { ...newLocations[locationIndex] };
            newLocation.stock += quantity;
            newLocations[locationIndex] = newLocation;
            product.locations = newLocations;

            newProducts[productIndex] = product;
            return newProducts;
        });

        const newMovement: StockMovement = {
            id: `SM-${Date.now()}`,
            productId,
            warehouseId,
            quantity,
            reason,
            referenceId,
            createdAt: new Date(),
        };

        setStockMovements(prevMovements => [newMovement, ...prevMovements]);
    };

    const saveProduct = (productToSave: Product) => {
        setProducts(prevProducts => {
            const existingIndex = prevProducts.findIndex(p => p.id === productToSave.id);
            if (existingIndex > -1) {
                const updatedProducts = [...prevProducts];
                updatedProducts[existingIndex] = productToSave;
                return updatedProducts;
            } else {
                return [productToSave, ...prevProducts];
            }
        });
    };

    const deleteProduct = (productId: string) => {
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    };

    return (
        <StockContext.Provider value={{ products, stockMovements, addStockMovement, saveProduct, deleteProduct }}>
            {children}
        </StockContext.Provider>
    );
};


// --- Cash Register Context ---
interface CashRegisterContextType {
  sessions: CashRegisterSession[];
  addSession: (session: CashRegisterSession) => void;
}

const CashRegisterContext = createContext<CashRegisterContextType | null>(null);

export const useCashRegister = () => {
  const context = useContext(CashRegisterContext);
  if (!context) {
    throw new Error('useCashRegister must be used within a CashRegisterProvider');
  }
  return context;
};

const CashRegisterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<CashRegisterSession[]>(() => {
    try {
      const storedSessions = localStorage.getItem('pos_sessions');
      return storedSessions ? JSON.parse(storedSessions, (key, value) => {
        if (key === 'openingTime' || key === 'closingTime' || key === 'createdAt') {
          return value ? new Date(value) : undefined;
        }
        return value;
      }) : initialSessions;
    } catch (error) {
      console.error("Failed to parse sessions from localStorage", error);
      return initialSessions;
    }
  });

  const addSession = (session: CashRegisterSession) => {
    const updatedSessions = [session, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem('pos_sessions', JSON.stringify(updatedSessions));
  };

  return (
    <CashRegisterContext.Provider value={{ sessions, addSession }}>
      {children}
    </CashRegisterContext.Provider>
  );
};

// --- Invoice Context ---
interface InvoiceContextType {
  invoices: Invoice[];
  saveInvoice: (invoice: Invoice) => void;
  deleteInvoice: (invoiceId: string) => void;
  addSiiDocumentToInvoice: (invoiceId: string, docType: string) => void;
}

const InvoiceContext = createContext<InvoiceContextType | null>(null);

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};

const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [invoices, setInvoices] = useState<Invoice[]>(() => {
        const stored = localStorage.getItem('erp_invoices');
        return stored ? JSON.parse(stored) : initialInvoices;
    });

    useEffect(() => {
        localStorage.setItem('erp_invoices', JSON.stringify(invoices));
    }, [invoices]);
    
    const generateNextOrderId = (): string => {
        const lastIdNumber = invoices
            .map(inv => parseInt(inv.id.split('-')[1], 10))
            .filter(num => !isNaN(num))
            .sort((a, b) => b - a)[0] || 0;
        return `O-${String(lastIdNumber + 1).padStart(3, '0')}`;
    };

    const saveInvoice = (invoiceToSave: Invoice) => {
        setInvoices(prevInvoices => {
            const existingIndex = prevInvoices.findIndex(i => i.id === invoiceToSave.id);
            if (existingIndex > -1) {
                const updatedInvoices = [...prevInvoices];
                updatedInvoices[existingIndex] = invoiceToSave;
                return updatedInvoices;
            } else {
                 const newId = generateNextOrderId();
                 return [{ ...invoiceToSave, id: newId }, ...prevInvoices];
            }
        });
    };

    const deleteInvoice = (invoiceId: string) => {
        setInvoices(prevInvoices => prevInvoices.filter(i => i.id !== invoiceId));
    };

    const addSiiDocumentToInvoice = (invoiceId: string, docType: string) => {
        setInvoices(currentInvoices => {
            const invoiceIndex = currentInvoices.findIndex(inv => inv.id === invoiceId);

            if (invoiceIndex === -1 || currentInvoices[invoiceIndex].siiDocument) {
                return currentInvoices;
            }

            const lastFolio = currentInvoices
                .map(i => i.siiDocument?.folio)
                .filter((f): f is string => !!f)
                .map(f => parseInt(f, 10))
                .sort((a, b) => b - a)[0] || 0;

            const newFolio = String(lastFolio + 1).padStart(4, '0');
            const shortDocType = docType.split(' ')[0];
            
            const newInvoices = [...currentInvoices];
            const updatedInvoice = {
                ...newInvoices[invoiceIndex],
                status: InvoiceStatus.Sent,
                siiDocument: {
                    type: shortDocType,
                    folio: newFolio,
                },
            };
            newInvoices[invoiceIndex] = updatedInvoice;

            return newInvoices;
        });
    };
    
    return (
        <InvoiceContext.Provider value={{ invoices, saveInvoice, deleteInvoice, addSiiDocumentToInvoice }}>
            {children}
        </InvoiceContext.Provider>
    );
};


// --- Main App Component ---
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CompanyProvider>
        <StockProvider>
          <InvoiceProvider>
            <CashRegisterProvider>
                <HashRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
                    <Route 
                    path="/*" 
                    element={
                        <ProtectedRoute>
                        <MainLayout>
                            <Routes>
                            <Route index element={<Navigate to="/dashboard" />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/clients" element={<ClientsPage />} />
                            <Route path="/client/:clientId" element={<ClientDetailPage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/quotes" element={<QuotesPage />} />
                            <Route path="/invoices" element={<InvoicesPage />} />
                            <Route path="/warehouses" element={<WarehousesPage />} />
                            <Route path="/stock-movements" element={<StockMovementsPage />} />
                            <Route path="/price-lists" element={<PriceListsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/pos-history" element={<POSHistoryPage />} />
                            </Routes>
                        </MainLayout>
                        </ProtectedRoute>
                    } 
                    />
                </Routes>
                </HashRouter>
            </CashRegisterProvider>
          </InvoiceProvider>
        </StockProvider>
      </CompanyProvider>
    </AuthProvider>
  );
};

export default App;
