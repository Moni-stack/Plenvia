import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guestMsg, setGuestMsg] = useState("");

  const handleLogin = async () => {
    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(data);

        localStorage.setItem("token", data.access_token);

        alert("Login successful 🚀");

        window.location.href = "/dashboard";
      } else {
        alert(data.detail || "Login failed");
      }

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  const handleGuest = () => {
    localStorage.setItem("guest", "true");
    setGuestMsg("You are logged in as Guest ✔️ Redirecting to Dashboard...");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          Study Planner
        </h2>

        {guestMsg && (
          <p className="text-green-600 text-center mb-3">{guestMsg}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded mb-3"
        >
          Login
        </button>

        <button
          onClick={handleGuest}
          className="w-full border py-2 rounded"
        >
          Skip for now (Guest Mode)
        </button>

        <p className="text-sm text-center mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
