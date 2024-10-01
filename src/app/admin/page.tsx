"use client";

import { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignupErrors } from "@/utils/Types";
import { toast, ToastContainer } from "react-toastify";
import { postLogin } from "../../services/adminApi";
import { loginSchema } from "@/utils/Validation";
import useAdminAuthStore from "@/store/adminAuthStore";

const AdminLogin = () => {
  const { isAdminAuthenticated, setAdminAuth } = useAdminAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<SignupErrors>({});

  const router = useRouter();

  useEffect(() => {
    if (isAdminAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isAdminAuthenticated, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setErrors({ general: "All fields must be filled out" });
      return;
    }
    setErrors({});

    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.format();
      setErrors({
        email: fieldErrors.email?._errors[0],
        password: fieldErrors.password?._errors[0],
      });
      return;
    } else {
      setErrors({});
    }
    console.log("login post");
    console.log(email, password, "cred");
    const data = await postLogin(email, password);
    if (data) {
      toast.success("Login successful!");
      setAdminAuth(data.isAdmin, data.accessToken)
      router.push("/admin/dashboard");
    } else {
      console.log("Invalid credentials", data);
      toast.error("Invalid credentials")
    }
  };

  return (
    <div className="bg-gray-800 flex items-center justify-center min-h-screen px-4 py-8 font-sans">
      <div className="w-full max-w-md">
        <div className="border border-gray-300 rounded-lg p-2 w-full">
          <h2 className="text-white text-xl sm:text-2xl font-serif text-center mb-4">
            ADMIN LOGIN
          </h2>
          <div className="flex items-center justify-center">
            <form onSubmit={handleSubmit} className=" w-80">
              {errors.general && (
                <p className="text-red-500 text-xs mb-4">{errors.general}</p>
              )}

              <div className="mb-4 w-full">
                <input
                  type=""
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-500 rounded bg-transparent text-white placeholder-gray-400"
                />
                <p className="text-red-500 text-xs min-h-[1em]">
                  {errors.email}
                </p>
              </div>

              <div className="mb-4 w-full">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-500 rounded bg-transparent text-white placeholder-gray-400"
                />
                <p className="text-red-500 text-xs min-h-[1em]">
                  {errors.password}
                </p>
              </div>

              <div className="flex justify-center -mt-3">
                <button
                  type="submit"
                  className="mt-1 border border-gray-300 text-white p-1 rounded-2xl w-2/4 font-serif hover:text-blue-950 hover:bg-white"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default AdminLogin;
