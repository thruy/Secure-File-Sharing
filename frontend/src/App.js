import './App.css';

function App() {
  return (
    <div className="App">
      {/* login box */}
      <div class="card" id="loginBox">
        <h2>🔐 Secure File Sharing</h2>
        <p class="small">End-to-End Encrypted</p>
        <input id="loginUser" placeholder="Username" />
        <input id="loginPass" type="password" placeholder="Password" />
        <button class="primary" onclick="login()">Đăng nhập</button>
        <p class="small"> Chưa có tài khoản? <a href="#" onclick="showRegister()">Đăng ký</a></p>
      </div>

      {/* register box */}
      <div class="card hidden" id="registerBox">
        <h2>Đăng ký</h2>
        <input id="regUser" placeholder="Username" />
        <input id="regPass" type="password" placeholder="Password" />
        <input id="regPass2" type="password" placeholder="Confirm password" />
        <button class="primary" onclick="register()">Đăng ký</button>
        <button class="secondary" onclick="showLogin()">Quay lại</button>
      </div>

      {/* app box */}
      <div class="card hidden" id="appBox">
        <div class="topbar">
          <b>👤 <span id="currentUserSpan"></span></b>
          <button class="secondary" onclick="logout()">Logout</button>
        </div>
        <input type="file" id="fileInput" />
        <input id="receiver" placeholder="Người nhận (username)" />
        <button class="primary" onclick="uploadFile()">Upload & Encrypt 🔒</button>
        <h3>File được chia sẻ</h3>
        <div id="fileList"></div>
      </div>
    </div>
  );
}

export default App;
