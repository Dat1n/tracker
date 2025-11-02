import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Cat } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase"; // make sure this path matches your setup

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({ uid: user.uid, email: user.email })
      );

      toast.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      let message = "Login failed. Please try again.";
      if (error.code === "auth/user-not-found")
        message = "No user found with this email.";
      else if (error.code === "auth/wrong-password")
        message = "Incorrect password.";
      else if (error.code === "auth/invalid-email")
        message = "Invalid email format.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center overflow-y-auto bg-gradient-to-br from-[#0b3d2e] via-[#0a3326] to-[#06251b] p-6">
      <Card className="w-full max-w-md p-8 pb-16 text-center shadow-2xl bg-[#102a20]/90 border border-[#1e4d38] rounded-2xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Cat className="w-10 h-10 text-white" />
          <h1 className="text-2xl font-bold text-white">Welcome Back 🐾</h1>
          <p className="text-[#a4cbb7] text-sm">
            Log in to continue your Getting Rich journey
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <Label className="text-[#b6e3c5]">Email</Label>
            <Input
              type="email"
              className="bg-[#0f221a] text-white border-[#1e4d38] focus:ring-[#7af0b6]"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-[#b6e3c5]">Password</Label>
            <Input
              type="password"
              className="bg-[#0f221a] text-white border-[#1e4d38] focus:ring-[#7af0b6]"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#1e4d38] hover:bg-[#27694c] text-white"
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <p className="text-sm mt-4 text-[#9ac6b2]">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-[#7af0b6] font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
