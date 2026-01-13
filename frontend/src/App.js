import { useEffect, useState } from "react";
import LoginBox from "./LoginBox";
import RegisterBox from "./RegisterBox";
import FileApp from "./FileLoad";
import "./App.css";

function App() {
  const SERVER = "http://localhost:3000";

  const [view, setView] = useState("login"); // login | register | app
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("user")
  );
  const [privateKey, setPrivateKey] = useState(null);

  useEffect(() => {
    if (currentUser && privateKey) {
      setView("app");
    }
  }, [currentUser, privateKey]);

  const logout = () => {
    localStorage.clear();
    setPrivateKey(null);
    setCurrentUser(null);
    setView("login");
  };

  return (
    <>
      {view === "login" && (
        <LoginBox
          SERVER={SERVER}
          setPrivateKey={setPrivateKey}   // 🔑 QUAN TRỌNG
          onLogin={(user) => {
            setCurrentUser(user);
          }}
          showRegister={() => setView("register")}
        />
      )}

      {view === "register" && (
        <RegisterBox
          SERVER={SERVER}
          showLogin={() => setView("login")}
        />
      )}

      {view === "app" && (
        <FileApp
          SERVER={SERVER}
          currentUser={currentUser}
          privateKey={privateKey}         // 🔑 QUAN TRỌNG
          logout={logout}
        />
      )}
    </>
  );
}

export default App;