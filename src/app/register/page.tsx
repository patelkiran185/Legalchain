"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import  createSpecificUserModel  from "@/models/User";
import User from "@/models/User";


export default function Register() {
  const [error, setError] = useState("");
  const router = useRouter();

  const [role, setRole] = useState<"client" | "lawyer" | "judge" | undefined>(
    undefined
  );
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/dashboard");
    }
  }, [sessionStatus]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };




  const handleRoleChange = (event: any) => {
    setRole(event.target.value);
  };


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    const role=e.target[2].value;

    if (!isValidEmail(email)) {
      setError("Email is invalid");
      return;
    } else if (!password || password.length < 8) {
      setError("Password is invalid");
      return;
    } else if (!role || role.length === 0) {
      setError("Select a role to register");
      return;
    }

    try {
      const res = await fetch("/api/register",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: role
        }),
      });
      if (res.status === 400) {
        setError("This email is already registered");
      } else if (res.status === 200) {
        setError("");

        const specificUserModel = createSpecificUserModel(role);
  
        await specificUserModel.create({
          email: email,
          password: password,
          role: role,
        });
        router.push(`/app/dashboards/${role}Dashboard`);
      }
    } catch (error) {
      setError("Error, try again");
      console.log(error);
    }
  };
  

  if (sessionStatus === "loading") {
    return <h1>Loading...</h1>;
  }

  return (
    sessionStatus !== "authenticated" && (
      <div className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="bg-[#212121] p-8 rounded shadow-md w-96">
          <h1 className="text-4xl text-center font-semibold mb-8 text-white">Register</h1>
          <form onSubmit={handleSubmit} method ="POST">
            <input
              type="text"
              className="w-full border border-gray-300 text-black rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-400 focus:text-black"
              placeholder="Email"
              required
            />
            <input
              type="password"
              className="w-full border border-gray-300 text-black rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-400 focus:text-black"
              placeholder="Password"
              required
            />




            <select
              name="loginType"
              value={role}
              onChange={handleRoleChange}
              className="w-full border border-gray-300 text-black rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-400 focus:text-black"
            >
              <option value="" selected disabled hidden>
                -Select-
              </option>
              <option value="client">Client</option>
              <option value="lawyer">Lawyer</option>
              <option value="judge">Judge</option>
            </select>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Register
            </button>

            <p className="text-red-600 text-[16px] mb-4 text-center">{error && error}</p>
            <div className="text-center text-gray-500 mt-4">- OR -</div>
            <button
              onClick={() => signIn("google")}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Sign in with Google
            </button>
          </form>
          <div className="text-center text-gray-500 mt-4">- OR -</div>
          <Link className="block text-center text-blue-500 hover:underline mt-2" href="/login">
            Login with an existing account
          </Link>
        </div>
      </div>
    )
  );
};
