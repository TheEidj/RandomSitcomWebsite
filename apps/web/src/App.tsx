import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { Navbar } from "./components/Navbar";
import { AppRoutes } from "./router";
import { TVZapTransition } from "./components/TVZapTransition";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TVZapTransition />
        <Navbar />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
