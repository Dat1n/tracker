import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Cat } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.some((u: any) => u.email === form.email)) {
      toast.error("Email already exists");
      return;
    }

    users.push(form);
    localStorage.setItem("users", JSON.stringify(users));
    toast.success("Account created successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b3d2e] via-[#0a3326] to-[#06251b] p-6">
      <Card className="w-full max-w-md p-8 text-center shadow-2xl bg-[#102a20]/90 border border-[#1e4d38] rounded-2xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Cat className="w-10 h-10 text-white" />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-[#a4cbb7] text-sm">Join the Rich community</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 text-left">
          <div>
            <Label className="text-[#b6e3c5]">Full Name</Label>
            <Input
              className="bg-[#0f221a] text-white border-[#1e4d38] focus:ring-[#7af0b6]"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

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
            className="w-full mt-4 bg-[#1e4d38] hover:bg-[#27694c] text-white"
          >
            Sign Up
          </Button>
        </form>

        <p className="text-sm mt-4 text-[#9ac6b2]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#7af0b6] font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Signup;
