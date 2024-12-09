import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const App = () => {
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);


  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER}/auth/login`,
        { userName, password }
      );

      const data = response.data;
      if (data.token) {
        sessionStorage.setItem("accessToken", data.token);
        setIsLoggedIn(true);
      } else {
        alert("Tên tài khoản hoặc mật khẩu không chính xác");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Lỗi đăng nhập");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Vui lòng chọn file");
      return;
    }

    setUploading(true); // Bắt đầu uploading

    const formData = new FormData();
    formData.append("files", file);

    const accessToken = sessionStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER}/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      if (response.status === 201) {
        alert("Upload thành công!");
        setFile(null);
        setUploadProgress(0); // Reset tiến trình
        fileInputRef.current.value = '';
      } else {
        alert("Upload thất bại!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Lỗi upload");
    } finally {
      setUploading(false); // Kết thúc uploading
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {!isLoggedIn ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <form
            onSubmit={handleLogin}
            style={{
              display: "flex",
              flexDirection: "column",
              width: 300,
              padding: 20,
              border: "1px solid #ccc",
              borderRadius: 5,
            }}
          >
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={userName}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                marginBottom: 10,
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 3,
              }}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                marginBottom: 10,
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 3,
              }}
            />
            <button
              type="submit"
              style={{
                padding: 10,
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: 3,
                cursor: "pointer",
              }}
            >
              Đăng nhập
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ padding: 20 }}>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ marginBottom: 10 }}
              ref={fileInputRef}
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{ opacity: uploading ? 0.5 : 1 /* ... other styles */ }}
            >
              {uploading ? `Đang upload... ${uploadProgress}%` : "Upload"}{" "}
              {/* Hiển thị tiến trình */}
            </button>
            {uploading && ( // Hiển thị progress bar
              <progress
                value={uploadProgress}
                max="100"
                style={{ width: "100%", marginTop: 10 }}
              />
            )}
          </div>
          <iframe
            src={process.env.REACT_APP_SERVER}
            title="WebView"
            style={{ flex: 1, border: "none" }}
          />
        </div>
      )}
    </div>
  );
};

export default App;
