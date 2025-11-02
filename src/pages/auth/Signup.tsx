import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Cat } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { auth, db } from "@/firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: form.name });

      // Save user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        email: form.email,
        createdAt: new Date(),
      });

      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already registered");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters");
      } else {
        toast.error("Signup failed. Please try again.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
            className="w-full mt-4 bg-[#1e4d38] hover:bg-[#27694c] text-white"
          >
            {loading ? "Creating Account..." : "Sign Up"}
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
