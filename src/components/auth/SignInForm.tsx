import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

import { useAdminAuth } from "../../context/AdminAuthContext";

export default function SignInForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { login } = useAdminAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(form.email, form.password);
    setLoading(false);

    if (ok) {
      navigate("/admin");
    } else {
      setError("Invalid credentials or not an admin account.");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    name="email"
                    placeholder="info@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <svg
                          className="fill-gray-500 dark:fill-gray-400 size-5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z" />
                        </svg>
                      ) : (
                        <svg
                          className="fill-gray-500 dark:fill-gray-400 size-5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5c-7 0-10 7-10 7s3 7 10 7c1.61 0 3.09-.25 4.41-.7l1.49 1.49c-1.7.7-3.6 1.21-5.9 1.21-7 0-10-7-10-7s3-7 10-7c2.3 0 4.2.51 5.9 1.21l-1.49 1.49c-1.32-.45-2.8-.7-4.41-.7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5c.34 0 .67.03 1 .08l1.45 1.45c-.13.02-.26.03-.4.03-1.65 0-3 1.35-3 3s1.35 3 3 3c.14 0 .27-.01.4-.03l-1.45 1.45c-.33.05-.66.08-1 .08z" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  {error && (
                    <div className="text-error-600 text-sm mb-2">{error}</div>
                  )}
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
