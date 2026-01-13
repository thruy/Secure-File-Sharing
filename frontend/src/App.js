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

  useEffect(() => {
    if (currentUser) setView("app");
  }, [currentUser]);

  const logout = () => {
    localStorage.clear();
    setCurrentUser(null);
    setView("login");
  };

  return (
    <>
      {view === "login" && (
        <LoginBox
          SERVER={SERVER}
          onLogin={(user) => {
            setCurrentUser(user);
            setView("app");
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
          logout={logout}
        />
      )}
    </>
  );
}

export default App;
